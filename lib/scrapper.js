const http = require('http');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require('request');
const _cliProgress = require('cli-progress');

const bar = new _cliProgress.Bar({format: 'progress [{bar}] {percentage}% | {value} MB /{total} MB' }, _cliProgress.Presets.shades_classic);

bar.start(2000, 0);

const fileLocation = './FamilyGuy/';

//crawl('http://dl6.downloadoo.ir/TV.Show/F/Family%20Guy');
crawl('http://dl8.heyserver.in/serial/Black.Mirror/S01/720p.x265/');

let totalFiles = 0;
let downloadCount = 0;

let totalSize = 0;
let downloadedSize = 0;

function crawl(url) {

	//console.log(url);

	request(url, (err, reponse, body)=>{

		const dom = new JSDOM(body);
		const anchors = dom.window.document.querySelectorAll('a');

		for(const anchor of anchors) {

			if(anchor.href.startsWith('.')) {

				continue;
			}

			if(anchor.href.endsWith('mkv')) {

				download(url + '/' + anchor.href);
			}
			else {

				crawl(url + '/' + anchor.href);
			}
		}

	});
}

function download(downloadLink) {

	totalFiles++;

	const rawFileName = downloadLink.split('/')[ downloadLink.split('/').length - 1 ];

	const fileName = rawFileName.split('.')[2]  + '.mkv';
	//const seasonName = fileName[1] + fileName[2];

	seasonName = 'S01';

	if (!fs.existsSync(fileLocation + seasonName)){

	    fs.mkdirSync(fileLocation + seasonName);
	}

	const file = fs.createWriteStream(fileLocation + seasonName + '/' + fileName);
	const request = http.get(downloadLink, (response)=> {
	  	
		const fileSize = Number(response.headers[ 'content-length' ]);

		totalSize += fileSize;

		const totalSizeinMB = Math.ceil(totalSize / 1000000);

		bar.start(totalSizeinMB, 0);

	  	const pipe = response.pipe(file);

	  	response.on('data', (chunk)=> {

	      	downloadedSize += chunk.length;
	      	
	      	const downloadedSizeinMB = Math.ceil(downloadedSize / 1000000);

	      	bar.update(downloadedSizeinMB);
	      	//console.log(`${downloadedSize} / ${totalSize}`)

	    });

	  	pipe.on('finish', ()=>{

			downloadCount++;
			
			//console.log('Downloaded ' + fileName);
			//console.log(`Downloaded ${done} / ${total}`)

		});
	
	});

	request.on('error', (err)=>{

		downloadCount++;

		console.log('\nError Downloading ' + fileName)

	});
}