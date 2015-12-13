var request = require('request');
var cheerio = require('cheerio');
var srtParser = require('../srtParse.js');
var AdmZip = require('adm-zip');
var fs = require("fs");
var rsync = require("sync-request");

var subtitleWorldPrimaryIndex = "http://tv.subtitlesworld.com/lists";

function build_AlphabeticalLists() {
	request(subtitleWorldPrimaryIndex, function(err, response, body) {
		if (err) {
			return console.log("ERROR IN THE INITIAL REQ TO subtitlesworld");
		}
		var $ = cheerio.load(body);
		var aTags = $('a');
		for (var tag in aTags) {
			if (aTags[tag].attribs) {
				if (aTags[tag].attribs.href) {
					if (aTags[tag].attribs.href.includes("lists-")) {
						var motherListUrl = aTags[tag].attribs.href;
						parse_AlphabeticalList(motherListUrl);
					}
				}
			}
		}
	});
}

function parse_AlphabeticalList(url) { //takes a url that returns a page containing a list of films starting with a given letter.
	request(url, function(err, response, body) {
		if (err) return console.log("ERROR IN THE parse_AlphabeticalList");
		$ = cheerio.load(body);
		var aTags = $("div.tvtitle a");
		for (var tag in aTags) {
			if (aTags[tag].attribs) {
				if (aTags[tag].attribs.href) {
					console.log(aTags[tag].attribs.href);
					// retrieveEpisodes(aTags[tag].attribs.href);
				}
			}
		}
	});
}

function retrieveEpisodes(url, name) {
	request(url, function(err, response, body) {
		if (err) return console.log("ERROR IN THE retrieveEpisodes");
		$ = cheerio.load(body);
		var aTags = $("div.tvtitleL a");
		for (var tag in aTags) {
			if (aTags[tag].attribs) {
				if (aTags[tag].attribs.href) {
					retrieveSubFile(aTags[tag].attribs.href, name + tag);
				}
			}
		}
	});
}

function retrieveSubFile(url, name) {
	request(url, function(err, response, body) {
		if (err) return console.log("ERROR IN THE retrieveSubFile");
		$ = cheerio.load(body);
		var aTags = $("a.download_episode");

		for (var tag in aTags) {
			if (aTags[tag].attribs) {
				if (aTags[tag].attribs.href && aTags[tag].attribs.title) {
					if (aTags[tag].attribs.title === "Download English subtitle") {
						var thing = rsync("GET", aTags[tag].attribs.href); //<- makes synchronous http call
						try {
							var zip = new AdmZip(thing.body);
							console.log('Successfully fetched ' + url);
							var zipEntries = zip.getEntries();
							var newSrtFile = srtParser(zip.readAsText(zipEntries[0]), name, "TV");
							// console.log(newSrtFile) // <- yo shit dawg
						} catch (err) {
							console.log(err, "ERROR")
							console.log('Whoops, wrong format for ' + url);
						}
					}
				}
			}
		}

	});
}

function fetchSlowly(urls) {
	console.log('fetching ' + urls[0]);
	//movie name is at end of URL
	var parts = urls[0].split('/');
	retrieveEpisodes(urls[0], parts[parts.length - 1]);
	urls.splice(0, 1)
	if (urls.length) {
		setTimeout(function() {
			fetchSlowly(urls);
		}, 6000)
	}
}

fs.readFile('./requestURLsTV', 'utf-8', function(err, data) {
	var urls = data.split("\n");
	fetchSlowly(urls);
});
// retrieveSubFile()
// build_AlphabeticalLists();
