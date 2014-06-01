var fs = require('fs');
var path = require('path');
var Q = require('kew');
var exif = require('./exif');

exports.renameFiles = function (paths) {
  paths
    .map(path.normalize)
    .forEach(function (imagePath) {
      exif.getImageCreateDate(imagePath)
        .then(date => createFilenameFromDate(imagePath, date))
        .then(filename => skipCorrectlyNamedImage(imagePath, filename))
        .then(assertNonExistingFile)
        .then(filename => renameFile(imagePath, filename))
        .then(status => reportStatus(imagePath, status))
        .fail(status => reportStatus(imagePath, status));
    });
};

function createFilenameFromDate (imagePath, date) {
  return path.normalize(
    path.dirname(imagePath) + path.sep +
      date.format('YYYYMMDD_HHmmss') + '.jpg'
  );
}

function skipCorrectlyNamedImage (imagePath, filename) {
  if (imagePath.toLowerCase() === filename.toLowerCase()) {
    return Q.reject({
      type: 'ignore',
      message: 'Filename is in correct format.'
    });
  }

  return filename;
}

function assertNonExistingFile (filename) {
  var deferred = Q.defer();

  fs.exists(filename, function (exists) {
    if (exists) {
      deferred.reject({
        type: 'ignore',
        message: 'Target ' + filename + ' already exists.'
      });
    }
    else {
      deferred.resolve(filename);
    }
  });

  return deferred.promise;
}

function renameFile (imagePath, filename) {
  var deferred = Q.defer();

  fs.rename(imagePath, filename, function (error) {
    if (error) {
      deferred.reject({
        type: 'error',
        message: error
      });
    }
    else {
      deferred.resolve({
        type: 'success',
        message: filename
      });
    }
  });

  return deferred.promise;
}

function reportStatus(imagePath, status) {
  if (status.type === 'error') {
    console.error('Error while renaming ' + imagePath + ':');
    console.error(status.message);
  }
  else if (status.type === 'ignore') {
    console.log('Ignoring file ' + imagePath + ':');
    console.log(status.message);
  }
  else if (status.type === 'success') {
    console.log('Successfully renamed ' + imagePath + ':');
    console.log(status.message);
  }
}
