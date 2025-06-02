const path = require("path");
const webpack = require("webpack");

module.exports = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".js", ".jsx", ".json"],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.REACT_APP_API_BASE": JSON.stringify(process.env.REACT_APP_API_BASE),
    }),
  ],
};