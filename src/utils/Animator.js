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
