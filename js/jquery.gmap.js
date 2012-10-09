/*
 * jQuery plugin for google map with markers.
 *
 * Copyright 2012, Yang Yang
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends on:
 * <script type="text/javascript" src="//maps.googleapis.com/maps/api/js?sensor=false"></script>
 * <script type="text/javascript" src="//www.google.com/jsapi"></script>
 * <script type="text/javascript" src="//google-maps-utility-library-v3.googlecode.com/svn/tags/infobox/1.1.9/src/infobox.js"></script>
 */
(function($) {
  var methods = {
    init: function(options) {
      var current_location = get_current_location();
      var defaults = {
        lat: current_location.lat,
        lng: current_location.lng,
        markInitLocation: false,
        onMarker: function(index){return false;},
        maxZoom: 15,
      };

      var mapDefaults = {
        zoom: 15,
        center: new google.maps.LatLng(current_location.lat, current_location.lng),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false
      };

      var options = $.extend(defaults, options);

      var mapOptions = $.extend(mapDefaults, options['mapOptions']);

      var map = new google.maps.Map(this.get(0), mapOptions);

      this.data('map', extendGoogleMap(map, options));

      if (options['markInitLocation']) {
        var marker = createMarker(new google.maps.LatLng(options['lat'], options['lng']));
        marker.setMap(map);
        map.panTo(marker.position);
      }

      return this;
    },

    addMarker: function(lat, lng, title) {
      var marker = createMarker(new google.maps.LatLng(lat, lng));
      marker.setTitle(title);
      this.data('map').addMarker(marker);
      return this;
    },

    deleteOverlays: function() {
      this.data('map').clear();
      return this;
    },

    dropAllMarkers: function() {
      this.data('map').dropAllMarkers();
      return this;
    },

    placeMarker: function(index) {
      var marker = this.data('map').markers[index];
      if (marker) {
        google.maps.event.trigger(marker, 'click');
      }
      return this;
    },

    enableDropMarker: function(infoWindow) {
      var map = this.data('map');
      var _this = this;
      map.set('draggableCursor', 'pointer');
      google.maps.event.addListenerOnce(map, 'click', function(event) {
        map.set('draggableCursor', 'default');

        var marker = createMarker(event.latLng);
        marker.setDraggable(true);
        marker.setIcon('images/star.png');

        map.addMarker(marker);
        marker.setMap(map);
        google.maps.event.trigger(marker, 'click');

        google.maps.event.addListener(marker, 'dragend', function(event) {
          google.maps.event.trigger(this, 'click');
        });

        if (infoWindow) {
          infoWindow.open(map, marker);
        }
      });
      return this;
    }
  };

  $.fn.gmap = function(method) {
    if (methods[method]) {
      if (!this.data('map')) {
        methods.init.apply(this);
      }
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Unsupported method '+method+' for jQuery.gmap');
    }
  };

  //private methods
  function extendGoogleMap(map, options) {
    return $.extend(map, {
      markers: [],

      currentMarker: null,

      addMarker: function(marker) {
        var _this = this;
        marker = $.extend(marker, {
          index: _this.markers.length,
          infoBox: createInfoBox(marker.getTitle())
        });

        google.maps.event.addListener(marker, 'title_changed', function() {
          this.infoBox.close();
          this.infoBox = createInfoBox(this.getTitle());
        });
        google.maps.event.addListener(marker, 'click', options['onMarker']);
        google.maps.event.addListener(marker, 'click', function() {
          bounceOnce(this);
          if (_this.currentMarker) {
            _this.currentMarker.infoBox.close();
          }
          if (this.getTitle()) {
            this.infoBox.open(map, this);
          }
          map.panTo(this.position);
          _this.currentMarker = marker;
        })
        this.markers.push(marker);
      },

      clear: function() {
        this.markers.map(function(v){
          if (v.infoBox) {
            v.infoBox.close();
          }
          v.setMap(null);
        });
        this.markers.length = 0;
      },

      dropAllMarkers: function() {
        var maxZoom, latLngBounds;

        if (this.markers.length === 0) {
          return;
        }

        maxZoom = options['maxZoom'];
        latLngBounds = new google.maps.LatLngBounds();

        //set the max zoom level for bounds_changed when use fitBounds method.
        google.maps.event.addListenerOnce(this, 'bounds_changed', function() {
          if(this.getZoom() > maxZoom) {
            this.setZoom(maxZoom);
          }
        });

        for (var i=0,l=this.markers.length; i < l; i++) {
          this.markers[i].setMap(this);
          latLngBounds.extend(this.markers[i].position);
        }
        this.fitBounds(latLngBounds);
      }
    });
  }

  function createMarker(latLng) {
    var marker = new google.maps.Marker({
      position: latLng,
      animation: google.maps.Animation.DROP,
    });
    return marker;
  }

  function bounceOnce(marker) {
    if (marker.getAnimation() != null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){ marker.setAnimation(null); }, 750);
    }
  }

  function createInfoBox(info) {
    var boxText = '<div class="mapTooltip">'+info+'</div>';
    var myOptions = {
      content: boxText
     ,disableAutoPan: false
     ,maxWidth: 0
     ,pixelOffset: new google.maps.Size(-140, 0)
     ,zIndex: null
     ,boxStyle: {
        background: "url('/assets/tipbox.gif') no-repeat",
        opacity: 0.9,
        width: "200px"
     }
     ,closeBoxMargin: "10px 2px 2px 2px"
     ,infoBoxClearance: new google.maps.Size(1, 1)
     ,isHidden: false
     ,pane: "floatPane"
     ,enableEventPropagation: false
    };
    return new InfoBox(myOptions);
  }

  function get_current_location() {
    var current_location = {lat: 0, lng: 0};
    if ((typeof google === 'object') && google.loader && google.loader.ClientLocation) {
      current_location.lat = google.loader.ClientLocation.latitude;
      current_location.lng = google.loader.ClientLocation.longitude;
    }
    return current_location;
  }
})(jQuery);
