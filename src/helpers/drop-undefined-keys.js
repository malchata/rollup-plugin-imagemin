export default function (obj) {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    if (typeof val !== "undefined") {
      acc[key] = val;
    }

    return acc;
  }, {});
}
