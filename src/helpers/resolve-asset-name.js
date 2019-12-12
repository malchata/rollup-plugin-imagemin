import path from "path";

export default function (id, extname, pluginOptions) {
  if (pluginOptions.preserveTree) {
    if (typeof pluginOptions.preserveTree === "string") {
      return path.join(path.dirname(id.replace(`${path.resolve(pluginOptions.preserveTree)}${path.sep}`, "")), path.basename(id, extname));
    }

    return path.join(path.dirname(id.replace(`${process.cwd()}${path.sep}`, "")), path.basename(id, extname));
  }

  return path.basename(id, extname);
}
