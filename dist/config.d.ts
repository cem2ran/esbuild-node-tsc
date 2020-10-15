export declare type Config = Partial<{
    outDir: string;
    esbuild: {
        entryPoints?: string[];
        minify?: boolean;
        target?: string;
    };
    assets: {
        baseDir?: string;
        filePatterns?: string[];
    };
}>;
export declare function readUserConfig(configPath: string): Promise<Config>;
