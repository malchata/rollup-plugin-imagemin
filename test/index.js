import assert from "assert";
import imagemin from "../src";
import rimraf from "rimraf";
import { rollup } from "rollup";

function run (input) {
  return rollup({
    input
  });
}
