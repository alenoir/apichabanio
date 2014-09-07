/**
 * ActionController
 *
 * @description :: Server-side logic for managing actions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var request = require('request')
  , cheerio = require('cheerio')
  , moment = require('moment');

module.exports = {
	parse: function (req, res) {
    var i=0;
    var url = 'http://www.lacub.fr/circulation/pont-chaban-delmas-previsions-de-fermetures-a-la-circulation';
    var allAction = [];
    request(url, function(err, resp, body){
      $ = cheerio.load(body);
      links = $('.views-table tr'); //use your CSS selector here
      $(links).each(function(i, link){
        var singleAction = {};
        var date = '';
        var year = 2014;
        var month = 01;
        var day = 01;

        $(link).find('td').each(function(i, td){
          if(i==0){
            singleAction.boat_name = $(td).text().trim().replace('Passage de ', '').replace('Passage du ', '');
          }

          if(i==1){

            var date_action = $(td).text().trim();
            var date_array = date_action.split('/');
            year = date_array[2];
            month = date_array[1];
            day = date_array[0];
            date = moment(year+'/'+month+'/'+day);
            singleAction.date_action = year+'/'+month+'/'+day;
          }

          if(i==2){
            var beggin_action = $(td).text().trim();
            var time_array = beggin_action.split(':');
            var moment_beggin = date.clone();
            moment_beggin.hour(time_array[0]);
            moment_beggin.minute(time_array[1]);
            singleAction.beggin = new Date(moment_beggin);
          }

          if(i==3){

            var end_action = $(td).text().trim();
            var time_array = end_action.split(':');
            var moment_end = date.clone();
            moment_end.hour(time_array[0]);
            moment_end.minute(time_array[1]);
            singleAction.end = new Date(moment_end);
          }

        });

        if (singleAction.boat_name != undefined){

          allAction.push(singleAction);

        }

        i++;

      });
      var date_ref = false;
      var finalDates = [];
      for(i=0;i<allAction.length;i++){
        //console.log('date ref : '+date_ref);
        if(date_ref && date_ref.date_action == allAction[i].date_action) {
          if(
            (date_ref.beggin < allAction[i].end && date_ref.end > allAction[i].beggin)
          ) {
            allAction[i-1].beggin = date_ref.beggin;
            allAction[i-1].end = allAction[i].end;
            allAction[i-1].boat_name = allAction[i-1].boat_name + ' - ' + allAction[i].boat_name
          }
          else {
            date_ref = allAction[i];
            finalDates.push(allAction[i]);
          }

          //var beggin_diff_hour = date_ref.beggin.diff(allAction[i].beggin, 'days');
          //var end_diff_hour = date_ref.end.diff(llAction[i].end, 'days');
        }
        else {
          date_ref = allAction[i];
          finalDates.push(allAction[i]);
        }
      }

      for(i=0;i<finalDates.length;i++) {
        if(finalDates[i] != undefined) {
          var action = finalDates[i];
          //console.log(finalDates[i]);
          Action.findOrCreate({
            boat_name: finalDates[i].boat_name,
            date_action: finalDates[i].date_action,
            beggin: finalDates[i].beggin,
            end: finalDates[i].end
          },
          {
            boat_name: finalDates[i].boat_name,
            date_action: finalDates[i].date_action,
            beggin: finalDates[i].beggin,
            end: finalDates[i].end
          }).exec(function(res, action){
            console.log(res);
          });
        }
      }
      
      return res.json(JSON.stringify(allAction));
    });
    
  }
};

