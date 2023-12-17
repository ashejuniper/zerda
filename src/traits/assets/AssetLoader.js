const Asset = require("./Asset");
const Sound = require("./Sound");
const Image = require("./Image");

class AssetLoader {
    static async loadAll () {
        await Sound._loadAll();
        await Image._loadAll();
    }

    static async unloadAll () {
        Asset._unloadAll();
    }
}

module.exports = AssetLoader;
