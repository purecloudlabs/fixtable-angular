module.exports =
  default: [
    'dist'
  ]

  dist: [
    'clean'
    'buildCSS'
    'buildJS'
  ]

  buildCSS: [
    'copy:css'
    'autoprefixer'
    'cssmin'
  ]

  buildJS: [
    'coffee'
    'uglify'
  ]
