jquery-gmap
===========

Just a jQuery plugin for Google Maps JavaScript API V3


## Using jQuery gmap is as easy as 1, 2, 3…

Just follow these simple steps to add an google map to your app:

1. Include jQuery on your page.

    ```html
    <script src="http://code.jquery.com/jquery.min.js"></script>
    ```

2. Include google map javascript api V3 and infobox.js to support the infobox.

    ```html
    <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
    <script type="text/javascript" src="http://www.google.com/jsapi"></script>
    <script type="text/javascript" src="http://google-maps-utility-library-v3.googlecode.com/svn/tags/infobox/1.1.9/src/infobox.js"></script>
    <script src="jquery.gmap.js"></script>
    ```
3. Include this plugin before fisrt use.

    ```html
    <script src="jquery.gmap.js"></script>
    ```

4. Just initilize the gmap with an container.

    ```html
    <script>
      $(function() {
        $('#map').gmap();
      });
    </script>
    ```

