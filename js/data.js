/* Global Constants */
var SQ_FT_COST = .15;
var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
var EXPO1_COORD = "(0,0)";
var EXPO2_COORD = "(-300,200)";

var OPEN = 0;
var SELECTED = 1;
var TENTATIVE = 2;
var BOOKED = 3;

var SELECTED_COLOR = 'red';
var OPEN_COLOR = '#00FF00';//'#ff00ff'; //'orange';
var TENTATIVE_COLOR = 'yellow';
var BOOKED_COLOR = 'grey';

/* Static Example Data */
var clientList = [
  "DecisionStreet",
  "DreamWorks"
];
var clientIds = {
  "DecisionStreet":0,
  "DreamWorks":1
};
var clients = [
  {
    "name" : "DecisionStreet",
    "avgRequestedSpace" : "10000",
    "avgUsedSpace" : "5000",
    "bookings" : [
      {
        "eventName" : "Optimization Conference",
        "startDate" : "5/12/2013",
        "sqFt" : "6000"
      },
      {
        "eventName" : "New Web Technologies Lecture",
        "startDate" : "6/12/2013",
        "sqFt" : "2000"
      }
    ]
  },
  {
    "name" : "DreamWorks",
    "avgRequestedSpace" : "20000",
    "avgUsedSpace" : "19000",
    "bookings" : []
  }
];
var spaceIds = {
  "hall_a" : 0,
  "hall_b" : 1,
  "hall_c" : 2,
  "hall_d" : 3
};
var spaceData = [
  {
    "name" : "Hall A",
    "size" : "178000",
    "theater" : "15000",
    "banquet" : "8000"
  },
  {
    "name" : "Hall B",
    "size" : "189000",
    "theater" : "15600",
    "banquet" : "8400"
  },
  {
    "name" : "Hall C",
    "size" : "188000",
    "theater" : "15600",
    "banquet" : "8400"
  },
  {
    "name" : "Hall D",
    "size" : "100600",
    "theater" : "8000",
    "banquet" : "5000"
  }
];

var optimationScores = [
  {"hall_a":1.6, "hall_b":0.8, "hall_c":1.8, "hall_d":2.0}, //sun
  {"hall_a":0.6, "hall_b":1.0, "hall_c":0.6, "hall_d":1.2}, //mon
  {"hall_a":0.3, "hall_b":1.0, "hall_c":0.2, "hall_d":1.0}, //tues
  {"hall_a":0.4, "hall_b":1.0, "hall_c":1.0, "hall_d":0.7}, //wed
  {"hall_a":1.7, "hall_b":0.6, "hall_c":0.9, "hall_d":1.9} //thurs
]
