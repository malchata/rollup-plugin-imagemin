// Built-ins
import path from "path";
import fs from "fs";
import util from "util";
import crypto from "crypto";

// Plugin-specific
import { createFilter } from "rollup-pluginutils";
import chalk from "chalk";
import mkpath from "mkpath";
import imagemin from "imagemin";
import imageminJpegtran from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-optipng";
import imageminGifsicle from "imagemin-gifsicle";
import imageminSvgo from "imagemin-svgo";

// Promisified methods
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkpathAsync = util.promisify(mkpath);

export default function (userOptions = {}) {
  // Default options
  let defaultOptions = {
    disable: false,
    verbose: false,
    emitFiles: true,
    hashLength: 16,
    include: "**/*.{svg,png,jpg,jpeg,gif}",
    exclude: "",
    fileName: "[name]-[hash][extname]",
    publicPath: "",
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

  defaultOptions.plugins.push(imageminJpegtran(defaultOptions.jpegtran), imageminPngquant(defaultOptions.pngquant), imageminGifsicle(defaultOptions.gifsicle), imageminSvgo(defaultOptions.svgo));

  const pluginOptions = Object.assign(defaultOptions, userOptions);
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
        const name = path.basename(id, extname);
        let hash, outputFileName;

        if (!pluginOptions.disable) {
          return imagemin.buffer(buffer, {
            plugins: pluginOptions.plugins
          }).then(optimizedBuffer => {
            hash = crypto.createHash("sha1").update(optimizedBuffer).digest("hex").substr(0, pluginOptions.hashLength);
            outputFileName = path.join(pluginOptions.publicPath, pluginOptions.fileName.replace(/\[name\]/i, name).replace(/\[hash\]/i, hash).replace(/\[extname\]/i, extname));
            assets[outputFileName] = optimizedBuffer;

            if (pluginOptions.verbose) {
              const inputSize = buffer.toString().length;
              const outputSize = optimizedBuffer.toString().length;
              const smaller = outputSize < inputSize;
              const difference = Math.round(Math.abs(((outputSize / inputSize) * 100) - 1));
              console.log(chalk.green.bold(`${logPrefix} Optimized ${outputFileName}: ${smaller ? `~${difference}% smaller 🎉` : chalk.red(`~${difference}% bigger 🤕`)}`));
            }

            return `export default new URL("${outputFileName}", import.meta.url).href;`;
          }).catch(error => {
            this.error(`${logPrefix} Couldn't optimize image: ${error}`);
          });
        } else {
          hash = crypto.createHash("sha1").update(buffer).digest("hex").substr(0, pluginOptions.hashLength);
          outputFileName = path.join(pluginOptions.publicPath, pluginOptions.fileName.replace(/\[name\]/i, name).replace(/\[hash\]/i, hash).replace(/\[extname\]/i, extname));
          assets[outputFileName] = buffer;

          return `export default new URL("${outputFileName}", import.meta.url).href;`;
        }
      }).catch(error => {
        this.error(`${logPrefix} Couldn't read asset from disk: ${error}`);
      });
    },
    generateBundle (rollupOptions) {
      if (!pluginOptions.emitFiles) {
        return;
      }

      const base = rollupOptions.dir || path.dirname(rollupOptions.file);

      return Promise.all(Object.keys(assets).map(name => {
        const assetBase = path.resolve(path.dirname(path.join(base, name)));

        return mkpathAsync(assetBase).then(() => {
          return writeFile(path.join(base, name), assets[name]).catch(error => {
            this.error(`${logPrefix} Couldn't write optimized input buffer for ${name}: ${error}`);
          });
        });
      }));
    }
  };
}
