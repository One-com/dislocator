import pkg from './package.json';
import commonjs from 'rollup-plugin-commonjs';
import uglifyjs from 'rollup-plugin-uglify';

export default [
  {
    format: 'umd',
    moduleName: 'Dislocator',
    plugins: [commonjs()],
    entry: 'lib/dislocator.js',
    sourceMap: true,
    dest: pkg.browser
  },
  {
    format: 'umd',
    moduleName: 'Dislocator',
    plugins: [commonjs(), uglifyjs()],
    entry: 'lib/dislocator.js',
    sourceMap: true,
    dest: pkg.browser.replace(/.js$/, '.min.js')
  }
];
