/**
* Action.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var moment = require('moment');

module.exports = {

  attributes: {
    boatName: {
      type: 'string'
    },
    dateAction: {
      type: 'string'
    },
    begin: {
      type: 'datetime'
    },
    end: {
      type: 'datetime'
    },
    timeClose: {
      type: 'integer'
    },
    timeTop: {
      type: 'datetime'
    },
    timeBottom: {
      type: 'datetime'
    }
  }
};

