var teamDataDate = "";
var request = require("request");
var fs = require('fs');
var teamDataUrl = 'http://phpscripts.zeit.de/fb_fwm/fb_mbl/feed/s2015/config/de/dpa/teams.json';
var liveScoreURL = "http://phpscripts.zeit.de/fb_fwm/fb_mbl/feed/s2015/md3/dpa/onl1.json";
var delay = 5*1000;
var liveData = {};
var tickerDataTimestamp = "";

//check teamDataDate against today 
//if older than 12 hours refresh

function checkLiveData(teamUrl, scoreUrl){
  if ( teamDataDate === "" || Date.parse(teamDataDate) + 12*60*60*1000 < new Date ){
    refreshTeamData(teamUrl)
  }
  if( teamDataDate !== "" ){
    refreshLiveData(scoreUrl)
  }
  //add liveDataTimestamp comparison after timestamp has been set
  if( liveData.lastModified ){
    createTickerData(liveData)
  }
}


function refreshTeamData(url){
  request
    .get(url)
    .on('error', function(error){
        console.log(error)
      })
    .on('response', function(response) {
        teamDataDate = new Date;
      })
    .pipe(fs.createWriteStream('cache/teamData.json'))
    console.log('piped');
}

function refreshLiveData(url){
  request
    .get(url)
    .on('error', function(error){
      console.log(error)
    })
    .on('data', function(data){
      liveData = JSON.parse(data);
    })
}

function createTickerData(data){
  
  tickerDataTimestamp = data.lastModified;
  console.log("created tickerData at ", tickerDataTimestamp);
}
// get tickerData
// compare tickerDataLastModified to tickerDataLastChecked
// if newer refresh liveData
//   case
//     one of the games status is LIVE set interval to 10000ms 
//     none of the games status is LIVE set interval to 1000*60*5ms
//   write liveData to ticker.json
// update tickerDataLastModified

setInterval(checkLiveData, delay, teamDataUrl, liveScoreURL);

var liveDataObject = {
  games: [
    {
      status: "FULL",
      time: "05 05 2015, 18:30",
      teamHome: "Eintracht Frankfurt",
      teamAway: "Dynamo Dresden",
      scoreTeamHome: {
        total: 2,
        firstHalf: 0 
      },
      scoreTeamAway : {
        total: 1,
        firstHalf: 1
      }
    }

  ]
}
