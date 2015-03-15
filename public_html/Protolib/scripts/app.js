// Copyright (c) 2014 Turbulenz Limited
/* global Protolib: false*/
/* global Config: false*/
/* global Physics2DDevice: false*/
/* global Physics2DDebugDraw: false*/

function Application() {
}

Application.prototype = {
    // Use the properties from Config by default, otherwise use these defaults
    protolibConfig: Protolib.extend(true, {fps: 60, useShadows: true}, Config),
    init: function initFn() {
        this.count = 0;
        var that = this;
        var version = this.protolib.version;
        var requiredVersion = [0, 2, 1];

        if (version === undefined ||
                version[0] !== requiredVersion[0] ||
                version[1] !== requiredVersion[1] ||
                version[2] !== requiredVersion[2]) {

            this.protolib.utils.error("Protolib is not requiredVersion");
            return false;
        }

        // carichiamo i device di cui abbiamo bisogno
        var mathDevice = this.protolib.getMathDevice();
        var graphicsDevice = this.protolib.getGraphicsDevice();
        var inputDevice = this.protolib.getInputDevice();
        var draw2D = this.protolib.globals.draw2D;

        this.protolib.setClearColor(mathDevice.v3Build(0.3, 0.3, 0.3));

        // Initialization code goes here
        this.viewWidth = 20; // incrementando questo valore aumenta la larghezza del campo visibile
        this.viewHeight = 10;
        var viewportRectangle = [0, 0, this.viewWidth, this.viewHeight];

        this.phys2D = Physics2DDevice.create();

        draw2D.configure({viewportRectangle: viewportRectangle, scaleMode: 'scale'});

        this.world = this.phys2D.createWorld({gravity: [0, 350]});

        this.player = new Player(this.viewWidth, this.viewHeight, this.phys2D, this.world);

        this.platform = new Platform(5, 0.5, [0, this.viewHeight / 2], this.phys2D, this.world);


        this.protolib.setNearFarPlanes(0.1, 1000);
        this.protolib.setCameraPosition(mathDevice.v3Build(0, 0, -1));
        this.protolib.setCameraDirection(mathDevice.v3Build(0, 0, 1));
        this.protolib.setAmbientLightColor(mathDevice.v3Build(1, 1, 1));

        this.viewport = {
            top: 0,
            bottom: this.protolib.height,
            left: 0,
            right: this.protolib.width,
            width: this.protolib.width,
            height: this.protolib.height
        };

        this.protolib.setPreDraw(function preDrawFn() {
            var x = draw2D.scissorX;
            var y = draw2D.scissorY;
            var width = draw2D.scissorWidth;
            var height = draw2D.scissorHeight;
            graphicsDevice.setViewport(x, y, width, height);
            graphicsDevice.setScissor(x, y, width, height);
            that.viewport.top = y;
            that.viewport.bottom = y + height;
            that.viewport.left = x;
            that.viewport.right = x + width;
            that.viewport.width = width;
            that.viewport.height = height;
        });

        this.protolib.setPostRendererDraw(function postRendererDrawFn() {
            graphicsDevice.setViewport(0, 0, that.protolib.width, that.protolib.height);
            graphicsDevice.setScissor(0, 0, that.protolib.width, that.protolib.height);
        });

        this.protolib.setPostDraw(function postDrawFn() {
        });

        this.realTime = 0;

// TEXT
// ============================================================================================================================
// ============================================================================================================================

        this.white = mathDevice.v3Build(1, 1, 1);
        var baseTextSize = this.baseTextSize = 1;
        var baseHeight = this.baseHeight = 200;
        var textScaleFactor = this.textScaleFactor = baseTextSize * (baseHeight / this.viewport.height);
        this.hudText = {
            text: "Health: " + Math.floor(this.player.health),
            position: [3, this.viewport.top],
            scale: textScaleFactor,
            v3Color: this.white,
            verticalAlign: this.protolib.textVerticalAlign.TOP
        };

        this.gameOverText = {
            text: "Game Over!",
            position: [this.protolib.width / 2, this.protolib.height / 2],
            scale: textScaleFactor * 1.5,
            v3Color: this.white
        };

        this.survivedText = {
            text: "You survived!",
            position: [this.protolib.width / 2, this.protolib.height / 2],
            scale: textScaleFactor * 1.5,
            v3Color: this.white
        };

        return true;
    },
    update: function updateFn() {

        var mathDevice = this.protolib.getMathDevice();
        var delta = this.protolib.time.app.delta;

        if (this.protolib.beginFrame()) {
            // Update code goes here
            var textScaleFactor = this.baseTextSize * (this.viewport.height / this.baseHeight);
            var text = null;
            if (this.player.health < 0) {
                text = this.gameOverText;
            }

            if (text) {

                text.position[0] = this.protolib.width / 2;
                text.position[1] = this.protolib.height / 2;
                text.scale = textScaleFactor * 1.5;
                this.protolib.drawText(text);
                this.protolib.endFrame();
                return;
            }

            this.realTime += delta;

            var keySpeedX = 6;
            var keySpeedY = 10;
            var keyDown = false;

            if (this.protolib.isKeyDown(this.protolib.keyCodes.UP)) {
                this.player.velocity[1] = -keySpeedY;
                keyDown = true;
            }
            if (this.protolib.isKeyDown(this.protolib.keyCodes.DOWN)) {
                this.player.velocity[1] = keySpeedY;
                keyDown = true;
            }
            if (this.protolib.isKeyDown(this.protolib.keyCodes.LEFT)) {
                this.player.velocity[0] = -keySpeedX;
                keyDown = true;
            }
            if (this.protolib.isKeyDown(this.protolib.keyCodes.RIGHT)) {
                this.player.velocity[0] = keySpeedX;
                keyDown = true;
            }

            if (!keyDown) {
                this.player.velocity[0] = 0;
                this.player.velocity[1] = 0;
            }
            this.player.rigidBody.setVelocity(this.player.velocity);

            while (this.world.simulatedTime < this.realTime) {
                this.world.step(1 / 60);
            }

            this.player.rigidBody.getPosition(this.player.position);
            // queste righe fanno sì che il player non posa uscire dalla
            // viewport
            this.player.position[0] = this.protolib.utils.clamp(this.player.position[0], 1, this.viewWidth - 1);
            this.player.position[1] = this.protolib.utils.clamp(this.player.position[1], 1, this.viewHeight - 1);
            this.player.rigidBody.setPosition(this.player.position);

            // Render code goes here
            this.hudText.text = "Health: " + Math.floor(this.player.health);
            var textPosition = this.hudText.position;
            textPosition[0] = this.protolib.width / 2;
            textPosition[1] = this.viewport.top;
            this.hudText.scale = textScaleFactor;
            this.protolib.drawText(this.hudText);

            this.protolib.draw3DSprite({
                texture: "../assets/textures/nightsky_gradient.png",
                v3Position: mathDevice.v3Build(0, 0, 1),
                size: 3
            });

            this.protolib.draw2DSprite({
                texture: this.platform.sprite.texture,
                position: this.platform.position,
                width: this.platform.width,
                height: this.platform.height
            });

            this.protolib.draw2DSprite({
                texture: this.player.sprite.texture,
                position: this.player.position,
                width: this.player.width,
                height: this.player.height
            });



            this.protolib.endFrame();
        }
    },
    destroy: function destroyFn() {
        if (this.protolib) {
            // Destruction code goes here
            this.protolib.destroy();
            this.protolib = null;
        }
    }
};

// Application constructor function
Application.create = function applicationCreateFn(params) {
    var app = new Application();
    app.protolib = params.protolib;
    if (!app.protolib) {
        console.error("Protolib could not be found");
        return null;
    }
    if (!app.init()) {
        app.protolib.utils.error("Protolib could not be initialized");
        return null;
    }
    return app;
};
