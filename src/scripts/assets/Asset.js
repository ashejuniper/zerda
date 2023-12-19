const path = require('path');
const { glob } = require('glob');
const Script = require('../Script');

const assets = {};

function removeDuplicates (a) {
    var seen = {};

    return a.filter(
        function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        }
    );
}

function createVirtualPath (modId, assetId, assetTypeName) {
    return `assets://${modId}/${assetTypeName}/${assetId}`;
}

function getVirtualPath (asset, assetTypeName = null) {
    if (typeof assetTypeName !== 'string') {
        assetTypeName = asset.constructor.name;
    }

    return createVirtualPath(
        asset.modId,
        asset.assetId,
        assetTypeName
    );
}

function addAsset (asset, assetTypeName = null) {
    assets[getVirtualPath(asset, assetTypeName)] = asset;
}

function getAsset (virtualPath) {
    return assets[virtualPath] || null;
}

function removeAsset (asset) {
    if (assets.hasOwnProperty(getVirtualPath(asset))) {
        delete assets[getVirtualPath(asset)];
    }
}

class Asset extends Script {
    constructor () {
        super();

        this._isRegistered = false;
    }

    static async getAssetPaths (
        modDirectory,
        assetTypeName,
        ...fileExtensions
    ) {
        const assetPaths = [];

        for (const extension of fileExtensions) {
            assetPaths.push(
                ...(await glob(`${modDirectory}/${assetTypeName}/*.${extension}`)),
                ...(await glob(`${modDirectory}/${assetTypeName}/**/*.${extension}`))
            );
        }

        return removeDuplicates(assetPaths);
    }

    static async getModDirectories () {
        return await glob("assets/*/");
    }

    static async forEachModDirectory (cb) {
        const modDirectories = await this.getModDirectories();

        for (const modDirectory of modDirectories) {
            const modName = path.basename(modDirectory);

            await cb(
                {
                    modDirectory,
                    modName
                }
            );
        }
    }

    static async forEachFile (assetTypeName, fileExtensions, cb) {
        await this.forEachModDirectory(
            async (e) => {
                console.info(`INFO: ASSETLOADER:   Loading images for mod '${e.modName}'...`);

                if (e.modName !== assetTypeName) {
                    const assetPaths = await Asset.getAssetPaths(
                        e.modDirectory,
                        assetTypeName,
                        ...fileExtensions
                    );

                    for (const assetPath of assetPaths) {
                        let assetId = path.basename(assetPath);

                        for (const extension of fileExtensions) {
                            assetId = assetId.replaceAll(`.${extension}`, '');
                        }

                        console.info(`INFO: ASSETLOADER:     Loading image "assets://${e.modName}/Image/${assetId}"...`);

                        const modName = e.modName;

                        void cb(
                            {
                                assetId,
                                assetPath,
                                modName
                            }
                        );
                    }
                }
            }
        )
    }

    static get (modName, assetId, assetType) {
        let virtualPath;

        if (typeof assetId !== 'string') {
            virtualPath = modName;
        } else {
            virtualPath = createVirtualPath(modName, assetId, assetType);
        }

        return getAsset(virtualPath);
    }

    static register (
        asset,
        modId,
        assetId,
        assetTypeName = null
    ) {
        if (
            !asset
                || (
                    typeof asset !== 'object'
                        && typeof asset !== 'function'
                )
        ) {
            return;
        }

        asset.modId = modId;
        asset.assetId = assetId;

        addAsset(asset, assetTypeName);

        asset._isRegistered = true;
    }

    static unregister (asset) {
        removeAsset(asset);

        asset._isRegistered = false;
    }

    static async _unloadAll () {
        for (const id in assets) {
            const asset = assets[id];

            if (asset.isEnabled()) {
                await asset.onDisable();
            }
        }
    }

    isRegistered () {
        return this._isRegistered;
    }

    register (modId, assetId) {
        Asset.register(this, modId, assetId);
    }

    unregister () {
        Asset.unregister(this);
    }

    virtualPath () {
        return getVirtualPath(this);
    }

    async onDisable (e) {
        super.onDisable(e);

        if (this.isRegistered()) {
            this.unregister();
        }

        console.info(`INFO: ASSET: [${this.virtualPath()}] Asset disabled`);
    }

    async onEnable (e) {
        super.onEnable(e);

        if (!this.isRegistered()) {
            this.register(this.modId, this.assetId);
        }

        console.info(`INFO: ASSET: [${this.virtualPath()}] Asset enabled`);
    }
}

module.exports = Asset;
