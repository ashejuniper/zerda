const path = require('path');
const { glob } = require('glob');
const rl = require('raylib');
const Asset = require('./Asset');
const Entity = require('../../entities/Entity');

class Image extends Asset {
    constructor () {
        super(new Entity());
    }

    static get (modName, assetId) {
        return Asset.get(modName, assetId, 'Image');
    }

    static async _loadAll () {
        console.log('Loading images...');

        const assetDirectories = await glob("assets/*/");

        for (const assetDirectory of assetDirectories) {
            const modName = path.basename(assetDirectory);

            console.log(`  Loading images for mod '${modName}'...`);

            if (modName !== 'Image') {
                const assetPaths = [
                    ...(await glob(`${assetDirectory}/Image/**/*.bmp`)),
                    ...(await glob(`${assetDirectory}/Image/**/*.jpeg`)),
                    ...(await glob(`${assetDirectory}/Image/**/*.jpg`)),
                    ...(await glob(`${assetDirectory}/Image/**/*.png`))
                ];

                for (const assetPath of assetPaths) {
                    const assetId = path.basename(assetPath)
                        .replaceAll('.bmp', '')
                        .replaceAll('.jpeg', '')
                        .replaceAll('.jpg', '')
                        .replaceAll('.png', '');

                    console.log(`    Loading image "assets://${modName}/Image/${assetId}"...`);

                    void Image.loadSync(modName, assetId, assetPath);
                }
            }
        }
    }

    static loadSync (mod, id, path) {
        const properties = rl.LoadImage(path);

        const asset = new Image();

        asset.setProperties(properties);

        new Entity(asset);

        asset.register(mod, id);

        return asset;
    }

    async enable (e) {
        super.enable(e);
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
