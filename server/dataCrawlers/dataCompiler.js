var fs = require('fs');

var MASTER_DIR = '/Volumes/Seagate Backup Plus Drive/SPEAKEASY_DATA'
fs.writeFileSync(MASTER_DIR + '/MASTER_FILE', '', 'utf-8');

var movieDir = MASTER_DIR + '/MOVIE_DATA';
fs.writeFileSync(movieDir + '/MASTER_FILE', '', 'utf-8');
fs.readdir(movieDir + '/INDEXED', function(err, data) {
  if (!err) {
    data.forEach(function(file) {
      var text = fs.readFileSync(movieDir + '/INDEXED/' + file, 'utf-8');
      text = parseMore(text);
      fs.appendFileSync(movieDir + '/MASTER_FILE', text + '\nbreakHerePlease\n')
      fs.appendFileSync(MASTER_DIR + '/MASTER_FILE', text + '\nbreakHerePlease\n')
    });
    var tvDir = MASTER_DIR + '/TV_DATA2';
    fs.writeFileSync(tvDir + '/MASTER_FILE', '', 'utf-8');
    fs.readdir(tvDir + '/INDEXED', function(err, data) {
      if (!err) {
        data.forEach(function(file) {
          var text = fs.readFileSync(tvDir + '/INDEXED/' + file, 'utf-8');
          text = parseMore(text);
          fs.appendFileSync(tvDir + '/MASTER_FILE', text + '\nbreakHerePlease\n');
          fs.appendFileSync(MASTER_DIR + '/MASTER_FILE', text + '\nbreakHerePlease\n');
        });
      }
    });
  }
});

function parseMore(text) {
  var parsed = ""
  parsed = text.replace(/mrs\.\n/g, 'mrs ').replace(/mr\.\n/g, 'mr ').replace(/ms\.\n/g, 'ms ').replace(/dr\n\./g, 'dr ').replace(/♪/g, '').replace(/�/g, '').replace(/\[([^\[\]]*)\]/g, '').replace(/-/g, ' ').replace(/~/g, '').replace(/(\s)\1{2,}/g, '\s').replace('blogspot.\ncom download the subtitle  //onlysubtitle.\nblogspot.').replace(/[a-z]+_/g, '');
  var lines = parsed.split("\n");
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].trim().length < 3) {
      lines.splice(i, 1);
    }
  }
  return lines.join("\n");
}

/*
cat / Volumes / Seagate Backup Plus Drive / SPEAKEASY_DATA / MOVIE_DATA > MASTER_FILE.txt
cat /Volumes/Seagate Backup Plus Drive/SPEAKEASY_DATA/TV_DATA/*s >> MASTER_FILE.txt
*/
