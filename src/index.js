const assets = require('./scripts/assets');
const entities = require('./entities');
const net = require('./net');
const rendering = require('./rendering');
const scenes = require('./scripts/scenes');
const structures = require('./scripts/structures');
const terrain = require('./scripts/terrain');

const AppClient = require("./AppClient");
const Application = require("./Application");
const ServerClient = require("./ServerClient");

module.exports = {
    assets,
    ...assets,
    entities,
    ...entities,
    net,
    ...net,
    rendering,
    ...rendering,
    scenes,
    ...scenes,
    structures,
    ...structures,
    terrain,
    ...terrain,
    AppClient,
    Application,
    ServerClient
};
