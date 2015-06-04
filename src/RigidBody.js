var odin = require("odin"),
    vec2 = require("vec2"),
    vec3 = require("vec3"),
    quat = require("quat"),
    p2 = require("p2");


var Component = odin.Component,
    ComponentPrototype = Component.prototype,
    RigidBodyPrototype;


module.exports = RigidBody;


function RigidBody() {

    Component.call(this);

    this.body = null;
}
Component.extend(RigidBody, "odin.p2.RigidBody");
RigidBodyPrototype = RigidBody.prototype;

RigidBodyPrototype.construct = function(options) {

    ComponentPrototype.construct.call(this);

    this.body = new p2.Body(options);

    return this;
};

RigidBodyPrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    this.body = null;

    return this;
};

RigidBodyPrototype.awake = function() {
    var body = this.body,
        components = this.entity.components,
        transform2d = components["odin.Transform2D"],
        transform;

    ComponentPrototype.awake.call(this);

    if (transform2d) {
        vec2.copy(body.position, transform2d.position);
        body.angle = transform2d.rotation;
    } else {
        transform = components["odin.Transform"];
        vec3.copy(body.position, transform.position);
        body.angle = quat.rotationZ(transform.rotation);
    }

    body.data = this;
};

var update_zaxis = vec3.create(0.0, 0.0, 1.0);
RigidBodyPrototype.update = function() {
    var body = this.body,
        components = this.entity.components,
        transform = components["odin.Transform"],
        transform2d = components["odin.Transform2D"];

    if (transform) {
        vec3.copy(transform.position, body.position);
        quat.fromAxisAngle(transform.rotation, update_zaxis, body.angle);
    } else if (transform2d) {
        vec2.copy(transform2d.position, body.position);
        transform2d.rotation = body.angle;
    }
};

RigidBodyPrototype.applyForce = function(force, worldPoint) {
    var components = this.entity.components;
    this.body.applyForce(force, worldPoint || (components["odin.Transform2D"] || components["odin.Transform"]).position);
    return this;
};
