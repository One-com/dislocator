import pkg from './package.json';
import uglifyjs from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel';

const entry = 'src/dislocator.js';

export default [
  {
    format: 'umd',
    moduleName: 'Dislocator',
    plugins: [
      babel()
    ],
    entry,
    sourceMap: true,
    dest: pkg.browser
  },
  {
    format: 'umd',
    moduleName: 'Dislocator',
    plugins: [
      babel(), uglifyjs()
    ],
    entry,
    sourceMap: true,
    dest: pkg.browser.replace(/.js$/, '.min.js')
  },
  {
    entry,
    targets: [
      { dest: pkg.main, format: 'cjs' },
      { dest: pkg.module, format: 'es' }
    ],
    sourceMap: true,
    plugins: [
      babel()
    ]
  }
];
