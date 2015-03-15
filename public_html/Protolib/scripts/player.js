
var Player = function (viewWidth, viewHeight, phys2D, world) {

    this.width = 1;
    this.height = 1;
    this.position = [viewWidth / 2, viewHeight / 2];
    this.shape = phys2D.createPolygonShape({vertices: phys2D.createBoxVertices(this.width, this.height)});

    this.rigidBody = phys2D.createRigidBody({
        type: 'dynamic',
        // type: 'kinematic',
        shapes: [this.shape],
        position: this.position
    });
    world.addRigidBody(this.rigidBody);
    this.sprite = {
        texture: "../assets/textures/Goomba.png",
        position: [this.position[0] - this.width / 2, this.position[1] - this.height / 2],
        width: this.width,
        height: this.height,
        rotation: this.rigidBody.getRotation()
    };
    this.velocity = [0, 0];
    this.health = 100;

    this.shape.addEventListener('begin', function (arbiter, shape) {
        this.health -= shape.body.getInertia() * 10;
    });
};

