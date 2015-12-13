var request = require('request');
var cheerio = require('cheerio');
var srtParser = require('../movieSubtitleWorker/modules/srtParse.js');
var AdmZip = require('adm-zip');
var fs = require("fs");
var rsync = require("sync-request");

var tvSubtitlesPrimaryIndex = "http://www.tvsubtitles.net/";

function findTelevisionShows() {
  request(tvSubtitlesPrimaryIndex + 'tvshows.html', function(err, response, body) {
    if (err) {
      return console.log("ERROR IN THE INITIAL REQ TO tvsubtitles");
    }
    var $ = cheerio.load(body);
    var aTags = $('#table5 a');
    for (var tag in aTags) {
      if (aTags[tag].attribs) {
        if (aTags[tag].attribs.href) {
          var show = aTags[tag].attribs.href
          findSubtitles(tvSubtitlesPrimaryIndex + show);
        }
      }
    }
  });
}

function findSubtitles(url) {
  request(url, function(err, response, body) {
    if (err) {
      return console.log("");
    }
    var $ = cheerio.load(body);
    var aTags = $('#table5 a');
    //for each link
    for (var tag in aTags) {
      //check for children
      if (aTags[tag].children) {
        //loop through children 
        for (var i = 0; i < aTags[tag].children.length; i++) {
          if (aTags[tag].children[i] !== undefined) {
            //looking for child <b> tag with a text child
            if (aTags[tag].children[i].children && aTags[tag].children[i].name === "b") {
              //only one item in child array
              if (aTags[tag].children[i].children) {
                if (aTags[tag].children[i].children[0]) {
                  if (aTags[tag].children[i].children[0].data) {
                    if (aTags[tag].children[i].children[0].data === "All episodes") {
                      var allEpisodes = aTags[tag].attribs.href
                        //add -en for english
                      allEpisodesEN = allEpisodes.split('.html').concat('-en.html').join('');
                      var downloadLink = ['download'].concat(allEpisodesEN.split('episode')).join('');
                      console.log(tvSubtitlesPrimaryIndex + downloadLink);
                      downloadSubtitles(tvSubtitlesPrimaryIndex + downloadLink);
                    }
                  }
                }

              }
            }
          }
        }
      }
    }
  });
}

function downloadSubtitles(url, name) {
  var thing = rsync("GET", url); //<- makes synchronous http call
  try {
    var zip = new AdmZip(thing.body);
    console.log('Successfully fetched ' + url);
    var zipEntries = zip.getEntries();
    for (var i = 0; i < zipEntries.length; i++) {
      var newSrtFile = srtParser(zip.readAsText(zipEntries[i]), name + i);
    }
  } catch (err) {
    console.log(err, "ERROR")
    console.log('Whoops, wrong format for ' + url);
  }
}


function fetchSlowly(urls) {
  console.log('fetching ' + urls[0]);
  //movie name is at end of URL
  var parts = urls[0].split('/');
  downloadSubtitles(urls[0], parts[parts.length - 1]);
  urls.splice(0, 1)
  if (urls.length) {
    setTimeout(function() {
      fetchSlowly(urls);
    }, 4000)
  }
}

var movie = 0;
fs.readFile('./requestURLs', 'utf-8', function(err, data) {
  var urls = data.split("\n");
  fetchSlowly(urls);
});