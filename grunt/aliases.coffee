module.exports =

  default: [
  	'dist'
  ]

  dev: [
  	'clean'
  	'buildJS'
  ]

  dist: [
  	'clean'
  	'distJS'
  ]

  buildJS: [
  	'coffee'
    'ngtemplates'
  ]

  distJS: [
  	'buildJS'
  	'uglify'
  ]

  server:
    [
      'dist'
      'connect'
      'notify:server_started'
      'watch'
    ]
