module.exports = ( grunt, options ) ->
  server:
    options:
      port: 9000
      base: 'example'
      keepalive: true
      open: true