var request = require('request');
var cheerio = require('cheerio');
var srtParser = require('./srtParse.js');
var AdmZip = require('adm-zip');
var fs = require("fs");

var subtitleWorldPrimaryIndex = "http://movie.subtitlesworld.com/lists";

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
		var aTags = $("div.mvtitle a");
		for (var tag in aTags) {
			if (aTags[tag].attribs) {
				if (aTags[tag].attribs.href) {
					retrieveSub(aTags[tag].attribs.href);
				}
			}
		}
	});
}

function retrieveSub(url) {
	// request('movie.subtitlesworld.com/download/15', function(err, response, body) {
	// 	if(err) return console.log("ERROR IN THE retrieveSub");
	// 	$ = cheerio.load(body);
	// 	var episodes = $("a.download_episode");
	// 	for (var episode in episodes) {
	// 		if (episodes[episode].attribs) {
	// 			if (episodes[episode].attribs.name) {
	// 				if (episodes[episode].attribs.name === "English") {
	// 					console.log(episodes[episode].attribs.href)
	// 				}
	// 			}
	// 		}
	// 	}
	// });
	request({
		url: 'http://movie.subtitlesworld.com/download/501',
		encoding: null
	}, function(err, response, body) {
		var zip = new AdmZip(body);
		var zipEntries = zip.getEntries();
		var newSrtFile = srtParser(zip.readAsText(zipEntries[0]), "t4", function() {
			console.log('finished');
		});
	});
}
retrieveSub()
	// build_AlphabeticalLists();