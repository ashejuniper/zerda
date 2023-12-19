const rl = require('raylib');

const Script = require('./Script');

class Transform extends Script {
    constructor () {
        super();

        this.position = rl.Vector3Zero();
        this.rotation = rl.QuaternionIdentity();
        this.scale = 1.0;
    }
}

module.exports = Transform;
