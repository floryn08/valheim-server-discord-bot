const { config } = require("../config");
const k8s = require("@kubernetes/client-node");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Define the deployment name and namespace
const deploymentName = config.deploymentName;
const namespace = config.namespace;

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
kc.clusters[0].skipTLSVerify = true;
const appsK8sApi = kc.makeApiClient(k8s.AppsV1Api);
const coreK8sApi = kc.makeApiClient(k8s.CoreV1Api);

exports.start = async (interaction) => {
  await interaction.reply("Starting server...");
  console.log("Starting server...");

  // find the particular deployment
  const res = await appsK8sApi.readNamespacedDeployment({
    name: deploymentName,
    namespace: namespace,
  });
  let deployment = res;

  // edit
  deployment.spec.replicas = 1;

  // replace
  await appsK8sApi
    .replaceNamespacedDeployment({
      name: deploymentName,
      namespace: namespace,
      body: deployment,
    })
    .then(async function (response) {
      // wait after starting the container because it may have some old logs
      // and the old join code may be returned, so we wait a bit for the new container
      // to log some new lines and then start the check loop
      await delay(config.joinCodeLoopTimeoutMillis);

      let podObj,
        podContainer,
        joinCode = "";

      await coreK8sApi
        .listNamespacedPod({ namespace: namespace })
        .then((res) => {
          res.items.forEach((pod) => {
            if (
              pod.metadata.labels["app.kubernetes.io/name"] ==
              config.deploymentName
            ) {
              podObj = pod;
              pod.spec.containers.forEach((container) => {
                podContainer = container;
              });
            }
          });
        });

      console.log("pod: ", podObj.metadata.name);
      console.log("container:", podContainer.name);

      for (let i = 0; i < config.joinCodeLoopCount; i++) {
        await coreK8sApi
          .readNamespacedPodLog({
            name: podObj.metadata.name,
            namespace: namespace,
            container: podContainer.name,
            follow: false,
            pretty: true,
            tailLines: 10,
          })
          .then((log) => {
            let data = log;

            let index = data.indexOf(
              `Session "${config.serverName}" with join code`
            );
            if (index !== -1) {
              // Get the next word after the string
              let words = data.slice(index).split(" ");
              joinCode = words[5]; // The next word is at index 5
            }

            console.log("Join code not present yet, retryin...");
          });

        if (joinCode != "") {
          await interaction.followUp(
            `Server started successfully! Join code is ${joinCode}`
          );
          console.log("Server started successfully! Join code is", joinCode);

          break;
        }

        await delay(config.joinCodeLoopTimeoutMillis);
      }
    });

  await interaction.followUp("Server is running!");
};

exports.stop = async (interaction) => {
  await interaction.reply("Stopping server...");
  console.log("Stopping server...");

  // find the particular deployment
  const res = await appsK8sApi.readNamespacedDeployment({
    name: deploymentName,
    namespace: namespace,
  });
  let deployment = res;

  // edit
  deployment.spec.replicas = 0;

  // replace
  await appsK8sApi.replaceNamespacedDeployment({
    name: deploymentName,
    namespace: namespace,
    body: deployment,
  });

  await interaction.followUp("Server is stopped!");
  console.log("Stopping server...");
};

exports.status = async (interaction) => {
  await interaction.reply("Getting server status...");
  console.log("Getting server status...");

  // find the particular deployment
  const res = await appsK8sApi.readNamespacedDeployment({
    name: deploymentName,
    namespace: namespace,
  });

  if (res.spec.replicas == 0) {
    await interaction.followUp("Server is stopped!");
  } else {
    await interaction.followUp("Server is running!");
  }
};
