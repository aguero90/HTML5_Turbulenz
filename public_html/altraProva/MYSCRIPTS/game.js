
var Game = function () {

};
Game.prototype = {
    // PRIMO GRUPPO ( SENZA DIPENDENZE )
    stage: null,
    textureRectangles: null,
    controls: null,
    realTime: null,
    prevTime: null,
    // SECONDO GRUPPO
    graphicsDevice: null,
    mathDevice: null,
    soundDevice: null,
    requestHandler: null,
    draw2D: null, // dipende da graphicsDevice
    debug: null, // dipende da graphicsDevice
    sounds: null, // dipende da soundDevice
    fontManager: null, // dipende da graphicsDevice & requestHandler
    shaderManager: null, // dipende da graphicsDevice & requestHandler
    soundManager: null, // dipende da soundDevice & requestHandler
    // TERZO GRUPPO
    phys2D: null,
    world: null, // dipende da phys2D
    collisionUtils: null, // dipende da phys2D
    materials: null, // dipende da phys2D
    shapeUtils: null, // dipende da phys2D
    // QUARTO GRUPPO
    inputDevice: null,
    KeyCodes: null, // dipende da inputDevice
    // QUINTO GRUPPO ( POTREBBERO ESSERE INIZIALIZZATI DOPO LA init() )
    draw2DTexture: null,
    player: null,
    bonus: null,
    font: null,
    // SESTO GRUPPO ( ULTIME RIGHE )
    gameSession: null, // dipende da requestHandler, fa partire il caricamento degli assets
    intervalID: null, // fa partire il loadingLoop
    backgroundTexture: null,
    // INIZIO FUNZIONI
    // =======================================================================
    init: function () {
        // PRIMO GRUPPO ( SENZA ALCUNA DIPENDENZA )
        this.stage = {
            width: 30,
            height: 20
        };
        this.textureRectangles = {
            circle: [130, 130, 255, 255],
            square: [5, 132, 125, 252],
            triangle: [131, 3, 251, 123],
            hexagon: [5, 5, 125, 125]
        };
        this.controls = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        this.realTime = 0;
        this.prevTime = TurbulenzEngine.time;
        // SECONDO GRUPPO
        this.graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
        this.mathDevice = TurbulenzEngine.createMathDevice({});
        this.soundDevice = TurbulenzEngine.createSoundDevice({});
        this.requestHandler = RequestHandler.create({});
        this.draw2D = Draw2D.create({
            graphicsDevice: this.graphicsDevice
        });
        this.draw2D.configure({
            viewportRectangle: [0, 0, this.stage.width, this.stage.height],
            scaleMode: 'scale'
        });
        this.sounds = {
            background: {
                sound: null,
                source: this.soundDevice.createSource({
                    position: [0, 0, 0],
                    relative: false,
                    looping: true,
                    pitch: 1.0
                })
            },
            bonus: {
                sound: null,
                source: this.soundDevice.createSource({
                    position: [0, 0, 0],
                    relative: false,
                    looping: false,
                    pitch: 1.0
                })
            }
        };
        this.fontManager = FontManager.create(this.graphicsDevice, this.requestHandler);
        this.shaderManager = ShaderManager.create(this.graphicsDevice, this.requestHandler);
        this.soundManager = SoundManager.create(this.soundDevice, this.requestHandler);
        // TERZO GRUPPO
        this.phys2D = Physics2DDevice.create();
        this.world = this.phys2D.createWorld({
            gravity: [0, 20]
        });
        this.collisionUtils = this.phys2D.createCollisionUtils();
        this.materials = {
            rubber: this.phys2D.createMaterial({
                elasticity: 0.9,
                staticFriction: 6,
                dynamicFriction: 4,
                rollingFriction: 0.001
            }),
            heavy: this.phys2D.createMaterial({
                density: 3
            }),
            conveyorBelt: this.phys2D.createMaterial({
                elasticity: 0,
                staticFriction: 10,
                dynamicFriction: 8,
                rollingFriction: 0.1
            }),
            border: this.phys2D.createMaterial({
                elasticity: 0,
                staticFriction: 0,
                dynamicFriction: 0 // in questo modo il corpo scivola anzichè "impuntarsi"
            }),
            platform: this.phys2D.createMaterial({
                elasticity: 0,
                dynamicFriction: 0
            })
        };
        this.shapeUtils = {};
        this.shapeUtils.size = 0.8;
        this.shapeUtils.factory = {
            circle: this.phys2D.createCircleShape({
                radius: (this.shapeUtils.size / 2),
                material: this.materials.rubber
            }),
            square: this.phys2D.createPolygonShape({
                vertices: this.phys2D.createBoxVertices(this.shapeUtils.size, this.shapeUtils.size),
                material: this.materials.platform
            }),
            triangle: this.phys2D.createPolygonShape({
                sensor: true, // in questo modo la "corsa" del player non viene intaccata dal bonus
                vertices: this.phys2D.createRegularPolygonVertices(this.shapeUtils.size, this.shapeUtils.size, 3),
                material: this.materials.heavy
            }),
            hexagon: this.phys2D.createPolygonShape({
                vertices: this.phys2D.createRegularPolygonVertices(this.shapeUtils.size, this.shapeUtils.size, 6),
                material: this.materials.heavy
            })
        };
        // QUARTO GRUPPO
        this.inputDevice = TurbulenzEngine.createInputDevice({});
        this.keyCodes = this.inputDevice.keyCodes;
        this.inputDevice.addEventListener('keyup', this._onKeyUp.bind(this));
        this.inputDevice.addEventListener('keydown', this._onKeyDown.bind(this));
        // QUINTO GRUPPO ( POTREBBERO ESSERE INIZIALIZZATI DOPO LA init() )
        this.draw2DTexture = null;
        this.player = null;
        this.bonus = null;
        this.font = {
            object: null,
            technique: null,
            techniqueParameters: null
        };
        // SESTO GRUPPO ( ULTIME RIGHE )
        this.gameSession = TurbulenzServices.createGameSession(this.requestHandler, this.sessionCreated.bind(this));
        this.intervalID = TurbulenzEngine.setInterval(this.loadingLoop.bind(this), 10); /* <ED È QUI CHE PARTE IL LOOP DI CARICAMENTO> */
    },
    sessionCreated: function () {
        var that = this;
        TurbulenzServices.createMappingTable(this.requestHandler, this.gameSession, function (table) {
            var urlMapping = table.urlMapping;
            var assetPrefix = table.assetPrefix;
            // Remapping
            that.shaderManager.setPathRemapping(urlMapping, assetPrefix);
            that.fontManager.setPathRemapping(urlMapping, assetPrefix);
            // Load
            that.fontManager.load('fonts/hero.fnt', function (fontObject) {
                that.font.object = fontObject;
            });
            that.shaderManager.load('shaders/font.cgfx', function (shaderObject) {
                that.shader = shaderObject;
            });

            var soundURL;
            if (that.soundDevice.isSupported("FILEFORMAT_OGG")) {
                soundURL = table.getURL("sounds/backgroundSound.ogg");
            } else {
                soundURL = table.getURL("sounds/backgroundSound.mp3");
            }

            that.soundManager.load(soundURL, true, function (sound) {
                that.sounds.background.sound = sound;
            });

            if (that.soundDevice.isSupported("FILEFORMAT_OGG")) {
                soundURL = table.getURL("sounds/bonusSound.ogg");
            } else {
                soundURL = table.getURL("sounds/bonusSound.mp3");
            }

            that.soundManager.load(soundURL, true, function (sound) {
                that.sounds.bonus.sound = sound;
            });

            that.graphicsDevice.createTexture({
                src: table.getURL("textures/physics2d.png"),
                mipmaps: true,
                onload: function (texture) {
                    if (texture) {
                        that.draw2DTexture = texture;
                    }
                }
            });
            that.graphicsDevice.createTexture({
                src: table.getURL("textures/texfxbg.png"),
                mipmaps: true,
                onload: function (texture) {
                    if (texture) {
                        that.backgroundTexture = texture;
                    }
                }
            });
        });
    },
    loadingLoop: function () {
        if (this.draw2DTexture && this.font.object &&
                this.shader && this.sounds.background.sound
                && this.sounds.bonus.sound) {

            this.reset();
            this.font.technique = this.shader.getTechnique('font');
            this.font.techniqueParameters = this.graphicsDevice.createTechniqueParameters({
                clipSpace: this.mathDevice.v4BuildZero(),
                alphaRef: 0.01,
                color: this.mathDevice.v4BuildOne()
            });
            this.sounds.background.source.play(this.sounds.background.sound);
            TurbulenzEngine.clearInterval(this.intervalID);
            this.intervalID = TurbulenzEngine.setInterval(this.mainLoop.bind(this), 1000 / 60);
        }
    },
    reset: function () {
        this.world.addRigidBody(this._createBorder(0.001));
        this.world.addRigidBody(this._createPlatform(0, this.stage.height - 0.5, this.stage.width, this.stage.height));
        this.world.addRigidBody(this._createPlatform(7, 5, 18, 5.5));
        this.world.addRigidBody(this._createPlatform(20, 9, 30, 9.5));
        this.world.addRigidBody(this._createPlatform(0, 10, 7, 10.5));
        this.world.addRigidBody(this._createPlatform(12, 13, 20, 13.5));
        this.world.addRigidBody(this._createPlatform(2, 17, 10, 17.5));
        this.world.addRigidBody(this._createPlatform(18, 17, 25, 17.5));
        this.world.addRigidBody(this._createPlayer());
        this.world.addRigidBody(this._createBonus());
    },
    mainLoop: function () {
        if (!this.graphicsDevice.beginFrame()) {
            return;
        }

        this.inputDevice.update();
        this.graphicsDevice.clear([0.3, 0.3, 0.3, 1.0]);
//        In questo modo implementiamo una camera che segue il player
//
//        var playerPos = this.player.body.getPosition();
//        this.draw2D.configure({
//            viewportRectangle: [playerPos[0] - 10, 0, playerPos[0] + 10, this.stage.height],
//            scaleMode: 'scale'
//        });

        var curTime = TurbulenzEngine.time;
        var timeDelta = (curTime - this.prevTime);
        if (timeDelta > (1 / 20)) {
            timeDelta = (1 / 20);
        }
        this.realTime += timeDelta;
        this.prevTime = curTime;
        while (this.world.simulatedTime < this.realTime) {

            // per impedire il player che rotoli
            this.player.body.setRotation(0);
            this.player.body.setAngularVelocity(0);

            if (!this.bonus.body) {
                this.world.addRigidBody(this._createBonus());
            } else if (curTime - this.bonus.timeCreated > 5) {
                // se non lo prendo in 5 secondi
                // lo distruggo
                this.world.removeRigidBody(this.bonus.body);
                this.bonus.body = null;
            }

            // input control
            if (this.controls.right) {
                var vel = this.player.body.getVelocity();
                this.player.body.setVelocity([7, vel[1]]);
            } else if (this.controls.left) {
                var vel = this.player.body.getVelocity();
                this.player.body.setVelocity([-7, vel[1]]);
            } else {
                var vel = this.player.body.getVelocity();
                this.player.body.setVelocity([0, vel[1]]);
            }

            if (this.controls.down) {
                this.player.body.setVelocity([0, 25]);
            }

            this.world.step(1 / 60);
        }

//      Questo codice disegna lo sfondo
//
//        this.draw2D.begin();
//        this.draw2D.draw({
//            texture: this.backgroundTexture,
//            destinationRectangle: [0, 0, this.stage.width, this.stage.height]
//        });
//        this.draw2D.end();

        // Draw Font
        this.graphicsDevice.setTechnique(this.font.technique);
        this.font.techniqueParameters.clipSpace = this.mathDevice.v4Build(2 / this.graphicsDevice.width, -2 / this.graphicsDevice.height, -1, 1, this.font.techniqueParameters.clipSpace);
        this.graphicsDevice.setTechniqueParameters(this.font.techniqueParameters);
        this._drawFont(1, 1, "Score: " + this.player.score, 0.75);
        // draw2D sprite drawing.
        var bodies = this.world.rigidBodies;
        var limit = bodies.length;
        var i, body;
        this.draw2D.begin('alpha', 'deferred');
        var pos = [];
        for (i = 0; i < limit; i += 1) {
            body = bodies[i];
            if (body.userData) {
                body.getPosition(pos);
                var sprite = body.userData;
                sprite.x = pos[0];
                sprite.y = pos[1];
                sprite.rotation = body.getRotation();
                this.draw2D.drawSprite(sprite);
            }
        }
        this.draw2D.end();
        this.graphicsDevice.endFrame();
    },
    _createBorder: function (thickness) {
        return this.phys2D.createRigidBody({
            type: 'static',
            shapes: [
                this.phys2D.createPolygonShape({
                    // bordo sinistro
                    vertices: this.phys2D.createRectangleVertices(0, 0, thickness, this.stage.height),
                    material: this.materials.border
                }),
                this.phys2D.createPolygonShape({
                    // bordo superiore
                    vertices: this.phys2D.createRectangleVertices(0, 0, this.stage.width, thickness),
                    material: this.materials.border
                }),
                this.phys2D.createPolygonShape({
                    // bordo destro
                    vertices: this.phys2D.createRectangleVertices((this.stage.width - thickness), 0, this.stage.width, this.stage.height),
                    material: this.materials.border
                }),
                this.phys2D.createPolygonShape({
                    // bordo inferiore
                    // solo nel bordo inferore devono comportarsi normalmente gli oggetti => niente material
                    vertices: this.phys2D.createRectangleVertices(0, (this.stage.height - thickness), this.stage.width, this.stage.height)
                })
            ]
        });
    },
    _createPlatform: function (x1, y1, x2, y2) {

        var platform = new Platform();
        platform.init(this);
        platform.create(x1, y1, x2, y2);
        return platform.body;
//        var shapes = [
//            this.phys2D.createPolygonShape({
//                vertices: this.phys2D.createRectangleVertices(x1, y1, x2, y2),
//                material: this.materials.conveyorBelt
//            })
//        ];
//
//        var platform = this.phys2D.createRigidBody({
//            type: 'static',
//            shapes: shapes
//        });
//
//        platform.isPlatform = true;
//        platform.top = y1;
//        platform.bottom = y2;
//        platform.right = x2;
//        platform.left = x1;
//
//
//        return platform;
    },
    _createPlayer: function () {

        this.player = new Player();
        this.player.init(this);
        this.player.create();
        return this.player.body;
// CODICE FUNZIONANTE SENZA UN FILE APPOSITO PER "player"
// SE SI DECIDE DI TORNARE A QUESTO CODICE CAMBIARE TUTTI I
// player.body con player
//
//        this.player = this.phys2D.createRigidBody({
//            shapes: [this.shapeUtils.factory.square.clone()],
//            position: [this.stage.width / 2, this.stage.height / 2],
//            userData: Draw2DSprite.create({
//                width: this.shapeUtils.size,
//                height: this.shapeUtils.size,
//                origin: [this.shapeUtils.size / 2, this.shapeUtils.size / 2],
//                textureRectangle: this.textureRectangles.square,
//                texture: this.draw2DTexture
//            })
//        });
//
//        this.player.score = 0;
//        this.player.isJumping = false;
//
//        var that = this;
//
//        this.player.shapes[0].addEventListener("begin", function (arbiter, shape) {
//
//            // NOTA: qui il this è riferito al player
//
//            if (shape.body.isBonus) {
//                that.player.score += 10;
//                that.world.removeRigidBody(that.bonus);
//                that.bonus = null;
//            } else if (arbiter.bodyA.isPlatform || arbiter.bodyA.isFloor) {
//                // in questo if uso arbiter.bodyA
//                // perchè le piattaforme non hanno shape xD
//                var contactPosition = arbiter.contacts[0].getPosition();
//
//                // console.log(arbiter.bodyA);
//                // console.log(contactPosition);
//
//                if (contactPosition[1] - arbiter.bodyA.top <= 0.1) {
//                    that.player.isJumping = false;
//                }
//            }
//
//        });
//
//        return this.player;
    },
    _createBonus: function () {

        this.bonus = new Bonus();
        this.bonus.init(this);
        this.bonus.create();
        return this.bonus.body;
//        this.bonus = this.phys2D.createRigidBody({
//            type: "static",
//            shapes: [this.shapeUtils.factory.triangle.clone()],
//            position: this._getBonusPosition(),
//            userData: Draw2DSprite.create({
//                width: this.shapeUtils.size,
//                height: this.shapeUtils.size,
//                origin: [this.shapeUtils.size / 2, this.shapeUtils.size / 2],
//                textureRectangle: this.textureRectangles.triangle,
//                texture: this.draw2DTexture
//            })
//        });
//
//        this.bonus.isBonus = true;
//        this.bonus.createdBonusTime = TurbulenzEngine.time; /* <LA PRIMA VOLTA POTREBBE SCOMPARIRE SUBITO> */
//
//        return this.bonus;
    },
    _getBonusPosition: function () {
        var isGood = false;
        var result;
        var tempPoint = {};
        var i;
        while (!isGood) {

            result = [Math.random() * this.stage.width, Math.random() * this.stage.height];
            tempPoint.topLeft = [result[0] - this.shapeUtils.size / 2, result[1] - this.shapeUtils.size / 2];
            tempPoint.topRight = [result[0] + this.shapeUtils.size / 2, result[1] - this.shapeUtils.size / 2];
            tempPoint.bottomLeft = [result[0] - this.shapeUtils.size / 2, result[1] + this.shapeUtils.size / 2];
            tempPoint.bottomRight = [result[0] + this.shapeUtils.size / 2, result[1] + this.shapeUtils.size / 2];
            for (i = 0; i < this.world.rigidBodies.length; i++) {
                if (this.collisionUtils.containsPoint(this.world.rigidBodies[i].shapes[0], tempPoint.topLeft)
                        || this.collisionUtils.containsPoint(this.world.rigidBodies[i].shapes[0], tempPoint.topRight)
                        || this.collisionUtils.containsPoint(this.world.rigidBodies[i].shapes[0], tempPoint.bottomLeft)
                        || this.collisionUtils.containsPoint(this.world.rigidBodies[i].shapes[0], tempPoint.bottomRight)) {
                    break;
                }
            }

            if (i >= this.world.rigidBodies.length) {
                isGood = true;
            }
        }

        return result;
    },
    _drawFont: function (x, y, text, height) {
        var topLeft = this.draw2D.viewportUnmap(x, y);
        var bottomRight = this.draw2D.viewportUnmap(x, y + height);
        this.font.object.drawTextRect(text, {
            rect: [topLeft[0], topLeft[1], bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]]
        });
    },
    _onKeyUp: function (keynum) {
        switch (keynum) {
            case this.keyCodes.R:
                reset();
                break;
            case this.keyCodes.RIGHT:
                this.controls.right = false;
                break;
            case this.keyCodes.LEFT:
                this.controls.left = false;
                break;
            case this.keyCodes.UP:
                this.controls.up = false;
                break;
            case this.keyCodes.DOWN:
                this.controls.down = false;
                break;
        }
    },
    _onKeyDown: function (keynum) {
        switch (keynum) {
            case this.keyCodes.RIGHT:
                this.controls.right = true;
                break;
            case this.keyCodes.LEFT:
                this.controls.left = true;
                break;
            case this.keyCodes.DOWN:
                this.controls.down = true;
                break;
            case this.keyCodes.UP:
                this.controls.up = true;
                if (!this.player.isJumping) {
                    this.player.body.setVelocity([0, -16]);
                    this.player.isJumping = true;
                }
                break;
        }
    }

};


