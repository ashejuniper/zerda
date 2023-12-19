const IEntity = require('../entities/IEntity');

const registeredScripts = {};

class Script extends IEntity {
    static register ($class) {
        registeredScripts[$class.constructor.name] = $class;
    }

    constructor () {
        super();

        this.__entity__ = null;
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
}

module.exports = Script;
