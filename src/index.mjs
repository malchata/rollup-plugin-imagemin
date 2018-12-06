import fs from "fs";
import util from "util";
import { createFilter } from "rollup-pluginutils";
import chalk from "chalk";
import imagemin from "imagemin";
import imageminJpegtran from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-optipng";
import imageminGifsicle from "imagemin-gifsicle";
import imageminSvgo from "imagemin-svgo";

export default function (userOptions = {}) {
  const defaults = {
    include: "**/*.{svg,png,jpe?g,gif}",
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
  const promise = (fn, ...args) => new Promise((resolve, reject) => fn(...args, (err, res) => err ? reject(err) : resolve(res)));

  return {
    name: "imagemin",
    load (id) {
      if (!filter(id)) {
        return null;
      }

      return Promise.all([
        promise(fs.stat, id),
        promise(fs.readFile, id)
      ]).then(async ([stats, inputImageBuffer]) => {
        const outputImageBuffer = await imagemin.buffer(inputImageBuffer, options.imageminOptions);
        const assetId = this.emitAsset(this.getAssetFileName(id), outputImageBuffer);
        console.dir(id);

        // return `export default import.meta.ROLLUP_ASSET_URL_${assetId}`;
      });
    }
  };
}
