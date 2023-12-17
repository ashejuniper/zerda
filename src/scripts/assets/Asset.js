const glob = require('glob');
const Script = require('../Script');

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

class Asset extends Script {
    constructor (entity = null) {
        super(entity);

        this._isRegistered = false;
    }

    static get (modName, assetId, assetType) {
        let virtualPath;

        if (!assetId) {
            virtualPath = modName;
        } else {
            virtualPath = `${modName}/${assetId}.${assetType}`;
        }

        return getAsset(virtualPath);
    }

    static async _unloadAll () {
        for (const id in assets) {
            const asset = assets[id];

            await asset.disable();
        }
    }

    isRegistered () {
        return this._isRegistered;
    }

    register (modId, assetId) {
        this.modId = modId;
        this.assetId = assetId;

        addAsset(this);

        this._isRegistered = true;
    }

    unregister () {
        removeAsset(this);

        this._isRegistered = false;
    }

    virtualPath () {
        return getVirtualPath(this);
    }

    async disable (e) {
        super.disable(e);

        if (this.isRegistered()) {
            this.unregister();
        }

        console.log(`Image "${this.virtualPath()}" disabled`);
    }

    async enable (e) {
        super.enable(e);

        if (!this.isRegistered()) {
            this.register(this.modId, this.assetId);
        }

        console.log(`Image "${this.virtualPath()}" enabled`);
    }
}

module.exports = Asset;
