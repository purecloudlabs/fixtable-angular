module.exports = (grunt) ->
	fixtable:
		src: ['templates/**/*.html']
		dest: 'build/templates.js'
		options:
			module: 'fixtable'
			htmlmin:
				collapseWhitespace: true
			prefix: 'fixtable'