const IEntity = require("./IEntity");

const registeredScripts = {};

class Script extends IEntity {
    static register ($class) {
        registeredScripts[$class.constructor.name] = $class;
    }
}

module.exports = Script;
