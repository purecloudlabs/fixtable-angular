angular.module('examples')
.service('rawData', function(){
	
	var data = [
	  {
	    year: 2015,
	    title: 'Birdman or (The Unexpected Virtue of Ignorance)',
	    director: 'Alejandro González Iñárritu',
	    rating: 'R'
	  },
	  {
	    year: 2014,
	    title: '12 Years a Slave',
	    director: 'Steve McQueen',
	    rating: 'R'
	  },
	  {
	    year: 2013,
	    title: 'Argo',
	    director: 'Ben Affleck',
	    rating: 'R'
	  },
	  {
	    year: 2012,
	    title: 'The Artist',
	    director: 'Michel Hazanavicius',
	    rating: 'PG-13'
	  },
	  {
	    year: 2011,
	    title: 'The King\'s Speech',
	    director: 'Tom Hooper',
	    rating: 'R'
	  },
	  {
	    year: 2010,
	    title: 'The Hurt Locker',
	    director: 'Kathryn Bigelow',
	    rating: 'R'
	  },
	  {
	    year: 2009,
	    title: 'Slumdog Millionaire',
	    director: 'Danny Boyle, Loveleen Tandan',
	    rating: 'R'
	  },
	  {
	    year: 2008,
	    title: 'No Country For Old Men',
	    director: 'Joel Coen, Ethan Coen',
	    rating: 'R'
	  },
	  {
	    year: 2007,
	    title: 'The Departed',
	    director: 'Martin Scorsese',
	    rating: 'R'
	  },
	  {
	    year: 2006,
	    title: 'Crash',
	    director: 'Paul Haggis',
	    rating: 'R'
	  },
	  {
	    year: 2005,
	    title: 'Million Dollar Baby',
	    director: 'Clint Eastwood',
	    rating: 'PG-13'
	  },
	  {
	    year: 2004,
	    title: 'Lord Of The Rings: Return Of The King',
	    director: 'Peter Jackson',
	    rating: 'PG-13'
	  },
	  {
	    year: 2003,
	    title: 'Chicago',
	    director: 'Rob Marshall',
	    rating: 'PG-13'
	  },
	  {
	    year: 2002,
	    title: 'A Beautiful Mind',
	    director: 'Ron Howard',
	    rating: 'PG-13'
	  },
	  {
	    year: 2001,
	    title: 'Gladiator',
	    director: 'Ridley Scott',
	    rating: 'R'
	  },
	  {
	    year: 2000,
	    title: 'American Beauty',
	    director: 'Sam Mendes',
	    rating: 'R'
	  },
	  {
	    year: 1999,
	    title: 'Shakespeare in Love',
	    director: 'John Madden',
	    rating: 'R'
	  },
	  {
	    year: 1998,
	    title: 'Titanic',
	    director: 'James Cameron',
	    rating: 'PG-13'
	  },
	  {
	    year: 1997,
	    title: 'The English Patient',
	    director: 'Anthony Minghella',
	    rating: 'R'
	  },
	  {
	    year: 1996,
	    title: 'Braveheart',
	    director: 'Mel Gibson',
	    rating: 'R'
	  },
	  {
	    year: 1995,
	    title: 'Forrest Gump',
	    director: 'Robert Zemeckis',
	    rating: 'PG-13'
	  },
	  {
	    year: 1994,
	    title: 'Schindler\'s List',
	    director: 'Steven Spielberg',
	    rating: 'R'
	  },
	  {
	    year: 1993,
	    title: 'Unforgiven',
	    director: 'Clint Eastwood',
	    rating: 'R'
	  },
	  {
	    year: 1992,
	    title: 'The Silence of the Lambs',
	    director: 'Jonathan Demme',
	    rating: 'R'
	  },
	  {
	    year: 1991,
	    title: 'Dances with Wolves',
	    director: 'Kevin Costner',
	    rating: 'PG-13'
	  },
	  {
	    year: 1990,
	    title: 'Driving Miss Daisy',
	    director: 'Bruce Beresford',
	    rating: 'PG'
	  },
	  {
	    year: 1989,
	    title: 'Rain Man',
	    director: 'Barry Levinson',
	    rating: 'R'
	  },
	  {
	    year: 1988,
	    title: 'The Last Emperor',
	    director: 'Bernardo Bertolucci',
	    rating: 'PG-13'
	  },
	  {
	    year: 1987,
	    title: 'Platoon',
	    director: 'Oliver Stone',
	    rating: 'R'
	  },
	  {
	    year: 1986,
	    title: 'Out of Africa',
	    director: 'Sydney Pollack',
	    rating: 'PG'
	  },
	  {
	    year: 1985,
	    title: 'Amadeus',
	    director: 'Miloš Forman',
	    rating: 'R'
	  },
	  {
	    year: 1984,
	    title: 'Terms of Endearment',
	    director: 'James L. Brooks',
	    rating: 'R'
	  },
	  {
	    year: 1983,
	    title: 'Gandhi',
	    director: 'Richard Attenborough',
	    rating: 'PG'
	  },
	  {
	    year: 1982,
	    title: 'Chariots of Fire',
	    director: 'Hugh Hudson',
	    rating: 'PG'
	  },
	  {
	    year: 1981,
	    title: 'Ordinary People',
	    director: 'Robert Redford',
	    rating: 'R'
	  },
	  {
	    year: 1980,
	    title: 'Kramer vs. Kramer',
	    director: 'Robert Benton',
	    rating: 'PG'
	  },
	  {
	    year: 1979,
	    title: 'The Deer Hunter',
	    director: 'Michael Cimino',
	    rating: 'R'
	  },
	  {
	    year: 1978,
	    title: 'Annie Hall',
	    director: 'Woody Allen',
	    rating: 'PG'
	  },
	  {
	    year: 1977,
	    title: 'Rocky',
	    director: 'John G. Avildsen',
	    rating: 'PG'
	  },
	  {
	    year: 1976,
	    title: 'One Flew Over the Cuckoo\'s Nest',
	    director: 'Miloš Forman',
	    rating: 'R'
	  },
	  {
	    year: 1975,
	    title: 'The Godfather Part II',
	    director: 'Francis Ford Coppola',
	    rating: 'R'
	  },
	  {
	    year: 1974,
	    title: 'The Sting',
	    director: 'George Roy Hill',
	    rating: 'PG'
	  },
	  {
	    year: 1973,
	    title: 'The Godfather',
	    director: 'Francis Ford Coppola',
	    rating: 'R'
	  },
	  {
	    year: 1972,
	    title: 'The French Connection',
	    director: 'William Friedkin',
	    rating: 'R'
	  },
	  {
	    year: 1971,
	    title: 'Patton',
	    director: 'Franklin J. Schaffner',
	    rating: 'PG'
	  },
	  {
	    year: 1970,
	    title: 'Midnight Cowboy',
	    director: 'John Schlesinger',
	    rating: 'R'
	  }
	];

	this.getData = function(){
		return data;
	}

});