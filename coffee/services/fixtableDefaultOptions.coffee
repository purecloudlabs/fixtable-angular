angular.module 'fixtable'
.provider 'fixtableDefaultOptions', ->

	@defaultOptions =
		realtimeFiltering: true

	@$get = -> @defaultOptions

	@setDefaultOptions = (options) ->
		for option, value of options
			@defaultOptions[option] = value

	null