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
  	'concat'
  ]
