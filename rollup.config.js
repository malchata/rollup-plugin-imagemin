import babel from "rollup-plugin-babel";
import pkg from "./package.json";

const external = [
  "path",
  "fs",
  "util",
  "crypto",
  ...Object.keys(pkg.dependencies)
];

export default [
  {
    input: "src/index.mjs",
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true
    },
    external
  },
  {
    input: "src/index.mjs",
    plugins: [
      babel()
    ],
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    },
    external
  }
];
