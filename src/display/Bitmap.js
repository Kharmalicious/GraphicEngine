/**
 * Created by fdimonte on 20/04/2015.
 */

var Bitmap = (function(DisplayObject){

    /**
     * Bitmap Class
     *
     * @param name
     * @constructor
     */
    function Bitmap(name) {
        DisplayObject.call(this,name);

        this._info.renderMethod = 'image';
    }

    /**
     * Bitmap prototype
     *
     * @type {DisplayObject}
     */
    Bitmap.prototype = Object.create(DisplayObject.prototype);

    /* *******************************
     * OVERRIDE SUPER CLASS METHODS
     * *******************************/

    Bitmap.prototype.render = function(stage) {

    };

    /* *******************************
     * IMPLEMENT CUSTOM METHODS
     * *******************************/

    return Bitmap;

}(DisplayObject));
