# fixtable-angular

[![Bower version][version-shield]][bower-url]
[![License][license-shield]](LICENSE)
[![Open issues][issues-shield]][issues-url]

AngularJS directive for the [Fixtable][fixtable-url] grid library, allowing for easy inclusion of data tables with the following functionality:

* Fixed headers
* Pagination
* Loading indicator
* Custom templates
* Edit-in-place

## Usage

### Installation

```shell
$ bower install fixtable-angular
```

### Registration

To be able to use the directive, you need to register the `fixtable` module as a dependency of your module:

```javascript
angular.module('yourModule', ['fixtable']);
```

### Configuration

The `fixtable` module includes a provider which may be used in your config block to provide default options:

```javascript
angular.module('yourModule')
.config('fixtableDefaultOptionsProvider', function(fixtableDefaultOptionsProvider){
	fixtableDefaultOptionsProvider.setDefaultOptions({
		footerTemplate: 'templates/customFooterTemplate.html',
		tableClass: 'table-striped'
	});
});
```

### Directive

#### Markup

The directive matches `<fixtable>` elements, and accepts a single `options` attribute for you to pass in an object specifying the configuration for the data table:

```html
<fixtable options="options"></fixtable>
```

#### Options

The options object should be defined in your controller. It will extend any default options specified in your module's config block (see above). Let's break it down and examine the available options one feature at a time.

##### Data

Use the `data` property to specify the name of a scope variable to use as the source of data for the table. This is a required option, and should always be an array of objects. The objects in the array will become the rows of the table:

```javascript
$scope.options = {
	data: 'data'
}

$scope.data = [
	{
		ordinal: '1st',
		firstName: 'George',
		lastName: 'Washington'
	},
	{
		ordinal: '2nd',
		firstName: 'John',
		lastName: 'Adams'
	}
]
```

##### Columns

The `columns` property should be an array of column definition objects:

```javascript
$scope.options = {
	columns: [
		{
			property: 'ordinal',
			width: 50
		},
		{
			property: 'firstName',
			label: 'First Name',
			width: '50%'
		},
		{
			property: 'lastName',
			label: 'Last Name',
			width: '50%'
		}
	]
}
```

In each column definition, `property` indicates which property from the row object will be displayed in the table. The column `label` is displayed in the heading for that column. You may also specify column widths either in pixels (using a `Number` like `50`) or percent (using a `String` like `'50%'`). Any columns with no specified width will divide equally.

Note: there are some additional options available when definining columns not shown in this example; see below for more.

##### Table Class

One of the benefits of Fixtable is that, at its core, it's just a normal HTML `<table>`. In order for you to style more easily, you may add one or more CSS classes to the table. Simply provide a space-delimited list of class names:

```javascript
$scope.options = {
	tableClass: 'table table-striped'
}
```

##### Loading Indicator

If your data table is being populated asynchronously, you may want to show a loading indicator to make this clear to the user. Support for this is built-in; just provide the name of a scope variable for Fixtable to watch:

```javascript
$scope.options = {
	loading: 'loading'
}
```

Then, in your controller, set the value of `$scope.loading` to `true` when you want the loading indicator displayed, and `false` once the data has loaded.

##### Pagination

To turn on pagination, set the `paging` option to `true`. This will cause the data table to display a footer with the pagination UI, which will be affixed to the bottom of the table. You also need to set up `pagingOptions`:

```javascript
$scope.options = {
	data: 'data',
	paging: true,
	pagingOptions: {
		pageSize: 50,
		pageSizeOptions: [25, 50, 100],
		currentPage: 1,
		callback: 'getPageData',
		totalItems: 0
	}
}

$scope.getPageData = function (pagingOptions) {
	apiUrl = 'api/v1/records';
	apiUrl += '?page=' + pagingOptions.currentPage;
	apiUrl += '&pageSize=' + pagingOptions.pageSize;
	$http.get(apiUrl).success(function(data){
		$scope.data = data.records;
		$scope.options.pagingOptions.totalItems = data.count;
	});
}
```

In the `pagingOptions` object, you should specify the initial `pageSize` as well as an array of all available `pageSizeOptions` (which will be presented to the user as a drop-down list). You may omit `pageSizeOptions` if all pages should be a given size.

The `totalItems` value will be used along with the page size to determine the number of available pages; if the total is unknown, you may omit this value (or set to to `0`) and then update it once the total is known.

You should also assign a `currentPage` value and pass in the name of a `callback` method from the controller. This callback method will be executed immediately, passing in the initial `pagingOptions` object as the first argument.

It is expected that this callback method will populate the `data` array, as shown in the above example. You may also need to update the `totalItems` property of the `pagingOptions` object, depending on your use case. The above example assumes that `totalItems` is unknown at page load, but returned by the API when we load each page of data.

When the user changes the page size or current page, the `callback` method will be executed again, passing over the updated `pagingOptions` object as the first argument.

##### Edit-in-place

Fixtable makes it easy to allow users to edit table data. In your column definition object, you can set `editable` to `true` and any cell in that column will switch to a text input field on click. Let's revise the `columns` array used before:

```javascript
$scope.options = {
	columns: [
		{
			property: 'ordinal',
			width: 50
		},
		{
			property: 'firstName',
			label: 'First Name',
			width: '50%',
			editable: true
		},
		{
			property: 'lastName',
			label: 'Last Name',
			width: '50%'
		}
	]
}
```

Now, the cells in the "First Name" column are editable. And thanks to AngularJS's two-way binding, users are directly updating the objects in the `data` array on your controller `$scope` as they edit values in the table.

Fixtable also emits events when the user begins or finishes editing a cell, so you may listen for these in your controller if you need to react:

```javascript
$scope.$on('fixtableBeginEdit', function(event){
	row = event.targetScope.row;
	col = event.targetScope.col;
	initialValue = row[col.property];
});

$scope.$on('fixtableEndEdit', function(event){
	row = event.targetScope.row;
	col = event.targetScope.col;
	newValue = row[col.property];
});
```

Notice that you can access the `row` object from the `data` array, as well as the `col` object from the `columns` array as properties on `event.targetScope`.

##### Custom Templates

Almost all the templates used by Fixtable to build its own UI can be overridden with custom templates. At the table level, you can specify the following templates:

```javascript
$scope.options = {
	headerTemplate: 'templates/headerCell_custom.html',
	footerTemplate: 'templates/footer_custom.html',
	loadingTemplate: 'templates/loading_custom.html',
	editTemplate: 'templates/editCell_custom.html'
}
```

You may also specify custom templates for individual columns:

```javascript
$scope.options = {
	columns: [
		{
			property: 'firstName',
			label: 'First Name',
			width: '50%',
			editable: true,
			template: 'templates/bodyCell_custom.html',
			editTemplate: 'templates/editCell_custom.html'
		}
	]
}
```

Custom templates specified at the column level will always be used in favor of those specified at the table level.

If you're interested in creating your own custom templates, it's probably best to look at the default ones in the `/templates` directory as a baseline for your own.

### Examples

The `example` folder has a couple working demos, using nearly all of Fixtable's features.

## Development

### Run

Clone the repo and run the following to get going:

```shell
$ npm install
$ bower install
```

### Build

This project uses [Grunt](http://gruntjs.com) to run build tasks. To build the minified, distribution-ready script file from source, simply run:

```shell
$ grunt
```

### Contribute

We welcome contributions to this project. Feel free to fork or submit pull requests on GitHub!

## Authors

* Brian Herold ([bmherold](https://github.com/bmherold))
* Michael McAuley ([michaelmcauley](https://github.com/michaelmcauley))
* Ryan Curtis ([rbrcurtis](https://github.com/rbrcurtis))
* Trezy ([trezy](https://github.com/trezy))

[version-shield]: http://img.shields.io/bower/v/fixtable-angular.svg?style=flat
[bower-url]: http://bower.io/search/?q=fixtable-angular
[license-shield]: http://img.shields.io/badge/license-ISC-blue.svg?style=flat
[issues-shield]: http://img.shields.io/github/issues/mypurecloud/fixtable-angular.svg?style=flat
[issues-url]: https://github.com/MyPureCloud/fixtable-angular/issues
[fixtable-url]: https://github.com/MyPureCloud/fixtable-core