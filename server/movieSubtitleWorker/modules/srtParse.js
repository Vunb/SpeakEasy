var fs = require('fs');

var MASTER_DIR = '/Volumes/Seagate Backup Plus Drive/MOVIE_DATA/'

module.exports = function(data, name, callback) {
  console.log(data);
  // check if file already exists
  fs.lstat(MASTER_DIR + 'INDEXED/' + name + '.txt', function(err, file) {
    if (err) {
      console.log('Indexing movie....')

      data = data.replace(/\r/g, '');
      var regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
      data = data.split(regex);
      data.shift();
      var items = [];
      for (var i = 0; i < data.length; i++) {
        // get rid of newlines, '-', '...', convert everything to lower case
        var text = data[i].trim().replace(/\n/g, ' ').replace(/\-/g, '').replace(/"/g, '').replace(/\'\'/g, '').replace(/(\.)\1{2,}/g, '').replace(/\.\s\.\s\./g, '').toLowerCase();

        // check for empty lines, numbered lines, meta data attributes 
        if (data[i] === ' ' || !isNaN(parseInt(data[i])) || text.includes("*") || text.includes("<") || text.includes(">") || text.includes("=") || text.includes("#")) {
          continue;
        }
        // deal with 'l' as 'I'... why is this even a problem?
        text = text.replace(/^l\s/g, 'I ');
        text = text.replace(/^l'm\s/g, 'I\'m ');
        text = text.replace(/^l've\s/g, 'I\'ve ');
        text = text.replace(/^l'd\s/g, 'I\'d ');
        text = text.replace(/^l'll\s/g, 'I\'ll ');

        text = text.replace(/^l'\sm\s/g, 'I\'m ');
        text = text.replace(/^l'\sve\s/g, 'I\'ve ');
        text = text.replace(/^l'\sd\s/g, 'I\'d ');
        text = text.replace(/^l'\sll\s/g, 'I\'ll ');
        text = text.replace(/\sl\s/g, ' I ');
        text = text.replace(/\sl'/g, ' I\'');
        text = text.replace(/^lt\s/g, 'It ');
        text = text.replace(/^lt'/g, ' It\'');
        text = text.replace(/^lt'\s/g, ' It\'');

        // capitalize 'i' (from .toLowerCase() above)
        text = text.replace(/^i\s/g, 'I ');
        text = text.replace(/^i'm\s/g, 'I\'m ');
        text = text.replace(/^i've\s/g, 'I\'ve ');
        text = text.replace(/^i'd\s/g, 'I\'d ');
        text = text.replace(/^i'll\s/g, 'I\'ll ');
        text = text.replace(/^i'\sm\s/g, 'I\'m ');
        text = text.replace(/^i'\sve\s/g, 'I\'ve ');
        text = text.replace(/^i'\sd\s/g, 'I\'d ');
        text = text.replace(/^i'\sll\s/g, 'I\'ll ');
        text = text.replace(/\si\s/g, ' I ');
        text = text.replace(/\si'/g, ' I\'');

        // remove anything in brackets and parens
        text = text.replace(/\(([^\(\)]+)\)/g, '');
        text = text.replace(/\[([^]]+)\]/g, '');
        // get rid of line assignments
        text = text.replace(/[a-z]+:/g, ''); // this might not be ideal
        items.push(text);
      }
      var totalScript = items.join(" ");

      //mark sentences
      totalScript = totalScript.replace(/\./g, "\.***");
      totalScript = totalScript.replace(/\?/g, "\?***");
      totalScript = totalScript.replace(/\!/g, "\!***");
      var sentences = totalScript.split('***');
      var toWrite = sentences.join("\n");

      // write to indexed file
      fs.writeFile(MASTER_DIR + 'INDEXED/' + name + '.txt', toWrite, 'utf-8', function(err, data) {
        //write to master file
        var stream = fs.createWriteStream(MASTER_DIR + 'MASTER_FILE.txt');
        stream.once('open', function(fd) {
          stream.write(toWrite);
          stream.end();
          callback();
        })
      });
    }
  });
}