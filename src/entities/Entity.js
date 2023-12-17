const UUID = require('uuid');

const EntityStatus = require('./EntityStatus');
const IEntity = require('./IEntity');

const entities = {};

const traitPrototypes = {};

function createUUID () {
    return UUID.v4();
}

class Entity extends IEntity {
    static get (uuid) {
        if (!entities.hasOwnProperty(uuid)) return null;

        return entities[uuid];
    }

    constructor (...traits) {
        super();

        this.status = EntityStatus.CREATE;

        this.traits = {};

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

        for (let trait of traits) {
            this.addTrait(trait);
        }

        this.status = EntityStatus.CREATED;
    }

    async addTrait (trait) {
        const prototype = Object.getPrototypeOf(trait);

        traitPrototypes[prototype.constructor.name] = prototype;

        this.traits[prototype.constructor.name] = trait;

        await trait.onAdd({});
        await trait.enable({});
    }

    async destroy (e) {
        if (!this._hasBeenDestroyed) {
            this._hasBeenDestroyed = true;
        }

        for (const trait of this.traits) {
            await trait.disable({});
            await trait.onRemove({});
        }

        delete entities[this.uuid()];
    }

    entity () {
        return this;
    }

    async removeTrait (trait) {
        if (typeof trait === 'string') {
            trait = this.traits[trait];
        }

        await trait.disable({});

        await trait.onRemove({});

        delete this.traits[trait.className()];
    }

    async trait ($class) {
        return this.traits[$class.prototype.constructor.name];
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
            for (const trait of this.traits) {
                await trait.onAdd(e);
            }

            this.status = EntityStatus.ADD;
        }
        else if (this.status === EntityStatus.ENABLED) {
            for (const trait of this.traits) {
                await trait.tick(e);
            }
        } else if (this.status === EntityStatus.REMOVE) {
            for (const trait of this.traits) {
                await trait.onRemove(e);
            }

            this.status = EntityStatus.REMOVED;
        }
    }
}

module.exports = Entity;
