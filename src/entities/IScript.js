class IScript {
    className () {
        return this.prototype.constructor.name;
    }

    entity () {}
    uuid () {}
}

module.exports = IScript;
