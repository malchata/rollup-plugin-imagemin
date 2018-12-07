// Built-ins
import path from "path";
import fs from "fs";
import util from "util";

// Plugin-specific
import { createFilter } from "rollup-pluginutils";
import chalk from "chalk";
import imagemin from "imagemin";
import imageminJpegtran from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-optipng";
import imageminGifsicle from "imagemin-gifsicle";
import imageminSvgo from "imagemin-svgo";

// Promisified methods
const readFileAsync = util.promisify(fs.readFile);

export default function (userOptions = {}) {
  // Default options
  let defaults = {
    disable: false,
    verbose: false,
    include: "**/*.{svg,png,jpg,jpeg,gif}",
    jpegtran: {
      progressive: true
    },
    pngquant: {
      speed: 1,
      strip: true
    },
    gifsicle: {
      optimizationLevel: 3
    },
    svgo: {
      precision: 1,
      multipass: true
    },
    plugins: []
  };

  defaults.plugins.push(imageminJpegtran(defaults.jpegtran), imageminPngquant(defaults.pngquant), imageminGifsicle(defaults.gifsicle), imageminSvgo(defaults.svgo));

  const options = Object.assign(defaults, userOptions);
  const filter = createFilter(options.include);
  const logPrefix = "imagemin:";

  return {
    name: "imagemin",
    buildStart () {
      if (options.verbose && options.disable) {
        options.disable ? console.log(chalk.yellow.bold(`${logPrefix} Skipping image optimizations.`)) : console.log(chalk.green.bold(`${logPrefix} Optimizing images...`));
      }
    },
    load (id) {
      if (!filter(id)) {
        return null;
      }

      return readFileAsync(id).then(buffer => {
        const outputFilename = path.basename(id);

        if (!options.disable) {
          return imagemin.buffer(buffer, {
            plugins: options.plugins
          }).then(optimizedBuffer => {
            const assetId = this.emitAsset(outputFilename, optimizedBuffer);

            if (options.verbose) {
              const inputSize = buffer.toString().length;
              const outputSize = optimizedBuffer.toString().length;
              const smaller = outputSize < inputSize;
              const difference = Math.round(Math.abs(((outputSize / inputSize) * 100) - 1));
              console.log(chalk.green.bold(`${logPrefix} Optimized ${outputFilename}: ${smaller ? `~${difference}% smaller 🎉` : chalk.red(`~${difference}% bigger 🤕`)}`));
            }

            return `export default import.meta.ROLLUP_ASSET_URL_${assetId}`;
          }).catch(error => {
            this.error(`${logPrefix} Couldn't optimize image: ${error}`);
          });
        } else {
          const assetId = this.emitAsset(outputFilename, buffer);

          return `export default import.meta.ROLLUP_ASSET_URL_${assetId}`;
        }
      }).catch(error => {
        this.error(`${logPrefix} Couldn't read asset from disk: ${error}`);
      });
    }
  };
}
