/**
* Action.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

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
    }
  }
};

