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
