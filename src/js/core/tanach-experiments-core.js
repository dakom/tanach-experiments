var TXP = (function(exports) {
  var _bgColor;

  exports.DoScaleWindow = function() {
      exports.windowScaleRatio = scaleToWindow(exports.renderer.view, _bgColor);
  }

  exports.Init = function(canvasWidth, canvasHeight, bgColor) {
      exports.canvasWidth = canvasWidth;
      exports.canvasHeight = canvasHeight;

      _bgColor = bgColor;

      exports.renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight);
      document.body.appendChild(exports.renderer.view);


      exports.stage = new PIXI.Container();

      requestAnimationFrame(mainGameLoop);

      exports.DoScaleWindow();
      window.addEventListener("resize", exports.DoScaleWindow);
  }



  //MAIN
  function mainGameLoop() {
      requestAnimationFrame(mainGameLoop);
      exports.renderer.render(exports.stage);
  }

    return exports;

  }(TXP || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    Books: {}
  }));
