/**
* Action.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var moment = require('moment');

module.exports = {

  attributes: {
    boat_name: {
      type: 'string'
    },
    date_action: {
      type: 'string'
    },
    beggin: {
      type: 'datetime'
    },
    end: {
      type: 'datetime'
    },
    time_close: {
      type: 'integer'
    },
    time_top: {
      type: 'datetime'
    },
    time_bottom: {
      type: 'datetime'
    }
  }
};

