
var GraphicEngine = (function(){
var geVersion = "v0.1.0";
/**
 * Created by fdimonte on 20/04/2015.
 */

var ObjectModel = (function(){

    /**
     * ObjectModel Class
     *
     * @constructor
     */
    function ObjectModel() {
        this._attributes = {};
    }

    /**
     * ObjectModel prototype
     *
     * @type {{set: Function, get: Function}}
     */
    ObjectModel.prototype = {
        set: function(key,val) {
            this._attributes[key] = val; return this;
        },
        get: function(key) {
            return this._attributes[key];
        },

        _extend: function(obj,ext) {
            if(!ext) return;
            for(var p in ext){
                if(ext.hasOwnProperty(p)){
                    if(obj[p] && (obj[p] instanceof Object) && !(obj[p] instanceof Array)) this._extend(obj[p],ext[p]);
                    else obj[p] = ext[p];
                }
            }
        }
    };

    return ObjectModel;

}());

/**
 * Created by fdimonte on 20/04/2015.
 */

var Point = (function(){

    function Point(x,y,z) {
        this.x = parseFloat(x)||0;
        this.y = parseFloat(y)||0;
        this.z = parseFloat(z)||0;
    }

    Point.prototype = {
        toOrtho  : function() { return new Point([(this.x - this.y), ((this.x + this.y)/2)-(this.z*1.25)], 0); },
        toIso    : function() { return new Point([this.y + (this.x/2), this.y - (this.x/2)], 0); },

        toString : function() { return "{x:"+this.x+", y:"+this.y+", z:"+this.z+"}"; },
        toObject : function() { return {x:this.x,y:this.y,z:this.z}; },
        toArray  : function() { return [this.x,this.y,this.z]; },

        add      : function(ip) { return new Point( this.x+ip.x, this.y+ip.y, this.z+ip.z); },
        subtract : function(ip) { return new Point( this.x-ip.x, this.y-ip.y, this.z-ip.z); },
        multiply : function(ip) { return new Point( this.x*ip.x, this.y*ip.y, this.z*ip.z); },

        distance:function(p2) {
            var dx = Math.abs(this.x-p2.x);
            var dy = Math.abs(this.y-p2.y);
            var dz = Math.abs(this.z-p2.z);
            var dist = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
            return Math.sqrt(Math.pow(dist,2) + Math.pow(dz,2));
        }

    };

    return Point;

}());

/**
 * Created by fdimonte on 20/04/2015.
 */

var Animator = (function(){

    /**
     * Animator Class
     *
     * @constructor
     */
    function Animator(callback) {

        this._stepCallback = null;
        this._animation = null;
        this._startTime = 0;

        callback && this.setCallback(callback);

        // polyfill for requestAnimationFrame
        window.requestAnimFrame = (function(){
            return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
                function(callback,element){
                    return window.setTimeout(callback, 1000 / 60);
                };
        })();

        // polyfill for cancelRequestAnimationFrame
        window.cancelRequestAnimFrame = (function() {
            return  window.cancelAnimationFrame              ||
                window.cancelRequestAnimationFrame       ||
                window.webkitCancelRequestAnimationFrame ||
                window.mozCancelRequestAnimationFrame    ||
                window.oCancelRequestAnimationFrame      ||
                window.msCancelRequestAnimationFrame     ||
                clearTimeout
        })();
    }

    /**
     * Animator prototype
     *
     * @type {{setCallback: setCallback, start: start, stop: stop, _animate: _animate, _stepRender: _stepRender}}
     */
    Animator.prototype = {

        // public methods

        setCallback: function(callback){
            this._stepCallback = callback;
        },

        start: function(timeout){
            this._startTime = (new Date()).getTime();
            this._animate();
            timeout && setTimeout(function(){this.stop();}.bind(this),timeout);
        },

        stop: function(){
            cancelRequestAnimFrame(this._animation);
            this._animation = null;
        },

        // private methods

        _animate: function(){
            this._stepRender();
            this._animation = requestAnimFrame(this._animate.bind(this));
        },

        _stepRender: function(){
            var time = (new Date()).getTime() - this._startTime;
            this._stepCallback && this._stepCallback(time);
        }

    };

    return Animator;

}());

/**
 * Created by fdimonte on 20/04/2015.
 */

var Draw = (function(){

    /**
     * Draw Class
     *
     * @param context
     * @constructor
     */
    function Draw(context) {
        this.context  = context;

        this.message  = null;
        this.messageOrigin = {x:0,y:0};

        this.isPath   = false;
        this.isStroke = false;
    }

    /**
     * Draw prototype
     *
     * @type {{isPath: boolean, isStroke: boolean, setup: setup, render: render, moveTo: moveTo, lineTo: lineTo, line: line, polygon: polygon}}
     */
    Draw.prototype = {

        setup: function(opt) {
            opt || (opt={});

            var fillColor   = opt.fillColor==null   ? null : this.castToColor(opt.fillColor);
            var strokeColor = opt.strokeColor==null ? null : this.castToColor(opt.strokeColor);
            var strokeSize  = opt.strokeSize;

            this.context.restore();
            this.context.fillStyle   = fillColor;
            this.context.strokeStyle = strokeColor;
            this.context.lineWidth   = strokeSize;
            this.context.globalAlpha = opt.alpha || 1;
            this.context.font        = opt.font  || '20px Open Sans';
            this.context.save();

            this.isStroke = strokeColor!=null;
            this.isPath = fillColor!=null;
            this.isPath && this.context.beginPath();
        },
        render: function() {
            if(this.message) {
                this.isPath && this.context.fillText(this.message,this.messageOrigin.x,this.messageOrigin.y);
                this.isStroke && this.context.strokeText(this.message,this.messageOrigin.x,this.messageOrigin.y);
                this.message = null;
            }

            this.isPath && this.context.closePath();
            this.isPath && this.context.fill();
            this.isPath = false;

            this.isStroke && this.context.stroke();
            this.isStroke = false;
        },

        moveTo: function(x,y) {
            var canDraw = (this.isPath || this.isStroke);
            canDraw && this.context.moveTo(x,y);
            return canDraw;
        },
        lineTo: function(x,y) {
            var canDraw = (this.isPath || this.isStroke);
            canDraw && this.context.lineTo(x,y);
            return canDraw;
        },

        text: function(string,origin) {
            if(!string) return [];
            if(!origin) origin = [0,0];
            origin = this.castToPoint(origin);

            this.messageOrigin = origin;
            this.message = string;
            var metrics = this.context.measureText(string);

            var f = this.context.font;
            var w = Math.ceil(metrics.width);
            var h = parseInt(f);
            if(isNaN(h)){
                f = f.substr(f.indexOf(' '));
                h = parseInt(f);
            }

            return [
                origin.add([0,0]),
                origin.add([w,0]),
                origin.add([w,-h]),
                origin.add([0,-h])
            ];
        },

        line: function(from,to,isIso) {
            if(!from || !to) return false;
            from = this.castToPoint(from);
            to = this.castToPoint(to);

            if(isIso){
                from = from.toOrtho();
                to = to.toOrtho();
            }

            return this.moveTo(from.x, from.y) && this.lineTo(to.x, to.y);
        },

        polygon: function(points,origin,isIso) {
            if(!points) return [];
            if(!origin) origin = [0,0,0];

            origin = this.castToPoint(origin);
            points = points.map(function(v){return this.castToPoint(v);}.bind(this));
            isIso && (points = points.map(function(v){return v.toOrtho();}));

            var i,p,
                o = origin.add(points[0]);
            var poly2D = [];

            this.moveTo(o.x, o.y) && poly2D.push(o);
            for(i=1; i<points.length; i++){
                p = origin.add(points[i]);
                this.lineTo(p.x, p.y) && poly2D.push(p);
            }
            this.lineTo(o.x, o.y);// && poly2D.push(o);

            return poly2D;
        },

        // CASTING METHODS
        castToColor: function(color) {
            var col =
                typeof(color) == "string" ? color :
                typeof(color) == "number" ? color.toString(16) :
                null;

            col!=null && col.substr(0,1)=='#' && (col = col.substr(1));
            col!=null && (col = '#' + ('00000'+col).substr(-6));

            return col;
        },
        castToPoint: function(coord) {
            var point;
            if(coord instanceof Point)
                point = coord;
            else if(typeof(coord)=='object' && coord.x!=null && coord.y!=null)
                point = new Point(parseFloat(coord.x), parseFloat(coord.y), parseFloat(coord.z));
            else if(typeof(coord)=='object' && coord.length>1 && coord.length<4)
                point = new Point(parseFloat(coord[0]), parseFloat(coord[1]), parseFloat(coord[2]));
            return point;
        }

    };

    return Draw;

}());
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

    // OPTIONS
    DisplayObject.prototype.setOptions = function(opts) {
        if(!opts) return false;
        this._extend(this._options,opts);
        return true;
    };
    DisplayObject.prototype.setRenderInfo = function(info, opts) {
        opts && this.setOptions(opts);
        this._info.renderInfo = info;
    };
    DisplayObject.prototype.setAnimationStep = function(callback) {
        this._info.stepCallback = callback;
    };

    /******************************
     * INTERNAL METHODS
     ******************************/

    // ADD/REMOVE
    DisplayObject.prototype._addTo = function(parent,zindex) {
        this._zIndex = zindex || 0;
        this._parent = parent;
    };
    DisplayObject.prototype._remove = function() {
        delete this;
    };

    // RENDER
    DisplayObject.prototype._render = function(stage) {
        if(!this._info.renderMethod) throw new Error('no renderMethod set for this instance of DisplayObject: ',this);
        if(!this._info.renderInfo) return false;

        stage._info.draw.setup(this._options);
        this._shape = stage.draw[this._info.renderMethod](this._info.renderInfo,this._position);
        stage._info.draw.render();

        return true;
    };

    // ANIMATION
    DisplayObject.prototype._step = function(time) {
        this._info.stepCallback && this._info.stepCallback(time);
        return true;
    };

    return DisplayObject;

}(ObjectModel,Point));

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

    return Text;

}(DisplayObject));

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

/**
 * Created by fdimonte on 20/04/2015.
 */

var DisplayObjectContainer = (function(DisplayObject){

    /**
     * DisplayObjectContainer Class
     *
     * @param name
     * @constructor
     */
    function DisplayObjectContainer(name){
        DisplayObject.call(this,name);

        this._children = {};

        this._childrenLength = function(){
            var tot=0;
            objMap(this,function(){tot++;});
            return tot;
        }.bind(this._children);

        this._childrenArray = function(){
            var arr = [];
            objMap(this,function(c){arr.push(c);});
            return arr.sort(function(a,b){return a._zIndex - b._zIndex;});
        }.bind(this._children);

    }

    /**
     * DisplayObjectContainer prototype
     *
     * @type {DisplayObject}
     */
    DisplayObjectContainer.prototype = Object.create( DisplayObject.prototype );

    /******************************
     * OVERRIDE METHODS
     ******************************/

    DisplayObjectContainer.prototype._render = function(stage) {
        this._childrenArray(true).forEach(function(v){
            v._render(stage);
        });
    };

    DisplayObjectContainer.prototype._step = function(time) {
        this._childrenArray(true).forEach(function(v){
            v._step(time);
        });
        DisplayObject.prototype._step.call(this,time);
        return true;
    };

    /******************************
     * PUBLIC METHODS
     ******************************/

    // ADD CHILD
    DisplayObjectContainer.prototype.addChild = function(child,index) {
        if(!(child instanceof DisplayObject))
            throw new Error('adding child with unsupported type:',typeof(child));
        if(this[child._name])
            throw new Error('property "',child._name,'" already exists on',this);

        index || (index = this._childrenLength());

        this._children[child._name] = child;
        this[child._name] = child;

        child._addTo(this,index);

        this._reorderChildren();

        return child;
    };

    // REMOVE CHILD
    DisplayObjectContainer.prototype.removeChild = function(child) {
        if(child instanceof String) child = this[child];
        if(child && this[child._name] && this[child._name] instanceof DisplayObject){
            delete this._children[child._name];
            delete this[child._name];
            child._remove();
        }
    };

    /******************************
     * INTERNAL METHODS
     ******************************/

    // REORDER CHILDREN
    DisplayObjectContainer.prototype._reorderChildren = function() {
        this._childrenArray().forEach(function(v,i){
            v._info.index = i;
        });
    };

    // GET SHAPES
    DisplayObjectContainer.prototype._getShapes = function() {
        var child,shapes = [];
        for(var c=0;c<this._children.length;c++){
            child = this._children[c];
            if(child._shape)
                shapes.push(child._shape);
            if(child instanceof DisplayObjectContainer)
                shapes = shapes.concat(child._getShapes());
        }
        return shapes;
    };

    DisplayObjectContainer.prototype._getShapesWithObjects = function() {
        var child,children = [];
        for(var c=0;c<this._children.length;c++){
            child=this._children[c];
            if(child._shape)
                children.push(child);
            if(child instanceof DisplayObjectContainer)
                children = children.concat(child._getShapesWithObjects());
        }
        return children;
    };

    /******************************
     * PRIVATE METHODS
     ******************************/

    function objMap(obj,cb) {
        if(!obj || !cb) return;
        for(var c in obj) if(obj.hasOwnProperty(c)) cb(obj[c]);
    }

    return DisplayObjectContainer;

}(DisplayObject));

/**
 * Created by fdimonte on 20/04/2015.
 */

var Stage = (function($,DisplayObjectContainer){

    /**
     * Stage Class
     *
     * @param name
     * @constructor
     */
    function Stage(name){
        DisplayObjectContainer.call(this,'_stage_'+name);

        this._engine = null;

        this._info.size = {w:0,h:0};
        this._info.canvas = document.createElement('canvas');
        this._info.context = this._info.canvas.getContext('2d');
        this._info.draw = new Draw(this._info.context);
        this._info.animator = new Animator(this.renderTime.bind(this));

        this.$el = $('<div/>')
            .addClass('iso-layer')
            .css({position:'absolute',top:0,left:0})
            .append(this._info.canvas);
    }

    /**
     * Stage prototype
     *
     * @type {DisplayObjectContainer}
     */
    Stage.prototype = Object.create( DisplayObjectContainer.prototype );

    /******************************
     * OVERRIDE METHODS
     ******************************/

    Stage.prototype._render = function() {
        this.clear();
        DisplayObjectContainer.prototype._render.call(this,this);
    };

    Stage.prototype._remove = function() {
        //TODO: improve the removing process (clear children and childrenMap on the parent)
        this.$el.remove();
    };

    Stage.prototype._addTo = function(engine) {
        if(!engine) return;
        //if(!(engine instanceof require('GraphicEngine')))
        //    throw new Error('stage added to unsupported object:',typeof(engine));

        var world_size = engine.worldSize();
        this.setSize(world_size.w, world_size.h);
        this.$el.appendTo(engine.$el);
        this._engine = engine;
    };

    /******************************
     * PUBLIC METHODS
     ******************************/

    Stage.prototype.clear = function() {
        this._info.context.clearRect( -this._info.size.w/2 , -this._info.size.h/2 , this._info.size.w , this._info.size.h );
    };

    Stage.prototype.getCanvas = function() {
        return this._info.canvas;
    };

    Stage.prototype.renderTime = function(time) {
        this._step(time) && this._render();
    };

    Stage.prototype.startAnimation = function(timeout) {
        this._info.animator.start(timeout);
    };

    Stage.prototype.stopAnimation = function() {
        this._info.animator.stop();
    };

    Stage.prototype.setSize = function(w,h) {
        this._info.size = {w:w,h:h};
        this._info.canvas.width = w.toString();
        this._info.canvas.height = h.toString();
        this._info.context.translate(w/2,h/2);
    };

    Stage.prototype.setShadow = function(color,blur,offsetX,offsetY) {
        this._info.context.shadowColor = color || '#999';
        this._info.context.shadowBlur = blur || 20;
        this._info.context.shadowOffsetX = offsetX || 15;
        this._info.context.shadowOffsetY = offsetY || offsetX || 15;
    };

    return Stage;

}(jQuery,DisplayObjectContainer));

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

var GEPackage = (function(ObjectModel,Point,Bitmap,DisplayObject,DisplayObjectContainer,Shape,Sprite,Stage,Text,Animator,Draw){
var gep={};
gep["core"]={};
gep["core"]["ObjectModel"]=ObjectModel;
gep["core"]["Point"]=Point;
gep["display"]={};
gep["display"]["Bitmap"]=Bitmap;
gep["display"]["DisplayObject"]=DisplayObject;
gep["display"]["DisplayObjectContainer"]=DisplayObjectContainer;
gep["display"]["Shape"]=Shape;
gep["display"]["Sprite"]=Sprite;
gep["display"]["Stage"]=Stage;
gep["display"]["Text"]=Text;
gep["utils"]={};
gep["utils"]["Animator"]=Animator;
gep["utils"]["Draw"]=Draw;
return gep;
}(ObjectModel,Point,Bitmap,DisplayObject,DisplayObjectContainer,Shape,Sprite,Stage,Text,Animator,Draw));
/**
 * Created by fdimonte on 20/04/2015.
 */

var GraphicEngine = (function($,GEPackage,Stage,Point){

    /**
     * GraphicEngine Class
     *
     * @constructor
     */
    function GraphicEngine() {
        this.$el = $('<div/>');
        this.layers = {};
        this.fpsInterval = null;
        this.fpsLogInterval = null;
        this.utils = {
            worldSizeWidth: 400,
            worldSizeHeight: 400
        };
    }

    /**
     * GraphicEngine prototype
     *
     * @type {{package: *, init: Function, setWorld: Function, worldSize: Function, render: Function, addLayer: Function, removeLayer: Function, showFPS: Function, hideFPS: Function, screenToWorld: Function, getObjectsAtScreenCoord: Function}}
     */
    GraphicEngine.prototype = {

        // var GEPackage is declared in target/GEPackage.js wrote by Grunt Task 'grunt create_package'
        packages: GEPackage,

        /**
         * This method initialize the graphic engine binding it to the given element and options calling this.setWorld
         *
         * @param elem {String}    query selector for the DOM element which will contain the graphic engine
         * @param options {Object} a set of options to override default values
         */
        init: function(elem,options){
            if(!elem) throw new Error('no "elem" param passed to new GraphicEngine instance');
            if(options) $.extend(true,this.utils,options);
            this.setWorld(elem);
        },

        /**
         * This method will append this.$el to the given element (selector) setting its width and height
         *
         * @param elem {String} query selector for the DOM element which will contain the graphic engine
         */
        setWorld: function(elem) {
            if(!this.$el) return;

            var ws = this.worldSize();
            this.$el
                .css('position','relative')
                .width(ws.w)
                .height(ws.h)
                .appendTo($(elem));
        },

        /**
         * Returns an object with w and h property, for world's width and height
         *
         * @returns {{w: number, h: number}}
         */
        worldSize: function() {
            return {w:this.utils.worldSizeWidth, h:this.utils.worldSizeHeight};
        },

        /**
         * The main render method. It will call the same method on every layer (Stage).
         */
        render: function() {
            for(var l in this.layers){
                if(this.layers.hasOwnProperty(l)){
                    this.layers[l].render();
                }
            }
        },

        /**
         * Adds a new layer (Stage instance) and returns it.
         *
         * @param name {String} new layer's name
         * @returns {Stage}     newly added layer
         */
        addLayer: function(name) {
            var layer = new Stage(name);
            layer._addTo(this);

            this.layers[name] = layer;
            return layer;
        },

        /**
         * Removes the layer with the given name.
         *
         * @param name {String} the desired layer's name
         * @returns {Boolean}   returns TRUE if layer existed before been removed
         */
        removeLayer: function(name) {
            var layer = this.layers[name];
            if(layer){
                layer.remove();
                delete this.layers[name];
                return true;
            }
            return false;
        },

        showFPS: function(callback) {
            callback || (callback=console.log);
            var c = 0;
            this.fpsInterval = setInterval(function(){
                c++;
            },1);
            this.fpsLogInterval = setInterval(function(){
                callback(c/10);
                c=0;
            },1000);
        },
        hideFPS: function() {
            clearInterval(this.fpsInterval);
            clearInterval(this.fpsLogInterval);
        },

        /**
         * Converts screen coordinates (mouseclick) to canvas drawing coordinates.
         * Note: override this method if Stage.setSize is overridden (and viceversa)
         *
         * @param mx {Number} mouse X coordinate
         * @param my {Number} mouse Y coordinate
         * @returns {{x: number, y: number}}
         */
        screenToWorld: function(mx,my) {
            var ws = this.worldSize();
            var worldPosition = this.$el.offset();
            return {
                x: mx - (worldPosition.left + ws.w/2),
                y: my - (worldPosition.top  + ws.h/2)
            };
        },

        /**
         * Returns an array of DisplayObjects whose positions correspond to the given coordinates
         *
         * @param coord {Point} the interested screen coordinates
         * @returns {Array}     the array of DisplayObjects that share the specified pixel position
         */
        getObjectsAtScreenCoord: function(coord) {
            var worldCoord = this.screenToWorld(coord.x,coord.y);
            var shapes=[];

            for(var l in this.layers){
                if(this.layers.hasOwnProperty(l)){
                    shapes = shapes.concat(this.layers[l].getShapesWithObjects());
                }
            }

            var objects=[];
            for(var s=0;s<shapes.length;s++)
                if(shapes[s].shape && isPointInPoly(shapes[s].shape,worldCoord))
                    objects.push(shapes[s]);

            objects.sort(function(a,b){return (b.zindex - a.zindex);});
            return objects;
        },

        draw: {

            grid: function(stage,size,unit,opt,isIso) {
                if(!stage) throw new Error('calling draw method without providing a Stage instance');
                size || (size = [10,10]);
                unit || (unit = 10);
                opt  || (opt = {});

                opt.strokeSize  || (opt.strokeSize = 1);
                opt.strokeColor || (opt.strokeColor = 0);
                opt.alpha       || (opt.alpha =.8);

                stage._info.draw.setup(opt);
                for(var w=0;w<=size[0];w++) stage._info.draw.line([w*unit,0], [w*unit,size[0]*unit], isIso);
                for(var h=0;h<=size[1];h++) stage._info.draw.line([0,h*unit], [size[1]*unit,h*unit], isIso);
                stage._info.draw.render();
            },

            line: function(stage,from,to,opt,isIso) {
                if(!stage) throw new Error('calling draw method without providing a Stage instance');
                if(from==null || to==null) return;

                opt && stage._info.draw.setup(opt);
                stage._info.draw.line(from,to,isIso);
                stage._info.draw.render();
            },

            axis: function(stage,length,isIso) {
                if(!stage) throw new Error('calling draw method without providing a Stage instance');
                length || (length=100);

                var aX = [length,0,0];
                var aY = [0,length,0];
                var aZ = [0,0,length];

                stage._info.draw.setup({strokeColor:0x0});
                stage._info.draw.line([0, 0, 0], aX, isIso);
                stage._info.draw.line([0, 0, 0], aY, isIso);
                stage._info.draw.line([0, 0, 0], aZ, isIso);
                stage._info.draw.render();
            },

            get3DPolygonSquare: function(size) {
                return [
                    [0,    0,    0],
                    [size, 0,    0],
                    [size, size, 0],
                    [0,    size, 0]
                ];
            },
            get3DPolygonSquareRight: function(size) {
                return [
                    [0, 0,    0   ],
                    [0, size, 0   ],
                    [0, size, size],
                    [0, 0,    size]
                ];
            },
            get3DPolygonSquareLeft: function(size) {
                return [
                    [0,    0, 0   ],
                    [0,    0, size],
                    [size, 0, size],
                    [size, 0, 0   ]
                ];
            }

        }

    };

    /******************************
     * PRIVATE METHODS
     ******************************/

    function isPointInPoly(poly, pt){
        for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
            && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
            && (c = !c);
        return c;
    }

    return GraphicEngine;

}(jQuery,GEPackage,Stage,Point));
return GraphicEngine;}());