const Controller = require('./Controller');
const Keyboard = require('./Keyboard');
const Mouse = require('./Mouse');

const controller = new Controller(0);
const keyboard = new Keyboard();
const mouse = new Mouse();

function pressed(
    key
) {
    return controller.pressed(key) ||
        keyboard.pressed(key) ||
        mouse.pressed(key);
}

module.exports = {
    pressed
};
