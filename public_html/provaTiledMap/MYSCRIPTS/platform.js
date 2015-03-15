
var Platform = function () {
};

Platform.prototype = {
    game: null,
    shapes: null,
    sprite: null,
    body: null,
    init: function (game) {
        this.game = game;
    },
    create: function (x1, y1, x2, y2) {
        this.shapes = [
            this.game.phys2D.createPolygonShape({
                vertices: this.game.phys2D.createBoxVertices(x2 - x1, y2 - y1),
                material: this.game.materials.platform
            })
        ];

        this.sprite = Draw2DSprite.create({
            width: x2 - x1,
            height: y2 - y1,
            texture: null
        });

        this.body = this.game.phys2D.createRigidBody({
            type: 'static',
            shapes: this.shapes,
            position: [x1 + ((x2 - x1) / 2), y1 + ((y2 - y1) / 2)],
            userData: this.sprite
        });

        this.body.isPlatform = true;
        this.body.top = y1;
        this.body.bottom = y2;
        this.body.right = x2;
        this.body.left = x1;
    }
};

