var TANACH_VIEWER = (function(exports) {



    exports.Init = function(configOptions) {
        exports.configOptions = configOptions;

        exports.renderer = PIXI.autoDetectRenderer(configOptions.canvasWidth, configOptions.canvasHeight);
        document.body.appendChild(exports.renderer.view);

        exports.stage = new PIXI.Container();

        exports.DrawAlphaImage();

        TANACH_CORE.Books.Load({
          onComplete: TANACH_VIEWER.TempTest
        });

        requestAnimationFrame(mainGameLoop);
    }

    exports.DoScaleWindow = function() {
        exports.windowScaleRatio = scaleToWindow(exports.renderer.view, exports.configOptions.bgColor);
    }

    //MAIN
    function mainGameLoop() {
        requestAnimationFrame(mainGameLoop);
        exports.renderer.render(exports.stage);
    }

    return exports;
}(TANACH_VIEWER || {}));
