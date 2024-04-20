const { config } = require("../config");
const k8s = require("@kubernetes/client-node");

// Define the deployment name and namespace
const deploymentName = config.deploymentName;
const namespace = config.namespace;

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

exports.start = async (interaction) => {
  await interaction.reply("Starting server...");
  console.log("Starting server...");

  // find the particular deployment
  const res = await k8sApi.readNamespacedDeployment(deploymentName, namespace);
  let deployment = res.body;

  // edit
  deployment.spec.replicas = 1;

  // replace
  await k8sApi.replaceNamespacedDeployment(
    deploymentName,
    namespace,
    deployment
  );

  await interaction.followUp("Server is running!");
};

exports.stop = async (interaction) => {
  await interaction.reply("Stopping server...");
  console.log("Stopping server...");

  // find the particular deployment
  const res = await k8sApi.readNamespacedDeployment(deploymentName, namespace);
  let deployment = res.body;

  // edit
  deployment.spec.replicas = 0;

  // replace
  await k8sApi.replaceNamespacedDeployment(
    deploymentName,
    namespace,
    deployment
  );

  await interaction.followUp("Server is stopped!");

};

exports.status = async (interaction) => {
  await interaction.reply("Getting server status...");
  console.log("Getting server status...");

  // find the particular deployment
  const res = await k8sApi.readNamespacedDeployment(deploymentName, namespace);

  if (res.body.spec.replicas == 0) {
    await interaction.followUp("Server is stopped!");
  } else {
    await interaction.followUp("Server is running!");
  }
};
