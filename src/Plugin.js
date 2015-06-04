var odin = require("odin"),
    p2 = require("p2");


var OdinPlugin = odin.Plugin,
    OdinPluginPrototype = OdinPlugin.prototype,
    PluginPrototype;


module.exports = Plugin;


function Plugin() {
    var _this = this;

    OdinPlugin.call(this);

    this.world = new p2.World();

    this.update = Plugin_createUpdate(this);

    this.onAddP2RigidBody = function onAddP2RigidBody(component) {
        _this.world.addBody(component.body);
    };
    this.onRemoveP2RigidBody = function onRemoveP2RigidBody(component) {
        _this.world.removeBody(component.body);
    };
}
OdinPlugin.extend(Plugin, "odin.p2.Plugin");
PluginPrototype = Plugin.prototype;

PluginPrototype.construct = function construct(options) {
    var world;

    OdinPluginPrototype.construct.call(this);

    if (options) {
        world = this.world;

        if (options.gravity) {
            world.gravity = options.gravity;
        }
        if (options.broadphase) {
            world.broadphase = options.broadphase;
        }
        if (options.solver) {
            world.solver = options.solver;
        }
        world.islandSplit = !!options.islandSplit;
        world.doProfiling = !!options.doProfiling;
    }

    return this;
};

PluginPrototype.clear = function clear(emitEvent) {
    var world = this.world,
        scene = this.scene;

    OdinPluginPrototype.clear.call(this, emitEvent);

    world.off("beginContact", emitP2Event);
    world.off("endContact", emitP2Event);
    world.off("impact", emitP2Event);

    scene.off("add-odin.p2.RigidBody", this.onAddP2RigidBody);
    scene.off("remove-odin.p2.RigidBody", this.onRemoveP2RigidBody);

    return this;
};

PluginPrototype.init = function init() {
    var world = this.world,
        scene = this.scene;

    OdinPluginPrototype.init.call(this);

    world.on("beginContact", emitP2Event);
    world.on("endContact", emitP2Event);
    world.on("impact", emitP2Event);

    scene.on("add-odin.p2.RigidBody", this.onAddP2RigidBody);
    scene.on("remove-odin.p2.RigidBody", this.onRemoveP2RigidBody);

    return this;
};

function emitP2Event(event) {
    var type = event.type,
        rigidbodyA = event.bodyA.data,
        rigidbodyB = event.bodyB.data;

    event.rigidbodyA = rigidbodyA;
    event.rigidbodyB = rigidbodyB;

    rigidbodyA.emit(type, event);
    rigidbodyB.emit(type, event);
}

function Plugin_createUpdate(_this) {
    var accumulator = 0.0;

    return function update() {
        var world = _this.world,
            time = _this.scene.time,
            step = time.fixedDelta;

        OdinPluginPrototype.update.call(_this);

        accumulator += time.delta;

        while (accumulator >= step) {
            world.step(step);
            accumulator -= step;
        }

        return _this;
    };
}
