import pkg from "./package.json";

const external = Object.keys(pkg.dependencies);
external.push("path", "fs", "util");

export default {
  input: "src/index.mjs",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    },
    {
      file: pkg.module,
      format: "esm",
      sourcemap: true
    }
  ],
  external
};
