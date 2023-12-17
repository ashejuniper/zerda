const minimist = require('minimist');

const ServerClient = require('../ServerClient');

const args = minimist(process.argv.splice(2));

async function main (args) {
    let client = new ServerClient();

    await client.start();
}

main(args);
