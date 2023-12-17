const brain = require('brain.js');
const { GPU } = require('gpu.js');
const rl = require('raylib');
const AppWindow = require('./AppWindow');

class ServerClient extends AppWindow {
    constructor () {
        super("Moonstone Server");

        this.setRenderer(null);
    }
}

module.exports = ServerClient;
