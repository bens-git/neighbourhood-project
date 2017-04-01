ko.bindingHandlers.marker = {

    infowindow: null,

    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var map = bindingContext.$parent.mapControl;
        var bounds = bindingContext.$parent.boundsControl;
        var location = valueAccessor().location;
        var latLng = new google.maps.LatLng(location.lat, location.lng);

        // Style the markers a bit. This will be our listing marker icon.
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + location.markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));

        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: markerImage,
            title: location.title
        });

        // Auto Center

        bounds.extend(latLng);

        map.fitBounds(bounds);





        marker.addListener('click', function() {
            ko.bindingHandlers.marker.openInfoWindow(map, marker);
        });
    },





    openInfoWindow: function(map, marker) {
        var contentString = '<div">' + marker.getTitle() + '</div>';
        if (this.infowindow) {
            this.infowindow.close();
        };
        this.infowindow = new google.maps.InfoWindow({
            content: contentString,
        });
        map.setCenter(marker.getPosition());
        this.infowindow.open(map, marker);

    }
};



function viewModel() {
    var self = this;


    self.initialLocations = ko.observableArray([{
        title: 'Waterford Black Bridge',
        code: 'OU0A4F',
        lat: 42.93262,
        lng: -80.30463,
        markerColor: '0091ff'

    }, {
        title: 'Waterford Deer Park Web Cam',
        code: 'OU0958',
        lat: 42.93770,
        lng: -80.29018,
        markerColor: '0091ff'

    }, {
        title: "Three's Company",
        code: 'OU097F',
        lat: 42.84870,
        lng: -80.28760,
        markerColor: '0091ff'

    }, {
        title: 'Historic tour of Simcoe Intercache',
        code: 'OU0942',
        lat: 42.83505,
        lng: -80.30282,
        markerColor: '0091ff'

    }, {
        title: 'Downtown Parking BIT Cache',
        code: 'OU0923',
        lat: 42.83568,
        lng: -80.30418,
        markerColor: '0091ff'

    }, {
        title: "Simcoe's Carillon Tower",
        code: 'OU0A2A',
        lat: 42.84122,
        lng: -80.30535,
        markerColor: '0091ff'

    }, {
        title: 'HNAG WWFM XIV / Introduction to Geocaching 2017',
        code: 'OU0A6C',
        lat: 42.82895,
        lng: -80.29923,
        markerColor: '0091ff'

    }]);

    //1.create map
    var mapOptions = {
        center: {
            lat: 43.1,
            lng: -80.264425
        },
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    this.bounds = new google.maps.LatLngBounds();

    document.getElementById("filter").addEventListener("click", function() {

        self.searchRadius();
    });


    document.getElementById("reset").addEventListener("click", function() {

        self.resetMarkers();
    });

    var geocoder = new google.maps.Geocoder();

    var Radius = function(radiusText, radiusValue) {
        this.radiusText = radiusText;
        this.radiusValue = radiusValue;
    };


    this.availableRadii = ko.observableArray([
        new Radius("Within 1km", 100),
        new Radius("Within 5km", 500),
        new Radius("Within 10km", 1000)
    ]);
    this.selectedRadius = ko.observable('5');
    this.searchAddress = ko.observable('');

    this.resetMarkers = function() {
        if (typeof(radius) != 'undefined') {
            radius.setMap(null);
        }
        self.locations.removeAll();

        self.initialLocations().forEach(function(location) {
            location.markerColor = '0091ff';
            self.locations.push(location);
        });
    }

    this.searchRadius = function() {

        console.log(self.selectedRadius());

        geocoder.geocode({
            address: self.searchAddress(),
            componentRestrictions: { locality: 'Ontario' }
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var latLng = results[0].geometry.location;
                if (typeof(radius) != 'undefined') {
                    radius.setMap(null);
                }
                radius = new google.maps.Circle({
                    map: map,
                    radius: self.selectedRadius(),
                    center: latLng,
                    fillColor: '#777',
                    fillOpacity: 0.1,
                    strokeColor: '#AA0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    draggable: false,
                    editable: false
                });

                // Center of map
                // 
                map.panTo(latLng);
                map.setZoom(15);
                self.locations.removeAll();

                self.initialLocations().forEach(function(location) {
                    var center = new google.maps.LatLng(location.lat, location.lng);
                    var distance = google.maps.geometry.spherical.computeDistanceBetween(center, latLng);
                    if (distance < self.selectedRadius()) {
                        location.markerColor = 'f44242';
                        self.locations.push(location);

                    }
                });





            } else {
                window.alert('We could not find that location - try entering a more' +
                    ' specific place.');
            }
        });



    };
    this.locations = ko.observableArray();

    self.locations(self.initialLocations.slice(0));

    this.mapControl = map;
    this.boundsControl = this.bounds;

    self.displaySubmitModal = ko.observable(false);
    self.showModal = function() {
        self.displaySubmitModal(true);
    };
    self.closeSubmitModal = function() {
        self.displaySubmitModal(false);
        self.newTaskText("");
    };

    this.ajaxInfoHeader = ko.observable();

this.cacheInfo = ko.observable();

self.showAjaxInfo= function(value) {

        $.ajax({
            url: 'http://www.opencaching.us/okapi/services/caches/geocache?cache_code='+value.code+'&consumer_key=Ls73uWXY9TFdQ8CKqJsZ&fields=code|name|location|type|status|url|description', 
            type: 'GET',
            success: function(data) {                        
                self.cacheInfo(data);
            },
            error: function(req, status, error) {
                    self.cacheInfo('opencaching.us Not Responding.');
            },
        });

    self.ajaxInfoHeader(value.title);
};
};



function initMap() {



    viewModel = new viewModel();

    ko.applyBindings(viewModel);
}
