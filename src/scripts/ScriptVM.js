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

const __REQUIRE__uuid = require('uuid');

function __JS__resolveSpecifier (specifier, dirname) {
    let modulePath = './index.js';

    if (specifier.includes('/')) {
        if (specifier.startsWith('./')) {
            modulePath = path.resolve(
                path.join(
                    dirname,
                    specifier
                )
            );
        } else {
            modulePath = path.resolve(
                path.join(
                    'assets',
                    specifier
                )
            );
        }

        if (existsSync(modulePath + '.js')) {
            modulePath += '.js';
        } else if (existsSync(modulePath + '.mjs')) {
            modulePath += '.mjs';
        }

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

    getGlobalSync (key) {
        const globals = this._context.global;

        return globals.getSync(key);
    }

    async setGlobal (key, value) {
        const globals = this._context.global;

        await globals.set(key, value);
    }

    setGlobalSync (key, value) {
        const globals = this._context.global;

        globals.setSync(key, value);
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
                modulePath += '.js',
                'utf-8'
            );
        } else if (existsSync(`${modulePath}.mjs`)) {
            code = readFileSync(
                modulePath += '.mjs',
                'utf-8'
            );
        }

        const dirname = path.dirname(modulePath);

        let filename = path.basename(modulePath);

        const actualCode = `
(
    function () {
        __JS__setGlobal('__dirname', "${dirname}");
        __JS__setGlobal('__filename', "${filename}");

        module.path = __dirname;
        module.filename = __filename;

        ${code}\n;

        __JS__.registerModule(module);
    }
)();
`;

        try {
            this._defineGlobals(
                {
                    dirname,
                    filename
                }
            );

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
            );
        } catch (error) {
            if (
                !options.hasOwnProperty('ignoreErrors')
                || !options.ignoreErrors
            ) {
                console.error(`ERROR: ("${modulePath}")`);

                throw error;
            }
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

    _defineGlobals (globals = {}) {
        const tasks = [];

        this._context.global.setSync(
            '__dirname',
            globals.dirname
        );

        this._context.global.setSync(
            '__filename',
            globals.filename
        );

        this._context.global.setSync(
            '__REQUIRE__path__join',
            path.join
        );

        this._context.global.setSync(
            '__REQUIRE__path__resolve',
            path.resolve
        );

        this.evalSync(`
__REQUIRE__path = {};

__REQUIRE__path.join = __REQUIRE__path__join;
__REQUIRE__path.resolve = __REQUIRE__path__resolve;
        `);
    }

    async _initializeContext () {
        this._context = await this._isolate.createContext();

        this._clearModule();

        await this.eval(
`
const __JS__ = {};

__JS__.modules = {};

__JS__.registerModule = function (module) {
    const path = require('path');

    const modulePath = path.resolve(
        path.join(
            module.path,
            '/',
            module.filename
        )
    );

    __JS__.modules[modulePath] = module;
}

function require (specifier) {
    switch (specifier) {
        case 'path':
            return __REQUIRE__path;
        default:
            break;
    }

    const modulePath = __JS__resolveSpecifier(specifier, __dirname);

    if (
        !modulePath
            || !__JS__.modules[modulePath]
            || !__JS__.modules[modulePath].hasOwnProperty('exports')
    ) {
        __JS__loadModule(modulePath);
    }

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
            '__JS__setGlobal',
            (key, value) => {
                this.setGlobalSync(key, value);
            }
        );

        await this.setGlobal(
            '__UUID_v4',
            __REQUIRE__uuid.v4
        );

        this.evalSync(`
const UUID = {
    v4: __UUID_v4
};
`)

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
