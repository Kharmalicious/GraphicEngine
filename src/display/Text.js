/**
 * Created by fdimonte on 20/04/2015.
 */

var Text = (function(DisplayObject){

    /**
     * Text Class
     *
     * @param name
     * @constructor
     */
    function Text(name) {
        DisplayObject.call(this,name);

        this._options.font = this.getFont('Verdana',14);
        this._options.fillColor = 0x0;
        this._options.strokeColor = null;

        this._info.renderMethod = 'text';
    }

    /**
     * Text prototype
     *
     * @type {DisplayObject}
     */
    Text.prototype = Object.create( DisplayObject.prototype );

    Text.prototype.getFont = function(font,size,style) {
        if(!font) return '';
        style || (style = '');
        size || (size = '');
        typeof(size)=='number' && (size = size+'px');
        return [style,size,font].join(' ');
    };

    Text.prototype.setFont = function(font,size,style) {
        if(!font) return false;
        this.options.font = this.getFont(font,size,style);
        return true;
    };

    return Text;

}(DisplayObject));
