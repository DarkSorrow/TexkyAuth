import scss from 'rollup-plugin-scss'

export default {
  input: './styles/style.js',
  output: { file: './styles/output.js', format: 'esm' },
  plugins: [
    scss(
      { 
        fileName: 'bundle.css' ,
        includePaths: [
          'node_modules/'
        ],
        outputStyle: 'compressed'
      }
    ), // will output compiled styles to "assets/output-123hash.css"
  ]
}
/*terser({
  toplevel: true,
  compress: {
    unused: false,
    collapse_vars: false,
  },
  keep_fnames: true,
  ecma: 5,
  safari10: true
})*/