const rl = require('raylib');
const Asset = require('./Asset');
const Scene = require('./Scene');

class Image extends Asset {
    constructor () {
        super();
    }

    static get (modName, assetId) {
        return Asset.get(modName, assetId, 'Image');
    }

    static async _loadAll () {
        await Asset.forEachFile(
            'Image',
            [
                'bmp',
                'jpeg',
                'jpg',
                'png'
            ],
            async (e) => {
                void await Image.load(
                    e.modName,
                    e.assetId,
                    e.assetPath
                );
            }
        );
    }

    static async load (mod, id, path) {
        const properties = rl.LoadImage(path);

        const asset = new Image();

        asset.modId = mod;
        asset.assetId = id;
        asset.path = path;

        asset.setProperties(properties);

        await Scene.main.createChild(asset);

        return asset;
    }

    async onEnable (e) {
        super.onEnable(e);
    }

    texture () {
        if (this._texture) {
            return this._texture;
        }

        this._texture = rl.LoadTextureFromImage(this);

        return this.texture();
    }
}

module.exports = Image;
