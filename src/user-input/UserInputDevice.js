const { readFile, writeFile } = require('fs/promises');

const rl = require('raylib');

class UserInputDevice {
    constructor (deviceId = 0) {
        this.id = deviceId;

        this.toggleFullscreen = -1;
    }

    pressed (
        key
    ) {

    }

    parse (controlMapString) {
        const controlMap = JSON.parse(controlMapString);

        this.toggleFullscreen = controlMap.toggleFullscreen;
    }

    save () {
        const controlMap = {
            toggleFullscreen: this.toggleFullscreen
        };

        const controlMapString = JSON.stringify(controlMap);

        return controlMapString;
    }

    async loadFile (path) {
        const json = readFile(path, 'utf-8');

        this.load(json);
    }

    async saveFile (path) {
        const controlMapString = this.save();

        writeFile(
            path,
            controlMapString,
            'utf-8'
        );
    }
}

module.exports = UserInputDevice;
