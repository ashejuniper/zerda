const path = require('path');
const { glob } = require('glob');
const rl = require('raylib');
const Asset = require('./Asset');
const Entity = require('../../entities/Entity');

class Image extends Asset {
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
        const asset = new Image(properties);

        new Entity(asset);

        asset.register(mod, id);

        return asset;
    }

    async enable () {
        this.register(this.modId, this.assetId);

        console.log(`Image "${this.virtualPath()}" enabled`);
    }

    async disable () {
        console.log(`Image "${this.virtualPath()}" disabled`);

        this.unregister();

        rl.UnloadImage(this);
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
