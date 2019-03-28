# FIleScrapper
Scrapes and downloads files from a web link

Example

const Scrappy = require('./lib/scrappy');

const scrap = new Scrappy({
	url: '<URL>',
	fileLocation: '<FILE_LOCATION>',
	extension: 'mkv',
	getFileName: (rawFileName) => {
		return rawFileName.split('.')[2]  + '.mkv';
	},
	getSeasonName: (rawFileName) => {
		return 'S04';
	},
});

scrap.start();
