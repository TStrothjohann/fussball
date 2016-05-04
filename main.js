var xml = require("./node_modules/node-xml");
var fs = require('fs');



var parser = new xml.SaxParser(function(cb) {
  cb.onStartDocument(function() {
    console.log("started reading doc");
  });
  cb.onEndDocument(function() {

  });
  cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
      console.log("=> Started: " + elem + " uri="+uri +" (Attributes: " + JSON.stringify(attrs) + " )");
  });
  cb.onEndElementNS(function(elem, prefix, uri) {
      console.log("<= End: " + elem + " uri="+uri + "\n");
         parser.pause();// pause the parser
         setTimeout(function (){parser.resume();}, 200); //resume the parser
  });
  cb.onCharacters(function(chars) {
      //console.log('<CHARS>'+chars+"</CHARS>");
  });
  cb.onCdata(function(cdata) {
      console.log('<CDATA>'+cdata+"</CDATA>");
  });
  cb.onComment(function(msg) {
      console.log('<COMMENT>'+msg+"</COMMENT>");
  });
  cb.onWarning(function(msg) {
      console.log('<WARNING>'+msg+"</WARNING>");
  });
  cb.onError(function(msg) {
      console.log('<ERROR>'+JSON.stringify(msg)+"</ERROR>");
  });
});

//parser.parseFile("../feed/s2015/md9/de/dpa/29_onl1.xml");
var teamData = JSON.parse( fs.readFileSync('../feed/s2015/config/de/dpa/teams.json', 'utf8') );

function getTeamName(teamId){
  
  function matchTeamName(data){
    var teamName;

    for (var i = 0; i < data.teams.length; i++) {
          if(data.teams[i].id === teamId){
            teamName = data.teams[i].nameShort;
          }
        }
    return teamName;    
  }
  return matchTeamName(teamData);
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

fs.readFile('../feed/s2015/md3/dpa/onl1.json', 'utf8', processData);