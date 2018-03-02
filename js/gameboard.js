dimensions = {
    width : 1024,
    height : 768,
    trayHeight : 150
}
images = new Array();

loadImages = function () {
    return new Promise(function(resolve, reject) {
        var sources = [
            "./images/puppy_board.png",
            "./images/tray.png",
            "./images/puppy_head.png",
            "./images/puppy_ball.png",
            "./images/puppy_legs.png",
            "./images/puppy_torso.png",
            "./images/puppy_back_leg.png",
            "./images/puppy_tail.png",
            "./images/puppy_leg.png"
        ];
        var loadedImages = 0;
        for (var s in sources) {
            var im = new Image();
            var ki = new Konva.Image({image:im});
            images.push(ki);
            im.onload = function() {
                loadedImages++;
                if (loadedImages === sources.length) {
                    //We got all loaded, return resolved promise
                    console.log("All images loaded");
                    resolve(images);
                } 
            }
            im.src = sources[s];
        }
    });
}

drawBackgroud = function() {
    console.log("This is ", this.window.innerHeight);
    lBackground.add(images[0]);
    images[1].y(dimensions.height-dimensions.trayHeight);
    lBackground.add(images[1]);
    lBackground.draw();
}


function returnToTrayAnimFactory(node_p, target_x, target_y, target_w, target_h) {
    return new Konva.Tween({
        node: node_p,
        x: target_x,
        y: target_y,
        width: target_w,
        height: target_h,
        duration: 0.1,
        easing: Konva.Easings.EaseInOut,
    });
}

function takeFromTrayAnimFactory(node_p, target_w, target_h) {
    return new Konva.Tween({
        node: node_p,
        width: target_w,
        height: target_h,
        duration: 0.2,
        easing: Konva.Easings.EaseInOut
    });
}


addPiece = function(index, ptx, pty, ptw, pth, pbx, pby, pz) {  
    var tx = ptx;
    var ty = pty;
    var tw = ptw;
    var th = pth;
    var bx = pbx;
    var by = pby;
    var z = pz;
    var kImage = images[index + 2];
    var bw = kImage.attrs.image.width;
    var bh = kImage.attrs.image.height;

    kImage.draggable(true);

    kImage.x(tx);
    kImage.y(ty);
    kImage.width(tw);
    kImage.height(th);
    kImage.on("mousedown", function() { 
        play_multi_sound("take"); 
    });
    kImage.on("dragstart", function() {
        kImage.moveToTop();
        var animTakePiece = takeFromTrayAnimFactory(kImage, bw, bh);
        animTakePiece.play();
    });
    kImage.on("dragend", function() {
        kImage.setZIndex(z);
        if ((Math.abs(kImage.x() - bx) + Math.abs(kImage.y() - by)) < 100) {
            kImage.x(bx);
            kImage.y(by);
            lPieces.draw();
            kImage.draggable(false);
            kImage.off("mousedown");
            play_multi_sound("place");
            score++;
            if (score === endgame) {
                play_multi_sound("applause");
                //TODO implement the whole popBaloons(15);
            }
        } else {
            play_multi_sound("return");
            var animReturnPiece = returnToTrayAnimFactory(kImage, tx, ty, tw, th);
            animReturnPiece.play();
        }
    });
    lPieces.add(kImage);
}

initStage = function() {

    console.log("Initializing stage ");
    stage = new Konva.Stage({
        container: 'game-container',
        width: dimensions.width,
        height: dimensions.height
    });
    lBackground = new Konva.Layer();
    lPieces = new Konva.Layer();
    lCtrl = new Konva.Layer();
    stage.add(lBackground);
    stage.add(lPieces);
    stage.add(lCtrl);
    addPiece(0, 10, 768-150+10, 128, 130, 272, 59, 5);
    addPiece(1, 150, 768-150+10, 130, 130, 133, 362, 6);
    addPiece(2, 290, 768-150+10, 107, 130, 367, 257, 3);
    addPiece(3, 430, 768-150+10, 130, 92, 420, 120, 2);
    addPiece(4, 570, 768-150+10, 130, 73, 565, 416, 0);
    addPiece(5, 710, 768-150+10, 130, 66, 818, 243, 1);
    addPiece(6, 850, 768-150+10, 56, 130, 774, 290, 4);
    endgame = 7;
    score = 0;
    lPieces.draw();
}

loadImages()
.then(function(result) {
    initStage();
    drawBackgroud();
});

window.onresize = function(event) {
    if (stage) {
        var w = window.innerWidth;
        var h = window.innerHeight;
        if ((w >= dimensions.width) && (h >= dimensions.height)) {
            //We are good, no need to scale anything up
        } else {
            var sw = w/dimensions.width;
            var sh = h/dimensions.height;
            var newscale = (sw > sh) ? sh : sw; 
            stage.scaleX(newscale);
            stage.scaleY(newscale);
            stage.draw();
        }
    }
};
