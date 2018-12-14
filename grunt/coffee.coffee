module.exports = ( grunt, options ) ->
  options:
    sourceMap: true
    extDot: 'last'

  fixtable:
    files:
      'build/fixtable-angular.js': ['coffee/**/*.coffee']
