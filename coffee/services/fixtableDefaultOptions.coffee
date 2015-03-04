angular.module 'fixtable'
.provider 'fixtableDefaultOptions', ->

	@defaultOptions = {}

	@$get = -> @defaultOptions

	@setDefaultOptions = (options) -> @defaultOptions = options

	null