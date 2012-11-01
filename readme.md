# FSLoader

 A complete and lightweight(~14kb) lib for single loading, queue loading and preloading assets.

## Quick start

### SETTING UP A SIMPLE FS LOADER

```html
var MainLoader = new FSLoader();
MainLoader.load("//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js",{oncomplete:onCompleteJquery});

function onCompleteJquery(){
    console.log(this.data);
}
```

### LOADING TYPES

```html
//FSLoaderHelpers.LOAD_AS_TAGS // DEFAULT
//FSLoaderHelpers.LOAD_AS_ARRAY_BUFFER
//FSLoaderHelpers.LOAD_AS_BLOB
//FSLoaderHelpers.LOAD_AS_XHR

var MainLoader = new FSLoader();
MainLoader.load("img/logo.png",{oncomplete:onCompleteImage, retries:3, loadingType: FSLoaderHelpers.LOAD_AS_BLOB});

function onCompleteImage(){
    console.log(this.data);
}
```

### RETRIES

```html
var MainLoader = new FSLoader();
MainLoader.load("img/logo.png",{oncomplete:onCompleteImage, onerror:onErrorLoadingImage, retries:3});

function onCompleteImage() {
    console.log(this.data);
}

function onErrorLoadingImage() {
    console.log("ERRO LOADING"+this);
}
```

### SETTING UP A QUEUE

```html
var queue  = new FSLoaderQueue({onqueuecomplete:onCompleteQueue, onqueueprogress:onProgressQueue);
queue.add("img/logo.png");
queue.add("//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js", {id:"jquery-external", oncomplete:onCompletejQuery});
queue.add("js/libs/jquery-1.8.0.min.js");
queue.add("logo.php", {type:FSLoaderHelpers.TYPE_CSS});
queue.start();

function onProgressQueue () {
    console.log("Progress: "+this.progress);
}

function onCompleteQueue () {
    console.log("Queue Complete");
}

```


### QUEUE EVENTS

### PRELOADER

```html
<!-- SET THE ITEMS THAT YOU WANT TO PRELOAD WITH THE DATA TAG 'data-preload="true"' -->
<img src="img/logo.png" data-preload="true" />
```

```html
preload = new FSPreloader({onqueuecomplete: onCompleteQueue, onqueueprogress: onQueueProgress, ignoreErrors: true});
preload.parseDocument({cssDependencies: true}); //cssDepencies:true parse the loaded CSS and load the background-images used

preload.add("img/logo.png"); //add another item
preload.start(); //start preloading

function onQueueProgress () {
    console.log(this.progress); //the total progress percentage of the loaded queue
}

function onCompleteQueue () {
    console.log("PRELOAD COMPLETE");
}

```


## Features

* Load both binary (Sound files, images) and text files (JSON, XML, TEXT, CSS, JAVASCRIPT, SVG, XML)
* XHR2 ready
* Lightweight
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
