# rollup-plugin-imagemin

`rollup-plugin-imagemin` is a Rollup plugin that uses [`imagemin`](https://github.com/imagemin/imagemin) to optimize images in your Rollup build. If you've used `imagemin` on any other platform before, this will feel familiar to you.

## Install

```
npm i rollup-plugin-imagemin --save-dev
```

## Usage

```javascript
// rollup.config.js
import { imagemin } from "rollup-plugin-imagemin";

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
- `preserveTree` (default: `false`): If `true`, preserve directory structure relative to `process.cwd()`.
Can also be a path specifying root from where directory structure should be preserved.
- `gifsicle`: (default: `{ optimizationLevel: 3 }`): Settings to merge with default, to pass to [`imagemin-gifsicle`](https://www.npmjs.com/package/imagemin-gifsicle).
- `jpegtran` (default: `{ progressive: true }`): Settings to merge with default, to pass to [`imagemin-jpegtran`](https://www.npmjs.com/package/imagemin-jpegtran).
- `pngquant`: (default: `{ speed: 1, strip: true }`): Settings to merge with default, to pass to [`imagemin-pngquant`](https://www.npmjs.com/package/imagemin-pngquant).
- `svgo`: (default: `{ precision: 1, multipass: true }`): Settings to merge with default, to pass to [`imagemin-svgo`](https://www.npmjs.com/package/imagemin-svgo).
- `plugins`: object with *plugin names* as keys and [plugins](https://www.npmjs.com/search?q=keywords:imageminplugin) as value to pass to `imagemin`. By default, `{gifsicle: 'imagemin-gifsicle', jpegtran: 'imagemin-jpegtran', pngquant: 'imagemin-pngquant', svgo: 'imagemin-svgo'}` are used. Each plugin
function must be a factory, taking the plugin's config (the object at `options[pluginName]`, merged with defaults), and returning an imagemin buffer transformer.

## Using custom plugins

You can use custom plugins the following way:

```javascript
// rollup.config.js
import imagemin from "rollup-plugin-imagemin";
import myCustomPlugin from "imagemin-my-custom-plugin";

export default {
  plugins: [
    imagemin({
        myCustomPlugin: {
            // Config to pass to `myCustomPlugin`'s factory
        },
        plugins: {
            myCustomPlugin,
        }
    })
  ],
  input: "src/index.js"
  output: {
    format: "esm",
    file: "./dist/index.js"
  }
};
```

## Contributing

Please read the contributing guidelines in [`CONTRIBUTING.md`](https://github.com/malchata/rollup-plugin-imagemin/blob/master/CONTRIBUTING.md).

## Special thanks

This is my first Rollup plugin. As such, I drew extensive help from the Rollup documentation, but also from the [`rollup-plugin-url`](https://github.com/rollup/rollup-plugin-url) and [`rollup-plugin-image`](https://github.com/rollup/rollup-plugin-image) source code. If anything in the plugin looks familiar to either of those two, it's no coincidence, and I owe a lot to the authors of those plugins for inspiration and guidance.
