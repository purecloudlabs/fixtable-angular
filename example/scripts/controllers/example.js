angular.module('fixtableExample').controller('ExampleCtrl', [
  '$scope', function($scope) {

    $scope.rawData = [
      {
        year: 2015,
        film: 'Birdman or (The Unexpected Virtue of Ignorance)',
        director: 'Alejandro González Iñárritu'
      },
      {
        year: 2014,
        film: '12 Years a Slave',
        director: 'Steve McQueen'
      },
      {
        year: 2013,
        film: 'Argo',
        director: 'Ben Affleck'
      },
      {
        year: 2012,
        film: 'The Artist',
        director: 'Michel Hazanavicius'
      },
      {
        year: 2011,
        film: 'The King\'s Speech',
        director: 'Tom Hooper'
      },
      {
        year: 2010,
        film: 'The Hurt Locker',
        director: 'Kathryn Bigelow'
      },
      {
        year: 2009,
        film: 'Slumdog Millionaire',
        director: 'Danny Boyle, Loveleen Tandan'
      },
      {
        year: 2008,
        film: 'No Country For Old Men',
        director: 'Joel Coen, Ethan Coen'
      },
      {
        year: 2007,
        film: 'The Departed',
        director: 'Martin Scorsese'
      },
      {
        year: 2006,
        film: 'Crash',
        director: 'Paul Haggis'
      },
      {
        year: 2005,
        film: 'Million Dollar Baby',
        director: 'Clint Eastwood'
      },
      {
        year: 2004,
        film: 'Lord Of The Rings: Return Of The King',
        director: 'Peter Jackson'
      },
      {
        year: 2003,
        film: 'Chicago',
        director: 'Rob Marshall'
      },
      {
        year: 2002,
        film: 'A Beautiful Mind',
        director: 'Ron Howard'
      },
      {
        year: 2001,
        film: 'Gladiator',
        director: 'Ridley Scott'
      },
      {
        year: 2000,
        film: 'American Beauty',
        director: 'Sam Mendes'
      },
      {
        year: 1999,
        film: 'Shakespeare in Love',
        director: 'John Madden'
      },
      {
        year: 1998,
        film: 'Titanic',
        director: 'James Cameron'
      },
      {
        year: 1997,
        film: 'The English Patient',
        director: 'Anthony Minghella'
      },
      {
        year: 1996,
        film: 'Braveheart',
        director: 'Mel Gibson'
      },
      {
        year: 1995,
        film: 'Forrest Gump',
        director: 'Robert Zemeckis'
      },
      {
        year: 1994,
        film: 'Schindler\'s List',
        director: 'Steven Spielberg'
      },
      {
        year: 1993,
        film: 'Unforgiven',
        director: 'Clint Eastwood'
      },
      {
        year: 1992,
        film: 'The Silence of the Lambs',
        director: 'Jonathan Demme'
      },
      {
        year: 1991,
        film: 'Dances with Wolves',
        director: 'Kevin Costner'
      },
      {
        year: 1990,
        film: 'Driving Miss Daisy',
        director: 'Bruce Beresford'
      }
    ];

    $scope.getPageData = function(opt) {
      begin = opt.pageSize * (opt.currentPage - 1)
      end = begin + opt.pageSize
      $scope.tableData = $scope.rawData.slice(begin, end);
    }

    $scope.tableOptions = {
      data: 'tableData',
      tableClass: 'table table-striped',
      columns: [
        {
          property: 'year',
          label: 'Year',
          width: 50
        }, {
          property: 'film',
          label: 'Film',
          width: 200
        }, {
          property: 'director',
          label: 'Director',
          width: 100
        }
      ],
      footerTemplate: null,
      paging: true,
      pagingOptions: {
        callback: 'getPageData',
        currentPage: 1,
        pageSize: 25,
        pageSizeOptions: [10, 25, 50],
        totalItems: 26
      }
    }

  }
]);