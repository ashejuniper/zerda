class IEntity {
    className () {
        return this.prototype.constructor.name;
    }

    entity () {}
    uuid () {}
}

module.exports = IEntity;
