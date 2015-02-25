module.exports = (grunt) ->
	fixtable:
		src: ['templates/**/*.html']
		dest: '.tmp/templates.js'
		options:
			module: 'fixtable'
			htmlmin:
				collapseWhitespace: true
			prefix: 'fixtable'