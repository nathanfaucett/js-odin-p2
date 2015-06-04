p2.js plugin
=======

p2.js plugin for odin

```javascript

var odinP2 = require("odin-p2");


// create a odin Component that wraps p2.Body for an entity
var rigidbody = odinP2.RigidBody.create({
    mass: 5 // options passed to new p2.Body(options)
});

// entity.addComponent(rigidbody);

// body is a p2.Body
rigidbody.body.addShape(new odinP2.p2.Rectangle(1.0, 1.0));

// create a odin Plugin that wraps p2.World for a scene
var p2Pluigin = odinP2.Plugin.create({
    gravity: [0, -9.801] // options passed to p2 world
});

// scene.addPlugin(p2Pluigin);
```
