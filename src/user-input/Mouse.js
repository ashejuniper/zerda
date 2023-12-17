const rl = require('raylib');

const UserInputDevice = require('./UserInputDevice');

class Keyboard extends UserInputDevice {
    constructor () {
        super(0);

        this.toggleFullscreen = rl.MOUSE_BUTTON_MIDDLE;
    }

    pressed (
        key
    ) {
        return rl.IsMouseButtonPressed(this[key]);
    }
}

module.exports = Keyboard;
