var traceur = require('traceur');
var lib = traceur.require('./lib.js');

var paths = process.argv.slice(2);

lib.renameFiles(paths);
