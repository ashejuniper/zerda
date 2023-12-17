const assets = require('./scripts/assets');
const entities = require('./entities');
const net = require('./net');
const rendering = require('./rendering');
const scenes = require('./scripts/scenes');
const structures = require('./scripts/structures');
const terrain = require('./scripts/terrain');

const AppClient = require("./AppClient");
const AppWindow = require("./AppWindow");
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
    AppWindow,
    ServerClient
};
