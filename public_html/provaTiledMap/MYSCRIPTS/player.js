
var Player = function () {

};

Player.prototype = {
    game: null,
    shapes: null,
    sprite: null,
    body: null,
    isJumping: null,
    score: null,
    init: function (game) {
        this.game = game;
        this.shapes = [this.game.shapeUtils.factory.square.clone()];
        this.sprite = Draw2DSprite.create({
            width: this.game.shapeUtils.size,
            height: this.game.shapeUtils.size,
            origin: [this.game.shapeUtils.size / 2, this.game.shapeUtils.size / 2],
            textureRectangle: this.game.textureRectangles.square,
            texture: this.game.draw2DTexture
        });
        this.isJumping = false;
        this.score = 0;
    },
    create: function () {
        this.body = this.game.phys2D.createRigidBody({
            shapes: this.shapes,
            position: [this.game.stage.width / 2, this.game.stage.height / 2],
            userData: this.sprite
        });


        var that = this;
        this.shapes[0].addEventListener("begin", function (arbiter, shape) {

            // NOTA: qui il this è riferito al player
            if (shape.body.isBonus) {
                that.score += 10;
                that.game.world.removeRigidBody(that.game.bonus.body);
                that.game.bonus.body = null;
            } else if (arbiter.bodyA.isPlatform || arbiter.bodyA.isFloor) {
                // in questo if uso arbiter.bodyA
                // perchè le piattaforme non hanno shape xD
                var contactPosition = arbiter.contacts[0].getPosition();

                // console.log(arbiter.bodyA);
                // console.log(contactPosition);

                if (contactPosition[1] - arbiter.bodyA.top <= 0.1) {
                    that.isJumping = false;
                }
            }

        });
    }


};


