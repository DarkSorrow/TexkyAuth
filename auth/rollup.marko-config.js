import { builtinModules } from "module";
import path from "path";
import autoprefixer from "autoprefixer";
import babelPlugin from "@rollup/plugin-babel";
import commonjsPlugin from "@rollup/plugin-commonjs";
import jsonPlugin from "@rollup/plugin-json";
import markoPlugin from "@marko/rollup";
import nodeResolvePlugin from "@rollup/plugin-node-resolve";
import replacePlugin from "@rollup/plugin-replace";
import runPlugin from "@rollup/plugin-run";
import stylesPlugin from "rollup-plugin-styles";
import urlPlugin from "@rollup/plugin-url";
import pkg from "./package.json";

const __DEV__ = process.env.NODE_ENV === "development";
const __PROD__ = !__DEV__;

const isWatch = Boolean(process.env.ROLLUP_WATCH);

const publicPath = "/s/"; // Guess what character is only 5 bits under HPACK
const assetFileNames = "[name]-[hash][extname]";

const externalDependencies = [
  ...Object.keys(pkg.dependencies),
  ...builtinModules
];

process.env.SASS_PATH = "./:./node_modules";

export default (async () => [
  compiler("server", {
    input: "index.js",
    output: {
      dir: "built/server/",
      assetFileNames: `../browser/${assetFileNames}`,
      format: "cjs",
      sourcemap: true
    },
    external: id =>
      externalDependencies.some(
        dependency => id === dependency || id.startsWith(dependency + "/")
      ),
    plugins: [isWatch && runPlugin({ execArgv: ["--enable-source-maps"] })]
  }),

  compiler("browser", {
    output: {
      dir: "built/browser/",
      chunkFileNames: __PROD__ ? "[name]-[hash].js" : null,
      entryFileNames: __PROD__ ? "[name]-[hash].js" : null,
      assetFileNames,
      sourcemap: true,
      sourcemapExcludeSources: __PROD__
    },
    plugins: [
      stylesPlugin({
        mode: "extract",
        sourceMap: true,
        config: {
          target: "browserslist:css",
          plugins: [autoprefixer({ env: "css" })]
        },
        minimize: __PROD__,
        url: {
          publicPath,
          hash: assetFileNames
        }
      }),
      __PROD__ && (await import("rollup-plugin-terser")).terser(),
      __PROD__ &&
        !isWatch &&
        (await import("rollup-plugin-visualizer")).default(),
      __PROD__ &&
        !isWatch && {
          name: "bundle-visualizer-location",
          writeBundle() {
            console.info(
              `📊 Bundle visualizer at \x1b[4;36mfile://${path.join(
                __dirname,
                "../../",
                bundleAnalyzerFilename
              )}\x1b[0m`
            );
          }
        }
    ]
  })
])();

function compiler(target, config) {
  const isBrowser = target === "browser";
  const browserslistEnv = isBrowser ? "js" : "server";
  const babelConfig = {
    comments: false,
    browserslistEnv,
    compact: false,
    babelrc: false,
    caller: { target }
  };
  if (isBrowser) {
    babelConfig.presets = [
      [
        "@babel/preset-env",
        {
          browserslistEnv,
          bugfixes: true
        }
      ]
    ];
  }

  return {
    ...config,
    preserveEntrySignatures: false,
    plugins: [
      markoPlugin[target]({ babelConfig }),
      nodeResolvePlugin({
        browser: isBrowser,
        preferBuiltins: !isBrowser
      }),
      commonjsPlugin(),
      replacePlugin({
        preventAssignment: true,
        values: { __DEV__, __PROD__ }
      }),
      babelPlugin({
        babelHelpers: "bundled",
        ...babelConfig
      }),
      jsonPlugin(),
      urlPlugin({
        publicPath,
        destDir: "built/browser/",
        fileName: assetFileNames,
        include: "**/*.{svg,png,jpg,jpeg}",
        limit: 0, // Never Base64 & inline
        emitFiles: !isBrowser
      }),
      ...config.plugins
    ]
  };
}
