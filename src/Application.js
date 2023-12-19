const brain = require('brain.js');
const { GPU } = require('gpu.js');
const rl = require('raylib');

const { AssetLoader } = require('./scripts/assets');
const UserInput = require('./user-input');
const Entity = require('./entities/Entity');
const Camera = require('./scripts/Camera');
const ScriptVM = require('./scripts/ScriptVM');
const Scene = require('./scripts/assets/Scene');

let instance = null;

class Application {
    static instance () {
        return instance;
    }

    constructor (
        title,
        width = 640,
        height = 480,
        borderlessFullscreen = false
    ) {
        instance = this;

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

    async start () {
        rl.InitWindow(this._width, this._height, this._title);

        rl.HideCursor();

        if (this._isBorderlessFullscreenEnabled) {
            Application.toggleFullscreen();
        }

        /* Create the main Scene. */

        Scene.main = new Scene();

        const sceneEntity = new Entity();

        await sceneEntity._initialize(Scene.main);

        /* Create the main ScriptVM. */

        ScriptVM.main = new ScriptVM();

        ScriptVM.main._isMain = true;

        await ScriptVM.main._initializeContext();

        await Scene.main.createChild(ScriptVM.main);

        /* Create the main camera. */

        Camera.main = new Camera();

        await Scene.main.createChild(Camera.main);

        Camera.main.transform().position = { x: 5, y: 5, z: 5 };

        /* Load all assets from the assets directory. */

        await AssetLoader.loadAll();

        // TODO: Render a configurable, modular loading screen until all assets have been loaded.

        /* Run the main application loop. */

        while (!rl.WindowShouldClose()) {
            await this.tick();

            rl.BeginDrawing();

            rl.ClearBackground(this.backgroundColor);

            await this.render();

            rl.EndDrawing();
        }

        if (Application.isFullscreenEnabled()) {
            Application.toggleFullscreen();
        }

        rl.ShowCursor();

        await AssetLoader.unloadAll();

        rl.CloseWindow();
    }

    async render () {
        rl.BeginMode3D(Camera.main);

        await Entity.runAll(
            async (entity) => {
                await entity.render({});
            }
        );

        rl.EndMode3D(Camera.main);
    }

    async tick () {
        if (UserInput.pressed('toggleFullscreen')) {
            Application.toggleFullscreen();
        }

        await Entity._tickAll({});
    }

    title () {
        return this._title;
    }

    static disableFullscreen () {
        if (Application.isFullscreenEnabled()) {
            rl.ToggleFullscreen();
        }
    }

    static enableFullscreen () {
        if (!Application.isFullscreenEnabled()) {
            rl.ToggleFullscreen();
        }
    }

    static isFullscreenEnabled () {
        return rl.IsWindowFullscreen();
    }

    static toggleFullscreen () {
        if (Application.isFullscreenEnabled()) {
            Application.disableFullscreen();
        } else {
            Application.enableFullscreen();
        }
    }
}

module.exports = Application;
