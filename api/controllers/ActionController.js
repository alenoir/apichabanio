/**
 * ActionController
 *
 * @description :: Server-side logic for managing actions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var request = require('request')
  , cheerio = require('cheerio')
  , moment = require('moment')
  , Feed = require('feed');

module.exports = {
  index: function (req, res) {
    Action.find().sort('begin ASC')
      .exec(function(err, actions) {
        return res.json(actions);
      });
  },

  next: function (req, res) {
    var datenow = new Date(moment());
    Action.find().where({
      begin: {
        '>=': datenow
      }
    }).sort('begin ASC')
      .exec(function(err, actions) {
        return res.json(actions);
      });
  },

  search: function (req, res) {
    var search = JSON.parse(req.param('q'));
    Action.find({
      dateAction: search.date
    })
    .sort('dateAction DESC')
    .exec(function(err, actions) {
      return res.json(actions);
    });
  },

  todayBoatRss: function (req, res) {

    var feed = new Feed({
        title:          'Fermeture du pont Chaban-Delmas aujourd\'hui',
        description:    'Grâce à Est-ce que le pont Chaban-Delmas est ouvert ?, vérifiez en un clic l\'ouverture du pont Chaban-Delmas et les prochaines fermetures.',
        link:           'http://estcequelepontchabanestouvert.fr',
        image:          'estcequelepontchabanestouvert.fr/images/fb_chaban.png',
        copyright:      'Copyright © 2014 French Fries Labs. All rights reserved',
    });

    var date = moment().subtract(8, 'Hours').format('YYYY/MM/DD');

    Action.find({
      dateAction: {
        '<=': date
      }
    })
    .exec(function(err, actions) {

      for(var key in actions) {
        feed.addItem({
          title:          actions[key].boatName,
          link:           'http://estcequelepontchabanestouvert.fr',
          description:    'Le pont Chaban-Delmas sera fermer aujourd\'hui de '+moment(actions[key].begin).zone('+0200').format('HH[h]mm')+' à '+moment(actions[key].end).format('HH[h]mm'),
          content:        'Le pont Chaban-Delmas sera fermer aujourd\'hui de '+moment(actions[key].begin).zone('+0200').format('HH[h]mm')+' à '+moment(actions[key].end).format('HH[h]mm'),
          date:           actions[key].beggin
        });
      }

      return res.header('Content-Type','text/xml').send(feed.render());
    });
  },

  tomorrowBoatRss: function (req, res) {

    var feed = new Feed({
        title:          'Fermeture du pont Chaban-Delmas demain',
        description:    'Grâce à Est-ce que le pont Chaban-Delmas est ouvert ?, vérifiez en un clic l\'ouverture du pont Chaban-Delmas et les prochaines fermetures.',
        link:           'http://estcequelepontchabanestouvert.fr',
        image:          'estcequelepontchabanestouvert.fr/images/fb_chaban.png',
        copyright:      'Copyright © 2014 French Fries Labs. All rights reserved',
    });

    var date = moment().add(4, 'Hours').format('YYYY/MM/DD');

    Action.find({
      dateAction: date
    })
    .exec(function(err, actions) {
      for(var key in actions) {
        feed.addItem({
          title:          actions[key].boatName,
          link:           'http://estcequelepontchabanestouvert.fr',
          description:    'Le pont Chaban-Delmas sera fermer demain de '+moment(actions[key].begin).zone('+0200').format('HH[h]mm')+' à '+moment(actions[key].end).zone('+0200').format('HH[h]mm'),
          content:        'Le pont Chaban-Delmas sera fermer demain de '+moment(actions[key].begin).zone('+0200').format('HH[h]mm')+' à '+moment(actions[key].end).zone('+0200').format('HH[h]mm'),
          date:           actions[key].beggin
        });
      }

      return res.header('Content-Type','text/xml').send(feed.render());
    });


  },

  statenow: function (req, res) {
    //var datenow = new Date(moment('2014-10-04 16:00'));
    var datenow = new Date(moment());
    var response = {};
    Action.findOne({
      begin: {'<=' : datenow},
      end: {'>=' : datenow}
    })
    .sort('dateAction DESC')
    .exec(function(err, action) {
      if(action == undefined) {
        response.state = 'opened';
      }
      else {
        response.state = 'closed';
        response.boatNames = action.boatName.split(' - ');
        response.begin = action.begin;
        response.end = action.end;
        response.timeClose = action.timeClose;
      }
      return res.json(response);
    });
  },

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
            singleAction.boatName = $(td).text().trim().replace('Passage de ', '').replace('Passage du ', '');
          }

          if(i==1){

            var dateAction = $(td).text().trim();
            var date_array = dateAction.split('/');
            year = date_array[2];
            month = date_array[1];
            day = date_array[0];
            date = moment(year+'/'+month+'/'+day).zone('+0200');
            singleAction.dateAction = year+'/'+month+'/'+day;
          }

          if(i==2){
            var begin_action = $(td).text().trim();
            var time_array = begin_action.split(':');
            var moment_begin = date.clone();
            moment_begin.hour(time_array[0]);
            moment_begin.minute(time_array[1]);
            singleAction.begin = new Date(moment_begin);
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

        if (singleAction.boatName != undefined){

          allAction.push(singleAction);

        }

        i++;

      });
      var date_ref = false;
      var finalDates = [];
      for(i=0;i<allAction.length;i++){
        //console.log('date ref : '+date_ref);
        if(date_ref && date_ref.dateAction == allAction[i].dateAction) {
          if(
            (date_ref.begin < allAction[i].end && date_ref.end > allAction[i].begin)
          ) {
            allAction[i-1].begin = date_ref.begin;
            allAction[i-1].end = allAction[i].end;
            allAction[i-1].boatName = allAction[i-1].boatName + ' - ' + allAction[i].boatName
          }
          else {
            date_ref = allAction[i];
            finalDates.push(allAction[i]);
          }

          //var begin_diff_hour = date_ref.begin.diff(allAction[i].begin, 'days');
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
          var beginDate = moment(finalDates[i].begin);
          var endDate = moment(finalDates[i].end);
          var diffSec = endDate.diff(beginDate);
          var timeTop = new Date(beginDate.add('minutes', 11));
          var timeBottom = new Date(endDate.subtract('minutes', 11));

          console.log(finalDates[i].begin);
          console.log(finalDates[i].boatName);
          Action.findOrCreate({
            boatName: finalDates[i].boatName,
            dateAction: finalDates[i].dateAction,
            begin: finalDates[i].begin,
            end: finalDates[i].end
          },
          {
            boatName: finalDates[i].boatName,
            dateAction: finalDates[i].dateAction,
            begin: finalDates[i].begin,
            end: finalDates[i].end,
            timeClose: diffSec,
            timeTop: timeTop,
            timeBottom: timeBottom
          }).exec(function(res, action){
            console.log(res);
          });
          
        }
      }
      
      return res.json(JSON.stringify(allAction));
    });
    
  }
};

