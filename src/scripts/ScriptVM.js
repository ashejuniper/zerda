const { readFile } = require('fs/promises');
const path = require('path');
const { glob } = require('glob');
const { Isolate } = require('isolated-vm');
const rl = require('raylib');

const Asset = require('./assets/Asset');

const Script = require("./Script");
const Image = require('./assets/Image');
const Scene = require('./assets/Scene');
const ScriptAsset = require('./assets/ScriptAsset');
const Entity = require('../entities/Entity');
const { existsSync } = require('fs');
const IsolatedVM = require('isolated-vm');
const assert = require('assert');

class ScriptVM extends Script {
    constructor () {
        super();

        this._isMain = false;
        this._shouldAppExit = false;

        this._loadedScripts = {};

        this._isolate = new Isolate(
            {
                memoryLimit: 1 * 1024 * 1024 * 1024,
                onCatastrophicError: async (message) => {
                    const error = new Error(message);

                    await this.error(
                        {
                            error,
                            message
                        }
                    );
                }
            }
        );
    }

    async onAttach (e) {
        await this._initializeContext();
    }

    async error (e) {
        console.error(e.message);

        process.exit(1);
    }

    async eval (code) {
        await this._context.eval(code);
    }

    async getGlobal (key) {
        const globals = this._context.global;

        return await globals.get(key);
    }

    async setGlobal (key, value) {
        const globals = this._context.global;

        await globals.set(key, value);
    }

    async loadModule (
        modulePath,
        options = {}
    ) {
        const scriptKey = modulePath;

        if (this._loadedScripts.hasOwnProperty(scriptKey)) {
            return this._loadedScripts[scriptKey];
        }

        let code = '';

        if (existsSync(`${modulePath}`)) {
            code = await readFile(
                modulePath,
                'utf-8'
            );
        } else if (existsSync(`${modulePath}.js`)) {
            code = await readFile(
                modulePath,
                'utf-8'
            );
        } else if (existsSync(`${modulePath}.mjs`)) {
            code = await readFile(
                modulePath,
                'utf-8'
            );
        }

        let $module = null;

        const filename = path.basename(modulePath);

        console.debug(`[${modulePath}]`);

        try {
            $module = await this._isolate.compileModule(
                code,
                {
                    filename
                }
            );

            const inst = await $module.instantiate(
                this._context,
                async (specifier, referrer) => {
                    if (specifier.includes('/')) {
                        let $module = null;

                        const modulePath = path.resolve(
                            path.join(
                                'assets',
                                specifier
                            )
                        );

                        $module = await this.loadModule(modulePath);

                        console.log(`IMPORT: [${modulePath}]`, $module);

                        return $module;
                    } else {
                        try {
                            return await this._context.eval(
                                `__NODEJS_REQUIRE__('${specifier}')`
                            )
                        } catch (error) {
                            return null;
                        }
                    }
                }
            );

            const result = await $module.evaluate();

            this._loadedScripts[scriptKey] = result;

            console.log(`MODULE: [${modulePath}]`, result);

            return $module;
        } catch (error) {
            if (
                !options.hasOwnProperty('ignoreErrors')
                || !options.ignoreErrors
            ) {
                console.error(`ERROR: ("${modulePath}"): ${error.message}`);
            }

            throw error;

            // return await this._context.eval("{}");
        }
    }

    async loadAllModules () {
        const assetDirectories = await glob("assets/*/")

        for (const assetDirectory of assetDirectories) {
            await this.loadModDirectory(assetDirectory);
        }
    }

    async loadModDirectory (
        modDirectory,
        options = {}
    ) {
        const modName = path.basename(modDirectory);

        const packageJSONPath = path.resolve(
            path.join(
                '.',
                'assets',
                modName,
                'package.json'
            )
        );

        assert(
            existsSync(packageJSONPath),
            `File [package.json] not found for mod "${modName}"`
        );

        const packageJSONString = await readFile(packageJSONPath);

        const packageJSON = JSON.parse(packageJSONString);

        const packageMainPath = packageJSON.main;

        const modulePath = path.resolve(
            modDirectory,
            packageMainPath
        );

        return await this.loadModule(
            modulePath,
            options
        );
    }

    async onTick (e) {
        if (this._shouldAppExit) {
            // Close the application's window.
            rl.CloseWindow();

            // Exit the application's process.
            process.exit();
        }
    }

    async _initializeContext () {
        this._context = await this._isolate.createContext();

        // await this.eval('module = {};\n');

        await this.setGlobal(
            'exit',
            () => {
                ScriptVM.main._shouldAppExit = true;
            }
        );

        await this.setGlobal(
            'log',
            (value) => {
                console.log(value);
            }
        );

        await this.setGlobal('EntityRef', Entity);
        await this.setGlobal('SceneRef', Scene);
        await this.setGlobal('ScriptRef', Script);
        await this.setGlobal('ImageRef', Image);
    }
}

module.exports = ScriptVM;
