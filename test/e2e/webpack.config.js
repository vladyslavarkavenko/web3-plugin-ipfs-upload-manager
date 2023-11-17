/* eslint-disable @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires */
const webpack = require("webpack");

module.exports = {
  mode: "development",
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "./js": require.resolve(
        "node_modules/@chainsafe/libp2p-noise/dist/src/crypto/js.js",
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
};
