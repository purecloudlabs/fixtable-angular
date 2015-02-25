module.exports = ( grunt, options ) ->
  options:
    sourceMap: true
    extDot: 'last'

  fixtable:
    files:
      'dist/fixtable-angular.js': ['coffee/**/*.coffee']
