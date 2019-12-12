import crypto from "crypto";
import path from "path";

export default function generateOutputFileName (buffer, name, extname, pluginOptions) {
  const hash = crypto.createHash("sha1").update(buffer).digest("hex").substr(0, pluginOptions.hashLength);

  return path.join(pluginOptions.publicPath, pluginOptions.fileName.replace(/\[name\]/i, name).replace(/\[hash\]/i, hash).replace(/\[extname\]/i, extname));
}
