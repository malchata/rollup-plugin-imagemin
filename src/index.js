// Built-ins
import path from "path";
import fs from "fs";
import util from "util";

// Helpers
import dropUndefinedKeys from "./helpers/drop-undefined-keys";
import generateOutputFileName from "./helpers/generate-output-file-name";
import getDefaultOptions from "./helpers/get-default-options";
import logOptimizationResult from "./helpers/log-optimization-result";
import resolveAssetName from "./helpers/resolve-asset-name";

// Plugin-specific
import { createFilter } from "@rollup/pluginutils";
import chalk from "chalk";
import mkpath from "mkpath";
import imagemin from "imagemin";
import imageminJpegtran from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-optipng";
import imageminGifsicle from "imagemin-gifsicle";
import imageminSvgo from "imagemin-svgo";
import glob from "glob";

// Promisified methods
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkpathAsync = util.promisify(mkpath);

export default function (userOptions = {}) {
  // Default options
  const defaultOptions = getDefaultOptions();

  // Remove `undefined` user options
  userOptions = dropUndefinedKeys(userOptions);

  // Inject default plugin factories
  const allPluginsFactories = {
    jpegtran: imageminJpegtran,
    pngquant: imageminPngquant,
    gifsicle: imageminGifsicle,
    svgo: imageminSvgo,
    ...(userOptions.plugins)
  };

  // Get pairs to use array functions
  const allPluginsFactoriesPairs = Object.entries(allPluginsFactories);

  // Merge 1st level options
  const pluginOptions = { ...defaultOptions, ...userOptions };

  // Merge user options with defaults for each plugin
  allPluginsFactoriesPairs.reduce((pluginOptionsAcc, [pluginName]) => {
    // Remove `undefined` plugin user options
    const pluginUserOpts = dropUndefinedKeys(userOptions[pluginName] || {});

    pluginOptionsAcc[pluginName] = { ...(defaultOptions[pluginName]), ...pluginUserOpts };

    return pluginOptionsAcc;
  }, pluginOptions);

  // Run factories
  pluginOptions.plugins = allPluginsFactoriesPairs.map(([pluginName, factoryFunction]) => factoryFunction(pluginOptions[pluginName]));

  const filter = createFilter(pluginOptions.include, pluginOptions.exclude);
  const logPrefix = "imagemin:";
  let assets = {};

  return {
    name: "imagemin",
    buildStart () {
      if (pluginOptions.verbose && pluginOptions.disable) {
        pluginOptions.disable ? console.log(chalk.yellow.bold(`${logPrefix} Skipping image optimizations.`)) : console.log(chalk.green.bold(`${logPrefix} Optimizing images...`));
      }
    },
    load (id) {
      if (!filter(id)) {
        return null;
      }

      return readFile(id).then(buffer => {
        const extname = path.extname(id);
        const name = resolveAssetName(id, extname, pluginOptions);
        let outputFileName;

        if (!pluginOptions.disable) {
          return imagemin.buffer(buffer, {
            plugins: pluginOptions.plugins
          }).then(optimizedBuffer => {
            outputFileName = generateOutputFileName(buffer, name, extname, pluginOptions);
            assets[outputFileName] = optimizedBuffer;

            if (pluginOptions.verbose) {
              logOptimizationResult(buffer, optimizedBuffer, logPrefix, outputFileName);
            }

            return `export default new URL("${outputFileName}", import.meta.url).href;`;
          }).catch(error => {
            this.error(`${logPrefix} Couldn't optimize image: ${error}`);
          });
        } else {
          outputFileName = generateOutputFileName(buffer, name, extname, pluginOptions);
          assets[outputFileName] = buffer;

          return `export default new URL("${outputFileName}", import.meta.url).href;`;
        }
      }).catch(error => {
        this.error(`${logPrefix} Couldn't read asset from disk: ${error}`);
      });
    },
    buildEnd () {
      if (pluginOptions.dirs.length) {
        for (let dirIndex in pluginOptions.dirs) {
          const dir = pluginOptions.dirs[dirIndex];

          glob(dir, (error, files) => {
            if (error) {
              this.error(error);
            }

            for (let fileIndex in files) {
              const file = files[fileIndex];

              readFile(file).then(buffer => {
                const extname = path.extname(file);
                const name = resolveAssetName(file, extname, pluginOptions);
                let outputFileName;

                if (!pluginOptions.disable) {
                  return imagemin.buffer(buffer, {
                    plugins: pluginOptions.plugins
                  }).then(optimizedBuffer => {
                    outputFileName = generateOutputFileName(buffer, name, extname, pluginOptions);
                    assets[outputFileName] = optimizedBuffer;

                    if (pluginOptions.verbose) {
                      logOptimizationResult(buffer, optimizedBuffer, logPrefix, outputFileName);
                    }

                    return `export default new URL("${outputFileName}", import.meta.url).href;`;
                  }).catch(error => {
                    this.error(`${logPrefix} Couldn't optimize image: ${error}`);
                  });
                } else {
                  outputFileName = generateOutputFileName(buffer, name, extname, pluginOptions);
                  assets[outputFileName] = buffer;

                  return `export default new URL("${outputFileName}", import.meta.url).href;`;
                }
              }).catch(error => {
                this.error(`${logPrefix} Couldn't read asset from disk: ${error}`);
              });
            }
          });
        }
      }
    },
    generateBundle (rollupOptions) {
      if (!pluginOptions.emitFiles) {
        return;
      }

      const base = rollupOptions.dir || path.dirname(rollupOptions.file);

      return Promise.all(Object.keys(assets).map(name => {
        const assetBase = path.resolve(path.dirname(path.join(base, name)));

        console.log(path.join(base, name));

        return mkpathAsync(assetBase).then(() => {
          return writeFile(path.join(base, name), assets[name]).catch(error => {
            this.error(`${logPrefix} Couldn't write optimized input buffer for ${name}: ${error}`);
          });
        });
      }));
    }
  };
}
