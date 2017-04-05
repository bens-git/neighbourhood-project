function initMap() {





    Location = function(title, lat, lng, code, map, bounds) {
        this.title = title;
        this.lat = lat;
        this.lng = lng;
        this.code = code;
        this.map = map;
        var marker;
        var latLng = new google.maps.LatLng(lat, lng);

        marker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: title
        });


        this.highlight = ko.observable(true);
        this.highlight.subscribe(function(currentState) {
            if (currentState) {
                marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
            } else {
                marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
            }
        });
        this.highlight(false);


        //isVisible propery to show/hide markers
        this.isVisible = ko.observable(false);
        this.isVisible.subscribe(function(currentState) {
            if (currentState) {
                marker.setMap(map);
            } else {
                marker.setMap(null);
            }
        });
        this.isVisible(true);

        bounds.extend(latLng);

        map.fitBounds(bounds);


    }

    function viewModel() {

        var self = this;

        self.mapOptions = {
            center: {
                lat: 43.1,
                lng: -80.264425
            },
            zoom: 12,
        };
        self.map = new google.maps.Map(document.getElementById('map'), self.mapOptions);


        self.bounds = new google.maps.LatLngBounds();


        self.locations = ko.observableArray([
            new Location('Waterford Black Bridge', 42.93262, -80.30463, 'OU0A4F', self.map, self.bounds),
            new Location('Waterford Deer Park Web Cam', 42.93770, -80.29018, 'OU0958', self.map, self.bounds),
            new Location("Three's Company", 42.84870, -80.28760, 'OU097F', self.map, self.bounds),
            new Location('Historic tour of Simcoe Intercache', 42.83505, -80.30282, 'OU0942', self.map, self.bounds),
            new Location('Downtown Parking BIT Cache', 42.83568, -80.30418, 'OU0923', self.map, self.bounds),
            new Location("Simcoe's Carillon Tower", 42.84122, -80.30535, 'OU0A2A', self.map, self.bounds),
            new Location('HNAG WWFM XIV / Introduction to Geocaching 2017', 42.82895, -80.29923, 'OU0A6C', self.map, self.bounds),
        ])

        self.locationsFiltered = ko.computed(function() {
            return ko.utils.arrayFilter(self.locations(), function(location) {
                return location.isVisible() === true;
            });
        });

        //the circle that will be searched
        var Radius = function(radiusText, radiusValue) {
            this.radiusText = radiusText;
            this.radiusValue = radiusValue;
        };
        self.availableRadii = ko.observableArray([
            new Radius("Within 1km", 100),
            new Radius("Within 5km", 500),
            new Radius("Within 10km", 1000)
        ]);
        self.selectedRadius = ko.observable('5');

        //the address that will be searched
        self.searchAddress = ko.observable('');

        self.ajaxInfoHeader = ko.observable();

        self.cacheInfo = ko.observable();

        self.geocoder = new google.maps.Geocoder();

        self.searchRadius = function() {
            if (self.searchAddress() == '') {
                alert('Please enter an address!');
                return false;
            }
            console.log(self.selectedRadius());

            self.geocoder.geocode({
                address: self.searchAddress(),
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var latLng = results[0].geometry.location;
                    if (typeof(radius) != 'undefined') {
                        radius.setMap(null);
                    }
                    radius = new google.maps.Circle({
                        map: self.map,
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

                    self.locations().forEach(function(location) {
                        location.isVisible(false);
                    });

                    self.locations().forEach(function(location) {
                        var center = new google.maps.LatLng(location.lat, location.lng);
                        var distance = google.maps.geometry.spherical.computeDistanceBetween(center, latLng);
                        if (distance < self.selectedRadius()) {
                            location.isVisible(true);

                        }
                    });

                    self.map.panTo(latLng);
                    self.map.setZoom(14);





                } else {
                    window.alert('We could not find that location - try entering a more' +
                        ' specific place.');
                }
            });



        };


        this.resetMarkers = function() {
            //reset coordinates
            var latLng = new google.maps.LatLng(43.1, -80.264425);

            if (typeof(radius) != 'undefined') {
                radius.setMap(null);
            }
            self.locations().forEach(function(location) {
                location.isVisible(true);
            });

                                 self.map.fitBounds(self.bounds);
           self.map.setZoom(11);

        }


        self.showAjaxInfo = function(value) {
            $.ajax({
                url: 'http://www.opencaching.us/okapi/services/caches/geocache?cache_code=' + value.code + '&consumer_key=Ls73uWXY9TFdQ8CKqJsZ&fields=code|name|location|type|status|url|description',
                type: 'GET',
                success: function(data) {
                    self.cacheInfo(data);
                },
                error: function(req, status, error) {
                    self.cacheInfo('opencaching.us Not Responding.');
                },
            });

            self.locations().forEach(function(location) {
                if (location == value) {
                    location.highlight(true);
                } else {
                    location.highlight(false);
                }
            });


            self.ajaxInfoHeader(value.title);


        };

    };


    ko.applyBindings(new viewModel());
}
