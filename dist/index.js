#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const esbuild_1 = require("esbuild");
const cpy_1 = __importDefault(require("cpy"));
const path_1 = __importDefault(require("path"));
const rimraf_1 = __importDefault(require("rimraf"));
const config_1 = require("./config");
const cwd = process.cwd();
function getTSConfig() {
    const tsConfigFile = typescript_1.default.findConfigFile(cwd, typescript_1.default.sys.fileExists, "tsconfig.json");
    if (!tsConfigFile) {
        throw new Error(`tsconfig.json not found in the current directory! ${cwd}`);
    }
    const configFile = typescript_1.default.readConfigFile(tsConfigFile, typescript_1.default.sys.readFile);
    const tsConfig = typescript_1.default.parseJsonConfigFileContent(configFile.config, typescript_1.default.sys, cwd);
    return { tsConfig, tsConfigFile };
}
function esBuildSourceMapOptions(tsConfig) {
    const { sourceMap, inlineSources, inlineSourceMap } = tsConfig.options;
    // inlineSources requires either inlineSourceMap or sourceMap
    if (inlineSources && !inlineSourceMap && !sourceMap) {
        return false;
    }
    // Mutually exclusive in tsconfig
    if (sourceMap && inlineSourceMap) {
        return false;
    }
    if (inlineSourceMap) {
        return "inline";
    }
    return sourceMap;
}
function getBuildMetadata(userConfig) {
    var _a, _b, _c, _d, _e, _f, _g;
    const { tsConfig, tsConfigFile } = getTSConfig();
    const outDir = userConfig.outDir || tsConfig.options.outDir || "dist";
    const esbuildEntryPoints = ((_a = userConfig.esbuild) === null || _a === void 0 ? void 0 : _a.entryPoints) || [];
    const srcFiles = [...tsConfig.fileNames, ...esbuildEntryPoints];
    const sourcemap = esBuildSourceMapOptions(tsConfig);
    const target = ((_b = userConfig.esbuild) === null || _b === void 0 ? void 0 : _b.target) || ((_d = (_c = tsConfig === null || tsConfig === void 0 ? void 0 : tsConfig.raw) === null || _c === void 0 ? void 0 : _c.compilerOptions) === null || _d === void 0 ? void 0 : _d.target) ||
        "es6";
    const minify = ((_e = userConfig.esbuild) === null || _e === void 0 ? void 0 : _e.minify) || false;
    const esbuildOptions = {
        outdir: outDir,
        entryPoints: srcFiles,
        sourcemap,
        target,
        minify,
        tsconfig: tsConfigFile,
    };
    const assetPatterns = ((_f = userConfig.assets) === null || _f === void 0 ? void 0 : _f.filePatterns) || ["**"];
    const assetsOptions = {
        baseDir: ((_g = userConfig.assets) === null || _g === void 0 ? void 0 : _g.baseDir) || "src",
        outDir: outDir,
        patterns: [...assetPatterns, `!**/*.{ts,tsx,jsx}`],
    };
    return { outDir, esbuildOptions, assetsOptions };
}
function buildSourceFiles(esbuildOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield esbuild_1.build(Object.assign(Object.assign({}, esbuildOptions), { bundle: false, format: "cjs", platform: "node" }));
    });
}
function copyNonSourceFiles({ baseDir, outDir, patterns, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const relativeOutDir = path_1.default.relative(baseDir, outDir);
        return yield cpy_1.default(patterns, relativeOutDir, {
            cwd: baseDir,
            parents: true,
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield config_1.readUserConfig(path_1.default.resolve(cwd, "etsc.config.js"));
        const { outDir, esbuildOptions, assetsOptions } = getBuildMetadata(config);
        rimraf_1.default.sync(outDir);
        yield Promise.all([
            buildSourceFiles(esbuildOptions),
            copyNonSourceFiles(assetsOptions),
        ]);
    });
}
console.time("Built in");
main()
    .then(() => {
    console.timeEnd("Built in");
    process.exit(0);
})
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map