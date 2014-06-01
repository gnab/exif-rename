var traceur = require('traceur');
var renamer = traceur.require('./lib/renamer.js');

var paths = process.argv.slice(2);

renamer.renameFiles(paths);
