class IEntity {
    constructor () {
        this._parent = null;
        this._children = [];
    }

    * children () {
        for (const child of this.entity().children()) {
            yield child;
        }
    }

    className () {
        return this.prototype.constructor.name;
    }

    color (color) {
        if (color) {
            return this.script('Renderer').color = color;
        }

        return this.script('Renderer').color;
    }

    createChild (...scripts) {
        this.entity().createChild(...scripts);
    }

    createEntity (parent, ...scripts) {
        this.entity().createEntity(parent, ...scripts);
    }

    enable () {
        this.entity().enableScript(this);
    }

    entity () {}

    isEnabled () {
        return this.entity().isScriptEnabled(this);
    }

    parent () {
        return this._parent;
    }

    script (scriptName) {
        return this.entity().script(scriptName) || null;
    }

    * scripts () {
        for (const script of this.entity().scripts()) {
            yield script;
        }
    }

    setColor (color) {
        this.script('Renderer').color = color;
    }

    setParent (parent) {
        this._parent = parent;
    }

    transform () {
        return this.script('Transform');
    }

    uuid () {
        return this._uuid;
    }
}

module.exports = IEntity;
