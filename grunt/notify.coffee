module.exports = ( grunt, options ) ->
  coffee:
    options:
      message: 'coffeescript compiled'

  sass:
    options:
      message: 'sass compiled'

  server_started:
    options:
      message: 'server started'
