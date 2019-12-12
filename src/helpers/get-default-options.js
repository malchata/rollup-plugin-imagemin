export default () => JSON.parse(JSON.stringify({
  disable: false,
  verbose: false,
  emitFiles: true,
  hashLength: 16,
  include: "**/*.{svg,png,jpg,jpeg,gif}",
  exclude: "",
  fileName: "[name]-[hash][extname]",
  publicPath: "",
  preserveTree: false,
  dirs: [],
  jpegtran: {
    progressive: true
  },
  pngquant: {
    speed: 1,
    strip: true
  },
  gifsicle: {
    optimizationLevel: 3
  },
  svgo: {
    precision: 1,
    multipass: true
  },
  plugins: {}
}));
