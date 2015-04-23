var isoEngine,isoGrid;

$(document).ready(function(){

    isoEngine = new GraphicEngine();
    isoEngine.init($('#iso-container'),{
        worldSizeWidth  : 500,
        worldSizeHeight : 500
    });

    isoGrid = isoEngine.addLayer('grid');

    isoEngine.draw.grid(isoGrid,null,null,null,true);
    isoEngine.draw.axis(isoGrid,200,true);

    drawSquare(isoGrid,[15,15,0],40,{fillColor:0xff0000,strokeColor:0x00ff00});

});

function drawSquare(stage,origin,size,opt,isIso) {
    var points = stage.parent.draw.get3DPolygonSquare(size);
    stage._info.draw.setup(opt);
    stage._info.draw.polygon(points,origin,isIso);
    stage._info.draw.render();
}
