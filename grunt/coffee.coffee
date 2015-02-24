module.exports = ( grunt, options ) ->
  options:
    sourceMap: true
    extDot: 'last'

  huxtable:
    files:
      'dist/huxtable.js': ['coffee/huxtable.coffee']
