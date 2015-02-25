module.exports = ( grunt, options ) ->
  fixtable:
    files:
      'dist/fixtable-angular.min.js': ['dist/**/*.js']
