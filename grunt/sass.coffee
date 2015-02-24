module.exports = ( grunt, options ) ->
  default:
    options:
      style: 'expanded'
    files:
      'css/fixtable.css': 'scss/fixtable.scss'
