const Script = require("../CoreScript");

class Scene extends Script {
    constructor () {
        super();
    }

    * entities () {
        for (const child of this.children()) {
            yield child;
        }
    }
}

module.exports = Scene;
