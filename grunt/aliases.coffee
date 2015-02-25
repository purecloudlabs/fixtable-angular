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
  	'ngtemplates'
  ]

  buildJS: [
  	'coffee'
  ]

  distJS: [
  	'buildJS'
  	'uglify'
  ]
