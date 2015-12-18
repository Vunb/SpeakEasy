var casper = require('casper').create();

var casper = require('casper').create();
var results = [];
var fs = require('fs');

var MASTER_DIR = '/Volumes/Seagate Backup Plus Drive/'

// casper.start('http://casperjs.org/', function() {
//   this.echo(this.getTitle());
// });

// casper.thenOpen('http://phantomjs.org', function() {
//   this.echo(this.getTitle());
// });

// casper.run();
function makePairs(comments) {
  console.log(comments, 'comments')
  comments = comments || $('.comment');
  var results = [];
  for (var i = 0; i < comments.length; i++) {
    var pushed = false;
    var prompt = $(comments[i]).children('.entry').find('.md > p').text().replace(/\n/g, '');
    var children = $(comments[i]).children('.child').children().children()
    if (prompt.indexOf('http') === -1 && children.length) {
      for (var j = 0; j < children.length; j++) {
        var response = $(children[j]).children('.entry').find('.md > p').text().replace(/\n/g, '');
        if (!pushed && response.split(' ').length > 2 && response.split(' ').length < 40 && response.indexOf('http') === -1) {
          results.push(prompt);
          results.push(response);
          pushed = true;
        }
        results = results.concat(makePairs(children[j]));
      }
    }
  }
  return results;
}

function writeToDisk(data, name) {
  fs.writeFileSync(MASTER_DIR + name, data);
  fs.appendFileSync(MASTER_DIR + 'MASTER_FILE', data);
}

function retrieveComments(url, name) {
  casper.start(url, function() {
    console.log('On reddit');
  });
  // skip css files for scraping- google this
  casper.then(function() {
    if (this.exists('.title-button')) {
      this.click('.title-button');
    }
  });

  casper.then(function() {
    console.log('making pairs');
    var data = makePairs();
    writeToDisk(data, name);
  })

  casper.run(function() {
    console.log("results", results);
  });


}



function fetchSlowly(urls) {
  console.log('fetching ' + urls[0]);
  var parts = urls[0].split('/');
  retrieveComments(urls[0], parts[parts.length - 1]);
  urls.splice(0, 1)
  if (urls.length) {
    setTimeout(function() {
      fetchSlowly(urls);
    }, 6000)
  }
}

fs.readFile('./redditURLs', 'utf-8', function(err, data) {
  var urls = data.split("\n");
  fetchSlowly(urls);
});
