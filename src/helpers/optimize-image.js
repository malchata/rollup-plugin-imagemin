import imagemin from "imagemin";
import generateOutputFileName from "./helpers/generate-output-file-name";

export default function (buffer, name, extname, logPrefix, pluginOptions) {
  if (!pluginOptions.disable) {
    return imagemin.buffer(buffer, {
      plugins: pluginOptions.plugins
    }).then(optimizedBuffer => {
      const outputFileName = generateOutputFileName(buffer, name, extname, pluginOptions);
      assets[outputFileName] = optimizedBuffer;

      if (pluginOptions.verbose) {
        logOptimizationResult(buffer, optimizedBuffer, logPrefix, outputFileName);
      }

      return `export default new URL("${outputFileName}", import.meta.url).href;`;
    }).catch(error => {
      this.error(`${logPrefix} Couldn't optimize image: ${error}`);
    });
  } else {
    outputFileName = generateOutputFileName(buffer, name, extname, pluginOptions);
    assets[outputFileName] = buffer;

    return `export default new URL("${outputFileName}", import.meta.url).href;`;
  }
}
