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

            this.context.fillStyle   = fillColor;
            this.context.strokeStyle = strokeColor;
            this.context.lineWidth   = strokeSize;
            this.context.globalAlpha = opt.alpha || 1;
            this.context.font        = opt.font  || '20px Open Sans';

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

            var coord = {from:from, to:to};
            return this.moveTo(coord.from.x, coord.from.y) && this.lineTo(coord.to.x, coord.to.y);
        },

        polygon: function(points,origin,isIso) {
            if(!points) return [];
            if(!origin) origin = [0,0];
            origin = this.castToPoint(origin);

            if(isIso){
                points = points.map(function(v,i,a){
                    return this.castToPoint(v).toOrtho();
                }.bind(this));
            }

            var i,p,
                o = origin.add(points[0]);
            var poly2D = [];

            this.moveTo(o.x,o.y) && poly2D.push(o);
            for(i=1; i<points.length; i++){
                p = origin.add(points[i]);
                this.lineTo(p.x, p.y) && poly2D.push(p);
            }
            this.lineTo(o.x,o.y);// && poly2D.push(o);

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
                point = new Point(coord.x, coord.y, coord.z);
            else if(typeof(coord)=='object' && coord.length>1 && coord.length<4)
                point = new Point(coord[0], coord[1], coord[2]);
            return point;
        }

    };

    return Draw;

}());