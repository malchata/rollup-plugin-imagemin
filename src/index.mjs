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
  const defaults = {
    disable: false,
    verbose: false,
    include: "**/*.{svg,png,jpe?g,gif}",
    hashLength: 16,
    imageminOptions: {
      plugins: [
        imageminJpegtran(),
        imageminPngquant(),
        imageminGifsicle(),
        imageminSvgo()
      ]
    }
  };

  const options = Object.assign(defaults, userOptions);
  const filter = createFilter(options.include);
  const preamble = "imagemin:";

  return {
    name: "imagemin",
    buildStart () {
      if (options.verbose && options.disable) {
        console.log(chalk.yellow.bold(`${preamble} Skipping image optimizations.`));
      }

      if (options.verbose && !options.disable) {
        console.log(chalk.green.bold(`${preamble} Optimizing images...`));
      }
    },
    load (id) {
      if (!filter(id)) {
        return null;
      }

      return readFileAsync(id).then(buffer => {
        const outputFilename = path.basename(id);

        if (!options.disable) {
          return imagemin.buffer(buffer, options.imageminOptions).then(optimizedBuffer => {
            const assetId = this.emitAsset(outputFilename, optimizedBuffer);

            if (options.verbose) {
              const inputSize = buffer.toString().length;
              const outputSize = optimizedBuffer.toString().length;
              const smaller = outputSize < inputSize;
              const difference = Math.round(Math.abs(((outputSize / inputSize) * 100) - 1));

              if (options.verbose) {
                console.log(chalk.green.bold(`${preamble} Optimized ${outputFilename}: ${smaller ? `~${difference}% smaller 🎉` : chalk.red(`~${difference}% bigger 🤕`)}`));
              }
            }

            return `export default import.meta.ROLLUP_ASSET_URL_${assetId}`;
          }).catch(error => {
            this.error(`${preamble} Couldn't optimize image: ${error}`);
          });
        } else {
          const assetId = this.emitAsset(outputFilename, buffer);

          return `export default import.meta.ROLLUP_ASSET_URL_${assetId}`;
        }
      }).catch(error => {
        this.error(`${preamble} Couldn't read asset from disk: ${error}`);
      });
    }
  };
}
