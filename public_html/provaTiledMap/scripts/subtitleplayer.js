/*{# Copyright (c) 2014 Turbulenz Limited #}*/
///
var SubtitlePlayer = (function () {
    function SubtitlePlayer(params) {
        this.md = params.mathDevice;
        this.gd = params.graphicsDevice;

        this.font = null;
        this.technique = null;
        this.techniqueParameters = null;

        this.script = null;
        this.nextActiveIdx = 0;

        this.maxWidthFactor = params.maxWidthFactor;
        this.lowEdgeFactor = params.lowEdgeFactor;
        this.languageCode = params.languageCode || "en";
        this.defaultLanguageCode = params.defaultLanguageCode || "en";

        this.scratchDimensions = null;
        this.scratchDrawParameters = {
            alignment: 1,
            rect: this.md.v4BuildZero(),
            scale: 1.0,
            spacing: 0,
            dimensions: null
        };

        var player = this;

        var checkReady = function () {
            if (player.font && player.technique) {
                if (params.onReady) {
                    params.onReady();
                }
            }
        };

        var error = function (msg) {
            if (params.onError) {
                params.onError(msg);
            }
        };

        var fontManager = params.fontManager;
        fontManager.load(params.fontURL, function (fontObject) {
            player.font = fontObject;
            checkReady();
        });

        var shaderManager = params.shaderManager;
        shaderManager.load(params.shaderURL, function (shader) {
            if (shader) {
                player.technique = shader.getTechnique(params.fontTechniqueName);

                if (player.technique) {
                    // TODO: set of TechniqueParameters is
                    // hard-coded for now.
                    player.techniqueParameters = player.gd.createTechniqueParameters({
                        clipSpace: player.md.v4BuildZero(),
                        alphaRef: 0.01,
                        color: player.md.v4BuildOne()
                    });

                    checkReady();
                } else {
                    error("No technique '" + params.fontTechniqueName + "'");
                }
            } else {
                error("No shader '" + params.shaderURL + "'");
            }
        });
    }
    /// Replace any existing script.  Assumes time will start from 0
    /// next frame.
    SubtitlePlayer.prototype.setScript = function (script) {
        this.script = script;
        this.reset();
    };

    /// Duration in milliseconds (for comparison with
    /// TurbulenzEngine.getTime()).
    SubtitlePlayer.prototype.getDuration = function () {
        var lastCaption = this.script[this.script.length - 1];
        return (lastCaption.startTime + lastCaption.duration) * 1000.0;
    };

    ///
    SubtitlePlayer.prototype.reset = function () {
        this.nextActiveIdx = 0;
        // this.lastFontDimensions = null;
    };

    /// Set a new language code.  reset must still be called if the
    /// caller wants to move back in time.
    SubtitlePlayer.prototype.setLanguageCode = function (languageCode) {
        this.languageCode = languageCode;
    };

    /// Render any subtitles associated with the current script and
    /// the specified time.  time is specified in ms (in-line with
    /// TurbulenzEngine.getTime()) and is assumed to be non-decreasing
    /// on each call.  Return value indicates whether anything was
    /// rendered.
    SubtitlePlayer.prototype.draw = function (timeMS) {
        var time = timeMS / 1000.0;
        var script = this.script;
        var nextActiveIdx = this.nextActiveIdx;
        var nextActive = script[nextActiveIdx];

        while (nextActive && time > nextActive.startTime + nextActive.duration) {
            nextActiveIdx += 1;
            nextActive = script[nextActiveIdx];
        }
        this.nextActiveIdx = nextActiveIdx;

        if (!nextActive) {
            return false;
        }

        if (time < nextActive.startTime) {
            return false;
        }

        // Render the caption
        var text = nextActive.text[this.languageCode] || nextActive.text[this.defaultLanguageCode];

        if (text) {
            // Prepare rendering
            var gd = this.gd;
            var techniqueParameters = this.techniqueParameters;

            var screenWidth = gd.width;
            var screenHeight = gd.height;

            gd.setTechnique(this.technique);
            techniqueParameters['clipSpace'] = this.md.v4Build(2 / screenWidth, -2 / screenHeight, -1, 1, techniqueParameters['clipSpace']);
            gd.setTechniqueParameters(techniqueParameters);

            // Place the text
            var font = this.font;

            var scale = 1.0;
            var spacing = 0;
            var lowEdgeFactor = this.lowEdgeFactor;

            var maxX = screenWidth * this.maxWidthFactor;
            var maxY = screenHeight * (1 - lowEdgeFactor);

            var dimensions = this.scratchDimensions;
            dimensions = font.calculateTextDimensions(text, scale, spacing, 0, dimensions);
            this.scratchDimensions = dimensions;

            while ((dimensions.width > maxX) || (dimensions.height > maxY)) {
                scale *= 0.5;
                dimensions = font.calculateTextDimensions(text, scale, spacing, 0, dimensions);
            }

            // Setup font parameters
            var drawParams = this.scratchDrawParameters;
            var rect = drawParams.rect;
            rect[0] = screenWidth / 2;
            rect[1] = screenHeight * (1 - lowEdgeFactor) - dimensions.height;
            drawParams.scale = scale;
            drawParams.spacing = spacing;
            drawParams.dimensions = dimensions;

            font.drawTextRect(text, drawParams);
        }
    };

    SubtitlePlayer.create = /// public creation function
    function (params) {
        return new SubtitlePlayer(params);
    };
    return SubtitlePlayer;
})();
