module.exports = (grunt) ->
	fixtable:
		src: ['templates/**/*.html']
		dest: 'dist/templates.js'
		options:
			module: 'fixtable'
			htmlmin:
				collapseWhitespace: true
			prefix: 'fixtable'