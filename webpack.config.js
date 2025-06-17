const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

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
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Xóa tất cả console.* trong bản build
          },
        },
      }),
    ],
  },
};