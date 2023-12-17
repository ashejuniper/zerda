const brain = require('brain.js');
const { GPU } = require('gpu.js');
const rl = require('raylib');

const { AssetLoader } = require('./traits/assets');
const UserInput = require('./user-input');

class AppWindow {
    constructor (
        title,
        width = 640,
        height = 480,
        borderlessFullscreen = false
    ) {
        this._width = width;
        this._height = height;
        this._title = title;
        this.backgroundColor = rl.BLACK;

        if (borderlessFullscreen) {
            this._isBorderlessFullscreenEnabled = true;

            rl.SetConfigFlags(rl.FLAG_WINDOW_UNDECORATED);
        } else {
            this._isBorderlessFullscreenEnabled = false;

            rl.SetConfigFlags(rl.FLAG_WINDOW_RESIZABLE);
        }
    }

    getRenderer () {
        return this._renderer;
    }

    setRenderer (renderer) {
        this._renderer = renderer;
    }

    async start () {
        rl.InitWindow(this._width, this._height, this._title);

        rl.HideCursor();

        if (this._isBorderlessFullscreenEnabled) {
            AppWindow.toggleFullscreen();
        }

        await AssetLoader.loadAll();

        // TODO: Render a configurable, modular loading screen until all assets have been loaded.

        while (!rl.WindowShouldClose()) {
            this.tick();

            rl.BeginDrawing();

            rl.ClearBackground(this.backgroundColor);

            this.render();

            rl.EndDrawing();
        }

        if (AppWindow.isFullscreenEnabled()) {
            AppWindow.toggleFullscreen();
        }

        rl.ShowCursor();

        AssetLoader.unloadAll();

        rl.CloseWindow();
    }

    async render () {
        await this._renderer?.render();
    }

    async tick () {
        if (UserInput.pressed('toggleFullscreen')) {
            AppWindow.toggleFullscreen();
        }
    }

    title () {
        return this._title;
    }

    static disableFullscreen () {
        if (AppWindow.isFullscreenEnabled()) {
            rl.ToggleFullscreen();
        }
    }

    static enableFullscreen () {
        if (!AppWindow.isFullscreenEnabled()) {
            rl.ToggleFullscreen();
        }
    }

    static isFullscreenEnabled () {
        return rl.IsWindowFullscreen();
    }

    static toggleFullscreen () {
        if (AppWindow.isFullscreenEnabled()) {
            AppWindow.disableFullscreen();
        } else {
            AppWindow.enableFullscreen();
        }
    }
}

module.exports = AppWindow;
