module.exports = ( grunt, options ) ->
  default:
    options:
      style: 'expanded'
    files:
      'css/huxtable.css': 'scss/huxtable.scss'
