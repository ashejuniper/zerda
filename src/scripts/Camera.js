const rl = require('raylib');

const Script = require("./Script");

class Camera extends Script {
    constructor () {
        super();

        this.position = rl.Vector3Zero();
        this.target = rl.Vector3Zero();
        this.up = { x: 0.0, y: 1.0, z: 0.0 };

        this.projection = rl.CAMERA_PERSPECTIVE;

        this.fovy = 45.0;
    }

    async onTick (e) {
        this.position = this.transform().position;
    }
}

module.exports = Camera;
