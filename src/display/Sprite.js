/**
 * Created by fdimonte on 20/04/2015.
 */

var Sprite = (function(DisplayObjectContainer){

    /**
     * Sprite Class
     *
     * @param name
     * @constructor
     */
    function Sprite(name) {
        DisplayObjectContainer.call(this,name);
    }

    /**
     * Sprite prototype
     *
     * @type {DisplayObjectContainer}
     */
    Sprite.prototype = Object.create( DisplayObjectContainer.prototype );

    return Sprite;

}(DisplayObjectContainer));
