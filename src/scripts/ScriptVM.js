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
const { existsSync, readFileSync } = require('fs');
const IsolatedVM = require('isolated-vm');
const assert = require('assert');

function __JS__resolveSpecifier (specifier) {
    if (specifier.includes('/')) {
        let $module = null;

        const modulePath = path.resolve(
            path.join(
                'assets',
                specifier
            )
        );

        return modulePath;
    } else {
        return specifier;
    }
}

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

    evalSync (code) {
        this._context.evalSync(code);
    }

    async getGlobal (key) {
        const globals = this._context.global;

        return await globals.get(key);
    }

    async setGlobal (key, value) {
        const globals = this._context.global;

        await globals.set(key, value);
    }

    loadModule (
        modulePath,
        options = {}
    ) {
        const scriptKey = modulePath;

        if (this._loadedScripts.hasOwnProperty(scriptKey)) {
            return this._loadedScripts[scriptKey];
        }

        let code = '';

        if (existsSync(`${modulePath}`)) {
            code = readFileSync(
                modulePath,
                'utf-8'
            );
        } else if (existsSync(`${modulePath}.js`)) {
            code = readFileSync(
                modulePath,
                'utf-8'
            );
        } else if (existsSync(`${modulePath}.mjs`)) {
            code = readFileSync(
                modulePath,
                'utf-8'
            );
        }

        const filename = path.basename(modulePath);

        console.debug(`[${modulePath}]`);

        const actualCode = `
(
    function () {
        module.__path = "${modulePath}";

        ${code}\n;

        // __JS__.registerModule(module);

        // log(module.__path)
    }
)();
`;

        try {
            this._context.evalSync(
                actualCode,
                options
            );


            this._loadedScripts[scriptKey] = true;

            this._context.evalSync(
`
__JS__.modules["${modulePath}"] = module;

__JS__clearModule();
`
            )

            console.log(`MODULE: [${modulePath}]`);

            // this._loadedScripts[scriptKey] = result;

            // console.log(`MODULE: [${modulePath}]`, result);

            // return result;
        } catch (error) {
            if (
                !options.hasOwnProperty('ignoreErrors')
                || !options.ignoreErrors
            ) {
                console.error(`ERROR: ("${modulePath}")`);

                throw error;
            }

            // return null;
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

        return this.loadModule(
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

    _clearModule () {
        this.evalSync(
            `
            module = {
                id: '',
                path: '',
                exports: {},
                filename: '',
                loaded: false,
                children: [],
                paths: []
            };\n
            `
                    );
    }

    async _initializeContext () {
        this._context = await this._isolate.createContext();

        this._clearModule();

        await this.eval(
`
const __JS__ = {};

__JS__.modules = {};

__JS__.registerModule = function (module) {
    __JS__.modules[module.path] = module;
}

function require (specifier) {
    const modulePath = __JS__resolveSpecifier(specifier);

    if (
        !modulePath
            || !__JS__.modules[modulePath]
            || !__JS__.modules[modulePath].exports
    ) {
        __JS__loadModule(modulePath);
    }

    log('')
    log(JSON.stringify(__JS__.modules[modulePath]))
    log('')

    return __JS__.modules[modulePath].exports;
}
`
        );

        await this.setGlobal(
            '__JS__clearModule',
            () => {
                this._clearModule();
            }
        );

        await this.setGlobal(
            '__JS__loadModule',
            (modulePath) => {
                this.loadModule(modulePath);
            }
        );

        await this.setGlobal(
            '__JS__resolveSpecifier',
            __JS__resolveSpecifier
        );

        await this.setGlobal(
            'exit',
            (exitCode) => {
                ScriptVM.main._exitCode = exitCode;

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
