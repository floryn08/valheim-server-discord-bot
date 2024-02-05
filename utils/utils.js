const axios = require('axios');
const { config } = require("../config")

exports.start = async (interaction) => {
    await interaction.reply('Starting server...')
    console.log('Starting server...')

    if (!config.portainerEndpoint || !config.portainerApiKey) {
        throw new Error('Please make sure you have set up the Portainer API token in your code.');
    }

    await axios({
        url: `${config.portainerEndpoint}/api/endpoints/2/docker/containers/${config.containerName}/start`,
        method: 'POST',
        headers: {
            "X-API-Key": `${config.portainerApiKey}`
        }
    }).then(async function (response) {

        if (response.status == 204) {
            await interaction.followUp('Container started successfully!')
            console.log('Container started successfully!');
        } else {
            console.log(response.status)
        }

    }).catch(async function (error) {

        if (error.response.status == 304) {
            await interaction.followUp('Container already started!')
            console.log('Container already started!');
        } else {
            await interaction.followUp(`Failed to start container. Error: ${error}`)
            console.log(`Failed to start container. Error: ${error}`)
        }

    });

}

exports.stop = async (interaction) => {
    await interaction.reply('Stopping server...')
    console.log('Stopping server...')

    if (!config.portainerEndpoint || !config.portainerApiKey) {
        throw new Error('Please make sure you have set up the Portainer API token in your code.');
    }

    await axios({
        url: `${config.portainerEndpoint}/api/endpoints/2/docker/containers/${config.containerName}/stop`,
        method: 'POST',
        headers: {
            "X-API-Key": `${config.portainerApiKey}`
        }
    }).then(async function (response) {

        if (response.status == 204) {
            await interaction.followUp('Container stopped successfully!')
            console.log('Container started successfully!');
        } else {
            console.log(response.status)
        }

    }).catch(async function (error) {
        if (error.response.status == 304) {
            await interaction.followUp('Container already stopped!')
            console.log('Container already stopped!');
        } else {
            await interaction.followUp(`Failed to stop container. Error: ${error}`)
            console.log(`Failed to stop container. Error: ${error}`)
        }
    });
}

exports.status = async (interaction) => {
    await interaction.reply('Getting server status...')
    console.log('Getting server status...');

    if (!config.portainerEndpoint || !config.portainerApiKey) {
        throw new Error('Please make sure you have set up the Portainer API token in your code.');
    }

    await axios({
        url: `${config.portainerEndpoint}/api/endpoints/2/docker/containers/${config.containerName}/json`,
        method: 'GET',
        headers: {
            "X-API-Key": `${config.portainerApiKey}`
        }
    }).then(async function (response) {
        await interaction.followUp(`Server status is: ${response.data.State.Status}`)
        console.log(`Server status is: ${response.data.State.Status}`);
    }).catch(async function (error) {
        await interaction.followUp(`Failed to get server status. Error Code: ${error}`)
        throw new Error(`Failed to get server status. Error Code: ${error}`);
    });
}