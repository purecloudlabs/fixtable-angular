module.exports = ( grunt, options ) ->
  options:
    sourceMap: true
    extDot: 'last'

  fixtable:
    files:
      '.tmp/fixtable-angular.js': ['coffee/**/*.coffee']
