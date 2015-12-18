var lazy = require("lazy");
var fs = require("fs");

var dictionary = {};
var wordsArr = [];
var currentLine = 0;

new lazy(fs.createReadStream('/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/RC_2015-01'))
  .lines
  .forEach(function(line) {
    var line = JSON.parse(line.toString());
    // eliminate tiny lines and everything with URLs
    if (line.body.indexOf('http') === -1 && line.body.length > 2) {
      var text = line["body"].trim().toLowerCase();
      // add punctuation if there isn 't any
      if (text.charAt(text.length - 1) !== '\.' && text.charAt(text.length - 1) !== '\!' && text.charAt(text.length - 1) !== '\?') {
        text = text.concat('\.');
      }
      //remove everything inside parentheses and brackets
      text = text.replace(/\[([^\[\]]*)\]/g, '').replace(/\(([^\(\)]+)\)/g, '');

      //fix "I" capitalization
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

      text = text.replace(/\n/g, '\s');

      text = text.replace(/(\.)\1{1,}/g, '\.').replace(/(\!)\1{1,}/g, '\!').replace(/(\?)\1{1,}/g, '\?')
      text = text.replace(/\.\s\.\s\./g, '\.').replace(/\!\s\!\s\!/g, '\!').replace(/\?\s\?\s\?/g, '\?')
      text = text.replace(/mrs\./g, 'mrs\s').replace(/mr\./g, 'mr\s').replace(/ms\./g, 'ms\s').replace(/dr\./g, 'dr ').replace(/♪/g, '').replace(/�/g, '').replace(/(\s)\1{1,}/g, '\s').replace(/[a-z]+_/g, '')

      //FUCKING HASHTAGS
      text = text.replace(/#\w+/g, '');

      //remove the rest of the garbage
      text = text.replace(/[^\w\s\.\!\,\?\']/g, '');
      text = text.trim()
      if (text.length > 2) {
        text = text.replace(/\?\!/g, " \?\! ***")
        text = text.replace(/\?(?=[^\!])/g, " \? ***")
        text = text.replace(/\./g, " \. ***");
        text = text.replace(/\!/g, " \! ***");
        text = text.replace(/\'/g, " \' ");
        text = text.replace(/\,/g, " \, ");
        text = text.replace(/\\/g, "");
        var sentences = text.split('***');

        //last one is an empty string, fuck it
        for (var i = 0; i < sentences.length - 1; i++) {
          words = sentences[i].split(" ");
          for (var j = 0; j < words.length; j++) {
            var word = words[j];
            if (word.length < 12 && !/\d/.test(word) && !!isNaN(parseInt(word))) {
              if (word !== "" && wordsArr[dictionary[word]] === undefined) {
                dictionary[word] = wordsArr.length
                wordsArr[dictionary[word]] = ([word, 1]);
              } else if (word !== "") {
                wordsArr[dictionary[word]][1]++;
              }
            }
          }
        }
      }
    }

    if (currentLine % 100000 === 0) {
      console.log("Current line is ", currentLine)
      console.log(wordsArr.length)
    }
    if (currentLine > 53851540) {
      writeToDisk();
    }
    currentLine++;
  });

function writeToDisk() {
  console.log(wordsArr.length);
  wordsArr.sort(function(a, b) {
    return (a[1] < b[1]) ? 1 : -1;
  });
  console.log(wordsArr);

  fs.writeFileSync('/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/IN_ORDER', "");
  var max = Math.min(150000, wordsArr.length);
  for (var i = 0; i < max; i++) {
    var toWrite = wordsArr[i][0] + " : " + wordsArr[i][1] + "\n";
    fs.appendFileSync('/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/IN_ORDER', toWrite);
  }

}
