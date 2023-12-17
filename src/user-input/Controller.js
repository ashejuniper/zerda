const rl = require('raylib');

const UserInputDevice = require('./UserInputDevice');

class Controller extends UserInputDevice {
    constructor (deviceId = 0) {
        super(deviceId);
    }

    pressed (
        key
    ) {
        return rl.IsGamepadButtonPressed(this.id, this[key]);
    }
}

module.exports = Controller;
