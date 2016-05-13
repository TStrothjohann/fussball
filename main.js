var fs = require('fs');
var request = require("request");
var lastImported = "05 01 2016";
var teamDataUrl = 'http://phpscripts.zeit.de/fb_fwm/fb_mbl/feed/s2015/config/de/dpa/teams.json';
var teamData = fs.readFileSync('cache/teamData.json', 'utf8');
var liveScoreURL = "http://phpscripts.zeit.de/fb_fwm/fb_mbl/feed/s2015/md3/dpa/onl1.json";
var currentLiveDataTime = "05 01 2016";
var delay = 10000;

function refreshTeamData(url, date) {
  var inputDate = new Date(date);
  var todaysDate = new Date();
  
  if(inputDate.setHours(0,0,0,0) < todaysDate.setHours(0,0,0,0) ){
    request
      .get(url)
      .on('error', function(error){
        console.log(error)
        })
      .on('response', function(response) {
          console.log(response.statusCode)  
        })
      .pipe(fs.createWriteStream('cache/teamData.json'))
    lastImported = todaysDate.setHours(0,0,0,0).toString();
  }
}

function getTeamName(teamId){
  refreshTeamData(teamDataUrl, lastImported);
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

function buildRound(data){
  for (var i = 0; i < data.length; i++) {
    var date = new Date(data[i].date);
    console.log("Am ", date.toLocaleDateString(), " um ", date.toLocaleTimeString() );
    console.log("spielt ", getTeamName(data[i].teamHome.teamId), " gegen ", getTeamName(data[i].teamAway.teamId));
  }
}

function processData(err, data){
  if (err) {
    return console.log(err);
  }
  var parsedData = JSON.parse(data);
  buildRound(parsedData.fixture);
}



function checkLiveData(url){
  request(url, function(error, response, body) {
    var liveData = JSON.parse(body);
    if(currentLiveDataTime === liveData.lastModified){
      console.log('aktuell');
      return;
    }else{
      console.log('news!');
      if(teamData && teamData !== ""){
        fs.readFile('../feed/s2015/md3/dpa/onl1.json', 'utf8', processData);
      }else{
        refreshTeamData(teamDataUrl, lastImported);
      }
      buildRound(liveData.fixture);
      currentLiveDataTime = liveData.lastModified;
    }

  });
}

setInterval(checkLiveData, delay, liveScoreURL);