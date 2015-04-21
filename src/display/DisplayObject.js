/**
 * Created by fdimonte on 20/04/2015.
 */

var DisplayObject = (function(ObjectModel,Point){

    /**
     * DisplayObject Class
     *
     * @param name
     * @constructor
     */
    function DisplayObject(name) {
        if(!name) throw new Error('no "name" provided for this displayObject:',this);
        if(name[0]==='_') throw new Error('DisplayObject names cannot begin with underscore');

        ObjectModel.call(this);

        this._info = {

            name     : name,
            zIndex   : 0,
            position : new Point(),
            parent   : null,
            shape    : null,

            stepCallback : null,// {function} callback to be called by this.step() method
            renderMethod : null,// {string} can be 'polygon', 'text', 'image'
            renderInfo   : null // {object} will be the first parameter of renderMethod call

        };

        // default drawing options
        this._options = {

            strokeColor: 0x0,
            fillColor: 0x0,
            strokeSize: 1,
            alpha: 1,
            font: '14px Arial'

        };
    }

    /**
     * DisplayObject prototype
     *
     * @type {ObjectModel}
     */
    DisplayObject.prototype = Object.create( ObjectModel.prototype );

    /******************************
     * PUBLIC METHODS
     ******************************/

    // ADD/REMOVE
    DisplayObject.prototype.addTo = function(parent,zindex) {

        //if(!(parent instanceof DisplayObjectContainer))
        //    throw new Error('displayObject added to unsupported object:',typeof(parent));

        this._info.zIndex = zindex || 0;
        this._info.parent = parent;

    };
    DisplayObject.prototype.remove = function() {
        delete this;
    };

    // OPTIONS
    DisplayObject.prototype.setOptions = function(opts) {
        if(!opts) return false;
        this.extend(this._options,opts);
        return true;
    };

    // RENDER
    DisplayObject.prototype.render = function(stage) {
        if(!this._info.renderMethod) throw new Error('no renderMethod set for this instance of DisplayObject: ',this);
        if(!this._info.renderInfo) return false;

        stage.draw.setup(this._options);
        this._info.shape = stage.draw[this._info.renderMethod](this._info.renderInfo,this._info.position);
        stage.draw.render();

        return true;
    };
    DisplayObject.prototype.setRenderInfo = function(info, opts) {
        opts && this.setOptions(opts);
        this._info.renderInfo = info;
    };

    // ANIMATION
    DisplayObject.prototype.step = function(time) {
        if(this._info.stepCallback){
            this._info.stepCallback(time);
        }
        return true;
    };
    DisplayObject.prototype.setAnimationStep = function(callback) {
        this._info.stepCallback = callback;
    };

    return DisplayObject;

}(ObjectModel,Point));
