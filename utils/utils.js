const axios = require("axios");
const { config } = require("../config");
const k8s = require("@kubernetes/client-node");

// Define the deployment name and namespace
const deploymentName = "valheim";
const namespace = "game-servers";

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

  // if (!config.portainerEndpoint || !config.portainerApiKey) {
  //   throw new Error(
  //     "Please make sure you have set up the Portainer API token in your code."
  //   );
  // }

  // await axios({
  //   url: `${config.portainerEndpoint}/api/endpoints/2/docker/containers/${config.containerName}/start`,
  //   method: "POST",
  //   headers: {
  //     "X-API-Key": `${config.portainerApiKey}`,
  //   },
  // })
  //   .then(async function (startResponse) {
  //     // wait after starting the container because it may have some old logs
  //     // and the old join code may be returned, so we wait a bit for the new container
  //     // to log some new lines and then start the check loop
  //     await new Promise((resolve) =>
  //       setTimeout(resolve, config.joinCodeLoopTimeoutMillis)
  //     );

  //     for (let i = 0; i < config.joinCodeLoopCount; i++) {
  //       let joinCode = "";

  //       await axios({
  //         url: `${config.portainerEndpoint}/api/endpoints/2/docker/containers/${config.containerName}/logs`,
  //         method: "GET",
  //         params: {
  //           stdout: true,
  //           tail: 10, // last 10 lines of the log
  //         },
  //         headers: {
  //           "X-API-Key": `${config.portainerApiKey}`,
  //         },
  //       }).then(function (logsResponse) {
  //         let data = logsResponse.data.toString();
  //         // Check if the data contains the string
  //         let index = data.indexOf(
  //           `Session "${config.serverName}" with join code`
  //         );
  //         if (index !== -1) {
  //           // Get the next word after the string
  //           let words = data.slice(index).split(" ");
  //           joinCode = words[5]; // The next word is at index 5
  //         }

  //         console.log("Join code not present yet, retryin...");
  //       });

  //       if (startResponse.status == 204 && joinCode != "") {
  //         await interaction.followUp(
  //           `Server started successfully! Join code is ${joinCode}`
  //         );
  //         console.log("Server started successfully! Join code is", joinCode);

  //         break;
  //       }

  //       await new Promise((resolve) =>
  //         setTimeout(resolve, config.joinCodeLoopTimeoutMillis)
  //       );
  //     }
  //   })
  //   .catch(async function (error) {
  //     if (error.response.status == 304) {
  //       await interaction.followUp("Server already started!");
  //       console.log("Server already started!");
  //     } else {
  //       await interaction.followUp(
  //         `Failed to start container. Error: ${error}`
  //       );
  //       console.log(`Failed to start container. Error: ${error}`);
  //     }
  //   });
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

  // if (!config.portainerEndpoint || !config.portainerApiKey) {
  //   throw new Error(
  //     "Please make sure you have set up the Portainer API token in your code."
  //   );
  // }

  // await axios({
  //   url: `${config.portainerEndpoint}/api/endpoints/2/docker/containers/${config.containerName}/stop`,
  //   method: "POST",
  //   headers: {
  //     "X-API-Key": `${config.portainerApiKey}`,
  //   },
  // })
  //   .then(async function (response) {
  //     if (response.status == 204) {
  //       await interaction.followUp("Server stopped successfully!");
  //       console.log("Server stopped successfully!");
  //     } else {
  //       console.log(response.status);
  //     }
  //   })
  //   .catch(async function (error) {
  //     if (error.response.status == 304) {
  //       await interaction.followUp("Server already stopped!");
  //       console.log("Server already stopped!");
  //     } else {
  //       await interaction.followUp(`Failed to stop server. Error: ${error}`);
  //       console.log(`Failed to stop server. Error: ${error}`);
  //     }
  //   });
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
