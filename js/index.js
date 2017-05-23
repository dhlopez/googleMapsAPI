/**
 * Created by dlopez on 2017-03-01.
 */
var alllevels = [];
var allStations = [];
var stationsSelected = [];
var levelsSelected = [];
var truckLevel = 44000;
var markers = [];
var modalLoaded = false;
function myMap() {
    function calcDistance(p1, p2) {
        //returns difference in km
        var d = (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
        return d;
    }

    //Get closest pump button - for 1 level
    $("#closestPump").click(function() {
       //clearSummary();
        var latlngValue = $("#levelVisited").val();
        var latlng = latlngValue.split(",");
        latlng = new google.maps.LatLng(latlng[0], latlng[1]);

        var c;
        var closestStation;
        var index;
        for(var i = 0; i<allStations.length;i++)
        {
            var supLat = allStations[i].lat;
            var supLng = allStations[i].lng;
            var suplatlng = new google.maps.LatLng(supLat, supLng);

            c=parseFloat(calcDistance(latlng,suplatlng));
            if(i==0)
            {
                index = i;
                closestStation = c;
            }
            else if(c<closestStation)
            {
                index = i;
                closestStation = c;
            }
        }

        displayClosestStation(directionsService,directionsDisplay, latlng, index);
    });

    //Define map and options
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({
        draggable: true
    });

    var mapOptions1 = {
        center: new google.maps.LatLng(43.653226, -79.383184),
        zoom:9,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map;
    if(modalLoaded)
    {
        map = new google.maps.Map(document.getElementById('googleMap2'), mapOptions1);
    }
    else
    {
        map = new google.maps.Map(document.getElementById('googleMap1'), mapOptions1);
    }

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('details'));

    google.maps.event.addListener(map,'click',function(event) {
        geocodeConvert(geocoder, map, event.latLng);
    });
    var geocoder = new google.maps.Geocoder();
    //add Location
    document.getElementById('submit').addEventListener('click', function() {
        /*$.growl("Address added to your selected levels.", {type: 'success'});*/
        geocodeAddress(geocoder, map);
    });
    //Get Route
    document.getElementById('draw').addEventListener('click', function() {
        //clearSummary();
        displayAddresses(directionsService,directionsDisplay);
    });
    //function to fill leves on leves and truck divs
    addStoredLvls();
}
function addLevelSelected(status, results, resultsMap)
{
    if (status === 'OK') {
        levelsSelected.push({
            location:results[0].formatted_address,
            stopover: true
        });

        var marker = new google.maps.Marker({
            map: resultsMap,
            position: results[0].geometry.location,
            title:results[0].formatted_address
        });
        markers.push(marker);
        document.getElementById('right-panel').innerHTML += '<div class = "draggableLevel" address="'+results[0].formatted_address+'"><b>' + results[0].formatted_address + '</b></div><br>';
    } else {
        alert('Geocode was not successful for the following reason: ' + status);
    }
}
//add location from textbox
function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('address').value;
    geocoder.geocode({'address': address}, function(results, status) {
        addLevelSelected(status, results, resultsMap);
        resultsMap.setCenter(results[0].geometry.location);
    });
}
//transform a click into an address
function geocodeConvert(geocoder, resultsMap, location){
    geocoder.geocode({'location': location}, function(results, status) {
        addLevelSelected(status, results, resultsMap);
    });
}
//find closest station to a level
function displayClosestStation(directionsService,directionsDisplay, levellatlng, supIndex)
{
    directionsService.route({
        origin: levellatlng,
        destination: allStations[supIndex].location,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
            var route = response.routes[0];
            //directions panel
            /*var summaryPanel = document.getElementById('summary');
            summaryPanel.innerHTML += '';
            // For each route, display summary information.
            for (var i = 0; i < route.legs.length; i++) {
                var routeSegment = i + 1;
                summaryPanel.innerHTML += 'Route Segment: ' + routeSegment +	'</br>';
                summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
                summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
                summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';*/
            $('#distance').text('Closest pump, distance (km): ' + route.legs[0].distance.text);
            //}
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}
//Get Route Function
function displayAddresses(directionsService,directionsDisplay)
{

    directionsService.route({
        origin: $("#startingPoint").val(),
        destination: $("#endingPoint").val(),
        waypoints: levelsSelected,
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            //get all the alllevels sorted
            directionsDisplay.setDirections(response);
            var route = response.routes[0];

            //directions panel
            /*var summaryPanel = document.getElementById('summary');
            summaryPanel.innerHTML += '';
            // For each route, display summary information.
            for (var i = 0; i < route.legs.length; i++) {
                var routeSegment = i + 1;
                summaryPanel.innerHTML += 'Route Segment: ' + routeSegment +	'</br>';
                summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
                summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
                summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
            }*/
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}
//adds levels from the database with toggle
function appendLevels(level, isEnable)
{
    var levelAddress = document.getElementById('levels');
    levelAddress.innerHTML += '<div class="draggableLevel" id="'+level.id+'" style="level" water="1500" priority="2" address="'+level.address+'">' + level.address + '' +
        '<br> Actual Level: ' + level.percentLevel +  ' Required Level: ' + level.deliveryLevel +'<br>' +
        'Needs refill?:'+'<label class="switch"><input type="checkbox" readonly '+ isEnable +' disabled><div class="slider round"></div></label><br><br></div>';
    alllevels.push({location:level.address, stopover: true});
}
//function to fill levels on levels and truck divs
function addStoredLvls()
{
    alllevels=[];
    //empty drop down
    $('#levelVisited').empty();
	$('#startingPoint').empty();
	$('#endingPoint').empty();
    //get levels
    //$.post("php/ajax/delivery-maps.php", { method:"map", userId: userId }, function(data, textStatus){
	var data=[];
	data[0]={
		id:1,
		address: "521 Thorold Rd, Welland",
		percentLevel: 5,
		deliveryLevel: 2,
		lat: 43.003077,
		lng: -79.282366
	}
	data[1]={
		id:2,
		address: "432 Clare Ave, Welland",
		percentLevel: 15,
		deliveryLevel: 20,
		lat: 42.995955,
		lng: -79.280231
	}
	data[2]={
		id:1,
		address: "312 Fitch St, Welland",
		percentLevel: 17,
		deliveryLevel: 20,
		lat: 42.994534,
		lng: -79.274629
	}
	for(var i=0; i<data.length; i++)
	{
		if(data[i].address!=null) {
			var isEnable = '';
			if(data[i].percentLevel<data[i].deliveryLevel && $("input[name='radCalc']:checked").val()=='needed')
			{
				appendLevels(data[i], 'checked');
			}
			if($("input[name='radCalc']:checked").val()=='all')
			{
				if(data[i].percentLevel<data[i].deliveryLevel)
				{
					isEnable = 'checked';
				}
				appendLevels(data[i],isEnable);
			}
		}
		//populate last level visited, values coming from db,
		// then transformed to latlng for google maps
		var lat = parseFloat(data[i].lat);
		var lng = parseFloat(data[i].lng);
		$('#levelVisited').append($('<option>', {
			value: lat + ',' +lng,
			text: data[i].address
		}));
	}
	if($("input[name='radCalc']:checked").val()=='custom')
	{
		$('#lvlsChoose').hide();
		/*$('#lvlsChosen').hide();*/
		$('#customAddress').show();
	}
	else
	{
		$('#lvlsChoose').show();
		/*$('#lvlsChosen').show();*/
		$('#customAddress').hide();
	}
    //},"json");

    //post for user address from userID
	var data = [];
	data[0] = 
	{
		address:"312 Fitch St.",
		city:"Welland"
	}
    //$.post("php/ajax/users.php", { userId:userId, method:'GetUserLocation' }, function(data, textStatus){
        for(var i=0; i<data.length; i++) {
            $('#startingPoint,#endingPoint').append($('<option>', {
                value: data[i].address + ' ' + data[i].city,
                text: 'Home ' + data[i].address + ' ' + data[i].city
            }));
        }
    //},"json");

        //starting and ending point, load stations and start/ending point
    //$.post("php/ajax/stationArea.php", { userId:userId }, function(data, textStatus){
	data[0] = 
	{
		address:"500 Fitch St.",
		city:"Welland"
	}
	data[1] = 
	{
		address:"600 Fitch St.",
		city:"Welland"
	}
        for(var i=0; i<data.length; i++)
        {
            if (data[i].address!=null) {
                $('#startingPoint,#endingPoint, #station').append($('<option>', {
                    value: data[i].address + ' '+ data[i].city,
                    text: data[i].address + ' '+ data[i].city
                }));
                //Fill stations div
                /*$('#Stations').append($('<div class="stationSelection" id="'+data[i].id+'"type="station">'+data[i].address +' <br></div>'));*/
                allStations.push({
                    location: data[i].address + ' '+ data[i].city,
                    stopover: true,
                    lat: data[i].lat,
                    lng: data[i].lng
                });
            }
        }
    //},"json");
};
//Get if the radio buttons change
$(document).ready(function() {
    $("#btnCreateStation").click(function(){
        $('#createStation').on('shown.bs.modal', function (e) {
            modalLoaded = true;
            google.maps.event.trigger($('#googleMap2')[0], 'resize');
            myMap();
        });
        $('#createStation').on('hidden.bs.modal', function (e) {
            modalLoaded = false;
            myMap();
        });

    });
    $("#btnCheck").click(function(){
        var address ='';
        address += $('#inputAddress1').val()+' ';
        address += $('#inputCity1').val()+' ';
        address += $('#inputPostal1').val()+' ';
        address += $('#state-select option:selected').text()+' ';
        address += $('#country option:selected').text();

        //$('#addressInfo').attr('address', address);
        console.info(address);

        $('#confirmAddress').on('shown.bs.modal', function (e) {
            //$('#address').val(address);
            google.maps.event.trigger($('#googleMapUser')[0], 'resize');
            myMap();
        });

    });
    $("#btnConfirm").click(function(){
        var validStation = true;
        if($("#inputName").val()!="")
        {
            $(this).css("borderColor","#cccccc");
        }else{
            $.growl("Please fill in your name!", { type: 'danger' });
            $(this).css("borderColor","#B94A48");
            validStation=false;
        }

        if($("#inputAddress1").val()!="")
        {
            $(this).css("borderColor","#cccccc");
        }else{
            $.growl("Please fill in your street!", { type: 'danger' });
            $(this).css("borderColor","#B94A48");
            validStation=false;
        }

        if($("#inputCity1").val()!="")
        {
            $(this).css("borderColor","#cccccc");
        }else{
            $.growl("Please fill in your city!", { type: 'danger' });
            $(this).css("borderColor","#B94A48");
            validStation=false;
        }

        jQuery("select#country").change(function(){
            console.info(this);
            var id = $("option:selected", this).val();
            var txt = $("option:selected", this).text();
            console.info(id);
            if(id != "-1") {
                //updateUser("country", txt);
                $(this).css("borderColor","#cccccc");
                jQuery.post("php/ajax/stateSelect.php", {id: id}, function (data) {
                    $("#showState").show();
                    jQuery("div#state-select").html(data);
                    jQuery("select#state").change(function () {
                        if (id != "") {
                            $('#state').css({"color": "#45615F"});
                        } else {
                            $('#state').css({"color": "#aaaaaa"})
                        }
                    });
                });
            }else{
                $.growl("Please select your country!", { type: 'danger' });
                $(this).css("borderColor","#B94A48");
                validStation=false;
            }
        });

        $("#state-select").change(function(){
            var id = $("option:selected", this).val();
            var value = $("option:selected", this).text();
            if(id!="-1") {
                //updateUser("state", value);
                $(this).css("borderColor","#cccccc");
            }else{
                $.growl("Please select your province!", { type: 'danger' });
                $(this).css("borderColor","#B94A48");
                validStation=false;
            }
        });
        //validation passed
        if(validStation) {
            var station =
                {
                    name: $("#inputName").val(),
                    region: $("#inputRegion").val(),
                    address: $("#inputAddress1").val(),
                    country: $("#country option:selected").text(),
                    state: $("#state-select option:selected").text(),
                    city: $("#inputCity1").val(),
                    zip: $("#inputPostal1").val(),
                    lat: 0, //google object, not an input
                    lng: 0, //google object, not an input
                    website: $("#inputWebsite").val()
                }
            createStation(station);
        }

    });
    $('#truckLevel').append(truckLevel);
    $('.divVisited').hide();

    $('input[type=radio][name=radCalc]').change(function() {
        clearLevelsStations();
        addStoredLvls();
    });
    var divTruck = document.getElementById('truck');

    //make levels 'clickable' and toggle
    $(document).on('click',".draggableLevel",function(){
        if($(this).parent().get(0).id=="levels")
        {
            //add to navigation
            $(this).appendTo("#right-panel");
            levelsSelected.push({location:$(this).attr('address'), stopover: true});
            var subWater = parseInt($(this).attr('water'));
            if(subWater>0){
                truckLevel-=subWater;
            }
            $('#truckLevel').text(truckLevel);
        }
        else if($(this).parent().get(0).id=="right-panel")
        {
            for (var i = 0; i < levelsSelected.length; i ++) {
                if (levelsSelected[i].location == $(this).attr('address')) {
                    levelsSelected.splice(i, 1);
                    var subWater = parseInt($(this).attr('water'));
                    if(subWater>0){
                        truckLevel+=subWater;
                    }
                    //truckLevel+=15000;
                    $('#truckLevel').text(truckLevel);
                    break;
                }
            }

            for(var i=0; i<markers.length; i++)
            {

                if(markers[i].title == $(this).attr('address')){
                    markers[i].setMap(null);
                }
            }
            $(this).appendTo("#levels");
        }
    });

    //make stations 'clickable'
    /*$(document).on('click',".stationSelection",function(){
        console.info($(this).parent().get(0).id);
        if($(this).parent().get(0).id=="Stations")
        {
            console.info(stationsSelected);
            stationsSelected.push({location:$(this).attr('id'), stopover: true});
            $(this).appendTo("#right-panel");
        }
        else if($(this).parent().get(0).id=="right-panel")
        {
            for (var i = 0; i < stationsSelected.length; i ++) {
                console.info(stationsSelected[i]);
                if (stationsSelected[i].location == $(this).attr('id')) {
                    stationsSelected.splice(i, 1);
                    break;
                }
            }
            $(this).appendTo("#Stations");
            console.info(stationsSelected);
        }
    });*/


    function IsEmail(email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    }
    function IsPhone(phone){
        var regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/i;
        return regex.test(phone);
    }

    /*I made this optionals, uncomment and change the updateUser function if you want to use them as required
    $("#inputRegion").blur(function(){
        var value = $(this).val();
        if(value!="") {
            updateUser("city", $(this).val());
            $(this).css("borderColor","#cccccc");
        }else{
            $.growl("Please fill in your city!", { type: 'danger' });
            $(this).css("borderColor","#B94A48");
        }
    });

    $("#inputPostal1").blur(function(){
        var value = $(this).val();
        if(value!="") {
            updateUser("zip", $(this).val());
            $(this).css("borderColor","#cccccc");
        }else{
            $.growl("Please fill in a proper postal code!", { type: 'danger' });
            $(this).css("borderColor","#B94A48");
        }
    });

    $("#inputWebsite").blur(function(){
        var value = $(this).val();
        if(value!="") {
            updateUser("zip", $(this).val());
            $(this).css("borderColor","#cccccc");
        }else{
            $.growl("Please fill in a proper postal code!", { type: 'danger' });
            $(this).css("borderColor","#B94A48");
        }
    });
    */




    $("#cancel").click(function(){
        $("#cancelDialog").modal('show');
    });
    $("#cancelSubs").click(function(){
        $("#cancelDialog").modal('hide');
        $.post("php/ajax/users.php", { method: "cancelSubscription", userId: userId }, function(data, textStatus) {
            if(data.error==true){
                $.growl(data.message, { type: 'danger' });
            }else{
                $.growl(data.message, {type: 'success'});
                setTimeout(function(){window.location.replace("https://www.ptlevel.com/secure/")},2000)
            }
        }, "json");
    });


    /*
     $( "#btnUpdateDelivery" ).click(function() {
     if (isDelivery === 1)
     updateUser('isDelivery', '0');
     else
     updateUser('isDelivery', '1');
     console.log( "Update fired successfully" );
     });

     $( "#btnUpdatePropertyManager" ).click(function() {
     if (isPropertyManager === 1)
     updateUser('isPropertyManager', '0');
     else
     updateUser('isPropertyManager', '1');
     console.log( "Update fired successfully" );
     });*/

function createStation(station){
    console.info('update user from delivery maps');
    console.info( station['name']);
    $.post("php/ajax/levels.php", { method: "createStation", name: station['name'], region: station['region'],  address: station['address'], country: station['country'], state: station['state'], city: station['city'], zip: station['zip'], lat: station['lat'], lng: station['lng'], website: station['website'] }, function(data, textStatus) {
        if(textStatus=='success')
        {
            $.growl("Your info was updated.", {type: 'success'});
        }
        else
        {
            $.growl("There was an issue updating your information!", { type: 'danger' });
        }
    }, "json");
}
});
/* uncomment this and any call to it
function clearSummary()
{
    document.getElementById('summary').innerHTML="";
}
*/

function clearLevelsStations()
{
    document.getElementById('levels').innerHTML="";
}



