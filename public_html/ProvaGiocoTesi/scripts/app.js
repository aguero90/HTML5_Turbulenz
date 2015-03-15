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
        var protolib = this.protolib;
        var version = protolib.version;
        var requiredVersion = [0, 2, 1];

        if (version === undefined ||
                version[0] !== requiredVersion[0] ||
                version[1] !== requiredVersion[1] ||
                version[2] !== requiredVersion[2]) {

            protolib.utils.error("Protolib is not requiredVersion");
            return false;
        }

        // carichiamo i device di cui abbiamo bisogno
        var mathDevice = protolib.getMathDevice();
        var graphicsDevice = protolib.getGraphicsDevice();
        var inputDevice = protolib.getInputDevice();
        var draw2D = protolib.globals.draw2D;

        protolib.setClearColor(mathDevice.v3Build(0.3, 0.3, 0.3));

        // Initialization code goes here

        var viewWidth = this.viewWidth = 20;
        var viewHeight = this.viewHeight = 10;
        var viewportRectangle = [0, 0, viewWidth, viewHeight];

        var phys2D = this.phys2D = Physics2DDevice.create();

        draw2D.configure({viewportRectangle: viewportRectangle, scaleMode: 'scale'});

        var world = this.world = phys2D.createWorld({gravity: [-1, 0]});

// NEMICI
// ============================================================================================================================
// ============================================================================================================================

        var boxCount = this.boxCount = 0;
        var boxes = this.boxes = [];
        var boxSize;
        var newBox;

        for (var i = 0; i < boxCount; i++) {
            boxSize = 0.5 + Math.random() * 0.7;
            newBox = {
                width: boxSize,
                height: boxSize,
                position: [20 + (i * 10) + Math.random() * 7, Math.random() * viewHeight]
            };
            newBox.shape = phys2D.createPolygonShape({vertices: phys2D.createBoxVertices(newBox.width, newBox.height)});
            newBox.rigidBody = phys2D.createRigidBody({
                type: 'dynamic',
                shapes: [newBox.shape],
                position: newBox.position,
                rotation: Math.PI * 2 * Math.random()
            });
            world.addRigidBody(newBox.rigidBody);
            newBox.sprite = {
                texture: "textures/crate.jpg",
                position: [newBox.position[0] - newBox.width / 2, newBox.position[1] - newBox.height / 2],
                width: newBox.width,
                height: newBox.height,
                rotation: newBox.rigidBody.getRotation()
            };
            boxes[i] = newBox;
        }

// PLAYER
// ============================================================================================================================
// ============================================================================================================================

        var player = this.player = {
            width: 1,
            height: 1,
            position: [viewWidth / 2, viewHeight / 2]
        };
        player.shape = phys2D.createPolygonShape({vertices: phys2D.createBoxVertices(player.width, player.height)});
        player.rigidBody = phys2D.createRigidBody({
            // type: 'dynamic',
            type: 'kinematic',
            shapes: [player.shape],
            position: player.position
        });
        world.addRigidBody(player.rigidBody);
        player.sprite = {
            texture: "textures/Goomba.png",
            position: [player.position[0] - player.width / 2, player.position[1] - player.height / 2],
            width: player.width,
            height: player.height,
            rotation: player.rigidBody.getRotation()
        };
        player.velocity = [0, 0];



        var that = this;
        this.touchPositionX = 0;
        this.touchPositionY = 0;
        that.touchID = null;
        that.touchCount = 0;

        this.touchPosition = [player.position[0], player.position[1]];
        inputDevice.addEventListener('touchstart', function (touchEvent) {

            var changedTouches = touchEvent.changedTouches;
            var touch;
            for (var i = 0; i < changedTouches.length; i++) {
                touch = changedTouches[i];
                if (that.touchID === null && touch.isGameTouch) {
                    that.touchID = touch.identifier;
                    draw2D.viewportMap(touch.positionX, touch.positionY, that.touchPosition);
                    that.touchCount += 1;
                }
            }
        });
        inputDevice.addEventListener('touchmove', function (touchEvent) {
            var changedTouches = touchEvent.changedTouches;
            var touch;
            for (var i = 0; i < changedTouches.length; i++) {
                touch = changedTouches[i];
                if (that.touchID === touch.identifier) {
                    draw2D.viewportMap(touch.positionX, touch.positionY, that.touchPosition);
                }
            }
        });

        function touchStop(touchEvent) {
            var changedTouches = touchEvent.changedTouches;
            var touch;
            for (var i = 0; i < changedTouches.length; i += 1) {
                touch = changedTouches[i];
                if (that.touchID === touch.identifier) {
                    that.touchID = null;
                    that.touchPosition[0] = that.player.position[0];
                    that.touchPosition[1] = that.player.position[1];
                }
            }
        }
        inputDevice.addEventListener('touchend', touchStop);
        inputDevice.addEventListener('touchleave', touchStop);


        player.health = 100;
        player.shape.addEventListener('begin', function (arbiter, shape) {
            player.health -= shape.body.getInertia() * 10;
        });
        // FINE PLAYER


        protolib.setNearFarPlanes(0.1, 1000);
        protolib.setCameraPosition(mathDevice.v3Build(0, 0, -1));
        protolib.setCameraDirection(mathDevice.v3Build(0, 0, 1));
        protolib.setAmbientLightColor(mathDevice.v3Build(1, 1, 1));

        var viewport = this.viewport = {
            top: 0,
            bottom: protolib.height,
            left: 0,
            right: protolib.width,
            width: protolib.width,
            height: protolib.height
        };
        protolib.setPreDraw(function preDrawFn() {
            var x = draw2D.scissorX;
            var y = draw2D.scissorY;
            var width = draw2D.scissorWidth;
            var height = draw2D.scissorHeight;
            graphicsDevice.setViewport(x, y, width, height);
            graphicsDevice.setScissor(x, y, width, height);
            viewport.top = y;
            viewport.bottom = y + height;
            viewport.left = x;
            viewport.right = x + width;
            viewport.width = width;
            viewport.height = height;
        });

        protolib.setPostRendererDraw(function postRendererDrawFn() {
            graphicsDevice.setViewport(0, 0, protolib.width, protolib.height);
            graphicsDevice.setScissor(0, 0, protolib.width, protolib.height);
        });

        protolib.setPostDraw(function postDrawFn() {
        });

        this.realTime = 0;

// TEXT
// ============================================================================================================================
// ============================================================================================================================

        this.white = mathDevice.v3Build(1, 1, 1);
        var baseTextSize = this.baseTextSize = 5;
        var baseHeight = this.baseHeight = 720;
        var textScaleFactor = this.textScaleFactor = baseTextSize * (baseHeight / viewport.height);
        this.hudText = {
            text: "Health: " + Math.floor(player.health) + ", Boxes: " + boxCount,
            position: [protolib.width / 2, viewport.top],
            scale: textScaleFactor,
            v3Color: this.white,
            verticalAlign: protolib.textVerticalAlign.TOP
        };

        this.gameOverText = {
            text: "Game Over!",
            position: [protolib.width / 2, protolib.height / 2],
            scale: textScaleFactor * 1.5,
            v3Color: this.white
        };

        this.survivedText = {
            text: "You survived!",
            position: [protolib.width / 2, protolib.height / 2],
            scale: textScaleFactor * 1.5,
            v3Color: this.white
        };

        return true;
    },
    reset: function resetFn() {
        var phys2D = this.phys2D;
        var boxList = this.boxes;
        var boxRigidBody, box;
        var world = this.world;
        boxList.push(this.box);
        var boxListLength = this.boxCount = boxList.length;
        for (var i = 0; i < boxListLength; i += 1) {
            box = boxList[i];
            box.avoided = false;
            boxRigidBody = box.rigidBody;
            if (boxRigidBody) {
                world.removeRigidBody(boxRigidBody);
            }
            box.position = [20 + (i * 10) + Math.random() * 7, Math.random() * this.viewHeight];
            boxRigidBody = phys2D.createRigidBody({
                type: 'dynamic',
                shapes: [box.shape],
                position: box.position,
                rotation: Math.PI * 2 * Math.random()
            });
            world.addRigidBody(boxRigidBody);
            box.rigidBody = boxRigidBody;
        }
        boxList.length = boxList.length - 1;

        var player = this.player;
        player.velocity[0] = 0;
        player.velocity[1] = 0;
        player.position[0] = this.touchPosition[0] = this.viewWidth / 2;
        player.position[1] = this.touchPosition[1] = this.viewHeight / 2;
        world.removeRigidBody(player.rigidBody);
        player.rigidBody = phys2D.createRigidBody({
            type: 'kinematic',
            shapes: [player.shape],
            position: player.position
        });
        world.addRigidBody(player.rigidBody);

        player.health = 100;
    },
    update: function updateFn() {
        var protolib = this.protolib;
        var mathDevice = protolib.getMathDevice();
        var delta = protolib.time.app.delta;
        var world = this.world;

        if (protolib.beginFrame()) {
            // Update code goes here
            if (protolib.isKeyJustDown(protolib.keyCodes.RETURN)) {
                this.reset();
                protolib.endFrame();
                return;
            }
            var textScaleFactor = this.baseTextSize * (this.viewport.height / this.baseHeight);
            var text = null;
            if (this.player.health < 0) {
                text = this.gameOverText;
            } else if (this.boxCount <= -1) {
                text = this.survivedText;
            }

            if (text) {
                if (this.lastTouchCount !== this.touchCount) {
                    this.reset();
                    protolib.endFrame();
                    return;
                }

                text.position[0] = protolib.width / 2;
                text.position[1] = protolib.height / 2;
                text.scale = textScaleFactor * 1.5;
                protolib.drawText(text);
                protolib.endFrame();
                return;
            }

            this.realTime += delta;

            var keySpeedX = 6;
            var keySpeedY = 3;
            var keyDown = false;

            var playerPosition = this.player.position;
            var playerRigidBody = this.player.rigidBody;
            var playerVelocity = this.player.velocity;
            if (protolib.isKeyDown(protolib.keyCodes.UP)) {
                playerVelocity[1] = -keySpeedY;
                keyDown = true;
            }
            if (protolib.isKeyDown(protolib.keyCodes.DOWN)) {
                playerVelocity[1] = keySpeedY;
                keyDown = true;
            }
            if (protolib.isKeyDown(protolib.keyCodes.LEFT)) {
                playerVelocity[0] = -keySpeedX;
                keyDown = true;
            }
            if (protolib.isKeyDown(protolib.keyCodes.RIGHT)) {
                playerVelocity[0] = keySpeedX;
                keyDown = true;
            }

            var touchPosition = this.touchPosition;
            if (!keyDown) {
                playerVelocity[0] = touchPosition[0] - playerPosition[0];
                playerVelocity[1] = touchPosition[1] - playerPosition[1];
            }
            playerRigidBody.setVelocity(playerVelocity);
            this.lastTouchCount = this.touchCount;

            while (world.simulatedTime < this.realTime) {
                world.step(1 / 60);
            }

            playerRigidBody.getPosition(playerPosition);
            playerPosition[0] = protolib.utils.clamp(playerPosition[0], 1, this.viewWidth - 1);
            playerPosition[1] = protolib.utils.clamp(playerPosition[1], 1, this.viewHeight - 1);
            playerRigidBody.setPosition(playerPosition);
            if (keyDown) {
                touchPosition[0] = playerPosition[0];
                touchPosition[1] = playerPosition[1];
            }

            // Render code goes here
            var box = this.box;
            var sprite = box.sprite;
            var boxRigidBody = box.rigidBody;
            if (boxRigidBody) {
                boxRigidBody.getPosition(box.position);
                sprite.position[0] = box.position[0] - box.width / 2;
                sprite.position[1] = box.position[1] - box.height / 2;
                sprite.rotation = boxRigidBody.getRotation();

                protolib.draw2DSprite(sprite);
            }

            if (!box.avoided && box.position[0] < -5) {
                this.boxCount -= 1;
                box.avoided = true;

                world.removeRigidBody(boxRigidBody);
                box.rigidBody = null;
            }

            var boxes = this.boxes;
            var boxesLength = boxes.length;
            for (var i = 0; i < boxesLength; i += 1) {
                box = boxes[i];
                boxRigidBody = box.rigidBody;
                if (boxRigidBody) {
                    sprite = box.sprite;
                    boxRigidBody.getPosition(box.position);
                    sprite.position[0] = box.position[0] - box.width / 2;
                    sprite.position[1] = box.position[1] - box.height / 2;
                    sprite.rotation = boxRigidBody.getRotation();

                    protolib.draw2DSprite(sprite);
                }

                if (!box.avoided && box.position[0] < -5) {
                    this.boxCount -= 1;
                    box.avoided = true;

                    world.removeRigidBody(boxRigidBody);
                    box.rigidBody = null;
                }
            }

            this.hudText.text = "Health: " + Math.floor(this.player.health) + ", Boxes: " + this.boxCount;
            var textPosition = this.hudText.position;
            textPosition[0] = protolib.width / 2;
            textPosition[1] = this.viewport.top;
            this.hudText.scale = textScaleFactor;
            protolib.drawText(this.hudText);

            protolib.draw3DSprite({
                texture: "textures/nightsky_gradient.png",
                v3Position: mathDevice.v3Build(0, 0, 1),
                size: 2
            });

            protolib.endFrame();
        }
    },
    destroy: function destroyFn() {
        var protolib = this.protolib;
        if (protolib) {
            // Destruction code goes here
            protolib.destroy();
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
