const path = require("path");
const JavaScriptObfuscator = require("webpack-obfuscator");

module.exports = function override(config, env) {
  // Alias configuration
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": path.resolve(__dirname, "src"),
  };

  // Obfuscation configuration for production
  if (env === "production") {
    config.plugins.push(
      new JavaScriptObfuscator(
        {
          rotateStringArray: true,
          compact: true,
          selfDefending: true,
        },
        ["excluded_bundle_name.js"] // Exclude specific files if needed
      )
    );
  }

  return config;
};