
var Bonus = function () {
};

Bonus.prototype = {
    game: null,
    shapes: null,
    sprite: null,
    body: null,
    timeCreated: null,
    init: function (game) {
        this.game = game;
        this.shapes = [this.game.shapeUtils.factory.triangle.clone()];
        this.sprite = Draw2DSprite.create({
            width: this.game.shapeUtils.size,
            height: this.game.shapeUtils.size,
            origin: [this.game.shapeUtils.size / 2, this.game.shapeUtils.size / 2],
            textureRectangle: this.game.textureRectangles.triangle,
            texture: this.game.draw2DTexture
        });
    },
    create: function () {
        this.body = this.game.phys2D.createRigidBody({
            type: "static",
            shapes: this.shapes,
            position: [],
            userData: this.sprite
        });

        this._findGoodPosition();

        this.body.isBonus = true;

        this.timeCreated = TurbulenzEngine.time;
    },
    _findGoodPosition: function () {
        var isGood = false;
        var i;
        while (!isGood) {

            isGood = true;
            this.body.setPosition([Math.random() * this.game.stage.width, Math.random() * this.game.stage.height]);

            for (i = 0; i < this.game.world.rigidBodies.length; i++) { // per ogni corpo nel mondo
                for (var j = 0; j < this.game.world.rigidBodies[i].shapes.length; j++) { // per ogni shape assegnato al corpo
                    if (this.game.collisionUtils.intersects(this.game.world.rigidBodies[i].shapes[j], this.shapes[0])) {
                        isGood = false;
                    }
                }
            }
        }
    }
};


