/**
 * Created with JetBrains WebStorm.
 * User: caio.franchi
 * Date: 19/09/12
 * Time: 16:47
 */

/*
 //scroll smooth
 $(".scroll-anchor").click(function(event){
 event.preventDefault();
 currentAnchor = $(this).attr('href');
 var offset = $(currentAnchor).offset().top-ANCHOR_ALIGN_FIX;
 activateMenu(currentAnchor);
 $('html, body').animate({scrollTop:offset}, 500,function(){
 location.hash = currentAnchor;
 $('html, body').animate({scrollTop:offset}, 0); //fix alignment

 });
 });

 //scroll smooth for outsiders
 var hash = window.location.hash;
 if(hash!="") {
 activateMenu(hash);
 $('html, body').animate({scrollTop:$(hash).offset().top-ANCHOR_ALIGN_FIX}, 500);
 }

 //detect hash changes to activate menu (PREVENTION)
 if ("onhashchange" in window) {
 $(window).bind( 'hashchange', function(e) {
 e.preventDefault();
 activateMenu();
 });
 }

 //switch button and anchor while user are scrolling
 $(window).scroll(function () {
 scrollRefresh();

 */