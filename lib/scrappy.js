const http = require('http');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require('request');
const _cliProgress = require('cli-progress');

const bar = new _cliProgress.Bar({format: 'progress [{bar}] {percentage}% | {value} MB /{total} MB', clearOnComplete: false }, _cliProgress.Presets.shades_classic);

module.exports =  class Scrapper {
	
	constructor(obj) {

		this.url = obj.url;
		this.fileLocation = obj.fileLocation;
		this.extension = obj.extension;

		this.getFileName = obj.getFileName;
		this.getSeasonName = obj.getSeasonName;
	}

	start() {

		bar.start(2000, 0);

		this.totalSize = 0;
		this.totalFiles = 0;

		this.downloadedSize = 0;
		this.downloadLink = 0;

		this.crawl(this.url);
	}

	crawl(url) {

		request(url, (err, reponse, body)=>{

			const dom = new JSDOM(body);
			const anchors = dom.window.document.querySelectorAll('a');

			for(const anchor of anchors) {

				if(anchor.href.startsWith('.')) {

					continue;
				}

				if(anchor.href.endsWith(this.extension)) {

					this.download(url + '/' + anchor.href);
				}
				else {

					this.crawl(url + '/' + anchor.href);
				}
			}

		});
	}

	download(downloadLink) {

		this.totalFiles++;

		const fileLocation = this.fileLocation;

		const rawFileName = downloadLink.split('/')[ downloadLink.split('/').length - 1 ];

		//const fileName = rawFileName.split('.')[4]  + '.mkv';
		//const seasonName = fileName[1] + fileName[2];
		const fileName = this.getFileName(rawFileName);
		const seasonName = this.getSeasonName(rawFileName);

		if (!fs.existsSync(fileLocation + seasonName)){

		    fs.mkdirSync(fileLocation + seasonName);
		}

		const file = fs.createWriteStream(fileLocation + seasonName + '/' + fileName);
		const request = http.get(downloadLink, (response)=> {
		  	
			const fileSize = Number(response.headers[ 'content-length' ]);

			this.totalSize += fileSize;

			const totalSizeinMB = Math.ceil(this.totalSize / 1000000);

			bar.start(totalSizeinMB, 0);

		  	const pipe = response.pipe(file);

		  	response.on('data', (chunk)=> {

		      	this.downloadedSize += chunk.length;
		      	
		      	const downloadedSizeinMB = Math.ceil(this.downloadedSize / 1000000);

		      	bar.update(downloadedSizeinMB);
		      	//console.log(`${downloadedSize} / ${totalSize}`)

		    });

		  	pipe.on('finish', ()=>{

				this.downloadCount++;

				//console.log('Downloaded ' + fileName);
				//console.log(`Downloaded ${done} / ${total}`)

			});
		
		});

		request.on('error', (err)=>{

			this.downloadCount++;

			console.log('\nError Downloading | ' + fileName + ' | ' + err.toString())

		});
	}
}