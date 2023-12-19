class TimeModule {
    constructor () {
        this._now = Date.now();

        this._previous = this.now();
    }

    delta () {
        return this._now - this._previous;
    }

    now () {
        return this._now;
    }

    tick () {
        this._previous = this._now;

        this._now = Date.now();
    }
}

module.exports = TimeModule;
