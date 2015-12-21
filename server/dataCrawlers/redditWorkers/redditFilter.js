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
var VOCAB_PATH = '/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/REDDIT_DICTIONARY_COMPLETE';
var SUBREDDIT_PATH = '/Volumes/HD/SPEAKEASY_DATA/REDDIT/reddit_data/SUBREDDITS/'

var MAX_WORDS = 25000;
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
  fs.readdir(SUBREDDIT_PATH, function(err, data) {
    if (!err) {
      data.forEach(function(file) {
        console.log(file);
        console.log(file);
        try {
          var lines = fs.readFileSync(SUBREDDIT_PATH + file, 'utf-8');
          lines = lines.split("\n");
          lines.forEach(function(line) {
            try {
              line = JSON.parse(line);
              var sentences = parseTextBody(line);
              if (sentences.length) actionCallback(sentences, line);
            } catch (err) {
              console.log("Error parsing line.");
              console.log(err);
            }
          });
        } catch (err) {
          console.log("Error reading file.")
          console.log(err);
        }

        recordBestPairs();
        console.log("Finished with", file);
      });
      successCallback();
    }
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
    text = text.replace(/\si(?=[\s\.\!\?])/g, "I");
    text = text.replace(/\si\'m(?=[\s\.\!\?])/g, "I'm");
    text = text.replace(/\si\'ve(?=[\s\.\!\?])/g, "I've");
    text = text.replace(/\si\'d(?=[\s\.\!\?])/g, "I'd");
    text = text.replace(/\si\'ll(?=[\s\.\!\?])/g, "I'll");
    text = text.replace(/\sim(?=[\s\.\!\?])/g, "I'm");
    text = text.replace(/\sive(?=[\s\.\!\?])/g, "I've");
    text = text.replace(/\sid(?=[\s\.\!\?])/g, "I'd");
    text = text.replace(/\sill(?=[\s\.\!\?])/g, "I'll");

    text = text.replace(/^i(?=[\s\.\!\?])/g, "I");
    text = text.replace(/^i\'m(?=[\s\.\!\?])/g, "I'm");
    text = text.replace(/^i\'ve(?=[\s\.\!\?])/g, "I've");
    text = text.replace(/^i\'d(?=[\s\.\!\?])/g, "I'd");
    text = text.replace(/^i\'ll(?=[\s\.\!\?])/g, "I'll");
    text = text.replace(/^im(?=[\s\.\!\?])/g, "I'm");
    text = text.replace(/^ive(?=[\s\.\!\?])/g, "I've");
    text = text.replace(/^id(?=[\s\.\!\?])/g, "I'd");
    text = text.replace(/^ill(?=[\s\.\!\?])/g, "I'll");

    //Remove newlines (nor sure why there would be any)
    text = text.replace(/\n/g, " ");

    text = text.replace(/(\.)\1{1,}/g, '\.').replace(/(\!)\1{1,}/g, '\!').replace(/(\?)\1{1,}/g, '\?')
    text = text.replace(/\.\s\.\s\./g, '\.').replace(/\!\s\!\s\!/g, '\!').replace(/\?\s\?\s\?/g, '\?')
    text = text.replace(/mrs\./g, 'mrs ').replace(/mr\./g, 'mr ').replace(/ms\./g, 'ms ').replace(/dr\./g, 'dr ').replace(/♪/g, '').replace(/�/g, '').replace(/(\s)\1{1,}/g, " ").replace(/[a-z]+_/g, '')

    //FUCKING HASHTAGS
    text = text.replace(/#\w+/g, '');

    //GRAMMARZ, not shed or wed...
    text = text.replace(/\su(?=[\s\.\!\?])/g, "you");
    text = text.replace(/\suve(?=[\s\.\!\?])/g, "you've");
    text = text.replace(/\sud(?=[\s\.\!\?])/g, "you'd");
    text = text.replace(/\sull(?=[\s\.\!\?])/g, "you'll");
    text = text.replace(/\suve(?=[\s\.\!\?])/g, "you've");
    text = text.replace(/\shed(?=[\s\.\!\?])/g, "he'd");
    text = text.replace(/\sitd(?=[\s\.\!\?])/g, "it'd");
    text = text.replace(/\shed(?=[\s\.\!\?])/g, "he'd");
    text = text.replace(/\stheyd(?=[\s\.\!\?])/g, "they'd");
    text = text.replace(/\sthatd(?=[\s\.\!\?])/g, "that'd");
    text = text.replace(/\swhod(?=[\s\.\!\?])/g, "who'd");
    text = text.replace(/\swhatd(?=[\s\.\!\?])/g, "what'd");
    text = text.replace(/\swhered(?=[\s\.\!\?])/g, "where'd");
    text = text.replace(/\swhend(?=[\s\.\!\?])/g, "when'd");
    text = text.replace(/\swhyd(?=[\s\.\!\?])/g, "why'd");
    text = text.replace(/\showd(?=[\s\.\!\?])/g, "how'd");
    text = text.replace(/\shes(?=[\s\.\!\?])/g, "he's");
    text = text.replace(/\sshes(?=[\s\.\!\?])/g, "she's");
    text = text.replace(/\stheres(?=[\s\.\!\?])/g, "there's");
    text = text.replace(/\sisnt(?=[\s\.\!\?])/g, "isn't");
    text = text.replace(/\sarent(?=[\s\.\!\?])/g, "aren't");
    text = text.replace(/\swasnt(?=[\s\.\!\?])/g, "wasn't");
    text = text.replace(/\swerent(?=[\s\.\!\?])/g, "weren't");
    text = text.replace(/\shavent(?=[\s\.\!\?])/g, "haven't");
    text = text.replace(/\shasnt(?=[\s\.\!\?])/g, "hasn't");
    text = text.replace(/\shadnt(?=[\s\.\!\?])/g, "hadn't");
    text = text.replace(/\swont(?=[\s\.\!\?])/g, "won't");
    text = text.replace(/\swouldnt(?=[\s\.\!\?])/g, "wouldn't");
    text = text.replace(/\sdont(?=[\s\.\!\?])/g, "don't");
    text = text.replace(/\sdoesnt(?=[\s\.\!\?])/g, "doesn't");
    text = text.replace(/\sdidnt(?=[\s\.\!\?])/g, "didn't");
    text = text.replace(/\scant(?=[\s\.\!\?])/g, "can't");
    text = text.replace(/couldnt(?=[\s\.\!\?])/g, "couldn't");
    text = text.replace(/shouldnt(?=[\s\.\!\?])/g, "shouldn't");
    text = text.replace(/mightnt(?=[\s\.\!\?])/g, "mightn't");
    text = text.replace(/mustnt(?=[\s\.\!\?])/g, "mustn't");
    text = text.replace(/wouldve(?=[\s\.\!\?])/g, "would've");
    text = text.replace(/shouldve(?=[\s\.\!\?])/g, "should've");
    text = text.replace(/couldve(?=[\s\.\!\?])/g, "could've");
    text = text.replace(/mightve(?=[\s\.\!\?])/g, "might've");
    text = text.replace(/mustve(?=[\s\.\!\?])/g, "must've");

    text = text.replace(/^u(?=[\s\.\!\?])/g, "you");
    text = text.replace(/^uve(?=[\s\.\!\?])/g, "you've");
    text = text.replace(/^ud(?=[\s\.\!\?])/g, "you'd");
    text = text.replace(/^ull(?=[\s\.\!\?])/g, "you'll");
    text = text.replace(/^uve(?=[\s\.\!\?])/g, "you've");
    text = text.replace(/^hed(?=[\s\.\!\?])/g, "he'd");
    text = text.replace(/^itd(?=[\s\.\!\?])/g, "it'd");
    text = text.replace(/^hed(?=[\s\.\!\?])/g, "he'd");
    text = text.replace(/^theyd(?=[\s\.\!\?])/g, "they'd");
    text = text.replace(/^thatd(?=[\s\.\!\?])/g, "that'd");
    text = text.replace(/^whod(?=[\s\.\!\?])/g, "who'd");
    text = text.replace(/^whatd(?=[\s\.\!\?])/g, "what'd");
    text = text.replace(/^whered(?=[\s\.\!\?])/g, "where'd");
    text = text.replace(/^whend(?=[\s\.\!\?])/g, "when'd");
    text = text.replace(/^whyd(?=[\s\.\!\?])/g, "why'd");
    text = text.replace(/^howd(?=[\s\.\!\?])/g, "how'd");
    text = text.replace(/^hes(?=[\s\.\!\?])/g, "he's");
    text = text.replace(/^shes(?=[\s\.\!\?])/g, "she's");
    text = text.replace(/^theres(?=[\s\.\!\?])/g, "there's");
    text = text.replace(/^isnt(?=[\s\.\!\?])/g, "isn't");
    text = text.replace(/^arent(?=[\s\.\!\?])/g, "aren't");
    text = text.replace(/^wasnt(?=[\s\.\!\?])/g, "wasn't");
    text = text.replace(/^werent(?=[\s\.\!\?])/g, "weren't");
    text = text.replace(/^havent(?=[\s\.\!\?])/g, "haven't");
    text = text.replace(/^hasnt(?=[\s\.\!\?])/g, "hasn't");
    text = text.replace(/^hadnt(?=[\s\.\!\?])/g, "hadn't");
    text = text.replace(/^wont(?=[\s\.\!\?])/g, "won't");
    text = text.replace(/^wouldnt(?=[\s\.\!\?])/g, "wouldn't");
    text = text.replace(/^dont(?=[\s\.\!\?])/g, "don't");
    text = text.replace(/^doesnt(?=[\s\.\!\?])/g, "doesn't");
    text = text.replace(/^didnt(?=[\s\.\!\?])/g, "didn't");
    text = text.replace(/^cant(?=[\s\.\!\?])/g, "can't");



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
  var id = line["name"];
  var parent = line["parent_id"];
  var comment = sentences.join(' ');
  matched[parent] = matched[parent] || {
    comment: undefined,
    children: []
  };
  if (id !== parent) {
    matched[parent].children.push([comment, line]);
    matched[id] = matched[id] || {
      comment: undefined,
      children: []
    };
  }
  matched[id].comment = comment;
}

function splitLongComment(sentences) {
  for (var i = 0; i < sentences.length - 2; i++) {
    var prompt = sentences[i];
    var response = sentences[i + 1];
    if (prompt.length > 3 && response.length > 3) {
      writeDataPairToDisk(prompt, response, "SPLITCOMMENTS");
    }
  }
}

function recordBestPairs() {
  for (var parent in matched) {
    var children = matched[parent].children;
    var prompt = matched[parent].comment;
    delete matched[parent];
    if (children.length) {
      var bestResponse = children.reduce(function(best, current) {
        if (best.length && current.length) {
          if (best[1].score < current[1].score) {
            best = current;
          }
          return best;
        }
      });

      var response = bestResponse[0];
      if (prompt && response) writeDataPairToDisk(prompt, response, "PAIRS");
    }
  }
}

function writeDataPairToDisk(prompt, response, path) {
  var prompt = "PROMPT : " + prompt + "\n";
  var response = "RESPONSE : " + response + "\n";
  fs.appendFileSync(PARSED_REDDIT_PATH + "_" + MAX_WORDS.toString() + "_" + path, prompt + response);
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
  //Now parse the data
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
  // if ((sentences.length < 2) && (wordCount < MAX_SENTENCE_LENGTH)) {
  //   matchToParent(sentences, line);
  // }

  return (sentences.length > 2) && (wordCount > MAX_SENTENCE_LENGTH) ? splitLongComment(sentences) : matchToParent(sentences, line);
}

function initializeVocabulary() {
  var fullVocab = fs.readFileSync(VOCAB_PATH, 'utf-8').split("\n");
  // Put everything into dictionary object
  var counter = 0;
  for (var i = 0; counter < MAX_WORDS; i++) {
    var word = fullVocab[i].split(':')[0];
    if (dictionary[word] === undefined) {
      dictionary[word] = counter;
      counter++
    }
  }
  console.log(dictionary);
  console.log(counter);
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
      var successCallback = function() {
        console.log("All done!")
      };
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
// new lazy(fs.createReadStream(OG_REDDIT_PATH))
//   .lines
//   .forEach(function(line) {
//       // Line is originally read as a buffer, need a string
//       var line = JSON.parse(line.toString());

//       var sentences = parseTextBody(line);
//       if (sentences.length) actionCallback(sentences, line);

//       Logging as we read
//       if (currentLine % 100000 === 0) {
//         console.log("Current line is", currentLine);
//       }
//       if (currentLine % 100000 === 0) {

//       }
//       if (currentLine === DATA_LENGTH) {
//         if (finished === false) {
//           console.log("Finished with", currentSubreddit);
//           finished = true;
//           finishedSubReddits[currentSubreddit] = true;
//           currentSubreddit = undefined;
//           currentLine = 0;
//           recordBestPairs();
//           readRedditData(actionCallback, successCallback);
//         } else {

//           console.log('Done!')
//           successCallback();
//         }
//       }
//     }
//     currentLine++;
//   });
