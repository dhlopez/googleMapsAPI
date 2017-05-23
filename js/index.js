var locations = [];

function myMap() {

	var directionsService = new google.maps.DirectionsService;
	var directionsDisplay = new google.maps.DirectionsRenderer;
  
	var mapOptions1 = {
		center: new google.maps.LatLng(43.653226, -79.383184),
		zoom:9,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById('googleMap1'), mapOptions1);
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById('right-panel'));
	
	google.maps.event.addListener(map,'click',function(event) {
		geocodeConvert(geocoder, map, event.latLng);
	});
	
	var geocoder = new google.maps.Geocoder();
	document.getElementById('submit').addEventListener('click', function() {
		geocodeAddress(geocoder, map);
	});
	document.getElementById('draw').addEventListener('click', function() {
		displayAddresses(directionsService,directionsDisplay);
	});
}

function geocodeAddress(geocoder, resultsMap) {
	var address = document.getElementById('address').value;
	
	geocoder.geocode({'address': address}, function(results, status) {
		if (status === 'OK') {
			locations.push({
				location:results[0].formatted_address,
				stopover: true
			});
			resultsMap.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
			  map: resultsMap,
			  position: results[0].geometry.location
			});
			document.getElementById('allAddresses').innerHTML += '<b>' + address + '</b><br>';
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}
function geocodeConvert(geocoder, resultsMap, location){

	geocoder.geocode({'location': location}, function(results, status) {
		if (status === 'OK') {
			locations.push({
				location:results[0].formatted_address,
				stopover: true
			});
			var marker = new google.maps.Marker({   
			  map: resultsMap,
			  position:results[0].geometry.location
			});
			var infowindow = new google.maps.InfoWindow({
				content: results[0].formatted_address
			});
			infowindow.open(resultsMap,marker);
			document.getElementById('allAddresses').innerHTML += '<b>' + results[0].formatted_address + '</b><br>';
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}
function displayAddresses(directionsService,directionsDisplay)
{
	var lastStop = locations.length-1;
	var waypts =[];
	//ommit the first and last
	for(var i =1; i<lastStop; i++)
	{
		waypts.push(locations[i]);
		//alert(waypts.length);
	}
	
	directionsService.route({
		origin: locations[0].location,
		destination: locations[lastStop].location,
		waypoints: waypts,
		optimizeWaypoints: true,
		travelMode: 'DRIVING'
		}, function(response, status) {
		if (status === 'OK') {
			directionsDisplay.setDirections(response);
			var route = response.routes[0];
			//directions panel
			var summaryPanel = document.getElementById('directions-panel');
			summaryPanel.innerHTML = '';
			// For each route, display summary information.
			for (var i = 0; i < route.legs.length; i++) {
				var routeSegment = i + 1;
				summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
					'</b><br>';
				summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
				summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
				summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
			}
		} else {
		  window.alert('Directions request failed due to ' + status);
		}
	});
	/*
	for (var i = 0; i < locations.length; i++) {
		alert(locations[i].location);
	}
	*/
}