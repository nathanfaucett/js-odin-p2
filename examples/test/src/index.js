var odin = require("odin"),
    odinP2 = require("../../../src/index");


function PlayerControl() {
    odin.Component.call(this);

    this.force = [0, 0];
}
odin.Component.extend(PlayerControl, "test.PlayerControl");

PlayerControl.prototype.update = function() {
    var entity = this.entity,
        rigidbody = entity.components["odin.p2.RigidBody"],
        input = entity.scene.input,
        force = this.force;

    force[0] = input.axis("horizontal") * 10;
    force[1] = input.axis("vertical") * 10;

    rigidbody.applyForce(force);
};


var assets = odin.Assets.create(),
    canvas = odin.Canvas.create({
        disableContextMenu: false,
        aspect: 1.5,
        keepAspect: true
    }),
    renderer = odin.Renderer.create();

var shader = odin.Shader.create(
    [
        "void main(void) {",
        "    gl_Position = perspectiveMatrix * modelViewMatrix * getPosition();",
        "}"
    ].join("\n"), [
        "uniform vec3 color;",

        "void main(void) {",
        "    gl_FragColor = vec4(color, 1.0);",
        "}"
    ].join("\n")
);

var material0 = odin.Material.create("mat_box0", null, {
    shader: shader,
    uniforms: {
        color: [1, 0, 0]
    }
});

var material1 = odin.Material.create("mat_box1", null, {
    shader: shader,
    uniforms: {
        color: [0, 1, 0]
    }
});

assets.addAsset(material0, material1);

var camera = global.camera = odin.Entity.create("main_camera").addComponent(
    odin.Transform.create()
        .setPosition([0, -1, 10]),
    odin.Camera.create()
        .setOrthographic(true)
        .setOrthographicSize(5)
        .setActive(),
    odin.OrbitControl.create()
);

var rigidbody = odinP2.RigidBody.create({
    mass: 0
});

rigidbody.body.addShape(new odinP2.p2.Rectangle(1.0, 1.0));

var sprite = odin.Entity.create().addComponent(
    odin.Transform2D.create(),
    odin.Sprite.create({
        material: material0
    }),
    rigidbody
);

var rigidbody2 = odinP2.RigidBody.create({
    mass: 1
});

rigidbody2.body.addShape(new odinP2.p2.Rectangle(1.0, 1.0));

var sprite2 = odin.Entity.create().addComponent(
    odin.Transform2D.create()
        .setPosition([0, 5, 0]),
    odin.Sprite.create({
        material: material1
    }),
    PlayerControl.create(),
    rigidbody2
);

var p2Pluigin = odinP2.Plugin.create({
    gravity: [0.0, -1.0]
});

var scene = global.scene = odin.Scene.create("scene")
        .addPlugin(p2Pluigin)
        .addEntity(camera, sprite, sprite2),
    cameraComponent = camera.getComponent("odin.Camera");

scene.assets = assets;

canvas.on("resize", function(w, h) {
    cameraComponent.set(w, h);
});
cameraComponent.set(canvas.pixelWidth, canvas.pixelHeight);

renderer.setCanvas(canvas.element);

var loop = odin.createLoop(function() {
    scene.update();
    renderer.render(scene, cameraComponent);
}, canvas.element);

assets.load(function() {
    scene.init(canvas.element);
    scene.awake();
    loop.run();
});
