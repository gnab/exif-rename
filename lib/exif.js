var ExifImage = require('exif').ExifImage;
var moment = require('moment');
var path = require('path');
var Q = require('kew');

exports.getImageCreateDate = function (imagePath) {
  return readImageExif(path.normalize(imagePath))
    .then(getExifCreateDate);
};

function readImageExif (path) {
  var deferred = Q.defer();

  try {
    new ExifImage({ image: path }, function (error, data) {
      if (!error) {
        deferred.resolve(data);
      }
      else {
        deferred.reject({
          type: 'error',
          message: error
        });
      }
    });
  }
  catch (error) {
    deferred.reject({
      type: 'error',
      message: error
    });
  }

  return deferred.promise;
}

function getExifCreateDate (info) {
  return new moment(info.exif.CreateDate, 'YYYY:MM:DD HH:mm:ss');
}
