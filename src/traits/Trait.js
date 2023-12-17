const Entity = require("../entities/Entity");
const IEntity = require("../entities/IEntity");
const TraitStatus = require("./TraitStatus");

class Trait extends IEntity {
    constructor (properties = null, entity = null) {
        super();

        if (typeof entity !== 'object' || entity === null || !(entity instanceof Entity)) {
            entity = new Entity();
        }

        this._entity = entity;

        this.status = TraitStatus.ADD;

        if (typeof properties === 'object' && properties !== null) {
            for (let key in properties) {
                this[key] = properties[key];
            }
        }
    }

    async disable (e) {
        this._isEnabled = false;
    }


    async enable (e) {
        this._isEnabled = true;
    }

    entity () {
        return this._entity;
    }

    isEnabled () {
        return this._isEnabled;
    }

    async onAdd (e) {}
    async onRemove (e) {}
    async render (e) {}
    async tick (e) {}

    uuid () {
        return this.entity().uuid();
    }
}

module.exports = Trait;
