module.exports = ( grunt, options ) ->
  coffee:
    files: [
      'coffee/**/*.coffee'
    ]
    tasks: [
      'coffee'
    ]

  sass:
    files: [
      'scss/**/*.scss'
    ]
    tasks: [
      'sass'
      'autoprefixer'
    ]
