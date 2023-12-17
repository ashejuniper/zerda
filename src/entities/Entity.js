const UUID = require('uuid');

const EntityStatus = require('./EntityStatus');
const IScript = require('./IScript');

const entities = {};

const scriptPrototypes = {};

function createUUID () {
    return UUID.v4();
}

class Entity extends IScript {
    static get (uuid) {
        if (!entities.hasOwnProperty(uuid)) return null;

        return entities[uuid];
    }

    constructor (...scripts) {
        super();

        this.status = EntityStatus.CREATE;

        this.scripts = {};

        this._uuid = createUUID();

        entities[this.uuid()] = this;

        process.once(
            'exit',
            this._onProcessExit
        );

        process.once(
            'SIGTERM',
            this._onProcessExit
        );

        for (let script of scripts) {
            this.addScript(script);
        }

        this.status = EntityStatus.CREATED;
    }

    async addScript (script) {
        const prototype = Object.getPrototypeOf(script);

        scriptPrototypes[prototype.constructor.name] = prototype;

        this.scripts[prototype.constructor.name] = script;

        await script.attach({});
        await script.enable({});
    }

    async destroy (e) {
        if (!this._hasBeenDestroyed) {
            this._hasBeenDestroyed = true;
        }

        for (const script of this.scripts) {
            await script.disable({});
            await script.detach({});
        }

        delete entities[this.uuid()];
    }

    entity () {
        return this;
    }

    async removeScript (script) {
        if (typeof script === 'string') {
            script = this.scripts[script];
        }

        await script.disable({});

        await script.detach({});

        delete this.scripts[script.className()];
    }

    async script (scriptName) {
        return this.scripts[scriptName];
    }

    uuid () {
        return this._uuid;
    }

    async _onProcessExit (exitCode) {
        if (typeof this.destroy === 'function') {
            await this.destroy();
        }

        if (this.assetId) console.log(`Unloading asset '${this.assetId}'...`);
    }

    async _step () {
        if (this.status === EntityStatus.ADD) {
            for (const script of this.scripts) {
                await script.attach(e);
            }

            this.status = EntityStatus.ADD;
        }
        else if (this.status === EntityStatus.ENABLED) {
            for (const script of this.scripts) {
                await script.tick(e);
            }
        } else if (this.status === EntityStatus.REMOVE) {
            for (const script of this.scripts) {
                await script.detach(e);
            }

            this.status = EntityStatus.REMOVED;
        }
    }
}

module.exports = Entity;
