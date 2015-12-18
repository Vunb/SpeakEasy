var request = require('request');
var cheerio = require('cheerio');
var fs = require("fs");

var REDDIT = "https://www.reddit.com/r/all/?count=700&after=t3_3wyul1";

function getReddit(page) {
  page = page || REDDIT;
  request(page, function(err, response, body) {
    if (err) {
      return console.log("ERROR IN THE INITIAL REQ TO REDDIT");
    }
    var $ = cheerio.load(body);
    var aTags = $('a.comments');
    for (var tag in aTags) {
      if (aTags[tag].attribs) {
        if (aTags[tag].attribs.href) {
          console.log(aTags[tag].attribs.href)
        }
      }
    }
    var next = $('span.nextprev a');
    for (var tag in next) {
      if (next[tag].attribs) {
        if (next[tag].attribs.href) {
          if (next[tag].attribs.rel) {
            if (next[tag].attribs.rel === "nofollow next") {
              var getThis = next[tag].attribs.href
              setTimeout(function() {
                console.log(getThis, 'NEXT FUCKING PAGE')
                getReddit(getThis);
              }, 5000)
            }
          }
        }
      }
    }
  });
}

getReddit();
