
var map;
var self_marker;
var request = new XMLHttpRequest();
var myLat = -34.387;
var myLng = 150.644;
var my_pos = new google.maps.LatLng(myLat, myLng);

var options = {
	zoom: 13,
	center: my_pos,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};

function init () {
	map = new google.maps.Map(document.getElementById("map_canvas"), options);
	getCurrentLocation();

}

function getCurrentLocation () {
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			myLat = position.coords.latitude;
			myLng = position.coords.longitude;
			renderMap();
		});
	} else {
		alert('Geolocation is not supported by your browser');
	}
}

function renderMap() {
	my_pos = new google.maps.LatLng(myLat, myLng);
	map.panTo(my_pos);
}