import { stringifyRequest } from "loader-utils";

function getDefaultFilename(filename) {
  if (typeof filename === "function") {
    return filename;
  }

  return filename.replace(/\.([a-z]+)(\?.+)?$/i, ".worker.$1$2");
}

function getDefaultChunkFilename(chunkFilename) {
  return chunkFilename.replace(/\.([a-z]+)(\?.+)?$/i, ".worker.$1$2");
}

function getExternalsType(compilerOptions) {
  // For webpack@4
  if (compilerOptions.output.libraryTarget) {
    return compilerOptions.output.libraryTarget;
  }

  // For webpack@5
  if (compilerOptions.externalsType) {
    return compilerOptions.externalsType;
  }

  if (compilerOptions.output.library) {
    return compilerOptions.output.library.type;
  }

  if (compilerOptions.output.module) {
    return "module";
  }

  return "var";
}

function workerGenerator(loaderContext, workerFilename, workerSource, options) {
  let workerConstructor;
  let workerOptions;

  if (typeof options.worker === "undefined") {
    workerConstructor = "Worker";
  } else if (typeof options.worker === "string") {
    workerConstructor = options.worker;
  } else {
    ({ type: workerConstructor, options: workerOptions } = options.worker);
  }
  if (options.forceInline) {
    const InlineWorkerPath = stringifyRequest(
      loaderContext,
      `!!${require.resolve("./runtime/inline.js")}`
    );

    return `import worker from ${InlineWorkerPath};
    export default function() {
      return worker(${JSON.stringify(
        workerSource
      )}, ${workerConstructor}, ${JSON.stringify(
      workerOptions
    )}, __webpack_public_path__ + ${JSON.stringify(workerFilename)});
}\n`;
  }

  return `export default function() {
    return new ${workerConstructor}(__webpack_public_path__ + ${JSON.stringify(
    workerFilename
  )}${workerOptions ? `, ${JSON.stringify(workerOptions)}` : ""});
}\n`;
}

// Matches only the last occurrence of sourceMappingURL
const innerRegex =
  /\s*[#@]\s*sourceMappingURL\s*=\s*(.*?(?=[\s'"]|\\n|\*\/|$)(?:\\n)?)\s*/;

/* eslint-disable prefer-template */
const sourceMappingURLRegex = RegExp(
  "(?:" +
    "/\\*" +
    "(?:\\s*\r?\n(?://)?)?" +
    "(?:" +
    innerRegex.source +
    ")" +
    "\\s*" +
    "\\*/" +
    "|" +
    "//(?:" +
    innerRegex.source +
    ")" +
    ")" +
    "\\s*"
);

const sourceURLWebpackRegex = RegExp(
  "\\/\\/#\\ssourceURL=webpack-internal:\\/\\/\\/(.*?)\\\\n"
);
/* eslint-enable prefer-template */

export {
  getDefaultFilename,
  getDefaultChunkFilename,
  getExternalsType,
  workerGenerator,
  sourceMappingURLRegex,
  sourceURLWebpackRegex,
};
