

var Platform = function (width, height, position, phys2D, world) {

    this.width = width;
    this.height = height;
    this.position = position;

    this.shape = phys2D.createPolygonShape({
        vertices: phys2D.createRectangleVertices(
                position[0],
                position[1],
                position[0] + this.width,
                position[1] + this.height),
        material: phys2D.createMaterial({density: 3})
    });

    this.rigidBody = phys2D.createRigidBody({
        type: 'static',
//        type: "kinematic",
        shapes: [this.shape],
        position: this.position
    });
    world.addRigidBody(this.rigidBody);

    this.sprite = {
        texture: "../assets/textures/white.png",
        position: [this.position[0] - this.width / 2, this.position[1] - this.height / 2],
        width: this.width,
        height: this.height
    };
};


