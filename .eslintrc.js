module.exports = {
  root: true,
  extends: ["@webpack-contrib/eslint-config-webpack", "prettier"],
  rules: {
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: false, // Disallow devDependencies in source code
        optionalDependencies: false,
        peerDependencies: false,
        bundledDependencies: false,
        includeInternal: false,
        includeTypes: false,
      },
    ],
  },
};
