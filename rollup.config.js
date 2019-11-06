import pkg from "./package.json";
import uglifyjs from "rollup-plugin-uglify";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";

const entry = "lib/dislocator.js";

export default [
  {
    format: "umd",
    moduleName: "Dislocator",
    plugins: [babel(), commonjs()],
    entry,
    sourceMap: true,
    dest: pkg.browser
  },
  {
    format: "umd",
    moduleName: "Dislocator",
    plugins: [babel(), commonjs(), uglifyjs()],
    entry,
    sourceMap: true,
    dest: pkg.browser.replace(/.js$/, ".min.js")
  },
  {
    entry,
    dest: pkg.module,
    format: "es",
    sourceMap: true,
    plugins: [commonjs()]
  }
];
