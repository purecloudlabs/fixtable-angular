angular.module('examples')
.run([
	'$httpBackend',
	'rawData',
	function($httpBackend, rawData){

		$httpBackend.whenGET(/^\/api\/v1\/films/).respond(function(method, url){

			// get query string params
			params = {}
			if (url.indexOf('?') >= 0) {
				url.split('?')[1].split('&').map(function(pair) {
					pieces = pair.split('=');
					params[pieces[0]] = pieces[1];
				});
			}

			// start with a copy of the raw data
			data = rawData.getData().slice(0);

			// filter by search queries
			if (params.search) {
				queries = params.search.split('+');
				for (i = data.length - 1; i >= 0; i--) {
					film = data[i];
					for (j = 0; j < queries.length; j++) {
						query = queries[j];
						pieces = query.split(':');
						property = pieces[0];
						searchTerm = pieces[1];
						pattern = new RegExp(searchTerm, 'i');
						if (!pattern.test(film[property])) {
							data.splice(i, 1);
							break;
						}
					}
				}
			}

			// filter by restrictions
			if (params.restrict) {
				restrictions = params.restrict.split('+');
				for (i = data.length - 1; i >= 0; i--) {
					film = data[i];
					for (j = 0; j < restrictions.length; j++) {
						restriction = restrictions[j];
						pieces = restriction.split(':');
						property = pieces[0];
						selected = pieces[1];
						if (selected == '') {
							break;
						}
						if (film[property] !== selected) {
							data.splice(i, 1);
							break;
						}
					}
				}
			}

			// apply sort
			if (params.sort) {
				pieces = params.sort.split(':');
				property = pieces[0];
				direction = pieces[1];
				data.sort(function(a, b){
					if (direction === 'asc') {
						if (a[property] > b[property]){
							return 1;
						}
						if (b[property] > a[property]){
							return -1;
						}
						return 0;
					}
					if (direction === 'desc') {
						if (a[property] > b[property]){
							return -1;
						}
						if (b[property] > a[property]){
							return 1;
						}
						return 0;
					}
				});
			}

			// slice out the page
			begin = (params.page - 1) * params.pageSize
			end = begin + parseInt(params.pageSize);
			pageData = data.slice(begin, end);

			// return the mock api response
			return [200, {
				films: pageData,
				totalFilms: data.length
			}];

		});

	}
]);