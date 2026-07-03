// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      // Data fetching on mount/focus is intentional in screen components.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
