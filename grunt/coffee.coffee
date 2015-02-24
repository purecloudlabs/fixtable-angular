module.exports = ( grunt, options ) ->
  options:
    sourceMap: true
    extDot: 'last'

  fixtable:
    files:
      'dist/fixtable.js': ['coffee/fixtable.coffee']
