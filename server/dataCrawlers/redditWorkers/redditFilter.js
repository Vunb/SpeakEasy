var lazy = require("lazy");
var fs = require("fs");

var wordsArr = [];
var dictionary = {};
var matched = {};

var finishedSubReddits = {};
var currentSubreddit = undefined;
var finished = true;

var OG_REDDIT_PATH = '/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/RC_2015-01';
var PARSED_REDDIT_PATH = '/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/REDDIT_COMMENTS';
var VOCAB_PATH = '/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/REDDIT_VOCAB';
var SUBREDDIT_PATH = '/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/SUBREDDITS/'

var MAX_WORDS = 40000;
var MAX_SENTENCE_LENGTH = 30;
var DATA_LENGTH = 53851540;

currentLine = 0;



function buildVocab(sentences) {
  //Last one is an empty string, don't bother with it
  for (var i = 0; i < sentences.length - 1; i++) {
    var words = sentences[i].split(" ");
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

function readRedditData(actionCallback, successCallback) {
  new lazy(fs.createReadStream(OG_REDDIT_PATH))
    .lines
    .forEach(function(line) {
      // Line is originally read as a buffer, need a string
      var line = JSON.parse(line.toString());
      var subreddit = line["subreddit_id"];

      if (currentLine > 4500000) {
        // if (currentSubreddit === undefined && finishedSubReddits[subreddit] === undefined) {
        //   currentSubreddit = subreddit;
        // }

        // if (currentSubreddit && subreddit === currentSubreddit || successCallback) {
        //   finished = false;
        //   var sentences = parseTextBody(line);
        //   if (sentences.length) actionCallback(sentences, line);
        // }

        finishedSubReddits[subreddit] = finishedSubReddits[subreddit] || [];

        // if (finishedSubReddits[subreddit] === undefined) {
        //   finishedSubReddits[subreddit] = [];
        // fs.writeFileSync(SUBREDDIT_PATH + subreddit, JSON.stringify(line) + "\n", 'utf-8');
        // } else {
        finishedSubReddits[subreddit].push(JSON.stringify(line) + "\n");
        // if (finishedSubReddits[subreddit].length > 100) {
        //   var toAppend = finishedSubReddits[subreddit].join('');
        //   fs.appendFileSync(SUBREDDIT_PATH + subreddit, toAppend, 'utf-8');
        //   finishedSubReddits[subreddit] = [];
        // }
        // }
        // Logging as we read
        if (currentLine % 100000 === 0) {
          console.log("Current line is", currentLine);
        }
        if (currentLine % 500000 === 0) {
          console.log("Current line is", currentLine);
          for (var key in finishedSubReddits) {
            var toAppend = finishedSubReddits[key].join('');
            fs.appendFileSync(SUBREDDIT_PATH + key, toAppend, 'utf-8');
            finishedSubReddits[key] = [];
            delete finishedSubReddits[key];

          }
          console.log(finishedSubReddits);
        }

        if (currentLine === DATA_LENGTH) {
          // if (finished === false) {
          //   console.log("Finished with", currentSubreddit);
          //   finished = true;
          //   finishedSubReddits[currentSubreddit] = true;
          //   currentSubreddit = undefined;
          //   currentLine = 0;
          //   recordBestPairs();
          //   readRedditData(actionCallback, successCallback);
          // } else {

          console.log('Done!')
          successCallback();
          // }
        }
      }
      currentLine++;
    });
}

function parseTextBody(line) {
  var sentences = [];
  // Eliminate tiny lines and everything with URLs
  if (line.body.indexOf('http') === -1 && line.body.length > 2) {
    var text = line["body"].trim().toLowerCase();
    // Add punctuation if there isn 't any
    if (text.charAt(text.length - 1) !== '\.' && text.charAt(text.length - 1) !== '\!' && text.charAt(text.length - 1) !== '\?') {
      text = text.concat('\.');
    }
    //Remove everything inside parentheses and brackets
    text = text.replace(/\[([^\[\]]*)\]/g, '').replace(/\(([^\(\)]+)\)/g, '');

    //Fix "I" capitalization
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

    //Remove newlines (nor sure why there would be any)
    text = text.replace(/\n/g, '\s');

    text = text.replace(/(\.)\1{1,}/g, '\.').replace(/(\!)\1{1,}/g, '\!').replace(/(\?)\1{1,}/g, '\?')
    text = text.replace(/\.\s\.\s\./g, '\.').replace(/\!\s\!\s\!/g, '\!').replace(/\?\s\?\s\?/g, '\?')
    text = text.replace(/mrs\./g, 'mrs\s').replace(/mr\./g, 'mr\s').replace(/ms\./g, 'ms\s').replace(/dr\./g, 'dr ').replace(/♪/g, '').replace(/�/g, '').replace(/(\s)\1{1,}/g, '\s').replace(/[a-z]+_/g, '')

    //FUCKING HASHTAGS
    text = text.replace(/#\w+/g, '');

    //Remove the rest of the garbage
    text = text.replace(/[^\w\s\.\!\,\?\']/g, '');
    text = text.trim()
    if (text.length > 2) {
      //Split by sentences
      text = text.replace(/\?\!/g, " \?\! ***")
      text = text.replace(/\?(?=[^\!])/g, " \? ***")
      text = text.replace(/\./g, " \. ***");
      text = text.replace(/\!/g, " \! ***");
      text = text.replace(/\'/g, " \' ");
      text = text.replace(/\,/g, " \, ");
      text = text.replace(/\\/g, "");
      sentences = text.split('***');
    }
  }
  return sentences;
}

function matchToParent(sentences, line) {
  var id = line["link_id"];
  var parent = line["parent_id"];
  var comment = sentences.join(' ');
  matched[parent] = matched[parent] || {
    comment: comment,
    children: []
  };
  matched[parent].children.push([comment, line]);
}

function splitLongComment(sentences) {
  for (var i = 0; i < sentences.length - 2; i++) {
    var prompt = sentences[i];
    var response = sentences[i + 1];
    writeDataPairToDisk(prompt, response);
  }
}

function recordBestPairs() {
  for (var parent in matched) {
    var children = matched[parent].children;
    var prompt = matched[parent].comment;
    var bestResponse = children.reduce(function(best, current) {
      if (best.length && current.length) {
        if (best[1].score < current[1].score) {
          best = current;
        }
        return best;
      }
    });
    var response = bestResponse[0];
    if (prompt && response) writeDataPairToDisk(prompt, response);
  }
  matched = {};
}

function writeDataPairToDisk(prompt, response) {
  var prompt = prompt + "\n";
  var response = response + "\n";
  fs.appendFileSync(PARSED_REDDIT_PATH + "_" + MAX_WORDS.toString(), prompt + response);
}

function writeVocabToDisk() {
  console.log(wordsArr.length);
  wordsArr.sort(function(a, b) {
    return (a[1] < b[1]) ? 1 : -1;
  });
  console.log(wordsArr);

  fs.writeFileSync(VOCAB_PATH, "");
  var max = Math.min(150000, wordsArr.length);
  for (var i = 0; i < max; i++) {
    var toWrite = wordsArr[i][0] + ":  " + wordsArr[i][1] + "\n";
    fs.appendFileSync(VOCAB_PATH, toWrite);
  }
  parseReddit();
}


function filterData(sentences, line) {
  //Check for unknown words, throw sentence away if there are any 
  var wordCount = 0;
  for (var i = 0; i < sentences.length - 1; i++) {
    var words = sentences[i].split(" ");
    for (var j = 0; j < words.length; j++) {
      wordCount++;
      if (dictionary[words[i]] === undefined) return;
    }
  }
  //Check for length of comment and word count, send big ones to get parsed on their own
  return sentences.length > 2 && wordCount > MAX_SENTENCE_LENGTH ? splitLongComment(sentences) : matchToParent(sentences, line);
}

function initializeVocabulary() {
  var fullVocab = fs.readFileSync(VOCAB_PATH, 'utf-8').split("\n");
  // Put everything into dictionary object
  for (var i = 0; i < MAX_WORDS; i++) {
    var word = fullVocab[i].trim();
    dictionary[word] = i;
  }
  return dictionary;
}

function parseReddit() {
  fs.lstat(VOCAB_PATH, function(err, file) {
    if (err) {
      var actionCallback = buildVocab;
      var successCallback = saveToDisk;
    } else {
      // Wipe dictionary in case we just finished building vocabulary
      dictionary = {};
      initializeVocabulary();
      var actionCallback = filterData;
      var successCallback = undefined;
    }
    readRedditData(actionCallback, successCallback);
  });
}

function init() {
  fs.lstat(PARSED_REDDIT_PATH + "_" + MAX_WORDS.toString(), function(err, file) {
    if (err) {
      parseReddit();
    } else {
      console.log('Created data file for ' + MAX_WORDS + 'words!');
    }
  });
}

init();
