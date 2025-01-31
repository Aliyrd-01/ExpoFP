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
            return files.flatMap((file) => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    return scanDirectory(fullPath);
                } else {
                    const relativePath = path.relative(baseDir, fullPath);
                    // Change all \ to / for universal compatibility
                    return relativePath.split(path.sep).join("/");
                }
            });
        };

        return fs.existsSync(baseDir) ? scanDirectory(baseDir) : [];
    }

    apply(compiler) {
        // Using `thisCompilation` hook to access the compilation object
        compiler.hooks.thisCompilation.tap("BundleJsonPlugin", (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: "BundleJsonPlugin",
                    // The stage at which the asset will be added (should be >= ADDITIONAL)
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                },
                () => {
                    const assets = compilation
                        .getAssets()
                        .map((asset) => asset.name)
                        .filter((name) => {
                            return !this.exclude.some((pattern) => name.includes(pattern));
                        });

                    let publicFiles = [];
                    const resolvedPublicPath = path.resolve(
                        compiler.options.context || process.cwd(),
                        this.publicPath
                    );

                    if (fs.existsSync(resolvedPublicPath)) {
                        publicFiles = this.getAllFiles(resolvedPublicPath).filter((file) => {
                            return !this.exclude.some((pattern) => file.includes(pattern));
                        });
                    }

                    const combinedFiles = [...new Set([...assets, ...publicFiles])];
                    console.log(this.filename, combinedFiles);

                    // Emit the asset to the compilation
                    compilation.emitAsset(
                        this.filename,
                        new compiler.webpack.sources.RawSource(
                            JSON.stringify(combinedFiles, null, 2)
                        )
                    );
                }
            );
        });
    }
}

module.exports = BundleJsonPlugin;
