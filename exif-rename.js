var fs = require('fs');
var path = require('path');
var Q = require('kew');
var moment = require('moment');
var ExifImage = require('exif').ExifImage;

function readImageExif (path) {
  var deferred = Q.defer();

  try {
    new ExifImage({ image: path }, function (error, data) {
      if (!error) {
        deferred.resolve(data);
      }
      else {
        deferred.reject(error);
      }
    });
  }
  catch (error) {
    deferred.reject(error);
  }

  return deferred.promise;
}

function getExifCreateDate (info) {
  return new moment(info.exif.CreateDate, 'YYYY:MM:DD HH:mm:ss');
}

function createFilenameFromDate (imagePath) {
  return function (date) {
    return path.normalize(
      path.dirname(imagePath) + path.sep +
        date.format('YYYYMMDD_HHmmss') + '.jpg'
    );
  };
}

function skipCorrectlyNamesImage (imagePath) {
  return function (filename) {
    if (imagePath.toLowerCase() === filename.toLowerCase()) {
      return Q.reject('SKIP ' + imagePath);
    }

    return filename;
  };
}

function assertNonExistingFile (filename) {
  var deferred = Q.defer();

  fs.exists(filename, function (exists) {
    if (exists) {
      deferred.reject('DUPL ' + filename);
    }
    else {
      deferred.resolve(filename);
    }
  });

  return deferred.promise;
}

function renameFile (imagePath) {
  return function (filename) {
    fs.renameSync(imagePath, filename);

    console.log('MOVE ' + filename);

    return filename;
  }
}

var paths = process.argv.slice(2);

paths
  .map(path.normalize)
  .forEach(function (imagePath) {
    readImageExif(path.normalize(imagePath))
      .then(getExifCreateDate)
      .then(createFilenameFromDate(imagePath))
      .then(skipCorrectlyNamesImage(imagePath))
      .then(assertNonExistingFile)
      .then(renameFile(imagePath))
      .fail(function (error) {
        console.log(error);
      });
  });
