# rollup-plugin-imagemin

`rollup-plugin-imagemin` is a Rollup plugin that uses [`imagemin`](https://github.com/imagemin/imagemin) to optimize images in your Rollup build. If you've used `imagemin` on any other platform before, this will feel familiar to you.

## Install

```
npm i rollup-plugin-imagemin --save-dev
```

## Usage

```javascript
// rollup.config.js
import imagemin from "rollup-plugin-imagemin";

export default {
  plugins: [
    imagemin()
  ],
  input: "src/index.js"
  output: {
    format: "esm",
    file: "./dist/index.js"
  }
};

// src/index.js
import someImage from "./some-image.png"; // <-- With the above config, this should output an optimized PNG to the dist folder.
```

## Options

`rollup-plugin-imagemin` has number of useful options to help you tune your builds to your liking:

- `disable` (default: `false`): Disable all optimizations and output unoptimized images. Useful for speedier development builds.
- `verbose` (default: `false`): Enables verbose logging, such as optimization gains.
- `emitFiles` (default: `true`): Whether to emit files. Could be useful for server side builds. Be aware that unless `disable` is set to `true`, images will still be optimized in memory, but will not be written to disk.
- `hashLength` (default: `16`): The length of hashes used in asset filenames.
- `include` (default: `"**/*.{svg,png,jpg,jpeg,gif}"`): File glob pattern of assets to be processed by `rollup-plugin-imagemin`.
- `exclude` (default: `""`): File glob pattern of assets to _not_ be processed by `rollup-plugin-imagemin`. The pattern defined by `exclude` is applied after the value of the `include` option pattern.
- `fileName` (default: `"[name]-[hash][extname]"`): The output filename pattern of images optimized by `rollup-plugin-imagemin`. The pattern includes the following tokens:
  - `[name]`: The basename of the input file.
  - `[hash]`: The has of the input file.
  - `[extname]`: The extension of the input file.
- `publicPath` (default: `""`): A folder for where to put optimized assets. Use this to separate your images into a separate folder.
- `gifsicle`: (default: `{ optimizationLevel: 3 }`): Settings to pass to [`imagemin-gifsicle`](https://www.npmjs.com/package/imagemin-gifsicle).
- `jpegtran` (default: `{ progressive: true }`): Settings to pass to [`imagemin-jpegtran`](https://www.npmjs.com/package/imagemin-jpegtran).
- `pngquant`: (default: `{ speed: 1, strip: true }`): Settings to pass to [`imagemin-pngquant`](https://www.npmjs.com/package/imagemin-pngquant).
- `svgo`: (default: `{ precision: 1, multipass: true }`): Settings to pass to [`imagemin-svgo`](https://www.npmjs.com/package/imagemin-svgo).
- `plugins`: Array of [plugins](https://www.npmjs.com/search?q=keywords:imageminplugin) to pass to `imagemin`. By default, `imagemin-gifsicle`, `imagemin-jpegtran`, `imagemin-pngquant`, and `imagemin-svgo` are used. Be aware that specifying this option will totally overwrite the array of default plugins, so you will need to specify optimizers for every file type! Most often, the defaults are just fine, so only modify this if you're quite comfortable with configuring `imagemin`.

## Warning!

`rollup-plugin-imagemin` is not production-ready! While tests pass and everything _seems_ to work fine, it's likely that there be dragons. If you find anything wrong, please file an issue (after first looking at [the list of existing issues](https://github.com/malchata/rollup-plugin-imagemin/issues), of course) and include the following:

- Your OS version.
- Your Node version.
- A link to a minimal reproducible test repo. This repo should include a local web server to help save time in reproducing the error locally.
- The browser and browser version the error occurs in, if applicable.

## Special thanks

This is my first Rollup plugin. As such, I drew extensive help from the Rollup documentation, but also from the [`rollup-plugin-url'](https://github.com/rollup/rollup-plugin-url) and [`rollup-plugin-image'](https://github.com/rollup/rollup-plugin-image) source code. If anything in the plugin looks familiar to either of those two, it's no coincidence, and I owe a lot to the authors of those plugins for inspiration and guidance.
