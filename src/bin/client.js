const minimist = require('minimist');

const AppClient = require('../AppClient');

const args = minimist(process.argv.splice(2));

async function main (args) {
    let client = new AppClient();

    await client.start();
}

main(args);
