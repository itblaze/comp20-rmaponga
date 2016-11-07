
var map;
var self_marker;
var request = new XMLHttpRequest();
var myLat = -34.387;
var myLng = 150.644;
var my_pos = new google.maps.LatLng(myLat, myLng);
var ale_to_jfk = [];
var jfk_to_ash = [];
var jfk_to_bra = [];

var shortest;

var infoWindow;

var markersList = [];
var jsonData;

var stationCoordinates = [
	{ station: 'South Station', pos:  { lat: 42.352271, lng: -71.05524200000001 }},
	{ station: 'Andrew'    , pos   :  { lat: 42.330154, lng: -71.057655 }},
	{ station: 'Porter Square', pos:  { lat:  42.3884 , lng: -71.11914899999999 }},
	{ station: 'Harvard Square', pos: { lat: 42.373362 ,lng: -71.118956 }},
	{ station: 'JFK/UMass', pos:      { lat: 42.320685 ,lng: -71.052391 }},
	{ station: 'Savin Hill', pos:     { lat: 42.31129 , lng: -71.053331 }},
	{ station: 'Park Street', pos:    { lat: 42.35639457,lng:-71.0624242 }},
	{ station: 'Broadway', pos:       { lat: 42.342622 , lng:-71.056967 }},
	{ station: 'North Quincy', pos:   { lat: 42.275275 , lng:-71.029583 }},
	{ station: 'Shawmut', pos:        { lat: 42.29312583,lng: -71.06573796000001 }},
	{ station: 'Davis', pos:          { lat: 42.39674,   lng: -71.121815 }},
	{ station: 'Alewife', pos:        { lat: 42.395428,  lng: -71.142483 }},
	{ station: 'Kendall/MIT', pos:    { lat: 42.36249079, lng: -71.08617653 }},
	{ station: 'Charles/MGH', pos:    {   lat: 42.361166 ,    lng: -71.070628 }},
	{ station: 'Downtown Crossing', pos:{  lat: 42.355518 ,   lng:   -71.060225 }},
	{ station: 'Quincy Center', pos:    {  lat: 42.251809 ,   lng:  -71.005409  }},
	{ station: 'Quincy Adams', pos:      { lat:  42.233391 ,  lng:       -71.007153 }},
	{ station: 'Ashmont', pos:           { lat:  42.284652 ,  lng: -71.06448899999999 }},
	{ station: 'Wollaston', pos:         { lat: 42.2665139 ,  lng:  -71.0203369 }},
	{ station: 'Fields Corner', pos:     { lat:  42.300093 ,  lng:   -71.061667 }},
	{ station: 'Central Square', pos:    { lat:  42.365486 ,  lng:   -71.103802 }},
	{ station: 'Braintree', pos:         { lat:  42.2078543 , lng:       -71.0011385 }}
];

var options = {
	zoom: 13,
	center: my_pos,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};

function init () {
	map = new google.maps.Map(document.getElementById("map_canvas"), options);
	t_image = {
		url: 't.png'
	};

	for(var i = 0; i < stationCoordinates.length; i++) {

		// need to set contents of window for each station

		var marker = new google.maps.Marker({
			position: stationCoordinates[i].pos,
			map: map,
			icon: t_image,
			title: stationCoordinates[i].station
		});

		attachListeners(marker, "-t");
		markersList.push({station:stationCoordinates[i].station, marker: marker});
	}
	// fetch data from server about the T
	fetchData();
	getCurrentLocation();
	renderRedPolyLine();

}

function fetchData () {

	var data;

	request = new XMLHttpRequest();

	request.open("get", "https://dry-mesa-37108.herokuapp.com/redline.json", true);


	request.onreadystatechange = function () {
		if (request.readyState == 4 && request.status == 200) {
			data = request.responseText;
			jsonData = JSON.parse(data);
		} else {
			jsonData = undefined;
		}
	}

	request.send();
}

function attachListeners (marker, type,content) {

	marker.addListener('click', function() {



		if (infoWindow) {
			infoWindow.close();
		}

		if (type == "-t" ) {
			var trainData = stationTrainInfo(marker.title);

			infoWindow = new google.maps.InfoWindow({
				content: trainData
			});
		} else if (type == "-s") {
			infoWindow = new google.maps.InfoWindow({
				content: content
			});
		} else {
			infoWindow = new google.maps.InfoWindow({
				content: marker.title
			});
		}

		infoWindow.open(marker.get('map_canvas'), marker);
	});
}

function stationTrainInfo (name) {

	var towardsAlewife = [];
	var towardsBraintree = [];
	var towardsAshmont = [];

	var stationName = '<h3>' + name + '</h3>';
	var scheduleData = stationName;


	if (jsonData == undefined) {
		return '<p>station data currently unavailable. try refreshing the page</p>';
	} else {
		var trips = jsonData.TripList.Trips;

		towardsAlewife = trips.filter(function (value) {
			if ( value.Destination == "Alewife") {
				return true;
			}
			return false;
		});

		towardsAshmont = trips.filter(function (value) {
			return value.Destination == "Ashmont";
		});

		towardsBraintree = trips.filter(function (value) {
			return value.Destination == "Braintree";
		});

		for ( var i = 0 ;i < towardsAshmont.length; i++) {
			for( var j = 0; j < towardsAshmont[i].Predictions.length; j++) {
				if (towardsAshmont[i].Predictions[j].Stop == name) {
					scheduleData = scheduleData + '<p>To Ashmont: ' + Math.round(towardsAshmont[i].Predictions[j].Seconds/60) + ' mins</p>';
				}
			}
		}

		for ( var i = 0 ;i < towardsBraintree.length; i++) {
			for( var j = 0; j < towardsBraintree[i].Predictions.length; j++) {
				if (towardsBraintree[i].Predictions[j].Stop == name) {
					scheduleData = scheduleData + '<p>To Braintree: ' + Math.round(towardsBraintree[i].Predictions[j].Seconds/60) + ' mins</p>';
				}
			}
		}

		for ( var i = 0 ;i < towardsAlewife.length; i++) {
			for( var j = 0; j < towardsAlewife[i].Predictions.length; j++) {
				if (towardsAlewife[i].Predictions[j].Stop == name) {
					scheduleData = scheduleData + '<p>To Alewife: ' + Math.round(towardsAlewife[i].Predictions[j].Seconds/60) + ' mins</p>';
				}
			}
		}
		if ( scheduleData == stationName) {
			scheduleData = scheduleData + '<p>No train data</p>';
		}

		return scheduleData;
	}
}
function renderRedPolyLine () {
	ale_to_jfk.push(findStation("Alewife").pos);
	ale_to_jfk.push(findStation("Davis").pos);
	ale_to_jfk.push(findStation("Porter Square").pos);
	ale_to_jfk.push(findStation("Harvard Square").pos);
	ale_to_jfk.push(findStation("Central Square").pos);
	ale_to_jfk.push(findStation("Kendall/MIT").pos);
	ale_to_jfk.push(findStation("Charles/MGH").pos);
	ale_to_jfk.push(findStation("Park Street").pos);
	ale_to_jfk.push(findStation("Downtown Crossing").pos);
	ale_to_jfk.push(findStation("South Station").pos);
	ale_to_jfk.push(findStation("Broadway").pos);
	ale_to_jfk.push(findStation("Andrew").pos);
	ale_to_jfk.push(findStation("JFK/UMass").pos);

	jfk_to_ash.push(findStation("JFK/UMass").pos);
	jfk_to_ash.push(findStation("Savin Hill").pos);
	jfk_to_ash.push(findStation("Fields Corner").pos);
	jfk_to_ash.push(findStation("Shawmut").pos);
	jfk_to_ash.push(findStation("Ashmont").pos);

	jfk_to_bra.push(findStation("JFK/UMass").pos);
	jfk_to_bra.push(findStation("North Quincy").pos);
	jfk_to_bra.push(findStation("Wollaston").pos);
	jfk_to_bra.push(findStation("Quincy Center").pos);
	jfk_to_bra.push(findStation("Quincy Adams").pos);
	jfk_to_bra.push(findStation("Braintree").pos);


	var Ale_JFK_Polyline = new google.maps.Polyline({
		path: ale_to_jfk,
		geodesic: true,
		strokeColor: '#FF0000',
		strokeWeight: 2
	});

	var JFK_Ash_Polyline = new google.maps.Polyline({
		path: jfk_to_ash,
		geodesic: true,
		strokeColor: '#FF0000',
		strokeWeight: 2
	});

	var JFK_Bra_Polyline = new google.maps.Polyline({
		path: jfk_to_bra,
		geodesic: true,
		strokeColor: '#FF0000',
		strokeWeight: 2
	});

	Ale_JFK_Polyline.setMap(map);
	JFK_Ash_Polyline.setMap(map);
	JFK_Bra_Polyline.setMap(map);

}
function findStation (station) {
	return stationCoordinates.find(function (element) {
		return element.station === station;
	});
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

function closestStation () {
	var closest = stationCoordinates[0];

	var pos = new google.maps.LatLng(stationCoordinates[0].pos.lat, stationCoordinates[0].pos.lng);
	var shortestDistance = google.maps.geometry.spherical.computeDistanceBetween(self_marker.position, pos);

	for (var i = 0; i < stationCoordinates.length; i++) {
		//var pos = new google.maps.LatLng(stationCoordinates[i].pos)
		pos = new google.maps.LatLng(stationCoordinates[i].pos.lat, stationCoordinates[i].pos.lng);

		var distance = google.maps.geometry.spherical.computeDistanceBetween(self_marker.position, pos);
		if (distance < shortestDistance) {
			closest = stationCoordinates[i];
			shortestDistance = distance;
		}
	}

	shortest = shortestDistance;
	return closest;
}

function renderMap() {

	my_pos = new google.maps.LatLng(myLat, myLng);
	map.panTo(my_pos);

	self_marker = new google.maps.Marker({
		position: my_pos,
		map: map,
		title: 'Current Position'
	});


	var x = closestStation();
	var y = [];
	y.push(x.pos);
	y.push({lat: myLat, lng: myLng});

	var closestTpath = new google.maps.Polyline({
		path: y,
		geodesic: true,
		strokeColor: '#FF0000',
		strokeWeight: 1
	});
	closestTpath.setMap(map);

	shortest = Math.round((shortest/1609.344)*1000)/1000;	// change the value to miles and round to 3 decimal places
	var content = '<p>The closest station is: ' + x.station + '. It\'s ' + shortest + ' miles away</p>';
	attachListeners(self_marker, "-s",content);

}