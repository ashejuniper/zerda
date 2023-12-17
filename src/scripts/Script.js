const Entity = require("../entities/Entity");
const IScript = require("../entities/IScript");
const ScriptStatus = require("./ScriptStatus");

class Script extends IScript {
    constructor (entity = null) {
        super();

        if (typeof entity !== 'object' || entity === null || !(entity instanceof Entity)) {
            entity = new Entity();
        }

        this._entity = entity;

        this.status = ScriptStatus.ADD;
    }

    async attach (e) {}
    async detach (e) {}

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

    async render (e) {}

    setProperties (properties) {
        if (typeof properties === 'object' && properties !== null) {
            for (let key in properties) {
                this[key] = properties[key];
            }
        }
    }

    async tick (e) {}

    uuid () {
        return this.entity().uuid();
    }
}

module.exports = Script;
