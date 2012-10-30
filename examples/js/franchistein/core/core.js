/**
 * Created with JetBrains WebStorm.
 * User: caio.franchi
 * Date: 19/09/12
 * Time: 15:50
 */

(function (global) {

    // Setup the interface
    var FS = {
        //encapsulated vars
        version: '0.0.1',

        //encapsulated methods
        callMe: teste
    };

    if (global.FS) {
        throw new Error('FS is already defined');
    } else {
        global.FS = FS;
    }

    //CORE METHODS
    function teste(pOrigin) {
        console.log(this);
    }

})(typeof window === 'undefined' ? this : window);

