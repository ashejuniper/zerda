const brain = require('brain.js');
const { GPU } = require('gpu.js');
const rl = require('raylib');

const AppWindow = require('./AppWindow');
const ClientRenderer = require('./rendering/ClientRenderer');

const clientRenderer = new ClientRenderer();

class AppClient extends AppWindow {
    constructor () {
        super("Moonstone");

        this.setRenderer(clientRenderer);
    }
}

module.exports = AppClient;
