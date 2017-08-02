import pkg from './package.json';
import commonjs from 'rollup-plugin-commonjs';

export default [
  {
    format: 'umd',
    moduleName: 'Dislocator',
    plugins: [commonjs()],
    entry: 'lib/dislocator.js',
    sourceMap: true,
    dest: pkg.browser
  }
];
