var stupidvar = 1;
var feeling = "Happy";
var reason = "Arite is such an awesome interface (づ｡◕‿‿◕｡)づ ";
var avatar_index = 0;
const RADIUS = 200;
var filename = 'avatar.png';
var AVAT_HEIGHT = 50;
var AVAT_WIDTH = 50;
var SCREEN_HEIGHT = 600;
var SCREEN_WIDTH = 800;
var current_dayidx = 0;
var emotionsdata = [[], [], [], [], [], [], []]; //these are the indices for previous days. first is today and so on...
var TRANSPARENCY_DELAY = 500;
var w = window.innerWidth*0.8,
    h = window.innerHeight*0.8,
    margin = { top: 40, right: 20, bottom: 20, left: 40 }
var svg ;
var dataset = []
var config = {
  apiKey: "AIzaSyBIuiGklPwChoeJ2PFWQVOJCvhO82Dbh0o",
  authDomain: "arite-project-6982b.firebaseapp.com",
  databaseURL: "https://arite-project-6982b.firebaseio.com",
  projectId: "arite-project-6982b",
  storageBucket: "",
  messagingSenderId: "281398737861"
};
firebase.initializeApp(config);
var database = firebase.database();
var usersReference = database.ref("users");
var map_pagination = ["zerod", "oned" ,"twod", "threed", "fourd", "fived", "sixd"];
var map_months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// make sure you take care of the firebase's latency asynchronosity
function retrieveOneWeekData() {
  var prevdates = [];
  for (var i = 0; i < 7; i++) {
    prevdates.push(getDateDaysBefore(i));
  }
  usersReference.once("value", function(snap){
      snap.forEach(function(user){

        database.ref("users/" + user.key + "/days").once("value",  function(day) {
          day.forEach(function(finput){
            var thetime = finput.val().date;
            var day_index = -1;

            for (var k = 0; k < 7; k++) {
              if (thetime == prevdates[k]){
                day_index = k;
                break;
              }
            }

            console.log(emotionsdata, day_index, "asddddasdjaeifjaefjaepofja")

            if (!(day_index == -1)) {
              emotionsdata[day_index].push({
                x: finput.val().xpos,
                y: finput.val().ypos,
                avatar : user.val().avatar,
                feeling: finput.val().feeling,
                reason: finput.val().reason,
                user_email: user.val().email
              });
            }
        });
      })
    });
  });
}
var circleAttrs = {
    x: function(d) { return d.x - AVAT_WIDTH/2; },
    y: function(d) { return d.y - AVAT_HEIGHT/2; },
    "xlink:href": function(d){ return d.avatar + filename; },
    height:AVAT_HEIGHT,
    width:AVAT_WIDTH,
    id:"avatar"
};

$(document).ready(function() {
  $('.modal').modal();
  //initialize firebase
  svg = d3.select(".emotion_graph").append("svg").attr({
    width: w,
    height: h
  });

      // make sure you take care of the firebase's latency asynchronosity
  console.log(emotionsdata, "asddddasdjaeifjaefjaepofja")

  svg.selectAll("image")
      .data(emotionsdata[current_dayidx])
      .enter()
      .append("svg:image")
      .attr(circleAttrs)  // Get attributes from circleAttrs var
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
  /*svg.append('svg:image')
  .attr({
    'xlink:href': 'trump_avatar.png',  // can also add svg file here
    x: 0,
    y: 0,
    height:50,
    width:50
  });*/


  // On Click, we want to add data to the array and chart
  svg.on("click", function() {
      svg.selectAll("circle").remove()
      var coords = d3.mouse(this);
      console.log(coords[0])
      console.log(Math.round(coords[0]))
      //Normally we go from data to pixels, but here we're doing pixels to data
      var newData= {
        x: Math.round( coords[0]),  // Takes the pixel number to convert to number
        y: Math.round( coords[1]),
        height:AVAT_HEIGHT,
        width:AVAT_WIDTH,
        "xlink:href": avatar_index + "avatar.png",
        avatar : avatar_index,
        feeling : feeling,
        reason : reason
      };

      if (stupidvar < 1) {
        insertNewFeeling(newData.x, newData.y, newData.feeling, newData.reason);
        emotionsdata[current_dayidx].push(newData);   // Push data to our array
        $("body").css('cursor','pointer');
        stupidvar += 1;

      }
      console.log("feeling is "+ feeling);

      console.log(dataset)

      svg.selectAll("image")  // For new circle, go through the update process
        .data(emotionsdata[current_dayidx])
        .enter()
        .append("image")
        .attr(circleAttrs)  // Get attributes from circleAttrs var
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

      console.log(newData);
      riffle = svg.append("circle")
        .attr('cx',coords[0])
        .attr('cy',coords[1])
        .attr('r',0)
        .attr('fill','none')
        .attr('stroke','black')

      riffle.transition().duration(100)
        .attr('r',RADIUS)




      d3.selectAll("#avatar")
            .data(emotionsdata[current_dayidx])
            .transition()
            .duration(TRANSPARENCY_DELAY)
            .attr("opacity",function(d,i){
              //console.log(distance(newData,d))
              //console.log(" " + distance(newData,d) + " $ " + 500)
              if(distance_squared(newData,d) < RADIUS*RADIUS){
                return "1"
              }
              else{
                return "0"
              }
            });


          d3.timer(make_hidden(newData),TRANSPARENCY_DELAY)
          //setTimeout("make_hidden(newData,dataset)" ,0.5)

    })
  // retrieveFBData();
  retrieveOneWeekData();
  paginationDateFill();

  //parseURL();
//d3.selectAll("#avatar").attr("visibility", "hidden");
});
function make_hidden(newData){
  d3.selectAll("#avatar")
        .data(emotionsdata[current_dayidx])
        .attr("visibility",function(d,i){
          //console.log(distance(newData,d))
          //console.log(" " + distance(newData,d) + " $ " + 500)
          if(distance_squared(newData,d) < RADIUS*RADIUS){
            return "visible"
          }
          else{
            return "hidden"

          }
        });
}
function change_day(new_day){
    console.log(current_dayidx,"->",new_day);
    console.log(emotionsdata[current_dayidx])
    reserve_today = []
    for(var i = 0;i < emotionsdata[current_dayidx].length; i++)
      reserve_today.push( emotionsdata[current_dayidx][i]);

    for(var i = 0;i < emotionsdata[current_dayidx].length; i++){
      for(var j = 0; j < emotionsdata[new_day].length; j++){
        if(emotionsdata[current_dayidx][i].user_email == emotionsdata[new_day][j].user_email){
            emotionsdata[current_dayidx][i] = emotionsdata[new_day][j];
            emotionsdata[current_dayidx][i].x = emotionsdata[new_day][j].x;
            emotionsdata[current_dayidx][i].y = emotionsdata[new_day][j].y;
            // avatar : user.val().avatar,
            // feeling: finput.val().feeling,
            // reason: finput.val().reason,
            // user_email: user.val().email

        }
      }
    }
    //update inputs which are from common users
    svg.selectAll("image")  // For new circle, go through the update process
      .data(emotionsdata[current_dayidx])
      .transition()
      .duration(TRANSPARENCY_DELAY)
      .attr(circleAttrs)
      .attr('visibility','visible')
      .attr('opacity','1')

    // // remove old avatars
    // svg.selectAll("image")  // For new circle, go through the update process
    //   .data(emotionsdata[current_dayidx])
    //   .transition()
    //   .duration(TRANSPARENCY_DELAY)
    //   .remove();
    //
    // // add new avatars
    // svg.selectAll("image")  // For new circle, go through the update process
    //   .data(emotionsdata[new_day])
    //   .enter()
    //   .append("image")
    //   .attr(circleAttrs)  // Get attributes from circleAttrs var
    //   .on("mouseover", handleMouseOver)
    //   .on("mouseout", handleMouseOut);
    emotionsdata[current_dayidx] = []
    for(var i = 0;i < emotionsdata[current_dayidx].length; i++)
      emotionsdata[current_dayidx].push(reserve_today[i]);

    emotionsdata[current_dayidx] = reserve_today;
    current_dayidx = new_day

}
function distance_squared(a,b){
  return (a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y);
}
    // Create Event Handlers for mouse
function handleMouseOver(d, i) {  // Add interactivity

  // Specify where to put label of text
  svg.append("text").attr({
     id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
      x: function() { return d.x - 30; },
      y: function() { return d.y - 15; }
  })
  .text(function() {

    return "I felt "+ d.feeling + " because " + d.reason;  // Value of the text
  });
}
function handleMouseOut(d, i) {
      // Use D3 to select element, change color back to normal
      // Select text by id and then remove
      d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
    }

function insertNewFeeling(xpos, ypos, feeling, reason) {
  usersReference.once("value", function(snap){
    snap.forEach(function(user) {
      console.log("the avatar", user.val().avatar)
      if (user.val().avatar == avatar_index) {
        console.log("I am right now avatar ", avatar_index, "adding to ", user.val())
        database.ref("users/" + user.key + "/days").push({
          xpos: xpos,
          ypos: ypos,
          feeling: feeling,
          reason: reason,
          date: GetTodayDate()
        });
      }
    });
  });
}

function GetTodayDate() {
  var tdate = new Date();
  var dd = tdate.getDate(); //yields day
  var MM = tdate.getMonth() + 1; //yields month
  var yyyy = tdate.getFullYear(); //yields year
  if (dd < 10){
    dd = "0" + dd;
  }
  if (MM < 10){
    MM = "0" + MM;
    console.log(dd)
  }
  var currentDate = dd +"" + MM + "" + yyyy;
  return currentDate;
}

function parseURL() {
  feeling = $.query.get("feeling");
  reason = $.query.get("reason");
}




function getDateDaysBefore(days) {
  var date = new Date();
  var thatdate = date - 1000 * 60 * 60 * 24 * days;   // current date's milliseconds - 1,000 ms * 60 s * 60 mins * 24 hrs * (# of days beyond one to go back)
  thatdate = new Date(thatdate);
  var dd = thatdate.getDate(); //yields day
  var MM = thatdate.getMonth() + 1; //yields month
  var yyyy = thatdate.getFullYear(); //yields year
  if (dd < 10){
    dd = "0" + dd;
  }
  if (MM < 10){
    MM = "0" + MM;
  }
  var thedate = dd +"" + MM + "" + yyyy;
  return thedate;
}


function selectPagIdx(idx) {

  $("#" + $(".active").attr("id")).removeClass("active");
  $("#" + map_pagination[idx]).addClass("active");

  change_day(idx);
}

function paginationDateFill() {
  var today = new Date();
  for (var i = 1; i < 7; i++) {
    var today = new Date(today - 1000 * 60 * 60 * 24 * 1);
    var dd = today.getDate(); //yields day
    var MM = map_months[today.getMonth()]; //yields month
    var date = MM + " " + dd
    $("#" + map_pagination[i] + " > a").text(date);
  }
}
