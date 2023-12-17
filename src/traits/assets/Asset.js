const glob = require('glob');
const Trait = require('../Trait');

const assets = {};

function getVirtualPath (asset) {
    return `assets://${asset.modId}/${asset.constructor.name}/${asset.assetId}`;
}

function addAsset (asset) {
    assets[getVirtualPath(asset)] = asset;
}

function getAsset (virtualPath) {
    return assets[virtualPath];
}

function removeAsset (asset) {
    if (assets.hasOwnProperty(getVirtualPath(asset))) {
        delete assets[getVirtualPath(asset)];
    }
}

class Asset extends Trait {
    static get (modName, assetId, assetType) {
        let virtualPath;

        if (!assetId) {
            virtualPath = modName;
        } else {
            virtualPath = `${modName}/${assetId}.${assetType}`;
        }

        return assets[virtualPath];
    }

    static async _unloadAll () {
        for (const id in assets) {
            const asset = assets[id];

            await asset.disable();
        }
    }

    register (modId, assetId) {
        this.modId = modId;
        this.assetId = assetId;

        addAsset(this);
    }

    unregister () {
        removeAsset(this);
    }

    virtualPath () {
        return getVirtualPath(this);
    }

    async disable (e) {
        super.disable(e);

        if (this.isRegistered()) {
            this.unregister();
        }
    }

    async enable (e) {
        super.enable(e);

        if (!this.isRegistered()) {
            this.register(this.modId, this.assetId);
        }
    }
}

module.exports = Asset;
