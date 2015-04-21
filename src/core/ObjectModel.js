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

        extend: function(obj,ext) {
            if(!ext) return;
            for(var p in ext){
                if(ext.hasOwnProperty(p)){
                    if(obj[p] && (obj[p] instanceof Object) && !(obj[p] instanceof Array)) this.extend(obj[p],ext[p]);
                    else obj[p] = ext[p];
                }
            }
        }
    };

    return ObjectModel;

}());
