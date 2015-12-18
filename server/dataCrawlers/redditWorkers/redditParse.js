var lazy = require("lazy");
var fs = require("fs");

var dictionary = {};
var wordsArr = [];
var currentLine = 0;

// var dictionaryStream = fs.createWriteStream('/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/DICTIONARY', {
//   encoding: 'utf-8'
// });
// var wordsStream = fs.createWriteStream('/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/WORDSARR', {
//   encoding: 'utf-8'
// });
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
        // console.log(sentences, 'sentences');
        //last one is an empty string, fuck it
        for (var i = 0; i < sentences.length - 1; i++) {
          words = sentences[i].split(" ");
          for (var j = 0; j < words.length; j++) {
            var word = words[j];
            if (word.length < 12 && !/\d/.test(word)) {
              if (word !== "" && wordsArr[dictionary[word]] === undefined) {
                dictionary[word] = wordsArr.length
                wordsArr[dictionary[word]] = ([word, [currentLine, i]]);
              } else if (word !== "") {
                wordsArr[dictionary[word]].push([currentLine, i]);
              }
            }
          }
        }
      }
    }
    if (currentLine % 100000 === 0) {
      console.log("Current line is ", currentLine)
      console.log(wordsArr.length);
      console.log(dictionary)
        // dictionaryStream.write('/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/WORDSARR', 'utf-8', JSON.stringify(wordsArr));
        // dictionaryStream.write('/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/DICTIONARY', 'utf-8', JSON.stringify(dictionary));
    }
    currentLine++;
  });

sorted = wordsArr.sort(function(a, b) {
  return (a.length > b.length) ? 1 : -1;
})

for (var i = 0; i < wordsArr.length; i++) {
  var toWrite = wordsArr[i][0] + " : " + wordsArr[i].length - 1 + "\n";
  fs.appendFileSync('/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/IN_ORDER', toWrite);
}

for (var key in dictionary) {
  var toWrite = key + " : " + dictionary[key] + "\n";
  fs.appendFileSync('/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/DICT', toWrite);
}
