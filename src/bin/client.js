const minimist = require('minimist');

const Application = require('../Application');

const args = minimist(process.argv.splice(2));

async function main (args) {
    let app = new Application('Zerda');

    await app.start();
}

main(args);
