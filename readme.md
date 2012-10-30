# FSLoader

 A complete and lightweight(~14kb) lib for single loading, queue loading and preloading assets.

## Quick start

### SETTING UP A SIMPLE FS LOADER

### SINGLE EVENTS

### SETTING UP A QUEUE

```html
var queue  = new FSLoaderQueue({onqueuecomplete:onCompleteQueue);
queue.add("img/logo.png");
queue.add("//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js", {id:"jquery-external",oncomplete:onCompletejQuery});
queue.add("js/libs/jquery-1.8.0.min.js");
queue.add("logo.php", {type:FSLoaderHelpers.TYPE_CSS});
queue.start();
```


### QUEUE EVENTS

### PRELOADER

### PRELOADER EVENTS

## Features

* Load both binary (Sound files, images) and text files (JSON, XML, TEXT, CSS, JAVASCRIPT, SVG, XML)
* XHR2 ready
* Lightweight (2KB) =)
* Preloading
* Lazy Loading
* Queue Loading

## Contributing

Not yet, but soon =)


## Project information

* +(

## License

### Major components:

* Boiler Plate
* Normalize.css: Public Domain

### Everything else:

The Unlicense (aka: public domain)
