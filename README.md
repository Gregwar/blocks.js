# blocks.js

## JavaScript dataflow graph editor

*blocks.js* is a JavaScript visual editor for editing dataflow graph, it can 
be used to edit processes graphs.

Note that this is just a flexible front-end editor, there is no back-end here.

You can [try a live demo](http://gregwar.com/blocks.js/).

## Using blocks.js

### Downloading

If you want to use it, you'll have to fetch the code, either by cloning this 
repository, or by 
[downloading it](https://github.com/Gregwar/blocks.js/archive/master.zip).

### Requirements

blocks.js uses:

* [jQuery](http://jquery.com/)
* [jquery-json](http://code.google.com/p/jquery-json/) for JSON export
* [jquery-mousewheel](http://plugins.jquery.com/mousewheel/) for scrolling zoom
* [jquery-svg](http://keith-wood.name/svg.html) for edges rendering
* [jquery-formserialize](http://malsup.com/jquery/form/) for forms serialization
  and deserialization
* [jquery-fancybox](http://fancyapps.com/fancybox/) for modal parameters edition

All these requirements are included in this repository. This is why the third party
libraries will look like this:

```html
<!-- Third party libraries -->
<script type="text/javascript" src="build/jquery.js"></script>
<script type="text/javascript" src="build/jquery.json.min.js"></script>
<script type="text/javascript" src="build/jquery.mousewheel.min.js"></script>
<script type="text/javascript" src="build/jquery.svg.min.js"></script>
<script type="text/javascript" src="build/jquery.formserialize.min.js"></script>
<script type="text/javascript" src="build/jquery.fancybox.min.js"></script> 
<link rel="stylesheet" type="text/css" href="build/fancybox/jquery.fancybox.css" />
```

Then, you'll have to load `blocks.js` and `blocks.css`:

```html
<!-- blocks.js -->
<script type="text/javascript" src="build/blocks.js"></script> 
<link rel="stylesheet" type="text/css" href="build/blocks.css" />
```

