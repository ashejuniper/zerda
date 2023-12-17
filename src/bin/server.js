const minimist = require('minimist');

const Server = require('../net/Server');

const args = minimist(process.argv.splice(2));

async function main (args) {
    let server = new Server();
}

main(args);
