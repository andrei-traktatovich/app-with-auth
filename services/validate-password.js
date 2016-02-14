'use strict';
const DEFAULT_REGEX = /([A-z|0-9]){8;16}/;

function validator(regex) {
  regex = regex || DEFAULT_REGEX;
  return (password) {
    return password.match(regex).length == 1;
  };
}

module.exports = validator;
