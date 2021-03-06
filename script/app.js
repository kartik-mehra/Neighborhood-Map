//--------model------------
var City = [{
        name: 'Rose Garden',
        lat: 30.7461,
        lng: 76.7820,
        id: '4c0ba827009a0f47975cebbf',
        selected:false,
        show: true
    },
    {
        name: 'Elante Mall',
        lat: 30.7058,
        lng: 76.8010,
        id: '5114cd90e4b06bb0ed15a97f',
        selected:false,
        show: true
    },
    {
        name: 'Sector 17',
        lat: 30.7398,
        lng: 76.7827,
        id: '4c0a1876bbc676b0154e49d5',
        selected:false,
        show: true
    },
    {
        name: 'Tagore Theatre',
        lat: 30.7331,
        lng: 76.7896,
        id: '4cbe727ac44f9c748f4cbbdf',
        selected:false,
        show: true
    },
	{
        name: 'Pal Dhaba',
        lat: 30.7191,
        lng: 76.8016,
        id: '4f452610e4b061ee9870084d',
        selected:false,
        show: true
    }


];
//------------model end ---------
var locations = []; //arrary of markers
//viewmodel
var viewmodel = function() {
    var defaultMarker = makeMarkerIcon('0091ff'); //default color of marker is stored in default icon
    var highlightedMarker = makeMarkerIcon('FFFF24'); //color when we highlight it
    var Infowindow = new google.maps.InfoWindow(); //info window of marker.

    function makeMarkerIcon(markerColor) { //passing marker color and building marker icon in this function
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2', //type of marker we choose.
            new google.maps.Size(21, 34), //size of marker height and widh
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34), //accuracy where they are pointing .
            new google.maps.Size(21, 34));
        return markerImage;
    }

    for (i = 0; i < City.length; i++) {
        var marker = new google.maps.Marker({ //in marker we are settings marker's details in marker variable
            //by iterating it into a loop through all places that we decided in model

            position: {
                lat: City[i].lat, //inserting latitude and longitude
                lng: City[i].lng
            },
            icon: defaultMarker, //setting icon to default marker
            map: map, //set markers on map
            title: City[i].name, //title of markers
            rating: '', //ratings of places that we added
            venue: City[i].id, //foursquare id
            selected:City[i].selected,//marker is selected or not
            image: '', //setting image when click on marker
            show: ko.observable(true)
        });
        locations.push(marker); //adding marker in location array


        marker.addListener('mouseover', function() { //when we take mouse on marker we change color of it to
            this.setIcon(highlightedMarker) // calling setIcon() color of highlighted icon
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultMarker); //when we take are mouse away from marker calling function setIcon color changes back to default
        });
        //bounce marker when click on it
        var makeBounce =null;
        var clickListener = function() {
        if(makeBounce!=null)
         makeBounce.setAnimation(null);
        if(makeBounce != this) {
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){makeBounce.setAnimation(null);},500)
        makeBounce = this;
        }
       else
        makeBounce = null;
        }
     google.maps.event.addListener(marker, 'click', clickListener);
        marker.addListener('click', function() {
            openInfoWindow(this, Infowindow); //on clicking marker calling function openInfoWindow()
        });
    }

    // get rating for each marker
    locations.forEach(function(m) {
        //passing m for marker
        $.ajax({ //ajax request for foursquare api
            method: 'GET',
            dataType: "json",
            url: "https://api.foursquare.com/v2/venues/" + m.venue + "?client_id=2JYEJY5E54SCTS2TJRILIIVLFPXCLQFXF0MPWI2YS2UQCJY3&client_secret=TH4C4MYFH44B2V02JS3YZEXYTKND5IEI4CTX0U51UT4JTKZ4&v=20170303",
            success: function(data) { //if data is successfully fetch than function will execute
                var venue = data.response.venue;
                var imgurl = data.response.venue.photos.groups[0].items[0];
                if ((venue.hasOwnProperty('rating')) || ((imgurl.hasOwnProperty('prefix')) && (imgurl.hasOwnProperty('suffix')))) {
                    m.rating = venue.rating;
                    m.image = imgurl.prefix + "100x100" + imgurl.suffix;
                } else {
                    m.rating = '';
                    m.imgurl = '';
                }
            },
            error: function(e) { //if any error occur in fetching data
                alert('There is some error in fetching data');
            }

        });
    });



    function openInfoWindow(marker, infowindow) //opening info window on click of marker
    {
        if (infowindow.marker != marker) {

            infowindow.marker = marker;

            infowindow.setContent('<div>' + '<h3>' + marker.title + '</h3>' + "<h4>Ratings:" + marker.rating + '</h4> </div><div><img src="' + marker.image + '"></div>'); //set content that should be appear in info window

            if(marker.rating!=null || marker.image!=null)
            {
            infowindow.open(map, marker);
            }
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    };
//the marker which is selected open its pop up window
    this.selectAll = function(marker) {

      openInfoWindow(marker, Infowindow);
        marker.selected = true;
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){marker.setAnimation(null);},500)
      };


//function for search bar
    this.inputText = ko.observable('');
    this.filtersearch = function() {
        Infowindow.close();//close all the info window that are previously opened window
        var inputSearch = this.inputText();
        if (inputSearch.length === 0) {
            this.showAll(true);
        } else {
            for (i = 0; i < locations.length; i++) {
                if (locations[i].title.toLowerCase().indexOf(inputSearch.toLowerCase()) > -1) {
                    locations[i].show(true);
                    locations[i].setVisible(true);
                } else {
                    locations[i].show(false);
                    locations[i].setVisible(false);
                }
            }
        }
        Infowindow.close();
    };
    this.showAll = function(variable) {
        for (i = 0; i < locations.length; i++) {
            locations[i].show(variable);
            locations[i].setVisible(variable);
        }
    };

};
