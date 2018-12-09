/* global describe it after */

// Built-ins
import fs from "fs";
// import path from "path";
import assert from "assert";
import util from "util";

// Test-specific
import imagemin from "../src";
import rimraf from "rimraf";
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
});

function promise(fn, ...args) {
  return new Promise((resolve, reject) => {
    return fn(...args, (err, res) => {
      return err ? reject(err) : resolve(res);
    });
  });
}

function run(input, file, disable = false, emitFiles = true) {
  return rollup({
    input,
    plugins: [
      imagemin({
        disable,
        emitFiles,
        fileName: "[name][extname]"
      })
    ]
  }).then(bundle => bundle.write({
    format: "esm",
    file,
    assetFileNames: "[name][extname]"
  }));
}

async function assertExists(input, shouldNotExist = false) {
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

async function assertSmaller(input, output, smaller = true) {
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
