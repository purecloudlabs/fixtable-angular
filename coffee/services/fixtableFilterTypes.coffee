angular.module 'fixtable'
.provider 'fixtableFilterTypes', ->

	@filterTypes = {}

	@$get = -> @filterTypes

	@add = (type, definition) ->
		@filterTypes[type] = definition

	@update = (type, properties) ->
		for property, value of properties
			@filterTypes[type][property] = value

	null