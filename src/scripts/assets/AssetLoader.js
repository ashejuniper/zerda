const Asset = require("./Asset");
const Sound = require("./Sound");
const Image = require("./Image");
const ScriptVM = require("../ScriptVM");

class AssetLoader {
    static async loadAll () {
        await Sound._loadAll();
        await Image._loadAll();

        await ScriptVM.main.loadAllModules();
    }

    static async unloadAll () {
        await Asset._unloadAll();
    }
}

module.exports = AssetLoader;
