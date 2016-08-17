var TANACH_CORE = (function(exports) {

    function addHoverListener(obj, callback) {
        obj.on('mouseover', function(info) {
            callback(obj, info)
        });
    };

    function addClickTapListener(obj, callback) {
        obj.on('tap', function(info) {
            callback(obj, info)
        });
        obj.on('click', function(info) {
            callback(obj, info)
        });
    };

    function addTouchStartListener(obj, callback) {
        obj.on('mousedown', function(info) {
            callback(obj, info)
        });
        obj.on('touchstart', function(info) {
            callback(obj, info)
        });
    };

    function addTouchMoveListener(obj, callback) {
        obj.on('mousemove', function(info) {
            callback(obj, info)
        });
        obj.on('touchmove', function(info) {
            callback(obj, info)
        });
    };

    function addTouchEndListener(obj, callback) {
        obj.on('mouseup', function(info) {
            callback(obj, info)
        });
        obj.on('mouseupoutside', function(info) {
            callback(obj, info)
        });
        obj.on('touchend', function(info) {
            callback(obj, info)
        });
        obj.on('touchendoutside', function(info) {
            callback(obj, info)
        });
    }

    exports.Interactions.TouchEvent = {
        addHoverListener: addHoverListener,
        addTouchStartListener: addTouchStartListener,
        addTouchMoveListener: addTouchMoveListener,
        addTouchEndListener: addTouchEndListener,
        addClickTapListener: addClickTapListener
    }
    return exports;

  }(TANACH_CORE || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    Books: {}
  }));
