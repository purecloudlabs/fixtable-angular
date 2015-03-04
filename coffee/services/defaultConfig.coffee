angular.module 'fixtable'
.provider 'defaultOptions', ->

	@defaultOptions = {}

	@$get = -> @defaultOptions

	@setDefaultOptions = (options) -> @defaultOptions = options

	null