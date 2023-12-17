const rl = require('raylib');

const UserInputDevice = require('./UserInputDevice');

class Keyboard extends UserInputDevice {
    constructor () {
        super(0);

        this.toggleFullscreen = rl.KEY_F11;
    }

    pressed (
        key,
        deviceId = 0
    ) {
        return rl.IsKeyPressed(this[key]);
    }
}

module.exports = Keyboard;
