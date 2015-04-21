/**
 * Created by fdimonte on 20/04/2015.
 */

var Shape = (function(DisplayObject){

    /**
     * Shape Class
     *
     * @param name
     * @constructor
     */
    function Shape(name) {
        DisplayObject.call(this,name);

        this._options.fillColor = null;
        this._options.strokeColor = 0x0;

        this._info.renderMethod = 'polygon';
    }

    /**
     * Shape prototype
     *
     * @type {DisplayObject}
     */
    Shape.prototype = Object.create( DisplayObject.prototype );

    return Shape;

}(DisplayObject));
