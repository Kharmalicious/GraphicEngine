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
