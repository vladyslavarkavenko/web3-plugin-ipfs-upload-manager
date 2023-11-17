/* eslint-disable @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires */
const webpackPreprocessor = require("@cypress/webpack-preprocessor");

const webpackOptions = require("./webpack.config");

/**
 * @type {Cypress.ConfigOptions}
 */
const config = {
  video: false,
  defaultCommandTimeout: 5 * 60 * 1000, // 5 min
  screenshotOnRunFailure: false,
  e2e: {
    supportFile: false,
    specPattern: "test/e2e/**/*.test.ts",
    setupNodeEvents(on) {
      on("file:preprocessor", webpackPreprocessor({ webpackOptions }));
    },
  },
};

module.exports = config;
