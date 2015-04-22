var isoEngine,isoGrid;

$(document).ready(function(){

    isoEngine = new IsoEngine();
    isoEngine.init($('#iso-container'),{
        worldSizeWidth  : 500,
        worldSizeHeight : 500
    });

    isoGrid = isoEngine.addLayer('grid');

    isoEngine.drawGrid(isoGrid);
    isoEngine.drawAxis(isoGrid,200);

    drawSquare(isoGrid,[15,15,0],40,{fillColor:0xff0000,strokeColor:0x00ff00});

});

function drawSquare(stage,origin,size,opt) {
    var points = stage.parent.polygonSquare(size);
    stage.draw.setup(opt);
    stage.draw.polygon(origin,points,true);
    stage.draw.render();
}
