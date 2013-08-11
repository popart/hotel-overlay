
function getClient(clientName) {
  if(clientIds[clientName] == undefined)
    return false;
  else 
    return clients[clientIds[clientName]];
}
function getSpace(spaceId) {
  if(spaceIds[spaceId] == undefined)
    return false;
  else 
    return spaceData[spaceIds[spaceId]];
}

function updateClientHistory() {
  var clientData = getClient($('#clientInput')[0].value);
  //if(getClient($('#clientInput')[0].value)){
  if(clientData) {
    $('#cust_hist_btn').button('enable'); //[0].disabled=false;
    $('#clientName').html(clientData.name);
    $('#clientAvgReqSpace').html(clientData.avgRequestedSpace);
    $('#clientAvgUsedSpace').html(clientData.avgUsedSpace);
    //something for multiple bookings
  }
  else {
    $('#cust_hist_btn').button('disable'); //[0].disabled=true;
    $('#clientInfo').dialog('close');
  }
}

function goToRoom(x) {
  if(x == "expo1") {
      //$('#map_group')[0].setAttribute('transform', 'translate'+EXPO1_COORD);
	touchCurrentX = 0;
	touchCurrentY = 0;
	currentScale = 1.0;
	fixScale(null);
	renderSvgWindow();
  }
  else if(x == "expo2") {
	touchCurrentX = -380;
	touchCurrentY = 30;
	currentScale = 2.0;
	fixScale(null);
	renderSvgWindow();
  }

    //$('#map_group')[0].setAttribute('transform', 'translate'+EXPO2_COORD);
}

var selectedDay = 0;
var allRoomSelections = [];
function initRooms() {
  for(i=0; i<5; i++) { //Sun thru Thurs
    allRoomSelections.push({ //push list of halls per diem
      "hall_a":OPEN,
      "hall_b":OPEN,
      "hall_c":OPEN,
      "hall_d":OPEN
    });
  }
  //add some sample booked stuff.
  allRoomSelections[1]["hall_b"] = TENTATIVE;
  allRoomSelections[2]["hall_b"] = BOOKED;
  allRoomSelections[3]["hall_b"] = BOOKED;
  allRoomSelections[3]["hall_c"] = TENTATIVE;
}
function selectDay(dayNum) {
  selectedDay = dayNum;
  //$('#selectedDay').html(DAYS[dayNum]);
  printRooms();
  dispRoomSelections();
}
function selectRoom(roomId) {
  var roomSelections = allRoomSelections[selectedDay];
  //var state = roomSelections[roomId]; //ok i am not doing this cuz pointer messes
  if($('#'+roomId)) {
    if(!roomSelections[roomId] || roomSelections[roomId] == OPEN) {
      roomSelections[roomId] = SELECTED;
      $('#'+roomId)[0].style.fill = SELECTED_COLOR; 
    } else if(roomSelections[roomId] == SELECTED) {
      roomSelections[roomId] = OPEN;
      $('#'+roomId)[0].style.fill = OPEN_COLOR;
    }
  }
  updateBookingDetails();
  printRooms();
  updateOptimationScore();
}
function dispRoomSelections() {
  var roomSelections = allRoomSelections[selectedDay];
  for(r in roomSelections) {
    var color = 'black';
    if(roomSelections[r] == SELECTED)
      color = SELECTED_COLOR;
      //$('#'+r)[0].style.fill = SELECTED_COLOR;
    else if(roomSelections[r] == OPEN)
      color = OPEN_COLOR;
    else if(roomSelections[r] == TENTATIVE)
      color = TENTATIVE_COLOR;
    else if(roomSelections[r] == BOOKED)
      color = BOOKED_COLOR;
    $('#'+r)[0].style.fill = color;
  }
}

function updateBookingDetails() {
  var totalSpace = 0;
  for(x in allRoomSelections) {
    var roomSelections = allRoomSelections[x];
    for(key in roomSelections) {
      if(roomSelections[key] == 1) {
        totalSpace += parseInt(spaceData[spaceIds[key]].size);
      }
    }
  }
  $('#estimatedCost').html("$"+totalSpace*SQ_FT_COST.toFixed(2));
  $('#estimatedCostRoom').html("$"+(totalSpace*SQ_FT_COST/parseInt($('#bookedRooms').val())).toFixed(2));
}

function updateOptimationScore() {
  var optoScore = 1.0;
  for(day in allRoomSelections) {
    var perDaySelections = allRoomSelections[day];
    for(room in perDaySelections) {
      if(perDaySelections[room] == SELECTED)
        optoScore *= optimationScores[day][room]
    }
  }
  //$('#opto_score').html(""+optoScore);
  //$('#opto_color').css('background-color', makeColor(optoScore));
  $('#optimization_color_box')[0].style.fill = makeColor(optoScore);
  $('#optimization_score').text(""+Math.round(optoScore*100));
}


function printRooms() {
  var selections = [];
  var roomSelections = allRoomSelections[selectedDay]
  for(key in roomSelections) {
    if(roomSelections[key] == SELECTED) {
      selections.push(key)
    }
  }
  var roomNames = [];
  var totalSpace = 0;
  var totalBanquet = 0;
  var totalTheater = 0;
  for(s in selections) {
    var data = spaceData[spaceIds[selections[s]]];
    roomNames.push(data.name);
    totalSpace += parseInt(data.size);
    totalBanquet += parseInt(data.banquet);
    totalTheater += parseInt(data.theater);
  }
  //ok now just print to selection thing
  if(roomNames.length == 0)
    $('#selectedRooms').html("None");
  else
    $('#selectedRooms').html(""+roomNames);
  $('#selectedSqFt').html(""+totalSpace);
  $('#selectedTheater').html(""+totalTheater);
  $('#selectedBanquet').html(""+totalBanquet);
}

function makeColor(score) {
  var variance = score - 1.0;
  if(variance >= 0.0) {
    return "#"+pad2(0xFF - (Math.min(variance, 1.0)*0xFF))+"FF00";
  } else {
    return "#FF"+pad2(0xFF + (variance*0xFF))+"00";
  }
}
function pad2(hexNum) {
  var rounded = Math.round(hexNum);
  //return (hexNum < 0x10 ? '0' : '') + hexNum.toString(16);
  return (rounded < 0x10 ? '0' : '') + rounded.toString(16);
}

var slid = true;
function slideOptoGroup() {
  if(slid) {
    $('#opto_group_slideIn')[0].beginElement();
    slid = false;
  } else {
    $('#opto_group_slideOut')[0].beginElement();
    slid = true;
  }
}
function flipOptoArrow() {
  if(slid) {
    $('#opto_arrow_out').hide();
    $('#opto_arrow_in').show();
  } else {
    $('#opto_arrow_out').show();
    $('#opto_arrow_in').hide();
  }
}

