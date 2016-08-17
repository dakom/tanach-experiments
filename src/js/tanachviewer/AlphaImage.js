var TANACH_VIEWER = (function(exports) {
    exports.DrawAlphaImage = function() {
      var graphics = new PIXI.Graphics();
      graphics.beginFill(0xFF0000);
      graphics.drawRect(0,0,500,500);
      graphics.endFill();
      TANACH_VIEWER.stage.addChild(graphics);
    }

    return exports;
}(TANACH_VIEWER || {}));
