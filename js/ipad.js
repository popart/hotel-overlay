var touchWindow;  // = $('#main_svg_panel');
function initTouch() {
touchWindow = $('#main_svg_panel')[0];

/* Single finger translate */
touchWindow.ontouchstart = grabStartPos;
touchWindow.ontouchmove = handleTranslate;
touchWindow.ontouchend = fixTranslate;

/* Two finger scale */
touchWindow.ongesturechange = handleScale;
touchWindow.ongestureend = fixScale;
}
var ogScale = 1.0
var currentScale = 1.0;

var ogX = 0.0;
var ogY = 0.0;
var touchCurrentX = 0.0;
var touchCurrentY = 0.0;
var touchStartX;
var touchStartY;

function blockMove(event) {
  event.preventDefault();
}
function handleScale(event) {
  //trying to center the scaling, i think this is better than nothing...
  //the formula is translate(-centerPos*(scaleFactor - 1))
  touchCurrentY -= touchCurrentY*(event.scale-1);
  touchCurrentX -= touchCurrentX*(event.scale-1);
  currentScale = ogScale * event.scale;
  renderSvgWindow();
}
function fixScale(event) {
  ogScale = currentScale;
  ogX = touchCurrentX;
  ogY = touchCurrentY;
}

function grabStartPos(event) {
  touchStartX = event.touches.item(0).pageX; //item(0) means the first finger touch
  touchStartY = event.touches.item(0).pageY;
}

function handleTranslate(event) {
  touchCurrentX = ogX + event.touches.item(0).pageX - touchStartX;
  touchCurrentY = ogY + event.touches.item(0).pageY - touchStartY;
  renderSvgWindow();
}
function fixTranslate() {
  ogX = touchCurrentX;
  ogY = touchCurrentY;
}

function renderSvgWindow() {
  $('#map_group')[0].setAttribute('transform', 'scale('+currentScale+', '+currentScale+'), translate('+touchCurrentX+', '+touchCurrentY+')');
  //alert("you touched me");
}
