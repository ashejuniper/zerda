class IScript {
    className () {
        return this.prototype.constructor.name;
    }

    entity () {}

    script (scriptName) {
        return this.entity().script(scriptName);
    }

    uuid () {}
}

module.exports = IScript;
