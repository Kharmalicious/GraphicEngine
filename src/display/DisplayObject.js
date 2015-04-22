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

        ObjectModel.call(this);

        this._name = name;
        this._parent = null;
        this._zIndex = 0;
        this._position = new Point();
        this._shape = null;

        this._info = {
            stepCallback : null,// {function} callback to be called by this._step() method
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

        if(this[name]) throw new Error('property "%s" already exists on',name,this);
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
    DisplayObject.prototype._addTo = function(parent,zindex) {

        this._zIndex = zindex || 0;
        this._parent = parent;

    };
    DisplayObject.prototype._remove = function() {
        delete this;
    };

    // OPTIONS
    DisplayObject.prototype.setOptions = function(opts) {
        if(!opts) return false;
        this.extend(this._options,opts);
        return true;
    };

    // RENDER
    DisplayObject.prototype._render = function(stage) {
        if(!this._info.renderMethod) throw new Error('no renderMethod set for this instance of DisplayObject: ',this);
        if(!this._info.renderInfo) return false;

        stage.draw.setup(this._options);
        this._shape = stage.draw[this._info.renderMethod](this._info.renderInfo,this._position);
        stage.draw.render();

        return true;
    };
    DisplayObject.prototype.setRenderInfo = function(info, opts) {
        opts && this.setOptions(opts);
        this._info.renderInfo = info;
    };

    // ANIMATION
    DisplayObject.prototype._step = function(time) {
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
