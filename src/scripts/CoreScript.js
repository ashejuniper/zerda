const { v4: uuidv4 } = require('uuid');

const IEntity = require('../../assets/core/scripts/IEntity');

const registeredScripts = {};

class CoreScript extends IEntity {
    static register ($class) {
        registeredScripts[$class.constructor.name] = $class;
    }

    constructor () {
        super();

        this.__entity__ = null;

        this._uuid = uuidv4();
    }

    entity () {
        return this.__entity__;
    }

    async onAttach (e) {
        this.__entity__ = e.entity;
    }

    async onDetach (e) {}
    async onDisable (e) {}
    async onEnable (e) {}

    setProperties (properties) {
        for (const key in properties) {
            this[key] = properties[key];
        }
    }

    async onRender (e) {}
    async onTick (e) {}

    uuid () {
        return this._uuid;
    }
}

module.exports = CoreScript;
