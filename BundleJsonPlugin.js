const fs = require("fs");
const path = require("path");
const { Compilation } = require("webpack");

class BundleJsonPlugin {
    constructor(options = {}) {
        this.filename = options.filename || "bundle.json";
        this.exclude = options.exclude || [];
        this.publicPath = options.publicPath || "public";
    }

    getAllFiles(baseDir) {
        const scanDirectory = (dir) => {
            const files = fs.readdirSync(dir);
            return files.flatMap(file => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    return scanDirectory(fullPath);
                } else {
                    const relativePath = path.relative(baseDir, fullPath);
                    return relativePath.split(path.sep).join("/");
                }
            });
        };

        return scanDirectory(baseDir);
    }

    apply(compiler) {
        const isProduction = compiler.options.mode === "production";
        const outputPath = compiler.options.output.path;

        if (isProduction) {
            compiler.hooks.afterEmit.tapAsync("BundleJsonPlugin", (compilation, callback) => {
                try {
                    const allFiles = this.getAllFiles(outputPath);
                    const filteredFiles = allFiles.filter(file =>
                        !this.exclude.some(pattern => file.includes(pattern))
                    );

                    fs.writeFileSync(
                        path.join(outputPath, this.filename),
                        JSON.stringify(filteredFiles, null, 2),
                        "utf-8"
                    );

                    console.log("[BundleJsonPlugin Production] Final result:", filteredFiles);
                    callback();
                } catch (err) {
                    callback(err);
                }
            });
        } else {
            compiler.hooks.thisCompilation.tap("BundleJsonPlugin", compilation => {
                compilation.hooks.processAssets.tap(
                    {
                        name: "BundleJsonPlugin",
                        stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                    },
                    () => {
                        const assets = compilation.getAssets()
                            .map(asset => asset.name)
                            .filter(name => !name.startsWith("webpack-dev-server"));

                        let publicFiles = [];
                        const resolvedPublicPath = path.resolve(
                            compiler.options.context || process.cwd(),
                            this.publicPath
                        );

                        if (fs.existsSync(resolvedPublicPath)) {
                            publicFiles = this.getAllFiles(resolvedPublicPath)
                                .map(file => path.relative(resolvedPublicPath, path.join(resolvedPublicPath, file)))
                                .map(file => file.split(path.sep).join("/"));
                        }

                        const combinedFiles = [...new Set([...assets, ...publicFiles])];
                        const filteredFiles = combinedFiles.filter(file =>
                            !this.exclude.some(pattern => file.includes(pattern))
                        );

                        console.log("[BundleJsonPlugin Development] Final file list:", filteredFiles);

                        compilation.emitAsset(
                            this.filename,
                            new compiler.webpack.sources.RawSource(
                                JSON.stringify(filteredFiles, null, 2)
                            )
                        );
                    }
                );
            });
        }
    }
}

module.exports = BundleJsonPlugin;
