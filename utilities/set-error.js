'use strict';
var http = require('http');
function setError(statusCode, message) {

  statusCode = statusCode || 500;

  var error = new Error(message || http.STATUS_CODES[statusCode]);
  error.status = statusCode || 500;
  return error;
}

module.exports = setError;
