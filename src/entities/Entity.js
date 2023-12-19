const UUID = require('uuid');

const EntityStatus = require('./EntityStatus');
const IEntity = require('./IEntity.js');

const Renderer = require('../scripts/rendering/Renderer');
const Transform = require('../scripts/Transform');

const entities = {};

const scriptPrototypes = {};

function createUUID () {
    return UUID.v4();
}

class Entity extends IEntity {
    static * all () {
        for (const uuid in entities) {
            const entity = entities[uuid];

            yield entity;
        }
    }

    static async create (parent = null, ...scripts) {
        const entity = new Entity();

        entity.setParent(parent);

        await entity._initialize(...scripts);
    }

    static async * generate (
        parent = null,
        scripts = [],
        count = 1
    ) {
        for (
            let remaining = count;
            remaining > 0;
            remaining--
        ) {
            yield await Entity.create(parent, ...scripts);
        }
    }

    static get (uuid) {
        if (!entities.hasOwnProperty(uuid)) return null;

        return entities[uuid];
    }

    static async runAll (cb) {
        for (const entity of Entity.all()) {
            await cb(entity);
        }
    }

    static async _tickAll (e) {
        for (const uuid in entities) {
            const entity = entities[uuid];

            await entity._step(e);
        }
    }

    constructor () {
        super();

        this.status = EntityStatus.CREATE;

        this._scripts = {};
        this._enabledScripts = {};

        this._uuid = createUUID();

        entities[this.uuid()] = this;
    }

    async addScript (script) {
        script._entity = this;

        const prototype = Object.getPrototypeOf(script);

        scriptPrototypes[prototype.constructor.name] = prototype;

        this._scripts[prototype.constructor.name] = script;

        await script.onAttach(
            {
                entity: this
            }
        );

        await script.onEnable({});
    }

    async addScripts (...scripts) {
        for (const script of scripts) {
            await this.addScript(script);
        }
    }

    * children () {
        for (let child of this._children) {
            yield child;
        }
    }

    async createChild (...scripts) {
        await this.createEntity(this, ...scripts);
    }

    async createEntity (parent, ...scripts) {
        const entity = new Entity();

        entity.setParent(parent);

        await entity._initialize(...scripts);

        return entity;
    }

    async destroy () {
        if (!this._hasBeenDestroyed) {
            this._hasBeenDestroyed = true;
        }

        const e = {};

        for (const script of Object.values(this._scripts)) {
            this.removeScript(script);
        }

        delete entities[this.uuid()];
    }

    async disable () {
        this._isEnabled = false;

        const e = {
            entity: this
        };

        for (const script of this.scripts()) {
            await script.onDisable(e);
        }
    }

    async enable () {
        this._isEnabled = true;

        const e = {
            entity: this
        };

        for (const script of this.scripts()) {
            await script.onEnable(e);
        }
    }

    async disableScript (scriptName) {
        const script = this.script(scriptName);

        if (!script || !this._enabledScripts[scriptName]) return;

        delete this._enabledScripts[scriptName];

        const e = {};

        script.onDisable(e);
    }

    async enableScript (scriptName) {
        const script = this.script(scriptName);

        if (!script || this._enabledScripts[scriptName]) return;

        this._enabledScripts[scriptName] = true;

        const e = {};

        script.onEnable(e);
    }

    hasScript (scriptName) {
        return this._scripts.hasOwnProperty(scriptName);
    }

    isEnabled () {
        return this._isEnabled;
    }

    isScriptEnabled (scriptName) {
        if (typeof scriptName === 'object') {
            scriptName = scriptName.constructor.name;
        }

        if (!this.hasScript(scriptName)) {
            return false;
        }

        return this._enabledScripts.hasOwnProperty(scriptName);
    }

    async render () {
        const e = {
            entity: this
        };

        for (const script of this.scripts()) {
            await script.onRender(e);
        }
    }

    async tick () {
        const e = {
            entity: this
        };

        for (const script of this.scripts()) {
            await script.onTick(e);
        }
    }

    entity () {
        return this;
    }

    async render (e) {
        for (const scriptName in this._scripts) {
            const script = this._scripts[scriptName];

            await script.onRender(e);
        }
    }

    async removeScript (script) {
        if (typeof script === 'string') {
            script = this._scripts[script];
        }

        if (script.isEnabled()) {
            await script.onDisable();
        }

        if (script.entity() !== null) {
            await script.onDetach({});
        }

        delete this._scripts[script.className()];
    }

    script (scriptName) {
        return this._scripts[scriptName];
    }

    * scripts () {
        for (const scriptName in this._scripts) {
            const script = this._scripts[scriptName];

            yield script;
        }
    }

    uuid () {
        return this._uuid;
    }

    async _initialize (...scripts) {
        this.addScripts(new Transform());

        for (let script of scripts) {
            this.addScript(script);
        }

        this.status = EntityStatus.ENABLED;
    }

    async _onProcessExit (exitCode) {
        if (typeof this.destroy === 'function') {
            await this.destroy();
        }

        if (this.assetId) console.info(`INFO: ASSETLOADER: Unloading asset '${this.assetId}'...`);
    }

    async _step (e) {
        if (this.status === EntityStatus.CREATE) {
            for (const script of this.scripts()) {
                await script.onAttach(e);
            }

            this.status = EntityStatus.CREATE;
        }
        else if (this.status === EntityStatus.ENABLED) {
            for (const script of this.scripts()) {
                await script.onTick(e);
            }
        } else if (this.status === EntityStatus.DESTROY) {
            for (const script of this.scripts()) {
                if (script.entity() !== null) {
                    await script.onDetach(e);
                }
            }

            this.status = EntityStatus.DELETED;
        }
    }
}

module.exports = Entity;
