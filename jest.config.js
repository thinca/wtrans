module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "bin/*.js",
    "lib/**/*.js",
  ],
  // Avoid html reporter(lcov -> lcovonly) to disable handlebars's warning
  // https://github.com/facebook/jest/issues/9396#issuecomment-573328488
  coverageReporters: ["json", "text", "lcovonly", "clover"],
};
