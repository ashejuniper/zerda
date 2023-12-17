const assets = require('./traits/assets');
const entities = require('./entities');
const net = require('./net');
const rendering = require('./rendering');
const scenes = require('./traits/scenes');
const structures = require('./traits/structures');
const terrain = require('./traits/terrain');

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
