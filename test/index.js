/* global describe it after */

// Built-ins
import fs from "fs";

import assert from "assert";
import util from "util";

// Test-specific
import imagemin, { getDefaultOptions } from "../src";
import rimraf from "rimraf";
import { stub } from "simple-mock";
import { rollup } from "rollup";

// Change process to tests directory
process.chdir(__dirname);

// Promisified methods
const stat = util.promisify(fs.stat);

describe("rollup-plugin-imagemin", () => {
  describe("disable: false", () => {
    after(() => promise(rimraf, "output"));

    it("should output an optimized GIF", () => {
      return run("fixtures/gif.js", "output/gif.js").then(() => {
        return Promise.all([
          assertExists("output/gif.gif"),
          assertSmaller("fixtures/gif.gif", "output/gif.gif")
        ]);
      });
    });

    it("should output an optimized JPG", () => {
      return run("fixtures/jpg.js", "output/jpg.js").then(() => {
        return Promise.all([
          assertExists("output/jpg.jpg"),
          assertSmaller("fixtures/jpg.jpg", "output/jpg.jpg")
        ]);
      });
    });

    it("should output an optimized PNG", () => {
      return run("fixtures/png.js", "output/png.js").then(() => {
        return Promise.all([
          assertExists("output/png.png"),
          assertSmaller("fixtures/png.png", "output/png.png")
        ]);
      });
    });

    it("should output an optimized SVG", () => {
      return run("fixtures/svg.js", "output/svg.js").then(() => {
        return Promise.all([
          assertExists("output/svg.svg"),
          assertSmaller("fixtures/svg.svg", "output/svg.svg")
        ]);
      });
    });
  });

  describe("disable: true", () => {
    after(() => promise(rimraf, "output"));

    it("should output an unoptimized GIF", () => {
      return run("fixtures/gif.js", "output/gif.js", true).then(() => {
        return Promise.all([
          assertExists("output/gif.gif"),
          assertSmaller("fixtures/gif.gif", "output/gif.gif", false)
        ]);
      });
    });

    it("should output an unoptimized JPG", () => {
      return run("fixtures/jpg.js", "output/jpg.js", true).then(() => {
        return Promise.all([
          assertExists("output/jpg.jpg"),
          assertSmaller("fixtures/jpg.jpg", "output/jpg.jpg", false)
        ]);
      });
    });

    it("should output an unoptimized PNG", () => {
      return run("fixtures/png.js", "output/png.js", true).then(() => {
        return Promise.all([
          assertExists("output/png.png"),
          assertSmaller("fixtures/png.png", "output/png.png", false)
        ]);
      });
    });

    it("should output an unoptimized SVG", () => {
      return run("fixtures/svg.js", "output/svg.js", true).then(() => {
        return Promise.all([
          assertExists("output/svg.svg"),
          assertSmaller("fixtures/svg.svg", "output/svg.svg", false)
        ]);
      });
    });
  });

  describe("emitFiles: false", () => {
    it("should NOT output a GIF", () => {
      return run("fixtures/gif.js", "output/gif.js", true, false).then(() => {
        return Promise.all([
          assertExists("output/gif.gif", true)
        ]);
      });
    });

    it("should NOT output a JPG", () => {
      return run("fixtures/jpg.js", "output/jpg.js", true, false).then(() => {
        return Promise.all([
          assertExists("output/jpg.jpg", true)
        ]);
      });
    });

    it("should NOT output a PNG", () => {
      return run("fixtures/png.js", "output/png.js", true, false).then(() => {
        return Promise.all([
          assertExists("output/png.png", true)
        ]);
      });
    });

    it("should NOT output an SVG", () => {
      return run("fixtures/svg.js", "output/svg.js", true, false).then(() => {
        return Promise.all([
          assertExists("output/svg.svg", true)
        ]);
      });
    });
  });

  describe("preserveTree: true", () => {
    it("should preserve tree relative to cwd", () => {
      return run("fixtures/gif.js", "output/gif.js", true, true, true).then(() => {
        return Promise.all([
          assertExists("output/fixtures/gif.gif")
        ]);
      });
    });

    it("should preserve tree relative to cwd", () => {
      return run("fixtures/jpg.js", "output/jpg.js", true, true, true).then(() => {
        return Promise.all([
          assertExists("output/fixtures/jpg.jpg")
        ]);
      });
    });

    it("should preserve tree relative to cwd", () => {
      return run("fixtures/png.js", "output/png.js", true, true, true).then(() => {
        return Promise.all([
          assertExists("output/fixtures/png.png")
        ]);
      });
    });

    it("should preserve tree relative to cwd", () => {
      return run("fixtures/svg.js", "output/svg.js", true, true, true).then(() => {
        return Promise.all([
          assertExists("output/fixtures/svg.svg")
        ]);
      });
    });
  });

  describe("preserveTree: ../", () => {
    it("should preserve tree relative to ../", () => {
      return run("fixtures/gif.js", "output/gif.js", true, true, "../").then(() => {
        return Promise.all([
          assertExists("output/test/fixtures/gif.gif")
        ]);
      });
    });

    it("should preserve tree relative to ../", () => {
      return run("fixtures/jpg.js", "output/jpg.js", true, true, "../").then(() => {
        return Promise.all([
          assertExists("output/test/fixtures/jpg.jpg")
        ]);
      });
    });

    it("should preserve tree relative to ../", () => {
      return run("fixtures/png.js", "output/png.js", true, true, "../").then(() => {
        return Promise.all([
          assertExists("output/test/fixtures/png.png")
        ]);
      });
    });

    it("should preserve tree relative to ../", () => {
      return run("fixtures/svg.js", "output/svg.js", true, true, "../").then(() => {
        return Promise.all([
          assertExists("output/test/fixtures/svg.svg")
        ]);
      });
    });
  });

  describe("Plugin options", () => {
    const customOpt = {
      foo: "bar"
    };

    const defaultOpts = [
      {
        type: "gif",
        pluginName: "gifsicle", overrideSample: {
          precision: 42
        }
      },
      {
        type: "jpg",
        pluginName: "jpegtran", overrideSample: {
          progressive: false
        }
      },
      {
        type: "png",
        pluginName: "pngquant",
        overrideSample: {
          speed: 42
        }
      },
      {
        type: "svg", pluginName: "svgo",
        overrideSample: {
          precision: 42
        }
      }
    ];

    defaultOpts.forEach(({type, pluginName, overrideSample}) => {
      describe(type.toUpperCase(), () => {
        it(`Should call ${pluginName} with default option`, () => mockPlugin(`fixtures/${type}.js`, `output/${type}.js`, pluginName).then(({ factoryMock, transformMock }) => {
          assert.equal(factoryMock.callCount, 1);
          assert.deepEqual(factoryMock.lastCall.args, [getDefaultOptions()[pluginName]]);
          assert.equal(transformMock.callCount, 1);
          assert.equal(transformMock.lastCall.args.length, 1);
          assert.ok(transformMock.lastCall.args[0] instanceof Buffer);
        }));

        it(`Should call ${pluginName} with custom option`, () => mockPlugin(`fixtures/${type}.js`, `output/${type}.js`, pluginName, overrideSample).then(({ factoryMock, transformMock }) => {
          assert.equal(factoryMock.callCount, 1);
          assert.deepEqual(factoryMock.lastCall.args, [{...(getDefaultOptions()[pluginName]), ...overrideSample}]);
          assert.equal(transformMock.callCount, 1);
          assert.equal(transformMock.lastCall.args.length, 1);
          assert.ok(transformMock.lastCall.args[0] instanceof Buffer);
        }));

        it(`Should call ${pluginName} with custom options`, () => mockPlugin(`fixtures/${type}.js`, `output/${type}.js`, pluginName, customOpt).then(({ factoryMock, transformMock }) => {
          assert.equal(factoryMock.callCount, 1);
          assert.deepEqual(factoryMock.lastCall.args, [{...(getDefaultOptions()[pluginName]), ...customOpt}]);
          assert.equal(transformMock.callCount, 1);
          assert.equal(transformMock.lastCall.args.length, 1);
          assert.ok(transformMock.lastCall.args[0] instanceof Buffer);
        }));
      });
    });
  });
});

function promise (fn, ...args) {
  return new Promise((resolve, reject) => {
    return fn(...args, (err, res) => {
      return err ? reject(err) : resolve(res);
    });
  });
}

function mockPlugin (inputFile, outputFile, pluginName, config){
  // Simple pass-through mock
  const transformMock = stub().callFn(buf => buf);
  const factoryMock = stub().returnWith(transformMock);

  return rollup({
    input: inputFile,
    plugins: [
      imagemin({
        fileName: "[name][extname]",
        [pluginName]: config,
        plugins: {
          [pluginName]: factoryMock
        }
      })
    ]
  }).then(bundle => bundle.write({
    format: "esm",
    file: outputFile,
    assetFileNames: "[name][extname]"
  })).then(() => Promise.resolve({
    factoryMock,
    transformMock,
  }));
}

function run (inputFile, outputFile, disable = false, emitFiles = true, preserveTree = false) {
  return rollup({
    input: inputFile,
    plugins: [
      imagemin({
        disable,
        emitFiles,
        fileName: "[name][extname]",
        preserveTree
      })
    ]
  }).then(bundle => bundle.write({
    format: "esm",
    file: outputFile,
    assetFileNames: "[name][extname]"
  }));
}

async function assertExists (input, shouldNotExist = false) {
  let file;

  try {
    file = await stat(input);
  } catch (error) {
    if (shouldNotExist) {
      return assert.ok(typeof file === "undefined");
    }

    return assert.fail(`File not found: ${input}`);
  }

  return assert.ok(!!file.size === true);
}

async function assertSmaller (input, output, smaller = true) {
  let inFile, outFile;

  try {
    inFile = await stat(input);
  } catch (error) {
    return assert.fail(`File not found: ${input}`);
  }

  try {
    outFile = await stat(output);
  } catch (error) {
    return assert.fail(`File not found: ${output}`);
  }

  return smaller ? assert.ok(outFile.size < inFile.size) : assert.ok(outFile.size === inFile.size);
}
