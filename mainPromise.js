var teamDataDate = "";
var request = require("request");
var fs = require('fs');
var teamDataUrl = 'http://phpscripts.zeit.de/fb_fwm/fb_mbl/feed/s2015/config/de/dpa/teams.json';
var liveScoreURL = "http://phpscripts.zeit.de/fb_fwm/fb_mbl/feed/s2015/md3/dpa/onl1.json";
var delay = 5*1000;
var liveData = {};
var tickerDataTimestamp = "";
var teamData = fs.readFileSync('cache/teamData.json', 'utf8');

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
  for (var i = 0; i < data.fixture.length; i++) {
    var date = new Date(data.fixture[i].date);

    if(data.fixture[i].status === "FULL"){
      console.log("Am ", date.toLocaleDateString() );
      console.log("spielte ", getTeamName(data.fixture[i].teamHome.teamId), " gegen ", getTeamName(data.fixture[i].teamAway.teamId));
      console.log(data.fixture[i].teamHome.score.total, ":", data.fixture[i].teamAway.score.total);
    }
    if(data.fixture[i].status === "PRE-MATCH"){
      console.log("Am ", date.toLocaleDateString(), " um ", date.toLocaleTimeString() );
      console.log("spielt ", getTeamName(data.fixture[i].teamHome.teamId), " gegen ", getTeamName(data.fixture[i].teamAway.teamId));
    }
  }
  tickerDataTimestamp = data.lastModified;
  console.log("created tickerData at ", tickerDataTimestamp);
}

//   case
//     one of the games status is LIVE set interval to 10000ms 
//     none of the games status is LIVE set interval to 1000*60*5ms
//   write liveData to ticker.json
// update tickerDataLastModified


function getTeamName(teamId){
  if(teamData && teamData !== ""){
    var teamJsonData = JSON.parse(teamData);

    function matchTeamName(data){
      var teamName;

      for (var i = 0; i < data.teams.length; i++) {
            if(data.teams[i].id === teamId){
              teamName = data.teams[i].nameShort;
            }
          }
      return teamName;    
    }
    return matchTeamName(teamJsonData);
  } 
}

setInterval(checkLiveData, delay, teamDataUrl, liveScoreURL);


//LIVE, HALF-TIME, HALF-EXTRATIME Halbzeit-Verlängerung, PENALTY-SHOOTOUT Elfmeterschießen, 
//REVOKED verlegt, WITHDRAWN abgesetzt, POSTPONED abgesagt, CANCELED ausgefallen, DISCARDED gestrichen, FULL, PRE-MATCH

//Zwei Zeitangaben: Spielminute live, zuletzt aktualisiert
var feedStatus = {
  updated: "05 05 2015, 18:30",
  
}

var liveDataObject = {
  games: {
    liveGames: [
      {
        status: "LIVE",
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
    ],
    upcomingGames: [
      {
        status: "PRE-MATCH",
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

    ],
    finishedGames: [
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
}

