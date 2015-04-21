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

        this._info.children = [];
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

    DisplayObjectContainer.prototype.render = function(stage) {
        for(var c=0;c<this._info.children.length;c++) {
            this._info.children[c].render(stage);
        }
    };

    DisplayObjectContainer.prototype.step = function(time) {
        for(var c=0;c<this.children.length;c++) {
            this._info.children[c].step(time)
        }
        DisplayObject.prototype.step.call(this,time);
        return true;
    };

    /******************************
     * PUBLIC METHODS
     ******************************/

    // ADD CHILD
    DisplayObjectContainer.prototype.addChild = function(child) {
        if(!(child instanceof DisplayObject))
            throw new Error('adding child with unsupported type:',typeof(child));

        this._info.children.push(child);
        this[child._info.name] = child;

        child.addTo(this,this._info.children.length-1);
        return child;
    };

    DisplayObjectContainer.prototype.addChildAt = function(child,zindex) {};

    // REMOVE CHILD
    DisplayObjectContainer.prototype.removeChild = function(child) {
        if(child){
            // TODO remove child from children Array!!!
            delete this[child.name];
            child.remove();
        }
    };

    DisplayObjectContainer.prototype.removeChildAt = function(child,zindex) {};

    DisplayObjectContainer.prototype.removeChildByName = function(name) {
        this.removeChild(this[name]);
    };

    // GET SHAPES
    DisplayObjectContainer.prototype.getShapes = function() {
        var child,shapes = [];
        for(var c=0;c<this._info.children.length;c++){
            child=this._info.children[c];
            if(child.shape)
                shapes.push(child.shape);
            if(child instanceof DisplayObjectContainer)
                shapes = shapes.concat(child.getShapes());
        }
        return shapes;
    };

    DisplayObjectContainer.prototype.getShapesWithObjects = function() {
        var child,children = [];
        for(var c=0;c<this._info.children.length;c++){
            child=this._info.children[c];
            if(child.shape)
                children.push(child);
            if(child instanceof DisplayObjectContainer)
                children = children.concat(child.getShapesWithObjects());
        }
        return children;
    };

    return DisplayObjectContainer;

}(DisplayObject));
