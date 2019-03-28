const Scrappy = require('./lib/scrappy');

const scrap = new Scrappy({
	url: 'http://dl8.heyserver.in/serial/Black.Mirror/S02/720p.x265/',
	fileLocation: './BlackMirror/',
	extension: 'mkv',
	getFileName: (rawFileName) => {
		return rawFileName.split('.')[2]  + '.mkv';
	},
	getSeasonName: (rawFileName) => {
		return 'S02';
	},
});

scrap.start();