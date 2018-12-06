import pkg from "./package.json";

const external = Object.keys(pkg.dependencies);

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
