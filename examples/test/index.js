(function(dependencies, undefined, global) {
    var cache = [];

    function require(index) {
        var module = cache[index],
            callback, exports;

        if (module !== undefined) {
            return module.exports;
        } else {
            callback = dependencies[index];
            exports = {};

            cache[index] = module = {
                exports: exports,
                require: require
            };

            callback.call(exports, require, exports, module, global);
            return module.exports;
        }
    }

    require.resolve = function(path) {
        return path;
    };

    if (typeof(define) === "function" && define.amd) {
        define([], function() {
            return require(0);
        });
    } else if (typeof(module) !== "undefined" && module.exports) {
        module.exports = require(0);
    } else {
        
        require(0);
        
    }
}([
function(require, exports, module, global) {

var odin = require(1),
    odinP2 = require(188);


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


},
function(require, exports, module, global) {

var odin = exports;


odin.Class = require(2);
odin.createLoop = require(23);

odin.enums = require(29);

odin.BaseApplication = require(99);
odin.Application = require(126);

odin.Assets = require(100);
odin.Asset = require(127);
odin.ImageAsset = require(128);
odin.JSONAsset = require(131);
odin.Texture = require(146);
odin.Material = require(147);
odin.Geometry = require(153);

odin.Canvas = require(158);
odin.Renderer = require(159);
odin.ComponentRenderer = require(161);

odin.Shader = require(148);

odin.Scene = require(101);
odin.Plugin = require(165);
odin.Entity = require(125);

odin.ComponentManager = require(166);

odin.Component = require(167);

odin.Transform = require(168);
odin.Transform2D = require(170);
odin.Camera = require(173);

odin.Sprite = require(175);

odin.Mesh = require(177);
odin.MeshAnimation = require(181);

odin.OrbitControl = require(182);

odin.ParticleSystem = require(183);


},
function(require, exports, module, global) {

var has = require(3),
    isFunction = require(5),
    inherits = require(12),
    EventEmitter = require(20),
    uuid = require(22);


var ClassPrototype;


module.exports = Class;


function Class() {

    EventEmitter.call(this, -1);

    this.__id = null;
}
EventEmitter.extend(Class);
ClassPrototype = Class.prototype;

Class.extend = function(child, className) {
    if (has(Class.__classes, className)) {
        throw new Error("extend(Child, className) class named " + className + " already defined");
    }

    Class.__classes[className] = child;

    inherits(child, this);
    child.className = child.prototype.className = className;

    if (isFunction(this.onExtend)) {
        this.onExtend.apply(this, arguments);
    }

    return child;
};

Class.__classes = {};

Class.getClass = function(className) {
    return Class.__classes[className];
};

Class.newClass = function(className) {
    var constructor = Class.getClass(className);
    return new constructor();
};

Class.createFromJSON = function(json) {
    var constructor = Class.getClass(json.className);
    return (new constructor()).fromJSON(json);
};

Class.className = ClassPrototype.className = "Class";

Class.create = function() {
    var instance = new this();
    return instance.construct.apply(instance, arguments);
};

ClassPrototype.construct = function() {

    this.__id = uuid();

    return this;
};

ClassPrototype.destructor = function() {

    this.__id = null;

    return this;
};

ClassPrototype.generateNewId = function() {
    this.__id = uuid();
    return this;
};

ClassPrototype.toJSON = function(json) {
    json = json || {};

    json.className = this.className;

    return json;
};

ClassPrototype.fromJSON = function( /* json */ ) {
    return this;
};


},
function(require, exports, module, global) {

var isNative = require(4),
    getPrototypeOf = require(10),
    isNullOrUndefined = require(6);


var nativeHasOwnProp = Object.prototype.hasOwnProperty,
    baseHas;


module.exports = has;


function has(object, key) {
    if (isNullOrUndefined(object)) {
        return false;
    } else {
        return baseHas(object, key);
    }
}

if (isNative(nativeHasOwnProp)) {
    baseHas = function baseHas(object, key) {
        return nativeHasOwnProp.call(object, key);
    };
} else {
    baseHas = function baseHas(object, key) {
        var proto = getPrototypeOf(object);

        if (isNullOrUndefined(proto)) {
            return key in object;
        } else {
            return (key in object) && (!(key in proto) || proto[key] !== object[key]);
        }
    };
}


},
function(require, exports, module, global) {

var isFunction = require(5),
    isNullOrUndefined = require(6),
    escapeRegExp = require(7);


var reHostCtor = /^\[object .+?Constructor\]$/,

    functionToString = Function.prototype.toString,

    reNative = RegExp("^" +
        escapeRegExp(Object.prototype.toString)
        .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ),

    isHostObject;


module.exports = isNative;


function isNative(value) {
    return !isNullOrUndefined(value) && (
        isFunction(value) ?
        reNative.test(functionToString.call(value)) : (
            typeof(value) === "object" && (
                (isHostObject(value) ? reNative : reHostCtor).test(value) || false
            )
        )
    ) || false;
}

try {
    String({
        "toString": 0
    } + "");
} catch (e) {
    isHostObject = function isHostObject() {
        return false;
    };
}

isHostObject = function isHostObject(value) {
    return !isFunction(value.toString) && typeof(value + "") === "string";
};


},
function(require, exports, module, global) {

var objectToString = Object.prototype.toString,
    isFunction;


if (objectToString.call(function() {}) === "[object Object]") {
    isFunction = function isFunction(value) {
        return value instanceof Function;
    };
} else if (typeof(/./) === "function" || (typeof(Uint8Array) !== "undefined" && typeof(Uint8Array) !== "function")) {
    isFunction = function isFunction(value) {
        return objectToString.call(value) === "[object Function]";
    };
} else {
    isFunction = function isFunction(value) {
        return typeof(value) === "function" || false;
    };
}


module.exports = isFunction;


},
function(require, exports, module, global) {

module.exports = isNullOrUndefined;

/**
  isNullOrUndefined accepts any value and returns true
  if the value is null or undefined. For all other values
  false is returned.
  
  @param {Any}        any value to test
  @returns {Boolean}  the boolean result of testing value

  @example
    isNullOrUndefined(null);   // returns true
    isNullOrUndefined(undefined);   // returns true
    isNullOrUndefined("string");    // returns false
**/
function isNullOrUndefined(obj) {
    return (obj === null || obj === void 0);
}


},
function(require, exports, module, global) {

var toString = require(8);


var reRegExpChars = /[.*+?\^${}()|\[\]\/\\]/g,
    reHasRegExpChars = new RegExp(reRegExpChars.source);


module.exports = escapeRegExp;


function escapeRegExp(string) {
    string = toString(string);
    return (
        (string && reHasRegExpChars.test(string)) ?
        string.replace(reRegExpChars, "\\$&") :
        string
    );
}


},
function(require, exports, module, global) {

var isString = require(9),
    isNullOrUndefined = require(6);


module.exports = toString;


function toString(value) {
    if (isString(value)) {
        return value;
    } else if (isNullOrUndefined(value)) {
        return "";
    } else {
        return value + "";
    }
}


},
function(require, exports, module, global) {

module.exports = isString;


function isString(obj) {
    return typeof(obj) === "string" || false;
}


},
function(require, exports, module, global) {

var isObject = require(11),
    isNative = require(4),
    isNullOrUndefined = require(6);


var nativeGetPrototypeOf = Object.getPrototypeOf,
    baseGetPrototypeOf;


module.exports = getPrototypeOf;


function getPrototypeOf(value) {
    if (isNullOrUndefined(value)) {
        return null;
    } else {
        return baseGetPrototypeOf(value);
    }
}

if (isNative(nativeGetPrototypeOf)) {
    baseGetPrototypeOf = function baseGetPrototypeOf(value) {
        return nativeGetPrototypeOf(isObject(value) ? value : Object(value)) || null;
    };
} else {
    if ("".__proto__ === String.prototype) {
        baseGetPrototypeOf = function baseGetPrototypeOf(value) {
            return value.__proto__ || null;
        };
    } else {
        baseGetPrototypeOf = function baseGetPrototypeOf(value) {
            return value.constructor ? value.constructor.prototype : null;
        };
    }
}


},
function(require, exports, module, global) {

var isNullOrUndefined = require(6);


module.exports = isObject;


function isObject(value) {
    var type = typeof(value);
    return type === "function" || (!isNullOrUndefined(value) && type === "object") || false;
}


},
function(require, exports, module, global) {

var create = require(13),
    extend = require(16),
    mixin = require(18),
    defineProperty = require(19);


var descriptor = {
    configurable: true,
    enumerable: false,
    writable: true,
    value: null
};


module.exports = inherits;


function inherits(child, parent) {

    mixin(child, parent);

    if (child.__super) {
        child.prototype = extend(create(parent.prototype), child.__super, child.prototype);
    } else {
        child.prototype = extend(create(parent.prototype), child.prototype);
    }

    defineNonEnumerableProperty(child, "__super", parent.prototype);
    defineNonEnumerableProperty(child.prototype, "constructor", child);

    child.defineStatic = defineStatic;
    child.super_ = parent;

    return child;
}
inherits.defineProperty = defineNonEnumerableProperty;

function defineNonEnumerableProperty(object, name, value) {
    descriptor.value = value;
    defineProperty(object, name, descriptor);
    descriptor.value = null;
}

function defineStatic(name, value) {
    defineNonEnumerableProperty(this, name, value);
}


},
function(require, exports, module, global) {

var isNull = require(14),
    isNative = require(4),
    isPrimitive = require(15);


var nativeCreate = Object.create;


module.exports = create;


function create(object) {
    return nativeCreate(isPrimitive(object) ? null : object);
}

if (!isNative(nativeCreate)) {
    nativeCreate = function nativeCreate(object) {
        var newObject;

        function F() {
            this.constructor = F;
        }

        if (isNull(object)) {
            newObject = new F();
            newObject.constructor = newObject.__proto__ = null;
            delete newObject.__proto__;
            return newObject;
        } else {
            F.prototype = object;
            return new F();
        }
    };
}


module.exports = create;


},
function(require, exports, module, global) {

module.exports = isNull;


function isNull(obj) {
    return obj === null;
}


},
function(require, exports, module, global) {

var isNullOrUndefined = require(6);


module.exports = isPrimitive;


function isPrimitive(obj) {
    var typeStr;
    return isNullOrUndefined(obj) || ((typeStr = typeof(obj)) !== "object" && typeStr !== "function") || false;
}


},
function(require, exports, module, global) {

var keys = require(17);


module.exports = extend;


function extend(out) {
    var i = 0,
        il = arguments.length - 1;

    while (i++ < il) {
        baseExtend(out, arguments[i]);
    }

    return out;
}

function baseExtend(a, b) {
    var objectKeys = keys(b),
        i = -1,
        il = objectKeys.length - 1,
        key;

    while (i++ < il) {
        key = objectKeys[i];
        a[key] = b[key];
    }
}


},
function(require, exports, module, global) {

var has = require(3),
    isNative = require(4),
    isNullOrUndefined = require(6),
    isObject = require(11);


var nativeKeys = Object.keys;


module.exports = keys;


function keys(value) {
    if (isNullOrUndefined(value)) {
        return [];
    } else {
        return nativeKeys(isObject(value) ? value : Object(value));
    }
}

if (!isNative(nativeKeys)) {
    nativeKeys = function(value) {
        var localHas = has,
            out = [],
            i = 0,
            key;

        for (key in value) {
            if (localHas(value, key)) {
                out[i++] = key;
            }
        }

        return out;
    };
}


},
function(require, exports, module, global) {

var keys = require(17),
    isNullOrUndefined = require(6);


module.exports = mixin;


function mixin(out) {
    var i = 0,
        il = arguments.length - 1;

    while (i++ < il) {
        baseMixin(out, arguments[i]);
    }

    return out;
}

function baseMixin(a, b) {
    var objectKeys = keys(b),
        i = -1,
        il = objectKeys.length - 1,
        key, value;

    while (i++ < il) {
        key = objectKeys[i];

        if (isNullOrUndefined(a[key]) && !isNullOrUndefined((value = b[key]))) {
            a[key] = value;
        }
    }
}


},
function(require, exports, module, global) {

var isObject = require(11),
    isFunction = require(5),
    isPrimitive = require(15),
    isNative = require(4),
    has = require(3);


var nativeDefineProperty = Object.defineProperty;


module.exports = defineProperty;


function defineProperty(object, name, descriptor) {
    if (isPrimitive(descriptor) || isFunction(descriptor)) {
        descriptor = {
            value: descriptor
        };
    }
    return nativeDefineProperty(object, name, descriptor);
}


if (!isNative(nativeDefineProperty) || !(function() {
        var object = {};
        try {
            nativeDefineProperty(object, "key", {
                value: "value"
            });
            if (has(object, "key") && object.key === "value") {
                return true;
            }
        } catch (e) {}
        return false;
    }())) {
    nativeDefineProperty = function defineProperty(object, name, descriptor) {
        if (!isObject(object)) {
            throw new TypeError("defineProperty(object, name, descriptor) called on non-object");
        }
        if (has(descriptor, "get") || has(descriptor, "set")) {
            throw new TypeError("defineProperty(object, name, descriptor) this environment does not support getters or setters");
        }
        object[name] = descriptor.value;
    };
}


},
function(require, exports, module, global) {

var isFunction = require(5),
    inherits = require(12),
    fastSlice = require(21),
    keys = require(17);


function EventEmitter(maxListeners) {
    this.__events = {};
    this.__maxListeners = maxListeners != null ? maxListeners : EventEmitter.defaultMaxListeners;
}

EventEmitter.prototype.on = function(name, listener) {
    var events, eventList, maxListeners;

    if (!isFunction(listener)) {
        throw new TypeError("EventEmitter.on(name, listener) listener must be a function");
    }

    events = this.__events || (this.__events = {});
    eventList = (events[name] || (events[name] = []));
    maxListeners = this.__maxListeners || -1;

    eventList[eventList.length] = listener;

    if (maxListeners !== -1 && eventList.length > maxListeners) {
        console.error(
            "EventEmitter.on(type, listener) possible EventEmitter memory leak detected. " + maxListeners + " listeners added"
        );
    }

    return this;
};

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

EventEmitter.prototype.once = function(name, listener) {
    var _this = this;

    function once() {

        _this.off(name, once);

        switch (arguments.length) {
            case 0:
                return listener();
            case 1:
                return listener(arguments[0]);
            case 2:
                return listener(arguments[0], arguments[1]);
            case 3:
                return listener(arguments[0], arguments[1], arguments[2]);
            case 4:
                return listener(arguments[0], arguments[1], arguments[2], arguments[3]);
            default:
                return listener.apply(null, arguments);
        }
    }

    this.on(name, once);

    return once;
};

EventEmitter.prototype.listenTo = function(obj, name) {
    var _this = this;

    if (!obj || !(isFunction(obj.on) || isFunction(obj.addListener))) {
        throw new TypeError("EventEmitter.listenTo(obj, name) obj must have a on function taking (name, listener[, ctx])");
    }

    function handler() {
        _this.emitArgs(name, arguments);
    }

    obj.on(name, handler);

    return handler;
};

EventEmitter.prototype.off = function(name, listener) {
    var events = this.__events || (this.__events = {}),
        eventList, event, i;

    eventList = events[name];
    if (!eventList) {
        return this;
    }

    if (!listener) {
        i = eventList.length;

        while (i--) {
            this.emit("removeListener", name, eventList[i]);
        }
        eventList.length = 0;
        delete events[name];
    } else {
        i = eventList.length;

        while (i--) {
            event = eventList[i];

            if (event === listener) {
                this.emit("removeListener", name, event);
                eventList.splice(i, 1);
            }
        }

        if (eventList.length === 0) {
            delete events[name];
        }
    }

    return this;
};

EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

EventEmitter.prototype.removeAllListeners = function() {
    var events = this.__events || (this.__events = {}),
        objectKeys = keys(events),
        i = -1,
        il = objectKeys.length - 1,
        key, eventList, j;

    while (i++ < il) {
        key = objectKeys[i];
        eventList = events[key];

        if (eventList) {
            j = eventList.length;

            while (j--) {
                this.emit("removeListener", key, eventList[j]);
                eventList.splice(j, 1);
            }
        }

        delete events[key];
    }

    return this;
};

function emit(eventList, args) {
    var a1, a2, a3, a4, a5,
        length = eventList.length - 1,
        i = -1,
        event;

    switch (args.length) {
        case 0:
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event();
                }
            }
            break;
        case 1:
            a1 = args[0];
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event(a1);
                }
            }
            break;
        case 2:
            a1 = args[0];
            a2 = args[1];
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event(a1, a2);
                }
            }
            break;
        case 3:
            a1 = args[0];
            a2 = args[1];
            a3 = args[2];
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event(a1, a2, a3);
                }
            }
            break;
        case 4:
            a1 = args[0];
            a2 = args[1];
            a3 = args[2];
            a4 = args[3];
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event(a1, a2, a3, a4);
                }
            }
            break;
        case 5:
            a1 = args[0];
            a2 = args[1];
            a3 = args[2];
            a4 = args[3];
            a5 = args[4];
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event(a1, a2, a3, a4, a5);
                }
            }
            break;
        default:
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event.apply(null, args);
                }
            }
            break;
    }
}

EventEmitter.prototype.emitArgs = function(name, args) {
    var eventList = (this.__events || (this.__events = {}))[name];

    if (!eventList || !eventList.length) {
        return this;
    }

    emit(eventList, args);

    return this;
};

EventEmitter.prototype.emit = function(name) {
    return this.emitArgs(name, fastSlice(arguments, 1));
};

function createFunctionCaller(args) {
    switch (args.length) {
        case 0:
            return function functionCaller(fn) {
                return fn();
            };
        case 1:
            return function functionCaller(fn) {
                return fn(args[0]);
            };
        case 2:
            return function functionCaller(fn) {
                return fn(args[0], args[1]);
            };
        case 3:
            return function functionCaller(fn) {
                return fn(args[0], args[1], args[2]);
            };
        case 4:
            return function functionCaller(fn) {
                return fn(args[0], args[1], args[2], args[3]);
            };
        case 5:
            return function functionCaller(fn) {
                return fn(args[0], args[1], args[2], args[3], args[4]);
            };
        default:
            return function functionCaller(fn) {
                return fn.apply(null, args);
            };
    }
}

function emitAsync(eventList, args, callback) {
    var length = eventList.length,
        index = 0,
        called = false,
        functionCaller;

    function next(err) {
        if (called !== true) {
            if (err || index === length) {
                called = true;
                callback(err);
            } else {
                functionCaller(eventList[index++]);
            }
        }
    }

    args[args.length] = next;
    functionCaller = createFunctionCaller(args);
    next();
}

EventEmitter.prototype.emitAsync = function(name, args, callback) {
    var eventList = (this.__events || (this.__events = {}))[name];

    args = fastSlice(arguments, 1);
    callback = args.pop();

    if (!isFunction(callback)) {
        throw new TypeError("EventEmitter.emitAsync(name [, ...args], callback) callback must be a function");
    }

    if (!eventList || !eventList.length) {
        callback();
    } else {
        emitAsync(eventList, args, callback);
    }

    return this;
};

EventEmitter.prototype.listeners = function(name) {
    var eventList = (this.__events || (this.__events = {}))[name];

    return eventList ? eventList.slice() : [];
};

EventEmitter.prototype.listenerCount = function(name) {
    var eventList = (this.__events || (this.__events = {}))[name];

    return eventList ? eventList.length : 0;
};

EventEmitter.prototype.setMaxListeners = function(value) {
    if ((value = +value) !== value) {
        throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");
    }

    this.__maxListeners = value < 0 ? -1 : value;
    return this;
};


inherits.defineProperty(EventEmitter, "defaultMaxListeners", 10);


inherits.defineProperty(EventEmitter, "listeners", function(obj, name) {
    var eventList;

    if (obj == null) {
        throw new TypeError("EventEmitter.listeners(obj, name) obj required");
    }
    eventList = obj.__events && obj.__events[name];

    return eventList ? eventList.slice() : [];
});

inherits.defineProperty(EventEmitter, "listenerCount", function(obj, name) {
    var eventList;

    if (obj == null) {
        throw new TypeError("EventEmitter.listenerCount(obj, name) obj required");
    }
    eventList = obj.__events && obj.__events[name];

    return eventList ? eventList.length : 0;
});

inherits.defineProperty(EventEmitter, "setMaxListeners", function(value) {
    if ((value = +value) !== value) {
        throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");
    }

    EventEmitter.defaultMaxListeners = value < 0 ? -1 : value;
    return value;
});

EventEmitter.extend = function(child) {
    inherits(child, this);
    return child;
};


module.exports = EventEmitter;


},
function(require, exports, module, global) {

module.exports = fastSlice;


function fastSlice(array, offset) {
    var length, newLength, i, il, result, j;

    offset = offset || 0;

    length = array.length;
    i = offset - 1;
    il = length - 1;
    newLength = length - offset;
    result = new Array(newLength <= 0 ? 0 : newLength);
    j = 0;

    while (i++ < il) {
        result[j++] = array[i];
    }

    return result;
}


},
function(require, exports, module, global) {

var CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),
    UUID = new Array(36);


module.exports = uuid;


function uuid() {
    var i = -1;

    while (i++ < 36) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            UUID[i] = "-";
        } else if (i === 14) {
            UUID[i] = "4";
        } else {
            UUID[i] = CHARS[(Math.random() * 62) | 0];
        }
    }

    return UUID.join("");
}


},
function(require, exports, module, global) {

var requestAnimationFrame = require(24);


module.exports = function createLoop(callback, element) {
    var id = null,
        running = false;

    function request() {
        id = requestAnimationFrame(run, element);
    }

    function run(ms) {

        callback(ms);

        if (running) {
            request();
        }
    }

    return {
        run: function() {
            if (running === false) {
                running = true;
                request();
            }
        },
        pause: function() {
            running = false;

            if (id) {
                requestAnimationFrame.cancel(id);
            }
        },
        setCallback: function(value) {
            callback = value;
        },
        setElement: function(value) {
            element = value;
        },
        isRunning: function() {
            return running;
        },
        isPaused: function() {
            return !running;
        }
    };
};


},
function(require, exports, module, global) {

var environment = require(25),
    emptyFunction = require(26),
    time = require(27);


var window = environment.window,

    nativeRequestAnimationFrame = (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame
    ),

    nativeCancelAnimationFrame = (
        window.cancelAnimationFrame ||
        window.cancelRequestAnimationFrame ||

        window.webkitCancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||

        window.mozCancelAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||

        window.oCancelAnimationFrame ||
        window.oCancelRequestAnimationFrame ||

        window.msCancelAnimationFrame ||
        window.msCancelRequestAnimationFrame
    ),

    requestAnimationFrame, lastTime, max;


if (nativeRequestAnimationFrame) {
    requestAnimationFrame = function requestAnimationFrame(callback, element) {
        return nativeRequestAnimationFrame.call(window, callback, element);
    };
} else {
    max = Math.max;
    lastTime = 0;

    requestAnimationFrame = function requestAnimationFrame(callback) {
        var current = time.now(),
            timeToCall = max(0, 16 - (current - lastTime)),
            id = global.setTimeout(
                function runCallback() {
                    callback(current + timeToCall);
                },
                timeToCall
            );

        lastTime = current + timeToCall;
        return id;
    };
}


if (nativeCancelAnimationFrame && nativeRequestAnimationFrame) {
    requestAnimationFrame.cancel = function(id) {
        return nativeCancelAnimationFrame.call(window, id);
    };
} else {
    requestAnimationFrame.cancel = function(id) {
        return global.clearTimeout(id);
    };
}


requestAnimationFrame(emptyFunction);


module.exports = requestAnimationFrame;


},
function(require, exports, module, global) {

var environment = exports,

    hasWindow = typeof(window) !== "undefined",
    userAgent = hasWindow ? window.navigator.userAgent : "";


environment.worker = typeof(importScripts) !== "undefined";

environment.browser = environment.worker || !!(
    hasWindow &&
    typeof(navigator) !== "undefined" &&
    window.document
);

environment.node = !environment.worker && !environment.browser;

environment.mobile = environment.browser && /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

environment.window = (
    hasWindow ? window :
    typeof(global) !== "undefined" ? global :
    typeof(self) !== "undefined" ? self : {}
);

environment.pixelRatio = environment.window.devicePixelRatio || 1;

environment.document = typeof(document) !== "undefined" ? document : {};


},
function(require, exports, module, global) {

module.exports = emptyFunction;


function emptyFunction() {}

function makeEmptyFunction(value) {
    return function() {
        return value;
    };
}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function() {
    return this;
};
emptyFunction.thatReturnsArgument = function(argument) {
    return argument;
};


},
function(require, exports, module, global) {

var process = require(28);
var environment = require(25);


var time = exports,
    dateNow, performance, HR_TIME, START_MS, now;


dateNow = Date.now || function now() {
    return (new Date()).getTime();
};


if (!environment.node) {
    performance = environment.window.performance || {};

    performance.now = (
        performance.now ||
        performance.webkitNow ||
        performance.mozNow ||
        performance.msNow ||
        performance.oNow ||
        function now() {
            return dateNow() - START_MS;
        }
    );

    now = function now() {
        return performance.now();
    };
} else {
    HR_TIME = process.hrtime();

    now = function now() {
        var hrtime = process.hrtime(HR_TIME),
            ms = hrtime[0] * 1e3,
            ns = hrtime[1] * 1e-6;

        return ms + ns;
    };
}

START_MS = dateNow();

time.now = now;

time.stamp = function stamp() {
    return START_MS + now();
};


},
function(require, exports, module, global) {

// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};


},
function(require, exports, module, global) {

var extend = require(16),
    WebGLContext = require(30);


var enums = extend(exports, WebGLContext.enums);


enums.emitterRenderMode = require(92);
enums.interpolation = require(93);
enums.normalMode = require(94);
enums.screenAlignment = require(95);
enums.side = require(96);
enums.sortMode = require(97);
enums.wrapMode = require(98);


},
function(require, exports, module, global) {

var mathf = require(31),

    environment = require(25),
    EventEmitter = require(20),
    eventListener = require(34),
    color = require(37),

    enums = require(40),
    WebGLBuffer = require(56),
    WebGLTexture = require(57),
    WebGLProgram = require(59);


var NativeUint8Array = typeof(Uint8Array) !== "undefined" ? Uint8Array : Array,
    cullFace = enums.cullFace,
    blending = enums.blending,
    depth = enums.depth,
    WebGLContextPrototype;


module.exports = WebGLContext;


WebGLContext.enums = enums;
WebGLContext.WebGLTexture = WebGLTexture;
WebGLContext.WebGLProgram = WebGLProgram;


function WebGLContext() {

    EventEmitter.call(this);

    this.gl = null;
    this.canvas = null;

    this.__attributes = {};

    this.__textures = {};

    this.__precision = null;
    this.__extensions = {};

    this.__maxAnisotropy = null;
    this.__maxTextures = null;
    this.__maxVertexTextures = null;
    this.__maxTextureSize = null;
    this.__maxCubeTextureSize = null;
    this.__maxRenderBufferSize = null;

    this.__maxUniforms = null;
    this.__maxVaryings = null;
    this.__maxAttributes = null;

    this.__enabledAttributes = null;

    this.__viewportX = null;
    this.__viewportY = null;
    this.__viewportWidth = null;
    this.__viewportHeight = null;

    this.__clearColor = color.create();
    this.__clearAlpha = null;

    this.__blending = null;
    this.__blendingDisabled = null;
    this.__cullFace = null;
    this.__cullFaceDisabled = null;
    this.__depthFunc = null;
    this.__depthTestDisabled = null;
    this.__depthWrite = null;
    this.__lineWidth = null;

    this.__program = null;
    this.__programForce = null;

    this.__textureIndex = null;
    this.__activeIndex = null;
    this.__activeTexture = null;

    this.__arrayBuffer = null;
    this.__elementArrayBuffer = null;

    this.__handlerContextLost = null;
    this.__handlerContextRestored = null;
}
EventEmitter.extend(WebGLContext);
WebGLContextPrototype = WebGLContext.prototype;

WebGLContextPrototype.setAttributes = function(attributes) {

    getAttributes(this.__attributes, attributes);

    if (this.gl) {
        WebGLContext_getGLContext(this);
    }

    return this;
};

WebGLContextPrototype.setCanvas = function(canvas, attributes) {
    var _this = this,
        thisCanvas = this.canvas;

    if (thisCanvas) {
        if (thisCanvas !== canvas) {
            eventListener.off(thisCanvas, "webglcontextlost", this.__handlerContextLost);
            eventListener.off(thisCanvas, "webglcontextrestored", this.__handlerContextRestored);
        } else {
            return this;
        }
    }

    getAttributes(this.__attributes, attributes);
    this.canvas = canvas;

    this.__handlerContextLost = this.__handlerContextLost || function handlerContextLost(e) {
        handleWebGLContextContextLost(_this, e);
    };
    this.__handlerContextRestored = this.__handlerContextRestored || function handlerContextRestored(e) {
        handleWebGLContextContextRestored(_this, e);
    };

    eventListener.on(canvas, "webglcontextlost", this.__handlerContextLost);
    eventListener.on(canvas, "webglcontextrestored", this.__handlerContextRestored);

    WebGLContext_getGLContext(this);

    return this;
};

WebGLContextPrototype.clearGL = function() {

    this.gl = null;

    this.__textures = {};

    this.__precision = null;
    this.__extensions = {};

    this.__maxAnisotropy = null;
    this.__maxTextures = null;
    this.__maxVertexTextures = null;
    this.__maxTextureSize = null;
    this.__maxCubeTextureSize = null;
    this.__maxRenderBufferSize = null;

    this.__maxUniforms = null;
    this.__maxVaryings = null;
    this.__maxAttributes = null;

    this.__enabledAttributes = null;

    this.__viewportX = null;
    this.__viewportY = null;
    this.__viewportWidth = null;
    this.__viewportHeight = null;

    color.set(this.__clearColor, 0, 0, 0);
    this.__clearAlpha = null;

    this.__blending = null;
    this.__blendingDisabled = true;
    this.__cullFace = null;
    this.__cullFaceDisabled = true;
    this.__depthFunc = null;
    this.__depthTestDisabled = true;
    this.__depthWrite = null;
    this.__lineWidth = null;

    this.__program = null;
    this.__programForce = null;

    this.__textureIndex = null;
    this.__activeIndex = null;
    this.__activeTexture = null;

    this.__arrayBuffer = null;
    this.__elementArrayBuffer = null;

    return this;
};

WebGLContextPrototype.resetGL = function() {

    this.__textures = {};

    this.__viewportX = null;
    this.__viewportY = null;
    this.__viewportWidth = null;
    this.__viewportHeight = null;

    this.__clearAlpha = null;

    this.__blending = null;
    this.__blendingDisabled = true;
    this.__cullFace = null;
    this.__cullFaceDisabled = true;
    this.__depthFunc = null;
    this.__depthTestDisabled = true;
    this.__depthWrite = null;
    this.__lineWidth = null;

    this.__program = null;
    this.__programForce = null;

    this.__textureIndex = null;
    this.__activeIndex = null;
    this.__activeTexture = null;

    this.__arrayBuffer = null;
    this.__elementArrayBuffer = null;

    this.disableAttributes();
    this.setViewport(0, 0, 1, 1);
    this.setDepthWrite(true);
    this.setLineWidth(1);
    this.setDepthFunc(depth.LESS);
    this.setCullFace(cullFace.BACK);
    this.setBlending(blending.DEFAULT);
    this.setClearColor(color.set(this.__clearColor, 0, 0, 0), 1);
    this.setProgram(null);
    this.clearCanvas();

    return this;
};

WebGLContextPrototype.clampMaxSize = function(image, isCubeMap) {
    var maxSize = isCubeMap ? this.__maxCubeTextureSize : this.__maxTextureSize,
        maxDim, newWidth, newHeight, canvas, ctx;

    if (!image || (image.height <= maxSize && image.width <= maxSize)) {
        return image;
    } else {
        maxDim = 1 / mathf.max(image.width, image.height);
        newWidth = (image.width * maxSize * maxDim) | 0;
        newHeight = (image.height * maxSize * maxDim) | 0;
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight);

        return canvas;
    }
};

WebGLContextPrototype.setProgram = function(program, force) {
    if (this.__program !== program || force) {
        this.__program = program;
        this.__programForce = true;

        if (program) {
            this.gl.useProgram(program.glProgram);
        } else {
            this.gl.useProgram(null);
        }
    } else {
        if (this.__textureIndex !== 0 || this.__activeIndex !== -1) {
            this.__programForce = true;
        } else {
            this.__programForce = false;
        }
    }

    this.__textureIndex = 0;
    this.__activeIndex = -1;

    return this;
};

WebGLContextPrototype.setTexture = function(location, texture, force) {
    var gl = this.gl,
        webglTexture = this.createTexture(texture),
        index = this.__textureIndex++,
        needsUpdate = this.__activeIndex !== index;

    this.__activeIndex = index;

    if (this.__activeTexture !== webglTexture || force) {
        this.__activeTexture = webglTexture;

        if (webglTexture.isCubeMap) {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture.getGLTexture());
        } else {
            gl.bindTexture(gl.TEXTURE_2D, webglTexture.getGLTexture());
        }

        if (needsUpdate || this.__programForce || force) {
            gl.activeTexture(gl.TEXTURE0 + index);
            gl.uniform1i(location, index);
        }

        return true;
    } else {
        return false;
    }
};

WebGLContextPrototype.setArrayBuffer = function(buffer, force) {
    var gl = this.gl;

    if (this.__arrayBuffer !== buffer || force) {
        this.disableAttributes();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.glBuffer);
        this.__arrayBuffer = buffer;
        return true;
    } else {
        return false;
    }
};

WebGLContextPrototype.setElementArrayBuffer = function(buffer, force) {
    var gl = this.gl;

    if (this.__elementArrayBuffer !== buffer || force) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.glBuffer);
        this.__elementArrayBuffer = buffer;
        return true;
    } else {
        return false;
    }
};

WebGLContextPrototype.setAttribPointer = function(location, itemSize, type, stride, offset, force) {
    var gl = this.gl;

    if (this.enableAttribute(location) || force) {
        gl.vertexAttribPointer(location, itemSize, type, gl.FALSE, stride, offset);
        return true;
    } else {
        return false;
    }
};

WebGLContextPrototype.createProgram = function() {
    return new WebGLProgram(this);
};

WebGLContextPrototype.createTexture = function(texture) {
    var textures = this.__textures;
    return textures[texture.__id] || (textures[texture.__id] = new WebGLTexture(this, texture));
};

WebGLContextPrototype.createBuffer = function() {
    return new WebGLBuffer(this);
};

WebGLContextPrototype.deleteProgram = function(program) {
    this.gl.deleteProgram(program.glProgram);
    return this;
};

WebGLContextPrototype.deleteTexture = function(texture) {
    this.gl.deleteTexture(texture.glTexture);
    return this;
};

WebGLContextPrototype.deleteBuffer = function(buffer) {
    this.gl.deleteBuffer(buffer.glBuffer);
    return this;
};

WebGLContextPrototype.setViewport = function(x, y, width, height) {
    x = x || 0;
    y = y || 0;
    width = width || 1;
    height = height || 1;

    if (
        this.__viewportX !== x ||
        this.__viewportY !== y ||
        this.__viewportWidth !== width ||
        this.__viewportHeight !== height
    ) {
        this.__viewportX = x;
        this.__viewportY = y;
        this.__viewportWidth = width;
        this.__viewportHeight = height;

        this.gl.viewport(x, y, width, height);
    }

    return this;
};

WebGLContextPrototype.setDepthWrite = function(depthWrite) {

    if (this.__depthWrite !== depthWrite) {
        this.__depthWrite = depthWrite;
        this.gl.depthMask(depthWrite);
    }

    return this;
};

WebGLContextPrototype.setLineWidth = function(width) {

    if (this.__lineWidth !== width) {
        this.__lineWidth = width;
        this.gl.lineWidth(width);
    }

    return this;
};

WebGLContextPrototype.setDepthFunc = function(depthFunc) {
    var gl = this.gl;

    if (this.__depthFunc !== depthFunc) {
        switch (depthFunc) {
            case depth.NEVER:
                if (this.__depthTestDisabled) {
                    gl.enable(gl.DEPTH_TEST);
                }
                gl.depthFunc(gl.NEVER);
                break;
            case depth.LESS:
                if (this.__depthTestDisabled) {
                    gl.enable(gl.DEPTH_TEST);
                }
                gl.depthFunc(gl.LESS);
                break;
            case depth.EQUAL:
                if (this.__depthTestDisabled) {
                    gl.enable(gl.DEPTH_TEST);
                }
                gl.depthFunc(gl.EQUAL);
                break;
            case depth.LEQUAL:
                if (this.__depthTestDisabled) {
                    gl.enable(gl.DEPTH_TEST);
                }
                gl.depthFunc(gl.LEQUAL);
                break;
            case depth.GREATER:
                if (this.__depthTestDisabled) {
                    gl.enable(gl.DEPTH_TEST);
                }
                gl.depthFunc(gl.GREATER);
                break;
            case depth.NOTEQUAL:
                if (this.__depthTestDisabled) {
                    gl.enable(gl.DEPTH_TEST);
                }
                gl.depthFunc(gl.NOTEQUAL);
                break;
            case depth.GEQUAL:
                if (this.__depthTestDisabled) {
                    gl.enable(gl.DEPTH_TEST);
                }
                gl.depthFunc(gl.GEQUAL);
                break;
            case depth.ALWAYS:
                if (this.__depthTestDisabled) {
                    gl.enable(gl.DEPTH_TEST);
                }
                gl.depthFunc(gl.ALWAYS);
                break;
            default:
                this.__depthTestDisabled = true;
                this.__depthFunc = depth.NONE;
                gl.disable(gl.DEPTH_TEST);
                return this;
        }

        this.__depthTestDisabled = false;
        this.__depthFunc = depthFunc;
    }

    return this;
};

WebGLContextPrototype.setCullFace = function(value) {
    var gl = this.gl;

    if (this.__cullFace !== value) {
        switch (value) {
            case cullFace.BACK:
                if (this.__cullFaceDisabled) {
                    gl.enable(gl.CULL_FACE);
                }
                gl.cullFace(gl.BACK);
                break;
            case cullFace.FRONT:
                if (this.__cullFaceDisabled) {
                    gl.enable(gl.CULL_FACE);
                }
                gl.cullFace(gl.FRONT);
                break;
            case cullFace.FRONT_AND_BACK:
                if (this.__cullFaceDisabled) {
                    gl.enable(gl.CULL_FACE);
                }
                gl.cullFace(gl.FRONT_AND_BACK);
                break;
            default:
                this.__cullFaceDisabled = true;
                this.__cullFace = cullFace.NONE;
                gl.disable(gl.CULL_FACE);
                return this;
        }

        this.__cullFaceDisabled = false;
        this.__cullFace = value;
    }

    return this;
};

WebGLContextPrototype.setBlending = function(value) {
    var gl = this.gl;

    if (this.__blending !== value) {
        switch (value) {
            case blending.ADDITIVE:
                if (this.__blendingDisabled) {
                    gl.enable(gl.BLEND);
                }
                gl.blendEquation(gl.FUNC_ADD);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                break;
            case blending.SUBTRACTIVE:
                if (this.__blendingDisabled) {
                    gl.enable(gl.BLEND);
                }
                gl.blendEquation(gl.FUNC_ADD);
                gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
                break;
            case blending.MULTIPLY:
                if (this.__blendingDisabled) {
                    gl.enable(gl.BLEND);
                }
                gl.blendEquation(gl.FUNC_ADD);
                gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
                break;
            case blending.DEFAULT:
                if (this.__blendingDisabled) {
                    gl.enable(gl.BLEND);
                }
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                break;
            default:
                gl.disable(gl.BLEND);
                this.__blendingDisabled = true;
                this.__blending = blending.NONE;
                return this;
        }

        this.__blendingDisabled = false;
        this.__blending = value;
    }

    return this;
};

WebGLContextPrototype.setClearColor = function(clearColor, alpha) {
    alpha = alpha || 1;

    if (color.notEqual(this.__clearColor, clearColor) || alpha !== this.__clearAlpha) {

        color.copy(this.__clearColor, clearColor);
        this.__clearAlpha = alpha;

        this.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], alpha);
    }

    return this;
};

WebGLContextPrototype.scissor = function(x, y, width, height) {
    this.gl.scissor(x, y, width, height);
    return this;
};

WebGLContextPrototype.clearCanvas = function(color, depth, stencil) {
    var gl = this.gl,
        bits = 0;

    if (color !== false) {
        bits |= gl.COLOR_BUFFER_BIT;
    }
    if (depth !== false) {
        bits |= gl.DEPTH_BUFFER_BIT;
    }
    if (stencil !== false) {
        bits |= gl.STENCIL_BUFFER_BIT;
    }

    gl.clear(bits);

    return this;
};

WebGLContextPrototype.clearColor = function() {
    var gl = this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT);
    return this;
};

WebGLContextPrototype.clearDepth = function() {
    var gl = this.gl;

    gl.clear(gl.DEPTH_BUFFER_BIT);
    return this;
};

WebGLContextPrototype.clearStencil = function() {
    var gl = this.gl;

    gl.clear(gl.STENCIL_BUFFER_BIT);
    return this;
};

WebGLContextPrototype.enableAttribute = function(attribute) {
    var enabledAttributes = this.__enabledAttributes;

    if (enabledAttributes[attribute] === 0) {
        this.gl.enableVertexAttribArray(attribute);
        enabledAttributes[attribute] = 1;
        return true;
    } else {
        return false;
    }
};

WebGLContextPrototype.disableAttribute = function(attribute) {
    var enabledAttributes = this.__enabledAttributes;

    if (enabledAttributes[attribute] === 1) {
        this.gl.disableVertexAttribArray(attribute);
        enabledAttributes[attribute] = 0;
        return true;
    } else {
        return false;
    }
};

WebGLContextPrototype.disableAttributes = function() {
    var gl = this.gl,
        i = this.__maxAttributes,
        enabledAttributes = this.__enabledAttributes;

    while (i--) {
        if (enabledAttributes[i] === 1) {
            gl.disableVertexAttribArray(i);
            enabledAttributes[i] = 0;
        }
    }

    return this;
};

var getExtension_lowerPrefixes = ["webkit", "moz", "o", "ms"],
    getExtension_upperPrefixes = ["WEBKIT", "MOZ", "O", "MS"];

WebGLContextPrototype.getExtension = function(name, throwError) {
    var gl = this.gl,
        extensions = this.__extensions || (this.__extensions = {}),
        extension = extensions[name] || (extensions[name] = gl.getExtension(name)),
        i;

    if (extension == null) {
        i = getExtension_upperPrefixes.length;

        while (i--) {
            if ((extension = gl.getExtension(getExtension_upperPrefixes[i] + "_" + name))) {
                extensions[name] = extension;
                break;
            }
        }
    }
    if (extension == null) {
        i = getExtension_lowerPrefixes.length;

        while (i--) {
            if ((extension = gl.getExtension(getExtension_lowerPrefixes[i] + name))) {
                extensions[name] = extension;
                break;
            }
        }
    }

    if (extension == null) {
        if (throwError) {
            throw new Error("WebGLContext.getExtension: could not get Extension " + name);
        } else {
            return null;
        }
    } else {
        return extension;
    }
};


function getAttributes(attributes, options) {
    options = options || {};

    attributes.alpha = options.alpha != null ? !!options.alpha : true;
    attributes.antialias = options.antialias != null ? !!options.antialias : true;
    attributes.depth = options.depth != null ? !!options.depth : true;
    attributes.premultipliedAlpha = options.premultipliedAlpha != null ? !!options.premultipliedAlpha : true;
    attributes.preserveDrawingBuffer = options.preserveDrawingBuffer != null ? !!options.preserveDrawingBuffer : false;
    attributes.stencil = options.stencil != null ? !!options.stencil : true;

    return attributes;
}

function handleWebGLContextContextLost(_this, e) {
    e.preventDefault();
    _this.clearGL();
    _this.emit("webglcontextlost", e);
}

function handleWebGLContextContextRestored(_this, e) {
    e.preventDefault();
    WebGLContext_getGLContext(_this);
    _this.emit("webglcontextrestored", e);
}

function WebGLContext_getGLContext(_this) {
    var gl;

    if (_this.gl != null) {
        _this.clearGL();
    }

    gl = getWebGLContext(_this.canvas, _this.__attributes);

    if (gl == null) {
        _this.emit("webglcontextcreationfailed");
    } else {
        _this.emit("webglcontextcreation");

        if (!gl.getShaderPrecisionFormat) {
            gl.getShaderPrecisionFormat = getShaderPrecisionFormat;
        }

        _this.gl = gl;
        getGPUInfo(_this);
        _this.resetGL();
    }
}

function getShaderPrecisionFormat() {
    return {
        rangeMin: 1,
        rangeMax: 1,
        precision: 1
    };
}

function getGPUInfo(_this) {
    var gl = _this.gl,

        VERTEX_SHADER = gl.VERTEX_SHADER,
        FRAGMENT_SHADER = gl.FRAGMENT_SHADER,
        HIGH_FLOAT = gl.HIGH_FLOAT,
        MEDIUM_FLOAT = gl.MEDIUM_FLOAT,

        EXT_tfa = _this.getExtension("EXT_texture_filter_anisotropic"),

        vsHighpFloat = gl.getShaderPrecisionFormat(VERTEX_SHADER, HIGH_FLOAT),
        vsMediumpFloat = gl.getShaderPrecisionFormat(VERTEX_SHADER, MEDIUM_FLOAT),

        fsHighpFloat = gl.getShaderPrecisionFormat(FRAGMENT_SHADER, HIGH_FLOAT),
        fsMediumpFloat = gl.getShaderPrecisionFormat(FRAGMENT_SHADER, MEDIUM_FLOAT),

        highpAvailable = vsHighpFloat.precision > 0 && fsHighpFloat.precision > 0,
        mediumpAvailable = vsMediumpFloat.precision > 0 && fsMediumpFloat.precision > 0,

        precision = "highp";

    if (!highpAvailable || environment.mobile) {
        if (mediumpAvailable) {
            precision = "mediump";
        } else {
            precision = "lowp";
        }
    }

    _this.__precision = precision;
    _this.__maxAnisotropy = EXT_tfa ? gl.getParameter(EXT_tfa.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
    _this.__maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    _this.__maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    _this.__maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    _this.__maxCubeTextureSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    _this.__maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);

    _this.__maxUniforms = mathf.max(
        gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS), gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)
    ) * 4;
    _this.__maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS) * 4;
    _this.__maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

    _this.__enabledAttributes = new NativeUint8Array(_this.__maxAttributes);
}

var getWebGLContext_webglNames = ["3d", "moz-webgl", "experimental-webgl", "webkit-3d", "webgl"],
    getWebGLContext_attuibutes = {
        alpha: true,
        antialias: true,
        depth: true,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        stencil: true
    };

function getWebGLContext(canvas, attributes) {
    var i = getWebGLContext_webglNames.length,
        gl, key;

    attributes = attributes || {};

    for (key in getWebGLContext_attuibutes) {
        if (attributes[key] == null) {
            attributes[key] = getWebGLContext_attuibutes[key];
        }
    }

    while (i--) {
        try {
            gl = canvas.getContext(getWebGLContext_webglNames[i], attributes);
            if (gl) {
                return gl;
            }
        } catch (e) {}
    }
    if (!gl) {
        throw new Error("WebGLContext: could not get a WebGL Context");
    }

    return gl;
}


},
function(require, exports, module, global) {

var keys = require(17),
    isNaN = require(32);


var mathf = exports,

    NativeMath = Math,

    NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array;


mathf.ArrayType = NativeFloat32Array;

mathf.PI = NativeMath.PI;
mathf.TAU = mathf.PI * 2;
mathf.TWO_PI = mathf.TAU;
mathf.HALF_PI = mathf.PI * 0.5;
mathf.FOURTH_PI = mathf.PI * 0.25;

mathf.EPSILON = Number.EPSILON || NativeMath.pow(2, -52);

mathf.TO_RADS = mathf.PI / 180;
mathf.TO_DEGS = 180 / mathf.PI;

mathf.E = NativeMath.E;
mathf.LN2 = NativeMath.LN2;
mathf.LN10 = NativeMath.LN10;
mathf.LOG2E = NativeMath.LOG2E;
mathf.LOG10E = NativeMath.LOG10E;
mathf.SQRT1_2 = NativeMath.SQRT1_2;
mathf.SQRT2 = NativeMath.SQRT2;

mathf.abs = NativeMath.abs;

mathf.acos = NativeMath.acos;
mathf.acosh = NativeMath.acosh || (NativeMath.acosh = function acosh(x) {
    return mathf.log(x + mathf.sqrt(x * x - 1));
});
mathf.asin = NativeMath.asin;
mathf.asinh = NativeMath.asinh || (NativeMath.asinh = function asinh(x) {
    if (x === -Infinity) {
        return x;
    } else {
        return mathf.log(x + mathf.sqrt(x * x + 1));
    }
});
mathf.atan = NativeMath.atan;
mathf.atan2 = NativeMath.atan2;
mathf.atanh = NativeMath.atanh || (NativeMath.atanh = function atanh(x) {
    return mathf.log((1 + x) / (1 - x)) / 2;
});

mathf.cbrt = NativeMath.cbrt || (NativeMath.cbrt = function cbrt(x) {
    var y = mathf.pow(mathf.abs(x), 1 / 3);
    return x < 0 ? -y : y;
});

mathf.ceil = NativeMath.ceil;

mathf.clz32 = NativeMath.clz32 || (NativeMath.clz32 = function clz32(value) {
    value = +value >>> 0;
    return value ? 32 - value.toString(2).length : 32;
});

mathf.cos = NativeMath.cos;
mathf.cosh = NativeMath.cosh || (NativeMath.cosh = function cosh(x) {
    return (mathf.exp(x) + mathf.exp(-x)) / 2;
});

mathf.exp = NativeMath.exp;

mathf.expm1 = NativeMath.expm1 || (NativeMath.expm1 = function expm1(x) {
    return mathf.exp(x) - 1;
});

mathf.floor = NativeMath.floor;
mathf.fround = NativeMath.fround || (NativeMath.fround = function fround(x) {
    return new NativeFloat32Array([x])[0];
});

mathf.hypot = NativeMath.hypot || (NativeMath.hypot = function hypot() {
    var y = 0,
        i = -1,
        il = arguments.length - 1,
        value;

    while (i++ < il) {
        value = arguments[i];

        if (value === Infinity || value === -Infinity) {
            return Infinity;
        } else {
            y += value * value;
        }
    }

    return mathf.sqrt(y);
});

mathf.imul = NativeMath.imul || (NativeMath.imul = function imul(a, b) {
    var ah = (a >>> 16) & 0xffff,
        al = a & 0xffff,
        bh = (b >>> 16) & 0xffff,
        bl = b & 0xffff;

    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

mathf.log = NativeMath.log;

mathf.log1p = NativeMath.log1p || (NativeMath.log1p = function log1p(x) {
    return mathf.log(1 + x);
});

mathf.log10 = NativeMath.log10 || (NativeMath.log10 = function log10(x) {
    return mathf.log(x) / mathf.LN10;
});

mathf.log2 = NativeMath.log2 || (NativeMath.log2 = function log2(x) {
    return mathf.log(x) / mathf.LN2;
});

mathf.max = NativeMath.max;
mathf.min = NativeMath.min;

mathf.pow = NativeMath.pow;

mathf.random = NativeMath.random;
mathf.round = NativeMath.round;

mathf.sign = NativeMath.sign || (NativeMath.sign = function sign(x) {
    x = +x;
    if (x === 0 || isNaN(x)) {
        return x;
    } else {
        return x > 0 ? 1 : -1;
    }
});

mathf.sin = NativeMath.sin;
mathf.sinh = NativeMath.sinh || (NativeMath.sinh = function sinh(x) {
    return (mathf.exp(x) - mathf.exp(-x)) / 2;
});
mathf.sqrt = NativeMath.sqrt;

mathf.tan = NativeMath.tan;
mathf.tanh = NativeMath.tanh || (NativeMath.tanh = function tanh(x) {
    if (x === Infinity) {
        return 1;
    } else if (x === -Infinity) {
        return -1;
    } else {
        return (mathf.exp(x) - mathf.exp(-x)) / (mathf.exp(x) + mathf.exp(-x));
    }
});

mathf.trunc = NativeMath.trunc || (NativeMath.trunc = function trunc(x) {
    return x < 0 ? mathf.ceil(x) : mathf.floor(x);
});

mathf.equals = function(a, b, e) {
    return mathf.abs(a - b) < (e !== void 0 ? e : mathf.EPSILON);
};

mathf.modulo = function(a, b) {
    var r = a % b;

    return (r * b < 0) ? r + b : r;
};

mathf.standardRadian = function(x) {
    return mathf.modulo(x, mathf.TWO_PI);
};

mathf.standardAngle = function(x) {
    return mathf.modulo(x, 360);
};

mathf.snap = function(x, y) {
    var m = x % y;
    return m < (y * 0.5) ? x - m : x + y - m;
};

mathf.clamp = function(x, min, max) {
    return x < min ? min : x > max ? max : x;
};

mathf.clampBottom = function(x, min) {
    return x < min ? min : x;
};

mathf.clampTop = function(x, max) {
    return x > max ? max : x;
};

mathf.clamp01 = function(x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
};

mathf.truncate = function(x, n) {
    var p = mathf.pow(10, n),
        num = x * p;

    return (num < 0 ? mathf.ceil(num) : mathf.floor(num)) / p;
};

mathf.lerp = function(a, b, x) {
    return a + (b - a) * x;
};

mathf.lerpRadian = function(a, b, x) {
    return mathf.standardRadian(a + (b - a) * x);
};

mathf.lerpAngle = function(a, b, x) {
    return mathf.standardAngle(a + (b - a) * x);
};

mathf.lerpCos = function(a, b, x) {
    var ft = x * mathf.PI,
        f = (1 - mathf.cos(ft)) * 0.5;

    return a * (1 - f) + b * f;
};

mathf.lerpCubic = function(v0, v1, v2, v3, x) {
    var P, Q, R, S, Px, Qx, Rx;

    v0 = v0 || v1;
    v3 = v3 || v2;

    P = (v3 - v2) - (v0 - v1);
    Q = (v0 - v1) - P;
    R = v2 - v0;
    S = v1;

    Px = P * x;
    Qx = Q * x;
    Rx = R * x;

    return (Px * Px * Px) + (Qx * Qx) + Rx + S;
};

mathf.smoothStep = function(x, min, max) {
    if (x <= min) {
        return 0;
    } else {
        if (x >= max) {
            return 1;
        } else {
            x = (x - min) / (max - min);
            return x * x * (3 - 2 * x);
        }
    }
};

mathf.smootherStep = function(x, min, max) {
    if (x <= min) {
        return 0;
    } else {
        if (x >= max) {
            return 1;
        } else {
            x = (x - min) / (max - min);
            return x * x * x * (x * (x * 6 - 15) + 10);
        }
    }
};

mathf.pingPong = function(x, length) {
    length = +length || 1;
    return length - mathf.abs(x % (2 * length) - length);
};

mathf.degsToRads = function(x) {
    return mathf.standardRadian(x * mathf.TO_RADS);
};

mathf.radsToDegs = function(x) {
    return mathf.standardAngle(x * mathf.TO_DEGS);
};

mathf.randInt = function(min, max) {
    return mathf.round(min + (mathf.random() * (max - min)));
};

mathf.randFloat = function(min, max) {
    return min + (mathf.random() * (max - min));
};

mathf.randSign = function() {
    return mathf.random() < 0.5 ? 1 : -1;
};

mathf.shuffle = function(array) {
    var i = array.length,
        j, x;

    while (i) {
        j = (mathf.random() * i--) | 0;
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }

    return array;
};

mathf.randArg = function() {
    return arguments[(mathf.random() * arguments.length) | 0];
};

mathf.randChoice = function(array) {
    return array[(mathf.random() * array.length) | 0];
};

mathf.randChoiceObject = function(object) {
    var objectKeys = keys(object);
    return object[objectKeys[(mathf.random() * objectKeys.length) | 0]];
};

mathf.isPowerOfTwo = function(x) {
    return (x & -x) === x;
};

mathf.floorPowerOfTwo = function(x) {
    var i = 2,
        prev;

    while (i < x) {
        prev = i;
        i *= 2;
    }

    return prev;
};

mathf.ceilPowerOfTwo = function(x) {
    var i = 2;

    while (i < x) {
        i *= 2;
    }

    return i;
};

var n225 = 0.39269908169872414,
    n675 = 1.1780972450961724,
    n1125 = 1.9634954084936207,
    n1575 = 2.748893571891069,
    n2025 = 3.5342917352885173,
    n2475 = 4.319689898685966,
    n2925 = 5.105088062083414,
    n3375 = 5.8904862254808625,

    RIGHT = "right",
    UP_RIGHT = "up_right",
    UP = "up",
    UP_LEFT = "up_left",
    LEFT = "left",
    DOWN_LEFT = "down_left",
    DOWN = "down",
    DOWN_RIGHT = "down_right";

mathf.directionAngle = function(a) {
    a = mathf.standardRadian(a);

    return (
        (a >= n225 && a < n675) ? UP_RIGHT :
        (a >= n675 && a < n1125) ? UP :
        (a >= n1125 && a < n1575) ? UP_LEFT :
        (a >= n1575 && a < n2025) ? LEFT :
        (a >= n2025 && a < n2475) ? DOWN_LEFT :
        (a >= n2475 && a < n2925) ? DOWN :
        (a >= n2925 && a < n3375) ? DOWN_RIGHT :
        RIGHT
    );
};

mathf.direction = function(x, y) {
    var a = mathf.standardRadian(mathf.atan2(y, x));

    return (
        (a >= n225 && a < n675) ? UP_RIGHT :
        (a >= n675 && a < n1125) ? UP :
        (a >= n1125 && a < n1575) ? UP_LEFT :
        (a >= n1575 && a < n2025) ? LEFT :
        (a >= n2025 && a < n2475) ? DOWN_LEFT :
        (a >= n2475 && a < n2925) ? DOWN :
        (a >= n2925 && a < n3375) ? DOWN_RIGHT :
        RIGHT
    );
};


},
function(require, exports, module, global) {

var isNumber = require(33);


module.exports = Number.isNaN || function isNaN(obj) {
    return isNumber(obj) && obj !== obj;
};


},
function(require, exports, module, global) {

module.exports = isNumber;


function isNumber(obj) {
    return typeof(obj) === "number" || false;
}


},
function(require, exports, module, global) {

var process = require(28);
var isObject = require(11),
    isFunction = require(5),
    environment = require(25),
    eventTable = require(35);


var eventListener = module.exports,

    reSpliter = /[\s]+/,

    window = environment.window,
    document = environment.document,

    listenToEvent, captureEvent, removeEvent, dispatchEvent;


window.Event = window.Event || function EmptyEvent() {};


eventListener.on = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        listenToEvent(target, eventTypes[i], callback);
    }
};

eventListener.capture = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        captureEvent(target, eventTypes[i], callback);
    }
};

eventListener.off = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        removeEvent(target, eventTypes[i], callback);
    }
};

eventListener.emit = function(target, eventType, event) {

    return dispatchEvent(target, eventType, isObject(event) ? event : {});
};

eventListener.getEventConstructor = function(target, eventType) {
    var getter = eventTable[eventType];
    return isFunction(getter) ? getter(target) : window.Event;
};


if (isFunction(document.addEventListener)) {

    listenToEvent = function(target, eventType, callback) {

        target.addEventListener(eventType, callback, false);
    };

    captureEvent = function(target, eventType, callback) {

        target.addEventListener(eventType, callback, true);
    };

    removeEvent = function(target, eventType, callback) {

        target.removeEventListener(eventType, callback, false);
    };

    dispatchEvent = function(target, eventType, event) {
        var getter = eventTable[eventType],
            EventType = isFunction(getter) ? getter(target) : window.Event;

        return !!target.dispatchEvent(new EventType(eventType, event));
    };
} else if (isFunction(document.attachEvent)) {

    listenToEvent = function(target, eventType, callback) {

        target.attachEvent("on" + eventType, callback);
    };

    captureEvent = function() {
        if (process.env.NODE_ENV === "development") {
            throw new Error(
                "Attempted to listen to events during the capture phase on a " +
                "browser that does not support the capture phase. Your application " +
                "will not receive some events."
            );
        }
    };

    removeEvent = function(target, eventType, callback) {

        target.detachEvent("on" + eventType, callback);
    };

    dispatchEvent = function(target, eventType, event) {
        var doc = target.ownerDocument || document;

        return !!target.fireEvent("on" + eventType, doc.createEventObject(event));
    };
} else {

    listenToEvent = function(target, eventType, callback) {

        target["on" + eventType] = callback;
        return target;
    };

    captureEvent = function() {
        if (process.env.NODE_ENV === "development") {
            throw new Error(
                "Attempted to listen to events during the capture phase on a " +
                "browser that does not support the capture phase. Your application " +
                "will not receive some events."
            );
        }
    };

    removeEvent = function(target, eventType) {

        target["on" + eventType] = null;
        return true;
    };

    dispatchEvent = function(target, eventType, event) {
        var onType = "on" + eventType;

        if (isFunction(target[onType])) {
            event.type = eventType;
            return !!target[onType](event);
        }

        return false;
    };
}


},
function(require, exports, module, global) {

var isNode = require(36),
    environment = require(25);


var window = environment.window,

    XMLHttpRequest = window.XMLHttpRequest,
    OfflineAudioContext = window.OfflineAudioContext;


function returnEvent() {
    return window.Event;
}


module.exports = {
    abort: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else {
            return window.UIEvent || window.Event;
        }
    },

    afterprint: returnEvent,

    animationend: function() {
        return window.AnimationEvent || window.Event;
    },
    animationiteration: function() {
        return window.AnimationEvent || window.Event;
    },
    animationstart: function() {
        return window.AnimationEvent || window.Event;
    },

    audioprocess: function() {
        return window.AudioProcessingEvent || window.Event;
    },

    beforeprint: returnEvent,
    beforeunload: function() {
        return window.BeforeUnloadEvent || window.Event;
    },
    beginevent: function() {
        return window.TimeEvent || window.Event;
    },

    blocked: returnEvent,
    blur: function() {
        return window.FocusEvent || window.Event;
    },

    cached: returnEvent,
    canplay: returnEvent,
    canplaythrough: returnEvent,
    chargingchange: returnEvent,
    chargingtimechange: returnEvent,
    checking: returnEvent,

    click: function() {
        return window.MouseEvent || window.Event;
    },

    close: returnEvent,
    compassneedscalibration: function() {
        return window.SensorEvent || window.Event;
    },
    complete: function(target) {
        if (OfflineAudioContext && target instanceof OfflineAudioContext) {
            return window.OfflineAudioCompletionEvent || window.Event;
        } else {
            return window.Event;
        }
    },

    compositionend: function() {
        return window.CompositionEvent || window.Event;
    },
    compositionstart: function() {
        return window.CompositionEvent || window.Event;
    },
    compositionupdate: function() {
        return window.CompositionEvent || window.Event;
    },

    contextmenu: function() {
        return window.MouseEvent || window.Event;
    },
    copy: function() {
        return window.ClipboardEvent || window.Event;
    },
    cut: function() {
        return window.ClipboardEvent || window.Event;
    },

    dblclick: function() {
        return window.MouseEvent || window.Event;
    },
    devicelight: function() {
        return window.DeviceLightEvent || window.Event;
    },
    devicemotion: function() {
        return window.DeviceMotionEvent || window.Event;
    },
    deviceorientation: function() {
        return window.DeviceOrientationEvent || window.Event;
    },
    deviceproximity: function() {
        return window.DeviceProximityEvent || window.Event;
    },

    dischargingtimechange: returnEvent,

    DOMActivate: function() {
        return window.UIEvent || window.Event;
    },
    DOMAttributeNameChanged: function() {
        return window.MutationNameEvent || window.Event;
    },
    DOMAttrModified: function() {
        return window.MutationEvent || window.Event;
    },
    DOMCharacterDataModified: function() {
        return window.MutationEvent || window.Event;
    },
    DOMContentLoaded: returnEvent,
    DOMElementNameChanged: function() {
        return window.MutationNameEvent || window.Event;
    },
    DOMFocusIn: function() {
        return window.FocusEvent || window.Event;
    },
    DOMFocusOut: function() {
        return window.FocusEvent || window.Event;
    },
    DOMNodeInserted: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeInsertedIntoDocument: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeRemoved: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeRemovedFromDocument: function() {
        return window.MutationEvent || window.Event;
    },
    DOMSubtreeModified: function() {
        return window.FocusEvent || window.Event;
    },
    downloading: returnEvent,

    drag: function() {
        return window.DragEvent || window.Event;
    },
    dragend: function() {
        return window.DragEvent || window.Event;
    },
    dragenter: function() {
        return window.DragEvent || window.Event;
    },
    dragleave: function() {
        return window.DragEvent || window.Event;
    },
    dragover: function() {
        return window.DragEvent || window.Event;
    },
    dragstart: function() {
        return window.DragEvent || window.Event;
    },
    drop: function() {
        return window.DragEvent || window.Event;
    },

    durationchange: returnEvent,
    ended: returnEvent,

    endEvent: function() {
        return window.TimeEvent || window.Event;
    },
    error: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else if (isNode(target)) {
            return window.UIEvent || window.Event;
        } else {
            return window.Event;
        }
    },
    focus: function() {
        return window.FocusEvent || window.Event;
    },
    focusin: function() {
        return window.FocusEvent || window.Event;
    },
    focusout: function() {
        return window.FocusEvent || window.Event;
    },

    fullscreenchange: returnEvent,
    fullscreenerror: returnEvent,

    gamepadconnected: function() {
        return window.GamepadEvent || window.Event;
    },
    gamepaddisconnected: function() {
        return window.GamepadEvent || window.Event;
    },

    hashchange: function() {
        return window.HashChangeEvent || window.Event;
    },

    input: returnEvent,
    invalid: returnEvent,

    keydown: function() {
        return window.KeyboardEvent || window.Event;
    },
    keyup: function() {
        return window.KeyboardEvent || window.Event;
    },
    keypress: function() {
        return window.KeyboardEvent || window.Event;
    },

    languagechange: returnEvent,
    levelchange: returnEvent,

    load: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else {
            return window.UIEvent || window.Event;
        }
    },

    loadeddata: returnEvent,
    loadedmetadata: returnEvent,

    loadend: function() {
        return window.ProgressEvent || window.Event;
    },
    loadstart: function() {
        return window.ProgressEvent || window.Event;
    },

    message: function() {
        return window.MessageEvent || window.Event;
    },

    mousedown: function() {
        return window.MouseEvent || window.Event;
    },
    mouseenter: function() {
        return window.MouseEvent || window.Event;
    },
    mouseleave: function() {
        return window.MouseEvent || window.Event;
    },
    mousemove: function() {
        return window.MouseEvent || window.Event;
    },
    mouseout: function() {
        return window.MouseEvent || window.Event;
    },
    mouseover: function() {
        return window.MouseEvent || window.Event;
    },
    mouseup: function() {
        return window.MouseEvent || window.Event;
    },

    noupdate: returnEvent,
    obsolete: returnEvent,
    offline: returnEvent,
    online: returnEvent,
    open: returnEvent,
    orientationchange: returnEvent,

    pagehide: function() {
        return window.PageTransitionEvent || window.Event;
    },
    pageshow: function() {
        return window.PageTransitionEvent || window.Event;
    },

    paste: function() {
        return window.ClipboardEvent || window.Event;
    },
    pause: returnEvent,
    pointerlockchange: returnEvent,
    pointerlockerror: returnEvent,
    play: returnEvent,
    playing: returnEvent,

    popstate: function() {
        return window.PopStateEvent || window.Event;
    },
    progress: function() {
        return window.ProgressEvent || window.Event;
    },

    ratechange: returnEvent,
    readystatechange: returnEvent,

    repeatevent: function() {
        return window.TimeEvent || window.Event;
    },

    reset: returnEvent,

    resize: function() {
        return window.UIEvent || window.Event;
    },
    scroll: function() {
        return window.UIEvent || window.Event;
    },

    seeked: returnEvent,
    seeking: returnEvent,

    select: function() {
        return window.UIEvent || window.Event;
    },
    show: function() {
        return window.MouseEvent || window.Event;
    },
    stalled: returnEvent,
    storage: function() {
        return window.StorageEvent || window.Event;
    },
    submit: returnEvent,
    success: returnEvent,
    suspend: returnEvent,

    SVGAbort: function() {
        return window.SVGEvent || window.Event;
    },
    SVGError: function() {
        return window.SVGEvent || window.Event;
    },
    SVGLoad: function() {
        return window.SVGEvent || window.Event;
    },
    SVGResize: function() {
        return window.SVGEvent || window.Event;
    },
    SVGScroll: function() {
        return window.SVGEvent || window.Event;
    },
    SVGUnload: function() {
        return window.SVGEvent || window.Event;
    },
    SVGZoom: function() {
        return window.SVGEvent || window.Event;
    },
    timeout: function() {
        return window.ProgressEvent || window.Event;
    },

    timeupdate: returnEvent,

    touchcancel: function() {
        return window.TouchEvent || window.Event;
    },
    touchend: function() {
        return window.TouchEvent || window.Event;
    },
    touchenter: function() {
        return window.TouchEvent || window.Event;
    },
    touchleave: function() {
        return window.TouchEvent || window.Event;
    },
    touchmove: function() {
        return window.TouchEvent || window.Event;
    },
    touchstart: function() {
        return window.TouchEvent || window.Event;
    },

    transitionend: function() {
        return window.TransitionEvent || window.Event;
    },
    unload: function() {
        return window.UIEvent || window.Event;
    },

    updateready: returnEvent,
    upgradeneeded: returnEvent,

    userproximity: function() {
        return window.SensorEvent || window.Event;
    },

    visibilitychange: returnEvent,
    volumechange: returnEvent,
    waiting: returnEvent,

    wheel: function() {
        return window.WheelEvent || window.Event;
    }
};


},
function(require, exports, module, global) {

var isFunction = require(5);


var isNode;


if (typeof(Node) !== "undefined" && isFunction(Node)) {
    isNode = function isNode(value) {
        return value instanceof Node;
    };
} else {
    isNode = function isNode(value) {
        return (
            typeof(value) === "object" &&
            typeof(value.nodeType) === "number" &&
            typeof(value.nodeName) === "string"
        );
    };
}


module.exports = isNode;


},
function(require, exports, module, global) {

var mathf = require(31),
    vec3 = require(38),
    vec4 = require(39),
    isNumber = require(33);


var color = exports;


color.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


color.create = function(r, g, b, a) {
    var out = new color.ArrayType(4);

    out[0] = r !== undefined ? r : 0;
    out[1] = g !== undefined ? g : 0;
    out[2] = b !== undefined ? b : 0;
    out[3] = a !== undefined ? a : 1;

    return out;
};

color.copy = vec4.copy;

color.clone = function(a) {
    var out = new color.ArrayType(4);

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    return out;
};

color.setRGB = vec3.set;
color.setRGBA = vec4.set;

color.add = vec4.add;
color.sub = vec4.sub;

color.mul = vec4.mul;
color.div = vec4.div;

color.sadd = vec4.sadd;
color.ssub = vec4.ssub;

color.smul = vec4.smul;
color.sdiv = vec4.sdiv;

color.lengthSqValues = vec4.lengthSqValues;
color.lengthValues = vec4.lengthValues;
color.invLengthValues = vec4.invLengthValues;

color.dot = vec4.dot;

color.lengthSq = vec4.lengthSq;

color.length = vec4.length;

color.invLength = vec4.invLength;

color.setLength = vec4.setLength;

color.normalize = vec4.normalize;

color.lerp = vec4.lerp;

color.min = vec4.min;

color.max = vec4.max;

color.clamp = vec4.clamp;

color.equal = vec4.equal;

color.notEqual = vec4.notEqual;


var cmin = color.create(0, 0, 0, 0),
    cmax = color.create(1, 1, 1, 1);

color.cnormalize = function(out, a) {
    return color.clamp(out, a, cmin, cmax);
};

color.str = function(out) {
    return "Color(" + out[0] + ", " + out[1] + ", " + out[2] + ", " + out[3] + ")";
};

color.set = function(out, r, g, b, a) {
    var type = typeof(r);

    if (type === "number") {
        out[0] = r !== undefined ? r : 0;
        out[1] = g !== undefined ? g : 0;
        out[2] = b !== undefined ? b : 0;
        out[3] = a !== undefined ? a : 1;
    } else if (type === "string") {
        color.fromStyle(out, r);
    } else if (r.length === +r.length) {
        out[0] = r[0] || 0;
        out[1] = r[1] || 0;
        out[2] = r[2] || 0;
        out[3] = r[3] || 1;
    }

    return out;
};

function to256(value) {
    return (value * 255) | 0;
}

color.toRGB = function(out, alpha) {
    if (isNumber(alpha)) {
        return "rgba(" + to256(out[0]) + "," + to256(out[1]) + "," + to256(out[2]) + "," + (mathf.clamp01(alpha) || 0) + ")";
    } else {
        return "rgb(" + to256(out[0]) + "," + to256(out[1]) + "," + to256(out[2]) + ")";
    }
};

color.toRGBA = function(out) {
    return "rgba(" + to256(out[0]) + "," + to256(out[1]) + "," + to256(out[2]) + "," + (mathf.clamp01(out[3]) || 0) + ")";
};

function toHEX(value) {
    value = mathf.clamp(value * 255, 0, 255) | 0;

    if (value < 16) {
        return "0" + value.toString(16);
    } else if (value < 255) {
        return value.toString(16);
    } else {
        return "ff";
    }
}

color.toHEX = function(out) {
    return "#" + toHEX(out[0]) + toHEX(out[1]) + toHEX(out[2]);
};

var rgb255 = /^rgb\((\d+),(?:\s+)?(\d+),(?:\s+)?(\d+)\)$/i,
    inv255 = 1 / 255;
color.fromRGB = function(out, style) {
    var values = rgb255.exec(style);
    out[0] = mathf.min(255, Number(values[1])) * inv255;
    out[1] = mathf.min(255, Number(values[2])) * inv255;
    out[2] = mathf.min(255, Number(values[3])) * inv255;
    out[3] = 1;
    return out;
};

var rgba255 = /^rgba\((\d+),(?:\s+)?(\d+),(?:\s+)?(\d+),(?:\s+)?((?:\.)?\d+(?:\.\d+)?)\)$/i;
color.fromRGBA = function(out, style) {
    var values = rgba255.exec(style);
    out[0] = mathf.min(255, Number(values[1])) * inv255;
    out[1] = mathf.min(255, Number(values[2])) * inv255;
    out[2] = mathf.min(255, Number(values[3])) * inv255;
    out[3] = mathf.min(1, Number(values[4]));
    return out;
};

var rgb100 = /^rgb\((\d+)\%,(?:\s+)?(\d+)\%,(?:\s+)?(\d+)\%\)$/i,
    inv100 = 1 / 100;
color.fromRGB100 = function(out, style) {
    var values = rgb100.exec(style);
    out[0] = mathf.min(100, Number(values[1])) * inv100;
    out[1] = mathf.min(100, Number(values[2])) * inv100;
    out[2] = mathf.min(100, Number(values[3])) * inv100;
    out[3] = 1;
    return out;
};

color.fromHEX = function(out, style) {
    out[0] = parseInt(style.substr(1, 2), 16) * inv255;
    out[1] = parseInt(style.substr(3, 2), 16) * inv255;
    out[2] = parseInt(style.substr(5, 2), 16) * inv255;
    out[3] = 1;
    return out;
};

var hex3to6 = /#(.)(.)(.)/,
    hex3to6String = "#$1$1$2$2$3$3";
color.fromHEX3 = function(out, style) {
    style = style.replace(hex3to6, hex3to6String);
    out[0] = parseInt(style.substr(1, 2), 16) * inv255;
    out[1] = parseInt(style.substr(3, 2), 16) * inv255;
    out[2] = parseInt(style.substr(5, 2), 16) * inv255;
    out[3] = 1;
    return out;
};

color.fromColorName = function(out, style) {
    return color.fromHEX(out, colorNames[style.toLowerCase()]);
};

var hex6 = /^\#([0.0-9a-f]{6})$/i,
    hex3 = /^\#([0.0-9a-f])([0.0-9a-f])([0.0-9a-f])$/i,
    colorName = /^(\w+)$/i;
color.fromStyle = function(out, style) {
    if (rgb255.test(style)) {
        return color.fromRGB(out, style);
    } else if (rgba255.test(style)) {
        return color.fromRGBA(out, style);
    } else if (rgb100.test(style)) {
        return color.fromRGB100(out, style);
    } else if (hex6.test(style)) {
        return color.fromHEX(out, style);
    } else if (hex3.test(style)) {
        return color.fromHEX3(out, style);
    } else if (colorName.test(style)) {
        return color.fromColorName(out, style);
    } else {
        return out;
    }
};

var colorNames = color.colorNames = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    grey: "#808080",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgrey: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370d8",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#d87093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
};


},
function(require, exports, module, global) {

var mathf = require(31);


var vec3 = exports;


vec3.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


vec3.create = function(x, y, z) {
    var out = new vec3.ArrayType(3);

    out[0] = x !== undefined ? x : 0;
    out[1] = y !== undefined ? y : 0;
    out[2] = z !== undefined ? z : 0;

    return out;
};

vec3.copy = function(out, a) {

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];

    return out;
};

vec3.clone = function(a) {
    var out = new vec3.ArrayType(3);

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];

    return out;
};

vec3.set = function(out, x, y, z) {

    out[0] = x !== undefined ? x : 0;
    out[1] = y !== undefined ? y : 0;
    out[2] = z !== undefined ? z : 0;

    return out;
};

vec3.add = function(out, a, b) {

    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];

    return out;
};

vec3.sub = function(out, a, b) {

    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];

    return out;
};

vec3.mul = function(out, a, b) {

    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];

    return out;
};

vec3.div = function(out, a, b) {
    var bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = a[0] * (bx !== 0 ? 1 / bx : bx);
    out[1] = a[1] * (by !== 0 ? 1 / by : by);
    out[2] = a[2] * (bz !== 0 ? 1 / bz : bz);

    return out;
};

vec3.sadd = function(out, a, s) {

    out[0] = a[0] + s;
    out[1] = a[1] + s;
    out[2] = a[2] + s;

    return out;
};

vec3.ssub = function(out, a, s) {

    out[0] = a[0] - s;
    out[1] = a[1] - s;
    out[2] = a[2] - s;

    return out;
};

vec3.smul = function(out, a, s) {

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;

    return out;
};

vec3.sdiv = function(out, a, s) {
    s = s !== 0 ? 1 / s : s;

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;

    return out;
};

vec3.lengthSqValues = function(x, y, z) {

    return x * x + y * y + z * z;
};

vec3.lengthValues = function(x, y, z) {
    var lsq = vec3.lengthSqValues(x, y, z);

    return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
};

vec3.invLengthValues = function(x, y, z) {
    var lsq = vec3.lengthSqValues(x, y, z);

    return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
};

vec3.cross = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;

    return out;
};

vec3.dot = function(a, b) {

    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

vec3.lengthSq = function(a) {

    return vec3.dot(a, a);
};

vec3.length = function(a) {
    var lsq = vec3.lengthSq(a);

    return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
};

vec3.invLength = function(a) {
    var lsq = vec3.lengthSq(a);

    return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
};

vec3.setLength = function(out, a, length) {
    var x = a[0],
        y = a[1],
        z = a[2],
        s = length * vec3.invLengthValues(x, y, z);

    out[0] = x * s;
    out[1] = y * s;
    out[2] = z * s;

    return out;
};

vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        invlsq = vec3.invLengthValues(x, y, z);

    out[0] = x * invlsq;
    out[1] = y * invlsq;
    out[2] = z * invlsq;

    return out;
};

vec3.inverse = function(out, a) {

    out[0] = a[0] * -1;
    out[1] = a[1] * -1;
    out[2] = a[2] * -1;

    return out;
};

vec3.lerp = function(out, a, b, x) {
    var lerp = mathf.lerp;

    out[0] = lerp(a[0], b[0], x);
    out[1] = lerp(a[1], b[1], x);
    out[2] = lerp(a[2], b[2], x);

    return out;
};

vec3.min = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = bx < ax ? bx : ax;
    out[1] = by < ay ? by : ay;
    out[2] = bz < az ? bz : az;

    return out;
};

vec3.max = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = bx > ax ? bx : ax;
    out[1] = by > ay ? by : ay;
    out[2] = bz > az ? bz : az;

    return out;
};

vec3.clamp = function(out, a, min, max) {
    var x = a[0],
        y = a[1],
        z = a[2],
        minx = min[0],
        miny = min[1],
        minz = min[2],
        maxx = max[0],
        maxy = max[1],
        maxz = max[2];

    out[0] = x < minx ? minx : x > maxx ? maxx : x;
    out[1] = y < miny ? miny : y > maxy ? maxy : y;
    out[2] = z < minz ? minz : z > maxz ? maxz : z;

    return out;
};

vec3.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2];

    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];

    return out;
};

vec3.transformMat4 = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2];

    out[0] = x * m[0] + y * m[4] + z * m[8] + m[12];
    out[1] = x * m[1] + y * m[5] + z * m[9] + m[13];
    out[2] = x * m[2] + y * m[6] + z * m[10] + m[14];

    return out;
};

vec3.transformMat4Rotation = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2];

    out[0] = x * m[0] + y * m[4] + z * m[8];
    out[1] = x * m[1] + y * m[5] + z * m[9];
    out[2] = x * m[2] + y * m[6] + z * m[10];

    return out;
};

vec3.transformProjection = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2],
        d = x * m[3] + y * m[7] + z * m[11] + m[15];

    d = d !== 0 ? 1 / d : d;

    out[0] = (x * m[0] + y * m[4] + z * m[8] + m[12]) * d;
    out[1] = (x * m[1] + y * m[5] + z * m[9] + m[13]) * d;
    out[2] = (x * m[2] + y * m[6] + z * m[10] + m[14]) * d;

    return out;
};

vec3.transformQuat = function(out, a, q) {
    var x = a[0],
        y = a[1],
        z = a[2],
        qx = q[0],
        qy = q[1],
        qz = q[2],
        qw = q[3],

        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return out;
};

vec3.positionFromMat4 = function(out, m) {

    out[0] = m[12];
    out[1] = m[13];
    out[2] = m[14];

    return out;
};

vec3.scaleFromMat3 = function(out, m) {

    out[0] = vec3.lengthValues(m[0], m[3], m[6]);
    out[1] = vec3.lengthValues(m[1], m[4], m[7]);
    out[2] = vec3.lengthValues(m[2], m[5], m[8]);

    return out;
};

vec3.scaleFromMat4 = function(out, m) {

    out[0] = vec3.lengthValues(m[0], m[4], m[8]);
    out[1] = vec3.lengthValues(m[1], m[5], m[9]);
    out[2] = vec3.lengthValues(m[2], m[6], m[10]);

    return out;
};

vec3.equal = function(a, b) {
    return !(
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2]
    );
};

vec3.notEqual = function(a, b) {
    return (
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2]
    );
};

vec3.str = function(out) {

    return "Vec3(" + out[0] + ", " + out[1] + ", " + out[2] + ")";
};


},
function(require, exports, module, global) {

var mathf = require(31);


var vec4 = exports;


vec4.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


vec4.create = function(x, y, z, w) {
    var out = new vec4.ArrayType(4);

    out[0] = x !== undefined ? x : 0;
    out[1] = y !== undefined ? y : 0;
    out[2] = z !== undefined ? z : 0;
    out[3] = w !== undefined ? w : 1;

    return out;
};

vec4.copy = function(out, a) {

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    return out;
};

vec4.clone = function(a) {
    var out = new vec4.ArrayType(4);

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    return out;
};

vec4.set = function(out, x, y, z, w) {

    out[0] = x !== undefined ? x : 0;
    out[1] = y !== undefined ? y : 0;
    out[2] = z !== undefined ? z : 0;
    out[3] = w !== undefined ? w : 0;

    return out;
};

vec4.add = function(out, a, b) {

    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];

    return out;
};

vec4.sub = function(out, a, b) {

    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];

    return out;
};

vec4.mul = function(out, a, b) {

    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];

    return out;
};

vec4.div = function(out, a, b) {
    var bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    out[0] = a[0] * (bx !== 0 ? 1 / bx : bx);
    out[1] = a[1] * (by !== 0 ? 1 / by : by);
    out[2] = a[2] * (bz !== 0 ? 1 / bz : bz);
    out[3] = a[3] * (bw !== 0 ? 1 / bw : bw);

    return out;
};

vec4.sadd = function(out, a, s) {

    out[0] = a[0] + s;
    out[1] = a[1] + s;
    out[2] = a[2] + s;
    out[3] = a[3] + s;

    return out;
};

vec4.ssub = function(out, a, s) {

    out[0] = a[0] - s;
    out[1] = a[1] - s;
    out[2] = a[2] - s;
    out[3] = a[3] - s;

    return out;
};

vec4.smul = function(out, a, s) {

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;

    return out;
};

vec4.sdiv = function(out, a, s) {
    s = s !== 0 ? 1 / s : s;

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;

    return out;
};

vec4.lengthSqValues = function(x, y, z, w) {

    return x * x + y * y + z * z + w * w;
};

vec4.lengthValues = function(x, y, z, w) {
    var lsq = vec4.lengthSqValues(x, y, z, w);

    return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
};

vec4.invLengthValues = function(x, y, z, w) {
    var lsq = vec4.lengthSqValues(x, y, z, w);

    return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
};

vec4.dot = function(a, b) {

    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

vec4.lengthSq = function(a) {

    return vec4.dot(a, a);
};

vec4.length = function(a) {
    var lsq = vec4.lengthSq(a);

    return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
};

vec4.invLength = function(a) {
    var lsq = vec4.lengthSq(a);

    return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
};

vec4.setLength = function(out, a, length) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3],
        s = length * vec4.invLengthValues(x, y, z, w);

    out[0] = x * s;
    out[1] = y * s;
    out[2] = z * s;
    out[3] = w * s;

    return out;
};

vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3],
        lsq = vec4.invLengthValues(x, y, z, w);

    out[0] = x * lsq;
    out[1] = y * lsq;
    out[2] = z * lsq;
    out[3] = w * lsq;

    return out;
};

vec4.inverse = function(out, a) {

    out[0] = a[0] * -1;
    out[1] = a[1] * -1;
    out[2] = a[2] * -1;
    out[3] = a[3] * -1;

    return out;
};

vec4.lerp = function(out, a, b, x) {
    var lerp = mathf.lerp;

    out[0] = lerp(a[0], b[0], x);
    out[1] = lerp(a[1], b[1], x);
    out[2] = lerp(a[2], b[2], x);
    out[3] = lerp(a[3], b[3], x);

    return out;
};

vec4.min = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    out[0] = bx < ax ? bx : ax;
    out[1] = by < ay ? by : ay;
    out[2] = bz < az ? bz : az;
    out[3] = bw < aw ? bw : aw;

    return out;
};

vec4.max = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    out[0] = bx > ax ? bx : ax;
    out[1] = by > ay ? by : ay;
    out[2] = bz > az ? bz : az;
    out[3] = bw > aw ? bw : aw;

    return out;
};

vec4.clamp = function(out, a, min, max) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3],
        minx = min[0],
        miny = min[1],
        minz = min[2],
        minw = min[3],
        maxx = max[0],
        maxy = max[1],
        maxz = max[2],
        maxw = max[3];

    out[0] = x < minx ? minx : x > maxx ? maxx : x;
    out[1] = y < miny ? miny : y > maxy ? maxy : y;
    out[2] = z < minz ? minz : z > maxz ? maxz : z;
    out[3] = w < minw ? minw : w > maxw ? maxw : w;

    return out;
};

vec4.transformMat4 = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];

    out[0] = x * m[0] + y * m[4] + z * m[8] + w * m[12];
    out[1] = x * m[1] + y * m[5] + z * m[9] + w * m[13];
    out[2] = x * m[2] + y * m[6] + z * m[10] + w * m[14];
    out[3] = x * m[3] + y * m[7] + z * m[11] + w * m[15];

    return out;
};

vec4.transformProjection = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3],
        d = x * m[3] + y * m[7] + z * m[11] + w * m[15];

    d = d !== 0 ? 1 / d : d;

    out[0] = (x * m[0] + y * m[4] + z * m[8] + w * m[12]) * d;
    out[1] = (x * m[1] + y * m[5] + z * m[9] + w * m[13]) * d;
    out[2] = (x * m[2] + y * m[6] + z * m[10] + w * m[14]) * d;
    out[3] = (x * m[3] + y * m[7] + z * m[11] + w * m[15]) * d;

    return out;
};

vec4.positionFromMat4 = function(out, m) {

    out[0] = m[12];
    out[1] = m[13];
    out[2] = m[14];
    out[3] = m[15];

    return out;
};

vec4.scaleFromMat4 = function(out, m) {

    out[0] = vec4.lengthValues(m[0], m[4], m[8], m[12]);
    out[1] = vec4.lengthValues(m[1], m[5], m[9], m[13]);
    out[2] = vec4.lengthValues(m[2], m[6], m[10], m[14]);
    out[3] = vec4.lengthValues(m[3], m[7], m[11], m[15]);

    return out;
};

vec4.equal = function(a, b) {
    return !(
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3]
    );
};

vec4.notEqual = function(a, b) {
    return (
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3]
    );
};

vec4.str = function(out) {

    return "Vec4(" + out[0] + ", " + out[1] + ", " + out[2] + ", " + out[3] + ")";
};


},
function(require, exports, module, global) {

var reverse = require(41);


var enums = exports;


enums.blending = require(45);
enums.cullFace = require(49);
enums.depth = require(51);
enums.filterMode = require(52);

enums.gl = require(50);
enums.glValues = reverse(enums.gl);

enums.textureFormat = require(53);
enums.textureType = require(54);
enums.textureWrap = require(55);


},
function(require, exports, module, global) {

var keys = require(17),
    isArrayLike = require(42);


module.exports = reverse;


function reverse(object) {
    return isArrayLike(object) ? reverseArray(object) : reverseObject(Object(object));
}

function reverseArray(array) {
    var i = array.length,
        results = new Array(i),
        j = 0;

    while (i--) {
        results[j++] = array[i];
    }

    return results;
}

function reverseObject(object) {
    var objectKeys = keys(object),
        i = -1,
        il = objectKeys.length - 1,
        results = {},
        key;

    while (i++ < il) {
        key = objectKeys[i];
        results[object[key]] = key;
    }

    return results;
}


},
function(require, exports, module, global) {

var isLength = require(43),
    isFunction = require(5),
    isObjectLike = require(44);


module.exports = isArrayLike;


function isArrayLike(value) {
    return isObjectLike(value) && isLength(value.length) && !isFunction(value);
}


},
function(require, exports, module, global) {

var isNumber = require(33);


var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;


module.exports = isLength;


function isLength(value) {
    return isNumber(value) && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER;
}


},
function(require, exports, module, global) {

var isNullOrUndefined = require(6);


module.exports = isObjectLike;


function isObjectLike(value) {
    return (!isNullOrUndefined(value) && typeof(value) === "object") || false;
}


},
function(require, exports, module, global) {

var enums = require(46);


module.exports = enums([
    "NONE",
    "DEFAULT",
    "ADDITIVE",
    "SUBTRACTIVE",
    "MULTIPLY"
]);


},
function(require, exports, module, global) {

var create = require(13),
    defineProperty = require(19),
    forEach = require(47),
    isString = require(9),
    isNumber = require(33),
    emptyFunction = require(26);


var reSpliter = /[\s\, ]+/,
    descriptor = {
        configurable: false,
        enumerable: true,
        writable: false,
        value: null
    },
    freeze = Object.freeze || emptyFunction;


module.exports = enums;


function enums(values) {
    if (isString(values)) {
        values = values.split(reSpliter);
        return createEnums(values);
    } else if (values) {
        return createEnums(values);
    } else {
        throw new TypeError("enums(values) values must be an array or a string");
    }
}

function createEnums(values) {
    var object = create(null);
    forEach(values, createEnum.set(object));
    freeze(object);
    return object;
}

function createEnum(value, key) {
    if (isNumber(key)) {
        key = value;
        value = stringToHash(value);
    }

    descriptor.value = value;
    defineProperty(createEnum.object, key, descriptor);
    descriptor.value = null;
}

createEnum.set = function(object) {
    this.object = object;
    return this;
};

function stringToHash(value) {
    var result = 0,
        i = -1,
        il = value.length - 1;

    while (i++ < il) {
        result = result * 31 + value.charCodeAt(i);
    }

    return result;
}


},
function(require, exports, module, global) {

var keys = require(17),
    isNullOrUndefined = require(6),
    fastBindThis = require(48),
    isArrayLike = require(42);


module.exports = forEach;


function forEach(object, callback, thisArg) {
    callback = isNullOrUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 2);
    return isArrayLike(object) ? forEachArray(object, callback) : forEachObject(object, callback);
}

function forEachArray(array, callback) {
    var i = -1,
        il = array.length - 1;

    while (i++ < il) {
        if (callback(array[i], i) === false) {
            return false;
        }
    }

    return array;
}

function forEachObject(object, callback) {
    var objectKeys = keys(object),
        i = -1,
        il = objectKeys.length - 1,
        key;

    while (i++ < il) {
        key = objectKeys[i];

        if (callback(object[key], key) === false) {
            return false;
        }
    }

    return object;
}


},
function(require, exports, module, global) {

var isNumber = require(33);


module.exports = fastBindThis;


function fastBindThis(callback, thisArg, length) {
    switch ((isNumber(length) ? length : callback.length) || 0) {
        case 0:
            return function bound() {
                return callback.call(thisArg);
            };
        case 1:
            return function bound(a1) {
                return callback.call(thisArg, a1);
            };
        case 2:
            return function bound(a1, a2) {
                return callback.call(thisArg, a1, a2);
            };
        case 3:
            return function bound(a1, a2, a3) {
                return callback.call(thisArg, a1, a2, a3);
            };
        case 4:
            return function bound(a1, a2, a3, a4) {
                return callback.call(thisArg, a1, a2, a3, a4);
            };
        default:
            return function bound() {
                return callback.apply(thisArg, arguments);
            };
    }
}


},
function(require, exports, module, global) {

var enums = require(46),
    gl = require(50);


module.exports = enums({
    NONE: 1,
    BACK: gl.BACK,
    FRONT: gl.FRONT,
    FRONT_AND_BACK: gl.FRONT_AND_BACK
});


},
function(require, exports, module, global) {

var enums = require(46);


module.exports = enums({
    ACTIVE_ATTRIBUTES: 35721,
    ACTIVE_TEXTURE: 34016,
    ACTIVE_UNIFORMS: 35718,
    ALIASED_LINE_WIDTH_RANGE: 33902,
    ALIASED_POINT_SIZE_RANGE: 33901,
    ALPHA: 6406,
    ALPHA_BITS: 3413,
    ALWAYS: 519,
    ARRAY_BUFFER: 34962,
    ARRAY_BUFFER_BINDING: 34964,
    ATTACHED_SHADERS: 35717,
    BACK: 1029,
    BLEND: 3042,
    BLEND_COLOR: 32773,
    BLEND_DST_ALPHA: 32970,
    BLEND_DST_RGB: 32968,
    BLEND_EQUATION: 32777,
    BLEND_EQUATION_ALPHA: 34877,
    BLEND_EQUATION_RGB: 32777,
    BLEND_SRC_ALPHA: 32971,
    BLEND_SRC_RGB: 32969,
    BLUE_BITS: 3412,
    BOOL: 35670,
    BOOL_VEC2: 35671,
    BOOL_VEC3: 35672,
    BOOL_VEC4: 35673,
    BROWSER_DEFAULT_WEBGL: 37444,
    BUFFER_SIZE: 34660,
    BUFFER_USAGE: 34661,
    BYTE: 5120,
    CCW: 2305,
    CLAMP_TO_EDGE: 33071,
    COLOR_ATTACHMENT0: 36064,
    COLOR_BUFFER_BIT: 16384,
    COLOR_CLEAR_VALUE: 3106,
    COLOR_WRITEMASK: 3107,
    COMPILE_STATUS: 35713,
    COMPRESSED_TEXTURE_FORMATS: 34467,
    CONSTANT_ALPHA: 32771,
    CONSTANT_COLOR: 32769,
    CONTEXT_LOST_WEBGL: 37442,
    CULL_FACE: 2884,
    CULL_FACE_MODE: 2885,
    CURRENT_PROGRAM: 35725,
    CURRENT_VERTEX_ATTRIB: 34342,
    CW: 2304,
    DECR: 7683,
    DECR_WRAP: 34056,
    DELETE_STATUS: 35712,
    DEPTH_ATTACHMENT: 36096,
    DEPTH_BITS: 3414,
    DEPTH_BUFFER_BIT: 256,
    DEPTH_CLEAR_VALUE: 2931,
    DEPTH_COMPONENT: 6402,
    DEPTH_COMPONENT16: 33189,
    DEPTH_FUNC: 2932,
    DEPTH_RANGE: 2928,
    DEPTH_STENCIL: 34041,
    DEPTH_STENCIL_ATTACHMENT: 33306,
    DEPTH_TEST: 2929,
    DEPTH_WRITEMASK: 2930,
    DITHER: 3024,
    DONT_CARE: 4352,
    DST_ALPHA: 772,
    DST_COLOR: 774,
    DYNAMIC_DRAW: 35048,
    ELEMENT_ARRAY_BUFFER: 34963,
    ELEMENT_ARRAY_BUFFER_BINDING: 34965,
    EQUAL: 514,
    FASTEST: 4353,
    FLOAT: 5126,
    FLOAT_MAT2: 35674,
    FLOAT_MAT3: 35675,
    FLOAT_MAT4: 35676,
    FLOAT_VEC2: 35664,
    FLOAT_VEC3: 35665,
    FLOAT_VEC4: 35666,
    FRAGMENT_SHADER: 35632,
    FRAMEBUFFER: 36160,
    FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: 36049,
    FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: 36048,
    FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: 36051,
    FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: 36050,
    FRAMEBUFFER_BINDING: 36006,
    FRAMEBUFFER_COMPLETE: 36053,
    FRAMEBUFFER_INCOMPLETE_ATTACHMENT: 36054,
    FRAMEBUFFER_INCOMPLETE_DIMENSIONS: 36057,
    FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: 36055,
    FRAMEBUFFER_UNSUPPORTED: 36061,
    FRONT: 1028,
    FRONT_AND_BACK: 1032,
    FRONT_FACE: 2886,
    FUNC_ADD: 32774,
    FUNC_REVERSE_SUBTRACT: 32779,
    FUNC_SUBTRACT: 32778,
    GENERATE_MIPMAP_HINT: 33170,
    GEQUAL: 518,
    GREATER: 516,
    GREEN_BITS: 3411,
    HIGH_FLOAT: 36338,
    HIGH_INT: 36341,
    IMPLEMENTATION_COLOR_READ_FORMAT: 35739,
    IMPLEMENTATION_COLOR_READ_TYPE: 35738,
    INCR: 7682,
    INCR_WRAP: 34055,
    INT: 5124,
    INT_VEC2: 35667,
    INT_VEC3: 35668,
    INT_VEC4: 35669,
    INVALID_ENUM: 1280,
    INVALID_FRAMEBUFFER_OPERATION: 1286,
    INVALID_OPERATION: 1282,
    INVALID_VALUE: 1281,
    INVERT: 5386,
    KEEP: 7680,
    LEQUAL: 515,
    LESS: 513,
    LINEAR: 9729,
    LINEAR_MIPMAP_LINEAR: 9987,
    LINEAR_MIPMAP_NEAREST: 9985,
    LINES: 1,
    LINE_LOOP: 2,
    LINE_STRIP: 3,
    LINE_WIDTH: 2849,
    LINK_STATUS: 35714,
    LOW_FLOAT: 36336,
    LOW_INT: 36339,
    LUMINANCE: 6409,
    LUMINANCE_ALPHA: 6410,
    MAX_COMBINED_TEXTURE_IMAGE_UNITS: 35661,
    MAX_CUBE_MAP_TEXTURE_SIZE: 34076,
    MAX_FRAGMENT_UNIFORM_VECTORS: 36349,
    MAX_RENDERBUFFER_SIZE: 34024,
    MAX_TEXTURE_IMAGE_UNITS: 34930,
    MAX_TEXTURE_SIZE: 3379,
    MAX_VARYING_VECTORS: 36348,
    MAX_VERTEX_ATTRIBS: 34921,
    MAX_VERTEX_TEXTURE_IMAGE_UNITS: 35660,
    MAX_VERTEX_UNIFORM_VECTORS: 36347,
    MAX_VIEWPORT_DIMS: 3386,
    MEDIUM_FLOAT: 36337,
    MEDIUM_INT: 36340,
    MIRRORED_REPEAT: 33648,
    NEAREST: 9728,
    NEAREST_MIPMAP_LINEAR: 9986,
    NEAREST_MIPMAP_NEAREST: 9984,
    NEVER: 512,
    NICEST: 4354,
    NONE: 0,
    NOTEQUAL: 517,
    NO_ERROR: 0,
    ONE: 1,
    ONE_MINUS_CONSTANT_ALPHA: 32772,
    ONE_MINUS_CONSTANT_COLOR: 32770,
    ONE_MINUS_DST_ALPHA: 773,
    ONE_MINUS_DST_COLOR: 775,
    ONE_MINUS_SRC_ALPHA: 771,
    ONE_MINUS_SRC_COLOR: 769,
    OUT_OF_MEMORY: 1285,
    PACK_ALIGNMENT: 3333,
    POINTS: 0,
    POLYGON_OFFSET_FACTOR: 32824,
    POLYGON_OFFSET_FILL: 32823,
    POLYGON_OFFSET_UNITS: 10752,
    RED_BITS: 3410,
    RENDERBUFFER: 36161,
    RENDERBUFFER_ALPHA_SIZE: 36179,
    RENDERBUFFER_BINDING: 36007,
    RENDERBUFFER_BLUE_SIZE: 36178,
    RENDERBUFFER_DEPTH_SIZE: 36180,
    RENDERBUFFER_GREEN_SIZE: 36177,
    RENDERBUFFER_HEIGHT: 36163,
    RENDERBUFFER_INTERNAL_FORMAT: 36164,
    RENDERBUFFER_RED_SIZE: 36176,
    RENDERBUFFER_STENCIL_SIZE: 36181,
    RENDERBUFFER_WIDTH: 36162,
    RENDERER: 7937,
    REPEAT: 10497,
    REPLACE: 7681,
    RGB: 6407,
    RGB5_A1: 32855,
    RGB565: 36194,
    RGBA: 6408,
    RGBA4: 32854,
    SAMPLER_2D: 35678,
    SAMPLER_CUBE: 35680,
    SAMPLES: 32937,
    SAMPLE_ALPHA_TO_COVERAGE: 32926,
    SAMPLE_BUFFERS: 32936,
    SAMPLE_COVERAGE: 32928,
    SAMPLE_COVERAGE_INVERT: 32939,
    SAMPLE_COVERAGE_VALUE: 32938,
    SCISSOR_BOX: 3088,
    SCISSOR_TEST: 3089,
    SHADER_TYPE: 35663,
    SHADING_LANGUAGE_VERSION: 35724,
    SHORT: 5122,
    SRC_ALPHA: 770,
    SRC_ALPHA_SATURATE: 776,
    SRC_COLOR: 768,
    STATIC_DRAW: 35044,
    STENCIL_ATTACHMENT: 36128,
    STENCIL_BACK_FAIL: 34817,
    STENCIL_BACK_FUNC: 34816,
    STENCIL_BACK_PASS_DEPTH_FAIL: 34818,
    STENCIL_BACK_PASS_DEPTH_PASS: 34819,
    STENCIL_BACK_REF: 36003,
    STENCIL_BACK_VALUE_MASK: 36004,
    STENCIL_BACK_WRITEMASK: 36005,
    STENCIL_BITS: 3415,
    STENCIL_BUFFER_BIT: 1024,
    STENCIL_CLEAR_VALUE: 2961,
    STENCIL_FAIL: 2964,
    STENCIL_FUNC: 2962,
    STENCIL_INDEX: 6401,
    STENCIL_INDEX8: 36168,
    STENCIL_PASS_DEPTH_FAIL: 2965,
    STENCIL_PASS_DEPTH_PASS: 2966,
    STENCIL_REF: 2967,
    STENCIL_TEST: 2960,
    STENCIL_VALUE_MASK: 2963,
    STENCIL_WRITEMASK: 2968,
    STREAM_DRAW: 35040,
    SUBPIXEL_BITS: 3408,
    TEXTURE: 5890,
    TEXTURE0: 33984,
    TEXTURE1: 33985,
    TEXTURE2: 33986,
    TEXTURE3: 33987,
    TEXTURE4: 33988,
    TEXTURE5: 33989,
    TEXTURE6: 33990,
    TEXTURE7: 33991,
    TEXTURE8: 33992,
    TEXTURE9: 33993,
    TEXTURE10: 33994,
    TEXTURE11: 33995,
    TEXTURE12: 33996,
    TEXTURE13: 33997,
    TEXTURE14: 33998,
    TEXTURE15: 33999,
    TEXTURE16: 34000,
    TEXTURE17: 34001,
    TEXTURE18: 34002,
    TEXTURE19: 34003,
    TEXTURE20: 34004,
    TEXTURE21: 34005,
    TEXTURE22: 34006,
    TEXTURE23: 34007,
    TEXTURE24: 34008,
    TEXTURE25: 34009,
    TEXTURE26: 34010,
    TEXTURE27: 34011,
    TEXTURE28: 34012,
    TEXTURE29: 34013,
    TEXTURE30: 34014,
    TEXTURE31: 34015,
    TEXTURE_2D: 3553,
    TEXTURE_BINDING_2D: 32873,
    TEXTURE_BINDING_CUBE_MAP: 34068,
    TEXTURE_CUBE_MAP: 34067,
    TEXTURE_CUBE_MAP_NEGATIVE_X: 34070,
    TEXTURE_CUBE_MAP_NEGATIVE_Y: 34072,
    TEXTURE_CUBE_MAP_NEGATIVE_Z: 34074,
    TEXTURE_CUBE_MAP_POSITIVE_X: 34069,
    TEXTURE_CUBE_MAP_POSITIVE_Y: 34071,
    TEXTURE_CUBE_MAP_POSITIVE_Z: 34073,
    TEXTURE_MAG_FILTER: 10240,
    TEXTURE_MIN_FILTER: 10241,
    TEXTURE_WRAP_S: 10242,
    TEXTURE_WRAP_T: 10243,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    TRIANGLE_STRIP: 5,
    UNPACK_ALIGNMENT: 3317,
    UNPACK_COLORSPACE_CONVERSION_WEBGL: 37443,
    UNPACK_FLIP_Y_WEBGL: 37440,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL: 37441,
    UNSIGNED_BYTE: 5121,
    UNSIGNED_INT: 5125,
    UNSIGNED_SHORT: 5123,
    UNSIGNED_SHORT_4_4_4_4: 32819,
    UNSIGNED_SHORT_5_5_5_1: 32820,
    UNSIGNED_SHORT_5_6_5: 33635,
    VALIDATE_STATUS: 35715,
    VENDOR: 7936,
    VERSION: 7938,
    VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: 34975,
    VERTEX_ATTRIB_ARRAY_ENABLED: 34338,
    VERTEX_ATTRIB_ARRAY_NORMALIZED: 34922,
    VERTEX_ATTRIB_ARRAY_POINTER: 34373,
    VERTEX_ATTRIB_ARRAY_SIZE: 34339,
    VERTEX_ATTRIB_ARRAY_STRIDE: 34340,
    VERTEX_ATTRIB_ARRAY_TYPE: 34341,
    VERTEX_SHADER: 35633,
    VIEWPORT: 2978,
    ZERO: 0
});


},
function(require, exports, module, global) {

var enums = require(46),
    gl = require(50);


module.exports = enums({
    NONE: 1,
    NEVER: gl.NEVER,
    LESS: gl.LESS,
    EQUAL: gl.EQUAL,
    LEQUAL: gl.LEQUAL,
    GREATER: gl.GREATER,
    NOTEQUAL: gl.NOTEQUAL,
    GEQUAL: gl.GEQUAL,
    ALWAYS: gl.ALWAYS
});


},
function(require, exports, module, global) {

var enums = require(46);


module.exports = enums({
    NONE: 1,
    LINEAR: 2
});


},
function(require, exports, module, global) {

var enums = require(46),
    gl = require(50);


module.exports = enums({
    RGB: gl.RGB,
    RGBA: gl.RGBA,
    ALPHA: gl.ALPHA,
    LUMINANCE: gl.LUMINANCE,
    LUMINANCE_ALPHA: gl.LUMINANCE_ALPHA
});


},
function(require, exports, module, global) {

var enums = require(46),
    gl = require(50);


module.exports = enums({
    UNSIGNED_BYTE: gl.UNSIGNED_BYTE,
    FLOAT: gl.FLOAT,
    DEPTH_COMPONENT: gl.DEPTH_COMPONENT,
    UNSIGNED_SHORT: gl.UNSIGNED_SHORT,
    UNSIGNED_SHORT_5_6_5: gl.UNSIGNED_SHORT_5_6_5,
    UNSIGNED_SHORT_4_4_4_4: gl.UNSIGNED_SHORT_4_4_4_4,
    UNSIGNED_SHORT_5_5_5_1: gl.UNSIGNED_SHORT_5_5_5_1
});


},
function(require, exports, module, global) {

var enums = require(46),
    gl = require(50);


module.exports = enums({
    REPEAT: gl.REPEAT,
    CLAMP: gl.CLAMP_TO_EDGE,
    MIRRORED_REPEAT: gl.MIRRORED_REPEAT
});


},
function(require, exports, module, global) {

module.exports = WebGLBuffer;


function WebGLBuffer(context) {

    this.context = context;

    this.stride = 0;
    this.type = null;
    this.draw = null;
    this.length = null;
    this.glBuffer = null;
    this.needsCompile = true;
}

WebGLBuffer.prototype.compile = function(type, array, stride, draw) {
    var gl = this.context.gl,
        glBuffer = this.glBuffer || (this.glBuffer = gl.createBuffer());

    gl.bindBuffer(type, glBuffer);
    gl.bufferData(type, array, draw);

    this.type = type;
    this.stride = stride || 0;
    this.draw = draw;
    this.length = array.length;

    this.needsCompile = false;

    return this;
};


},
function(require, exports, module, global) {

var isArray = require(58),
    mathf = require(31),
    enums = require(40);


var textureType = enums.textureType,
    filterMode = enums.filterMode;


module.exports = WebGLTexture;


function WebGLTexture(context, texture) {
    var _this = this;

    this.context = context;
    this.texture = texture;

    this.isCubeMap = false;
    this.needsCompile = true;
    this.glTexture = null;

    texture.on("update", function() {
        _this.needsCompile = true;
    });
}

WebGLTexture.prototype.getGLTexture = function() {
    if (this.needsCompile === false) {
        return this.glTexture;
    } else {
        return WebGLTexture_getGLTexture(this);
    }
};

function WebGLTexture_getGLTexture(_this) {
    var texture = _this.texture,

        context = _this.context,
        gl = context.gl,

        glTexture = _this.glTexture || (_this.glTexture = gl.createTexture()),

        image = texture.data,
        notNull = image != null,
        isCubeMap = isArray(image),

        width = texture.width,
        height = texture.height,
        isPOT = mathf.isPowerOfTwo(width) && mathf.isPowerOfTwo(height),

        generateMipmap = texture.generateMipmap,
        flipY = texture.flipY,
        premultiplyAlpha = texture.premultiplyAlpha,
        anisotropy = texture.anisotropy,
        filter = texture.filter,
        format = getFormat(gl, texture.format),
        wrap = isPOT ? getWrap(gl, texture.wrap) : gl.CLAMP_TO_EDGE,
        type = getType(gl, texture.type),

        TFA = (anisotropy > 0) && context.getExtension("EXT_texture_filter_anisotropic"),
        TEXTURE_TYPE = isCubeMap ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D,
        minFilter, magFilter, images, i, il;

    if (TFA) {
        anisotropy = mathf.clamp(anisotropy, 1, context.__maxAnisotropy);
    }

    if (notNull) {
        if (isCubeMap) {
            images = [];
            i = -1;
            il = image.length - 1;

            while (i++ < il) {
                images[i] = context.clampMaxSize(image[i], isCubeMap);
            }
        } else {
            image = context.clampMaxSize(image, false);
        }
    }

    if (filter === filterMode.NONE) {
        magFilter = gl.NEAREST;
        minFilter = isPOT && generateMipmap ? gl.LINEAR_MIPMAP_NEAREST : gl.NEAREST;
    } else { //filterMode.LINEAR
        magFilter = gl.LINEAR;
        minFilter = isPOT && generateMipmap ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;
    }

    if (
        (type === textureType.FLOAT && !context.getExtension("OES_texture_float")) ||
        (type === textureType.DEPTH_COMPONENT && !context.getExtension("WEBGL_depth_texture"))
    ) {
        type = gl.UNSIGNED_BYTE;
    }

    gl.bindTexture(TEXTURE_TYPE, glTexture);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplyAlpha ? 1 : 0);

    if (notNull) {
        if (isCubeMap) {
            i = images.length;
            while (i--) {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, format, format, type, images[i]);
            }
        } else {
            gl.texImage2D(TEXTURE_TYPE, 0, format, format, type, image);
        }
    } else {
        if (isCubeMap) {
            i = image.length;
            while (i--) {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, format, width, height, 0, format, type, null);
            }
        } else {
            if (type === textureType.DEPTH_COMPONENT) {
                gl.texImage2D(TEXTURE_TYPE, 0, type, width, height, 0, type, gl.UNSIGNED_SHORT, null);
            } else {
                gl.texImage2D(TEXTURE_TYPE, 0, format, width, height, 0, format, type, null);
            }
        }
    }

    gl.texParameteri(TEXTURE_TYPE, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(TEXTURE_TYPE, gl.TEXTURE_MIN_FILTER, minFilter);

    gl.texParameteri(TEXTURE_TYPE, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(TEXTURE_TYPE, gl.TEXTURE_WRAP_T, wrap);

    if (TFA) {
        gl.texParameterf(TEXTURE_TYPE, TFA.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
    }
    if (generateMipmap && isPOT) {
        gl.generateMipmap(TEXTURE_TYPE);
    }

    _this.isCubeMap = isCubeMap;
    _this.needsCompile = false;

    gl.bindTexture(TEXTURE_TYPE, null);

    return glTexture;
}

function getFormat(gl, format) {
    switch (format) {
        case gl.RGB:
            return gl.RGB;
        case gl.ALPHA:
            return gl.ALPHA;
        case gl.LUMINANCE:
            return gl.LUMINANCE;
        case gl.LUMINANCE_ALPHA:
            return gl.LUMINANCE_ALPHA;
        default:
            return gl.RGBA;
    }
}

function getType(gl, type) {
    switch (type) {
        case gl.FLOAT:
            return gl.FLOAT;
        case gl.DEPTH_COMPONENT:
            return gl.DEPTH_COMPONENT;
        case gl.UNSIGNED_SHORT:
            return gl.UNSIGNED_SHORT;
        case gl.UNSIGNED_SHORT_5_6_5:
            return gl.UNSIGNED_SHORT_5_6_5;
        case gl.UNSIGNED_SHORT_4_4_4_4:
            return gl.UNSIGNED_SHORT_4_4_4_4;
        case gl.UNSIGNED_SHORT_5_5_5_1:
            return gl.UNSIGNED_SHORT_5_5_5_1;
        default:
            return gl.UNSIGNED_BYTE;
    }
}

function getWrap(gl, wrap) {
    switch (wrap) {
        case gl.REPEAT:
            return gl.REPEAT;
        case gl.MIRRORED_REPEAT:
            return gl.MIRRORED_REPEAT;
        default:
            return gl.CLAMP_TO_EDGE;
    }
}


},
function(require, exports, module, global) {

var isNative = require(4),
    isLength = require(43),
    isObject = require(11);


var objectToString = Object.prototype.toString,
    nativeIsArray = Array.isArray,
    isArray;


if (isNative(nativeIsArray)) {
    isArray = nativeIsArray;
} else {
    isArray = function isArray(value) {
        return (
            isObject(value) &&
            isLength(value.length) &&
            objectToString.call(value) === "[object Array]"
        ) || false;
    };
}


module.exports = isArray;


},
function(require, exports, module, global) {

var isArray = require(58),
    FastHash = require(60),

    enums = require(40),
    uniforms = require(62),
    attributes = require(82);


var reUniformName = /[^\[]+/;


module.exports = WebGLProgram;


function WebGLProgram(context) {

    this.context = context;

    this.floatPrecision = context.__precision;
    this.intPrecision = context.__precision;

    this.uniforms = new FastHash("name");
    this.attributes = new FastHash("name");

    this.needsCompile = true;
    this.glProgram = null;
}

WebGLProgram.prototype.compile = function(vertex, fragment) {
    var context = this.context,
        floatPrecision = this.floatPrecision,
        intPrecision = this.intPrecision,
        uniforms = this.uniforms,
        attributes = this.attributes,
        gl = context.gl,
        glProgram = this.glProgram;

    if (glProgram) {
        uniforms.clear();
        attributes.clear();
        gl.deleteProgram(glProgram);
    }

    glProgram = this.glProgram = createProgram(
        gl,
        prependPrecision(floatPrecision, intPrecision, vertex),
        prependPrecision(floatPrecision, intPrecision, fragment)
    );

    parseUniforms(gl, context, glProgram, uniforms);
    parseAttributes(gl, context, glProgram, attributes);

    this.needsCompile = false;

    return this;
};

function parseUniforms(gl, context, glProgram, hash) {
    var length = gl.getProgramParameter(glProgram, gl.ACTIVE_UNIFORMS),
        glValues = enums.glValues,
        i = -1,
        il = length - 1,
        uniform, name, location;

    while (i++ < il) {
        uniform = gl.getActiveUniform(glProgram, i);
        name = reUniformName.exec(uniform.name)[0];
        location = gl.getUniformLocation(glProgram, name);
        hash.add(new uniforms[glValues[uniform.type]](context, name, location, uniform.size));
    }
}

function parseAttributes(gl, context, glProgram, hash) {
    var length = gl.getProgramParameter(glProgram, gl.ACTIVE_ATTRIBUTES),
        glValues = enums.glValues,
        i = -1,
        il = length - 1,
        attribute, name, location;

    while (i++ < il) {
        attribute = gl.getActiveAttrib(glProgram, i);
        name = attribute.name;
        location = gl.getAttribLocation(glProgram, name);
        hash.add(new attributes[glValues[attribute.type]](context, name, location));
    }
}

function prependPrecision(floatPrecision, intPrecision, shader) {
    return "precision " + floatPrecision + " float;\nprecision " + intPrecision + " int;\n" + shader;
}

function createProgram(gl, vertex, fragment) {
    var program = gl.createProgram(),
        shader, i, il, programInfoLog;

    vertex = isArray(vertex) ? vertex : [vertex];
    fragment = isArray(fragment) ? fragment : [fragment];

    i = -1;
    il = vertex.length - 1;
    while (i++ < il) {
        shader = createShader(gl, vertex[i], gl.VERTEX_SHADER);
        gl.attachShader(program, shader);
        gl.deleteShader(shader);
    }

    i = -1;
    il = fragment.length - 1;
    while (i++ < il) {
        shader = createShader(gl, fragment[i], gl.FRAGMENT_SHADER);
        gl.attachShader(program, shader);
        gl.deleteShader(shader);
    }

    gl.linkProgram(program);
    gl.validateProgram(program);
    gl.useProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        programInfoLog = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error("createProgram: problem compiling Program " + programInfoLog);
    }

    return program;
}

function createShader(gl, source, type) {
    var shader = gl.createShader(type),
        shaderInfoLog;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        shaderInfoLog = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("createShader: problem compiling shader " + shaderInfoLog);
    }

    return shader;
}


},
function(require, exports, module, global) {

var has = require(3),
    indexOf = require(61),
    forEach = require(47);


module.exports = FastHash;


function FastHash(key) {
    this.__key = key;
    this.__array = [];
    this.__hash = {};
}

FastHash.prototype.get = function(key) {
    return this.__hash[key];
};

FastHash.prototype.has = function(key) {
    return has(this.__hash, key);
};

FastHash.prototype.count = function() {
    return this.__array.length;
};

FastHash.prototype.clear = function() {
    var hash = this.__hash,
        key;

    for (key in hash) {
        if (has(hash, key)) {
            delete hash[key];
        }
    }
    this.__array.length = 0;

    return this;
};

FastHash.prototype.add = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        FastHash_add(this, arguments[i]);
    }

    return this;
};

function FastHash_add(_this, value) {
    var array = _this.__array,
        hash = _this.__hash,
        key = value[_this.__key];

    if (!has(hash, key)) {
        hash[key] = value;
        array[array.length] = value;
    }
}

FastHash.prototype.remove = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        FastHash_remove(this, arguments[i]);
    }

    return this;
};

function FastHash_remove(_this, value) {
    var array = _this.__array,
        hash = _this.__hash,
        key = value[_this.__key];

    if (has(hash, key)) {
        delete hash[key];
        array.splice(indexOf(value), 1);
    }
}

FastHash.prototype.forEach = function(callback, thisArg) {
    return forEach(this.__array, callback, thisArg);
};


},
function(require, exports, module, global) {

var isLength = require(43),
    isObjectLike = require(44);


module.exports = indexOf;


function indexOf(array, value, fromIndex) {
    return (isObjectLike(array) && isLength(array.length)) ? arrayIndexOf(array, value, fromIndex || 0) : -1;
}

function arrayIndexOf(array, value, fromIndex) {
    var i = fromIndex - 1,
        il = array.length - 1;

    while (i++ < il) {
        if (array[i] === value) {
            return i;
        }
    }

    return -1;
}


},
function(require, exports, module, global) {

module.exports = {
    BOOL: require(63),
    INT: require(65),
    FLOAT: require(66),

    BOOL_VEC2: require(67),
    BOOL_VEC3: require(69),
    BOOL_VEC4: require(70),

    INT_VEC2: require(67),
    INT_VEC3: require(69),
    INT_VEC4: require(70),

    FLOAT_VEC2: require(71),
    FLOAT_VEC3: require(72),
    FLOAT_VEC4: require(73),

    FLOAT_MAT2: require(74),
    FLOAT_MAT3: require(76),
    FLOAT_MAT4: require(78),

    SAMPLER_2D: require(80),
    SAMPLER_CUBE: require(81)
};


},
function(require, exports, module, global) {

var Uniform = require(64);


var NativeInt32Array = typeof(Int32Array) !== "undefined" ? Int32Array : Array;


module.exports = Uniform1b;


function Uniform1b(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? NaN : new NativeInt32Array(size);
}
Uniform.extend(Uniform1b);

Uniform1b.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || this.value !== value) {
            context.gl.uniform1i(this.location, value);
            this.value = value;
        }
    } else {
        context.gl.uniform1iv(this.location, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var inherits = require(12);


module.exports = Uniform;


function Uniform(context, name, location, size) {
    this.name = name;
    this.location = location;
    this.context = context;
    this.size = size;
    this.value = null;
}

Uniform.extend = function(child) {
    return inherits(child, this);
};

Uniform.prototype.set = function( /* value, force */ ) {
    return this;
};


},
function(require, exports, module, global) {

var Uniform = require(64);


var NativeInt32Array = typeof(Int32Array) !== "undefined" ? Int32Array : Array;


module.exports = Uniform1i;


function Uniform1i(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? NaN : new NativeInt32Array(size);
}
Uniform.extend(Uniform1i);

Uniform1i.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || this.value !== value) {
            context.gl.uniform1i(this.location, value);
            this.value = value;
        }
    } else {
        context.gl.uniform1iv(this.location, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var Uniform = require(64);


var NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array;


module.exports = Uniform1f;


function Uniform1f(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? NaN : new NativeFloat32Array(size);
}
Uniform.extend(Uniform1f);

Uniform1f.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || this.value !== value) {
            context.gl.uniform1f(this.location, value);
            this.value = value;
        }
    } else {
        context.gl.uniform1fv(this.location, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var vec2 = require(68),
    Uniform = require(64);


var NativeInt32Array = typeof(Int32Array) !== "undefined" ? Int32Array : Array;


module.exports = Uniform2i;


function Uniform2i(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? vec2.create(NaN, NaN) : new NativeInt32Array(size * 2);
}
Uniform.extend(Uniform2i);

Uniform2i.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || vec2.notEqual(this.value, value)) {
            context.gl.uniform2i(this.location, value[0], value[1]);
            vec2.copy(this.value, value);
        }
    } else {
        context.gl.uniform2iv(this.location, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var mathf = require(31);


var vec2 = exports;


vec2.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


vec2.create = function(x, y) {
    var out = new vec2.ArrayType(2);

    out[0] = x !== undefined ? x : 0;
    out[1] = y !== undefined ? y : 0;

    return out;
};

vec2.copy = function(out, a) {

    out[0] = a[0];
    out[1] = a[1];

    return out;
};

vec2.clone = function(a) {
    var out = new vec2.ArrayType(2);

    out[0] = a[0];
    out[1] = a[1];

    return out;
};

vec2.set = function(out, x, y) {

    out[0] = x !== undefined ? x : 0;
    out[1] = y !== undefined ? y : 0;

    return out;
};

vec2.add = function(out, a, b) {

    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];

    return out;
};

vec2.sub = function(out, a, b) {

    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];

    return out;
};

vec2.mul = function(out, a, b) {

    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];

    return out;
};

vec2.div = function(out, a, b) {
    var bx = b[0],
        by = b[1];

    out[0] = a[0] * (bx !== 0 ? 1 / bx : bx);
    out[1] = a[1] * (by !== 0 ? 1 / by : by);

    return out;
};

vec2.sadd = function(out, a, s) {

    out[0] = a[0] + s;
    out[1] = a[1] + s;

    return out;
};

vec2.ssub = function(out, a, s) {

    out[0] = a[0] - s;
    out[1] = a[1] - s;

    return out;
};

vec2.smul = function(out, a, s) {

    out[0] = a[0] * s;
    out[1] = a[1] * s;

    return out;
};

vec2.sdiv = function(out, a, s) {
    s = s !== 0 ? 1 / s : s;

    out[0] = a[0] * s;
    out[1] = a[1] * s;

    return out;
};

vec2.lengthSqValues = function(x, y) {

    return x * x + y * y;
};

vec2.lengthValues = function(x, y) {
    var lsq = vec2.lengthSqValues(x, y);

    return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
};

vec2.invLengthValues = function(x, y) {
    var lsq = vec2.lengthSqValues(x, y);

    return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
};

vec2.cross = function(a, b) {

    return a[0] * b[1] - a[1] * b[0];
};

vec2.dot = function(a, b) {

    return a[0] * b[0] + a[1] * b[1];
};

vec2.lengthSq = function(a) {

    return vec2.dot(a, a);
};

vec2.length = function(a) {
    var lsq = vec2.lengthSq(a);

    return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
};

vec2.invLength = function(a) {
    var lsq = vec2.lengthSq(a);

    return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
};

vec2.setLength = function(out, a, length) {
    var x = a[0],
        y = a[1],
        s = length * vec2.invLengthValues(x, y);

    out[0] = x * s;
    out[1] = y * s;

    return out;
};

vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        invlsq = vec2.invLengthValues(x, y);

    out[0] = x * invlsq;
    out[1] = y * invlsq;

    return out;
};

vec2.inverse = function(out, a) {

    out[0] = a[0] * -1;
    out[1] = a[1] * -1;

    return out;
};

vec2.lerp = function(out, a, b, x) {
    var lerp = mathf.lerp;

    out[0] = lerp(a[0], b[0], x);
    out[1] = lerp(a[1], b[1], x);

    return out;
};

vec2.perp = function(out, a) {

    out[0] = a[1];
    out[1] = -a[0];

    return out;
};

vec2.perpR = function(out, a) {

    out[0] = -a[1];
    out[1] = a[0];

    return out;
};

vec2.min = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        bx = b[0],
        by = b[1];

    out[0] = bx < ax ? bx : ax;
    out[1] = by < ay ? by : ay;

    return out;
};

vec2.max = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        bx = b[0],
        by = b[1];

    out[0] = bx > ax ? bx : ax;
    out[1] = by > ay ? by : ay;

    return out;
};

vec2.clamp = function(out, a, min, max) {
    var x = a[0],
        y = a[1],
        minx = min[0],
        miny = min[1],
        maxx = max[0],
        maxy = max[1];

    out[0] = x < minx ? minx : x > maxx ? maxx : x;
    out[1] = y < miny ? miny : y > maxy ? maxy : y;

    return out;
};

vec2.transformAngle = function(out, a, angle) {
    var x = a[0],
        y = a[1],
        c = mathf.cos(angle),
        s = mathf.sin(angle);

    out[0] = x * c - y * s;
    out[1] = x * s + y * c;

    return out;
};

vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];

    out[0] = x * m[0] + y * m[2];
    out[1] = x * m[1] + y * m[3];

    return out;
};

vec2.transformMat32 = function(out, a, m) {
    var x = a[0],
        y = a[1];

    out[0] = x * m[0] + y * m[2] + m[4];
    out[1] = x * m[1] + y * m[3] + m[5];

    return out;
};

vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];

    out[0] = x * m[0] + y * m[3] + m[6];
    out[1] = x * m[1] + y * m[4] + m[7];

    return out;
};

vec2.transformMat4 = function(out, a, m) {
    var x = a[0],
        y = a[1];

    out[0] = x * m[0] + y * m[4] + m[12];
    out[1] = x * m[1] + y * m[5] + m[13];

    return out;
};

vec2.transformProjection = function(out, a, m) {
    var x = a[0],
        y = a[1],
        d = x * m[3] + y * m[7] + m[11] + m[15];

    d = d !== 0 ? 1 / d : d;

    out[0] = (x * m[0] + y * m[4] + m[12]) * d;
    out[1] = (x * m[1] + y * m[5] + m[13]) * d;

    return out;
};

vec2.positionFromMat32 = function(out, m) {

    out[0] = m[4];
    out[1] = m[5];

    return out;
};

vec2.positionFromMat4 = function(out, m) {

    out[0] = m[12];
    out[1] = m[13];

    return out;
};

vec2.scaleFromMat2 = function(out, m) {

    out[0] = vec2.lengthValues(m[0], m[2]);
    out[1] = vec2.lengthValues(m[1], m[3]);

    return out;
};

vec2.scaleFromMat32 = vec2.scaleFromMat2;

vec2.scaleFromMat3 = function(out, m) {

    out[0] = vec2.lengthValues(m[0], m[3]);
    out[1] = vec2.lengthValues(m[1], m[4]);

    return out;
};

vec2.scaleFromMat4 = function(out, m) {

    out[0] = vec2.lengthValues(m[0], m[4]);
    out[1] = vec2.lengthValues(m[1], m[5]);

    return out;
};

vec2.equal = function(a, b) {
    return !(
        a[0] !== b[0] ||
        a[1] !== b[1]
    );
};

vec2.notEqual = function(a, b) {
    return (
        a[0] !== b[0] ||
        a[1] !== b[1]
    );
};

vec2.str = function(out) {

    return "Vec2(" + out[0] + ", " + out[1] + ")";
};


},
function(require, exports, module, global) {

var vec3 = require(38),
    Uniform = require(64);


var NativeInt32Array = typeof(Int32Array) !== "undefined" ? Int32Array : Array;


module.exports = Uniform3i;


function Uniform3i(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? vec3.create(NaN, NaN, NaN) : new NativeInt32Array(size * 3);
}
Uniform.extend(Uniform3i);

Uniform3i.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || vec3.notEqual(this.value, value)) {
            context.gl.uniform3i(this.location, value[0], value[1], value[2]);
            vec3.copy(this.value, value);
        }
    } else {
        context.gl.uniform3iv(this.location, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var vec4 = require(39),
    Uniform = require(64);


var NativeInt32Array = typeof(Int32Array) !== "undefined" ? Int32Array : Array;


module.exports = Uniform4i;


function Uniform4i(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? vec4.create(NaN, NaN, NaN, NaN) : new NativeInt32Array(size * 4);
}
Uniform.extend(Uniform4i);

Uniform4i.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || vec4.notEqual(this.value, value)) {
            context.gl.uniform4i(this.location, value[0], value[1], value[2], value[3]);
            vec4.copy(this.value, value);
        }
    } else {
        context.gl.uniform4iv(this.location, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var vec2 = require(68),
    Uniform = require(64);


var NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array;


module.exports = Uniform2f;


function Uniform2f(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? vec2.create(NaN, NaN) : new NativeFloat32Array(size * 2);
}
Uniform.extend(Uniform2f);

Uniform2f.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || vec2.notEqual(this.value, value)) {
            context.gl.uniform2f(this.location, value[0], value[1]);
            vec2.copy(this.value, value);
        }
    } else {
        context.gl.uniform2fv(this.location, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var vec3 = require(38),
    Uniform = require(64);


var NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array;


module.exports = Uniform3f;


function Uniform3f(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? vec3.create(NaN, NaN, NaN) : new NativeFloat32Array(size * 3);
}
Uniform.extend(Uniform3f);

Uniform3f.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || vec3.notEqual(this.value, value)) {
            context.gl.uniform3f(this.location, value[0], value[1], value[2]);
            vec3.copy(this.value, value);
        }
    } else {
        context.gl.uniform3fv(this.location, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var vec4 = require(39),
    Uniform = require(64);


var NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array;


module.exports = Uniform4f;


function Uniform4f(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? vec4.create(NaN, NaN, NaN, NaN) : new NativeFloat32Array(size * 4);
}
Uniform.extend(Uniform4f);

Uniform4f.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || vec4.notEqual(this.value, value)) {
            context.gl.uniform4f(this.location, value[0], value[1], value[2], value[3]);
            vec4.copy(this.value, value);
        }
    } else {
        context.gl.uniform4fv(this.location, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var mat2 = require(75),
    Uniform = require(64);


var NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array;


module.exports = UniformMatrix2fv;


function UniformMatrix2fv(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? mat2.create(NaN, NaN, NaN, NaN) : new NativeFloat32Array(size * 4);
}
Uniform.extend(UniformMatrix2fv);

UniformMatrix2fv.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || mat2.notEqual(this.value, value)) {
            context.gl.uniformMatrix2fv(this.location, false, value);
            mat2.copy(this.value, value);
        }
    } else {
        context.gl.uniformMatrix2fv(this.location, false, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var mathf = require(31);


var mat2 = exports;


mat2.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


mat2.create = function(m11, m12, m21, m22) {
    var out = new mat2.ArrayType(4);

    out[0] = m11 !== undefined ? m11 : 1;
    out[2] = m12 !== undefined ? m12 : 0;
    out[1] = m21 !== undefined ? m21 : 0;
    out[3] = m22 !== undefined ? m22 : 1;

    return out;
};

mat2.copy = function(out, a) {

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    return out;
};

mat2.clone = function(a) {
    var out = new mat2.ArrayType(4);

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    return out;
};

mat2.set = function(out, m11, m12, m21, m22) {

    out[0] = m11 !== undefined ? m11 : 1;
    out[2] = m12 !== undefined ? m12 : 0;
    out[1] = m21 !== undefined ? m21 : 0;
    out[3] = m22 !== undefined ? m22 : 1;

    return out;
};

mat2.identity = function(out) {

    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;

    return out;
};

mat2.zero = function(out) {

    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    return out;
};

mat2.mul = function(out, a, b) {
    var a11 = a[0],
        a12 = a[2],
        a21 = a[1],
        a22 = a[3],

        b11 = b[0],
        b12 = b[2],
        b21 = b[1],
        b22 = b[3];

    out[0] = a11 * b11 + a21 * b12;
    out[1] = a12 * b11 + a22 * b12;

    out[2] = a11 * b21 + a21 * b22;
    out[3] = a12 * b21 + a22 * b22;

    return out;
};

mat2.smul = function(out, a, s) {

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;

    return out;
};

mat2.sdiv = function(out, a, s) {
    s = s !== 0 ? 1 / s : s;

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;

    return out;
};

mat2.determinant = function(a) {

    return a[0] * a[3] - a[2] * a[1];
};

mat2.inverse = function(out, a) {
    var m11 = a[0],
        m12 = a[2],
        m21 = a[1],
        m22 = a[3],

        det = m11 * m22 - m12 * m21;

    if (det === 0) {
        return mat2.identity(out);
    }
    det = 1 / det;

    out[0] = m22 * det;
    out[1] = -m12 * det;
    out[2] = -m21 * det;
    out[3] = m11 * det;

    return out;
};

mat2.transpose = function(out, a) {
    var tmp;

    if (out === a) {
        tmp = a[1];
        out[1] = a[2];
        out[2] = tmp;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }

    return out;
};

mat2.setRotation = function(out, angle) {
    var c = mathf.cos(angle),
        s = mathf.sin(angle);

    out[0] = c;
    out[1] = s;
    out[2] = -s;
    out[3] = c;

    return out;
};

mat2.getRotation = function(out) {

    return mathf.atan2(out[1], out[0]);
};

mat2.rotate = function(out, a, angle) {
    var m11 = a[0],
        m12 = a[2],
        m21 = a[1],
        m22 = a[3],

        s = mathf.sin(angle),
        c = mathf.sin(angle);

    out[0] = m11 * c + m12 * s;
    out[1] = m11 * -s + m12 * c;
    out[2] = m21 * c + m22 * s;
    out[3] = m21 * -s + m22 * c;

    return out;
};

mat2.equal = function(a, b) {
    return !(
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3]
    );
};

mat2.notEqual = function(a, b) {
    return (
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3]
    );
};

mat2.str = function(out) {
    return (
        "Mat2[" + out[0] + ", " + out[2] + "]\n" +
        "     [" + out[1] + ", " + out[3] + "]"
    );
};


},
function(require, exports, module, global) {

var mat3 = require(77),
    Uniform = require(64);


var NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array;


module.exports = UniformMatrix3fv;


function UniformMatrix3fv(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? mat3.create(
        NaN, NaN, NaN,
        NaN, NaN, NaN,
        NaN, NaN, NaN
    ) : new NativeFloat32Array(size * 9);
}
Uniform.extend(UniformMatrix3fv);

UniformMatrix3fv.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || mat3.notEqual(this.value, value)) {
            context.gl.uniformMatrix3fv(this.location, false, value);
            mat3.copy(this.value, value);
        }
    } else {
        context.gl.uniformMatrix3fv(this.location, false, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var mathf = require(31);


var mat3 = exports;


mat3.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


mat3.create = function(m11, m12, m13, m21, m22, m23, m31, m32, m33) {
    var out = new mat3.ArrayType(9);

    out[0] = m11 !== undefined ? m11 : 1;
    out[1] = m21 !== undefined ? m21 : 0;
    out[2] = m31 !== undefined ? m31 : 0;
    out[3] = m12 !== undefined ? m12 : 0;
    out[4] = m22 !== undefined ? m22 : 1;
    out[5] = m32 !== undefined ? m32 : 0;
    out[6] = m13 !== undefined ? m13 : 0;
    out[7] = m23 !== undefined ? m23 : 0;
    out[8] = m33 !== undefined ? m33 : 1;

    return out;
};

mat3.copy = function(out, a) {

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];

    return out;
};

mat3.clone = function(a) {
    var out = new mat3.ArrayType(9);

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];

    return out;
};

mat3.set = function(out, m11, m12, m13, m21, m22, m23, m31, m32, m33) {

    out[0] = m11 !== undefined ? m11 : 1;
    out[1] = m21 !== undefined ? m21 : 0;
    out[2] = m31 !== undefined ? m31 : 0;
    out[3] = m12 !== undefined ? m12 : 0;
    out[4] = m22 !== undefined ? m22 : 1;
    out[5] = m32 !== undefined ? m32 : 0;
    out[6] = m13 !== undefined ? m13 : 0;
    out[7] = m23 !== undefined ? m23 : 0;
    out[8] = m33 !== undefined ? m33 : 1;

    return out;
};

mat3.identity = function(out) {

    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;

    return out;
};

mat3.zero = function(out) {

    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;

    return out;
};

mat3.mul = function(out, a, b) {
    var a11 = a[0],
        a12 = a[3],
        a13 = a[6],
        a21 = a[1],
        a22 = a[4],
        a23 = a[7],
        a31 = a[2],
        a32 = a[5],
        a33 = a[8],

        b11 = b[0],
        b12 = b[3],
        b13 = b[6],
        b21 = b[1],
        b22 = b[4],
        b23 = b[7],
        b31 = b[2],
        b32 = b[5],
        b33 = b[8];

    out[0] = a11 * b11 + a21 * b12 + a31 * b13;
    out[3] = a12 * b11 + a22 * b12 + a32 * b13;
    out[6] = a13 * b11 + a23 * b12 + a33 * b13;

    out[1] = a11 * b21 + a21 * b22 + a31 * b23;
    out[4] = a12 * b21 + a22 * b22 + a32 * b23;
    out[7] = a13 * b21 + a23 * b22 + a33 * b23;

    out[2] = a11 * b31 + a21 * b32 + a31 * b33;
    out[5] = a12 * b31 + a22 * b32 + a32 * b33;
    out[8] = a13 * b31 + a23 * b32 + a33 * b33;

    return out;
};

mat3.smul = function(out, a, s) {

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;
    out[4] = a[4] * s;
    out[5] = a[5] * s;
    out[6] = a[6] * s;
    out[7] = a[7] * s;
    out[8] = a[8] * s;

    return out;
};

mat3.sdiv = function(out, a, s) {
    s = s !== 0 ? 1 / s : s;

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;
    out[4] = a[4] * s;
    out[5] = a[5] * s;
    out[6] = a[6] * s;
    out[7] = a[7] * s;
    out[8] = a[8] * s;

    return out;
};

mat3.determinant = function(out) {
    var a = out[0],
        b = out[1],
        c = out[2],
        d = out[3],
        e = out[4],
        f = out[5],
        g = out[6],
        h = out[7],
        i = out[8];

    return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
};

mat3.inverseMat = function(out, m11, m12, m13, m21, m22, m23, m31, m32, m33) {
    var m0 = m22 * m33 - m23 * m32,
        m3 = m13 * m32 - m12 * m33,
        m6 = m12 * m23 - m13 * m22,

        det = m11 * m0 + m21 * m3 + m31 * m6;

    if (det === 0) {
        return mat3.identity(out);
    }
    det = 1 / det;

    out[0] = m0 * det;
    out[1] = (m23 * m31 - m21 * m33) * det;
    out[2] = (m21 * m32 - m22 * m31) * det;

    out[3] = m3 * det;
    out[4] = (m11 * m33 - m13 * m31) * det;
    out[5] = (m12 * m31 - m11 * m32) * det;

    out[6] = m6 * det;
    out[7] = (m13 * m21 - m11 * m23) * det;
    out[8] = (m11 * m22 - m12 * m21) * det;

    return out;
};

mat3.inverse = function(out, a) {
    return mat3.inverseMat(
        out,
        a[0], a[3], a[6],
        a[1], a[4], a[7],
        a[2], a[5], a[8]
    );
};

mat3.inverseMat4 = function(out, a) {
    return mat3.inverseMat(
        out,
        a[0], a[4], a[8],
        a[1], a[5], a[9],
        a[2], a[6], a[10]
    );
};

mat3.transpose = function(out, a) {
    var a01, a02, a12;

    if (out === a) {
        a01 = a[1];
        a02 = a[2];
        a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }

    return out;
};

mat3.scale = function(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];

    out[0] *= x;
    out[3] *= y;
    out[6] *= z;
    out[1] *= x;
    out[4] *= y;
    out[7] *= z;
    out[2] *= x;
    out[5] *= y;
    out[8] *= z;

    return out;
};

mat3.makeScale = function(out, v) {

    return mat3.set(
        out,
        v[0], 0, 0,
        0, v[1], 0,
        0, 0, v[2]
    );
};

mat3.makeRotationX = function(out, angle) {
    var c = mathf.cos(angle),
        s = mathf.sin(angle);

    return mat3.set(
        out,
        1, 0, 0,
        0, c, -s,
        0, s, c
    );
};

mat3.makeRotationY = function(out, angle) {
    var c = mathf.cos(angle),
        s = mathf.sin(angle);

    return mat3.set(
        out,
        c, 0, s,
        0, 1, 0, -s, 0, c
    );
};

mat3.makeRotationZ = function(out, angle) {
    var c = mathf.cos(angle),
        s = mathf.sin(angle);

    return mat3.set(
        out,
        c, -s, 0,
        s, c, 0,
        0, 0, 1
    );
};

mat3.fromQuat = function(out, q) {
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;

    out[3] = xy - wz;
    out[4] = 1 - (xx + zz);
    out[5] = yz + wx;

    out[6] = xz + wy;
    out[7] = yz - wx;
    out[8] = 1 - (xx + yy);

    return out;
};

mat3.equal = function(a, b) {
    return !(
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3] ||
        a[4] !== b[4] ||
        a[5] !== b[5] ||
        a[6] !== b[6] ||
        a[7] !== b[7] ||
        a[8] !== b[8]
    );
};

mat3.notEqual = function(a, b) {
    return (
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3] ||
        a[4] !== b[4] ||
        a[5] !== b[5] ||
        a[6] !== b[6] ||
        a[7] !== b[7] ||
        a[8] !== b[8]
    );
};

mat3.str = function(out) {
    return (
        "Mat3[" + out[0] + ", " + out[3] + ", " + out[6] + "]\n" +
        "     [" + out[1] + ", " + out[4] + ", " + out[7] + "]\n" +
        "     [" + out[2] + ", " + out[5] + ", " + out[8] + "]"
    );
};


},
function(require, exports, module, global) {

var mat4 = require(79),
    Uniform = require(64);


var NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array;


module.exports = UniformMatrix4fv;


function UniformMatrix4fv(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
    this.value = size === 1 ? mat4.create(
        NaN, NaN, NaN, NaN,
        NaN, NaN, NaN, NaN,
        NaN, NaN, NaN, NaN,
        NaN, NaN, NaN, NaN
    ) : new NativeFloat32Array(size * 16);
}
Uniform.extend(UniformMatrix4fv);

UniformMatrix4fv.prototype.set = function(value, force) {
    var context = this.context;

    if (this.size === 1) {
        if (force || context.__programForce || mat4.notEqual(this.value, value)) {
            context.gl.uniformMatrix4fv(this.location, false, value);
            mat4.copy(this.value, value);
        }
    } else {
        context.gl.uniformMatrix4fv(this.location, false, value);
    }

    return this;
};


},
function(require, exports, module, global) {

var mathf = require(31),
    vec3 = require(38);


var mat4 = exports;


mat4.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


mat4.create = function(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
    var out = new mat4.ArrayType(16);

    out[0] = m11 !== undefined ? m11 : 1;
    out[4] = m12 !== undefined ? m12 : 0;
    out[8] = m13 !== undefined ? m13 : 0;
    out[12] = m14 !== undefined ? m14 : 0;
    out[1] = m21 !== undefined ? m21 : 0;
    out[5] = m22 !== undefined ? m22 : 1;
    out[9] = m23 !== undefined ? m23 : 0;
    out[13] = m24 !== undefined ? m24 : 0;
    out[2] = m31 !== undefined ? m31 : 0;
    out[6] = m32 !== undefined ? m32 : 0;
    out[10] = m33 !== undefined ? m33 : 1;
    out[14] = m34 !== undefined ? m34 : 0;
    out[3] = m41 !== undefined ? m41 : 0;
    out[7] = m42 !== undefined ? m42 : 0;
    out[11] = m43 !== undefined ? m43 : 0;
    out[15] = m44 !== undefined ? m44 : 1;

    return out;
};

mat4.copy = function(out, a) {

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];

    return out;
};

mat4.clone = function(a) {
    var out = new mat4.ArrayType(16);

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];

    return out;
};

mat4.set = function(out, m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {

    out[0] = m11 !== undefined ? m11 : 1;
    out[4] = m12 !== undefined ? m12 : 0;
    out[8] = m13 !== undefined ? m13 : 0;
    out[12] = m14 !== undefined ? m14 : 0;
    out[1] = m21 !== undefined ? m21 : 0;
    out[5] = m22 !== undefined ? m22 : 1;
    out[9] = m23 !== undefined ? m23 : 0;
    out[13] = m24 !== undefined ? m24 : 0;
    out[2] = m31 !== undefined ? m31 : 0;
    out[6] = m32 !== undefined ? m32 : 0;
    out[10] = m33 !== undefined ? m33 : 1;
    out[14] = m34 !== undefined ? m34 : 0;
    out[3] = m41 !== undefined ? m41 : 0;
    out[7] = m42 !== undefined ? m42 : 0;
    out[11] = m43 !== undefined ? m43 : 0;
    out[15] = m44 !== undefined ? m44 : 1;

    return out;
};

mat4.identity = function(out) {

    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

mat4.zero = function(out) {

    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 0;

    return out;
};

mat4.mul = function(out, a, b) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15],
        b0, b1, b2, b3;

    b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    return out;
};

mat4.smul = function(out, a, s) {

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;
    out[4] = a[4] * s;
    out[5] = a[5] * s;
    out[6] = a[6] * s;
    out[7] = a[7] * s;
    out[8] = a[8] * s;
    out[9] = a[9] * s;
    out[10] = a[10] * s;
    out[11] = a[11] * s;
    out[12] = a[12] * s;
    out[13] = a[13] * s;
    out[14] = a[14] * s;
    out[15] = a[15] * s;

    return out;
};

mat4.sdiv = function(out, a, s) {
    s = s !== 0 ? 1 / s : s;

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;
    out[4] = a[4] * s;
    out[5] = a[5] * s;
    out[6] = a[6] * s;
    out[7] = a[7] * s;
    out[8] = a[8] * s;
    out[9] = a[9] * s;
    out[10] = a[10] * s;
    out[11] = a[11] * s;
    out[12] = a[12] * s;
    out[13] = a[13] * s;
    out[14] = a[14] * s;
    out[15] = a[15] * s;

    return out;
};

mat4.determinant = function(a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

mat4.inverse = function(out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return mat4.identity(out);
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

mat4.transpose = function(out, a) {
    var a01, a02, a03, a12, a13, a23;

    if (out === a) {
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a12 = a[6];
        a13 = a[7];
        a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }

    return out;
};

var lookAt_x = vec3.create(),
    lookAt_y = vec3.create(),
    lookAt_z = vec3.create();

mat4.lookAt = function(out, eye, target, up) {
    var x = lookAt_x,
        y = lookAt_y,
        z = lookAt_z;

    vec3.sub(z, eye, target);
    vec3.normalize(z, z);

    if (vec3.length(z) === 0) {
        z[2] = 1;
    }

    vec3.cross(x, up, z);
    vec3.normalize(x, x);

    if (vec3.length(x) === 0) {
        z[0] += mathf.EPSILON;
        vec3.cross(x, up, z);
        vec3.normalize(x, x);
    }

    vec3.cross(y, z, x);

    out[0] = x[0];
    out[4] = y[0];
    out[8] = z[0];
    out[1] = x[1];
    out[5] = y[1];
    out[9] = z[1];
    out[2] = x[2];
    out[6] = y[2];
    out[10] = z[2];

    return out;
};

mat4.compose = function(out, position, scale, rotation) {
    var x = rotation[0],
        y = rotation[1],
        z = rotation[2],
        w = rotation[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2,

        sx = scale[0],
        sy = scale[1],
        sz = scale[2];

    out[0] = (1 - (yy + zz)) * sx;
    out[4] = (xy - wz) * sy;
    out[8] = (xz + wy) * sz;

    out[1] = (xy + wz) * sx;
    out[5] = (1 - (xx + zz)) * sy;
    out[9] = (yz - wx) * sz;

    out[2] = (xz - wy) * sx;
    out[6] = (yz + wx) * sy;
    out[10] = (1 - (xx + yy)) * sz;

    out[3] = 0;
    out[7] = 0;
    out[11] = 0;

    out[12] = position[0];
    out[13] = position[1];
    out[14] = position[2];
    out[15] = 1;

    return out;
};

mat4.decompose = function(out, position, scale, rotation) {
    var m11 = out[0],
        m12 = out[4],
        m13 = out[8],
        m21 = out[1],
        m22 = out[5],
        m23 = out[9],
        m31 = out[2],
        m32 = out[6],
        m33 = out[10],
        x = 0,
        y = 0,
        z = 0,
        w = 1,

        sx = vec3.lengthValues(m11, m21, m31),
        sy = vec3.lengthValues(m12, m22, m32),
        sz = vec3.lengthValues(m13, m23, m33),

        invSx = 1 / sx,
        invSy = 1 / sy,
        invSz = 1 / sz,

        s, trace;

    scale[0] = sx;
    scale[1] = sy;
    scale[2] = sz;

    position[0] = out[12];
    position[1] = out[13];
    position[2] = out[14];

    m11 *= invSx;
    m12 *= invSy;
    m13 *= invSz;
    m21 *= invSx;
    m22 *= invSy;
    m23 *= invSz;
    m31 *= invSx;
    m32 *= invSy;
    m33 *= invSz;

    trace = m11 + m22 + m33;

    if (trace > 0) {
        s = 0.5 / mathf.sqrt(trace + 1);

        w = 0.25 / s;
        x = (m32 - m23) * s;
        y = (m13 - m31) * s;
        z = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
        s = 2 * mathf.sqrt(1 + m11 - m22 - m33);

        w = (m32 - m23) / s;
        x = 0.25 * s;
        y = (m12 + m21) / s;
        z = (m13 + m31) / s;
    } else if (m22 > m33) {
        s = 2 * mathf.sqrt(1 + m22 - m11 - m33);

        w = (m13 - m31) / s;
        x = (m12 + m21) / s;
        y = 0.25 * s;
        z = (m23 + m32) / s;
    } else {
        s = 2 * mathf.sqrt(1 + m33 - m11 - m22);

        w = (m21 - m12) / s;
        x = (m13 + m31) / s;
        y = (m23 + m32) / s;
        z = 0.25 * s;
    }

    rotation[0] = x;
    rotation[1] = y;
    rotation[2] = w;
    rotation[3] = z;

    return out;
};

mat4.setPosition = function(out, v) {
    var z = v[2];

    out[12] = v[0];
    out[13] = v[1];
    out[14] = z !== undefined ? z : 0;

    return out;
};

mat4.extractPosition = function(out, a) {

    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];

    return out;
};

mat4.extractRotation = function(out, a) {
    var lx = vec3.lengthSqValues(a[0], a[1], a[2]),
        ly = vec3.lengthSqValues(a[4], a[5], a[6]),
        lz = vec3.lengthSqValues(a[8], a[9], a[10]),

        scaleX = lx !== 0 ? 1 / mathf.sqrt(lx) : lx,
        scaleY = ly !== 0 ? 1 / mathf.sqrt(ly) : ly,
        scaleZ = lz !== 0 ? 1 / mathf.sqrt(lz) : lz;

    out[0] = a[0] * scaleX;
    out[1] = a[1] * scaleX;
    out[2] = a[2] * scaleX;

    out[4] = a[4] * scaleY;
    out[5] = a[5] * scaleY;
    out[6] = a[6] * scaleY;

    out[8] = a[8] * scaleZ;
    out[9] = a[9] * scaleZ;
    out[10] = a[10] * scaleZ;

    return out;
};

mat4.extractRotationScale = function(out, a) {

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];

    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];

    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];

    return out;
};

mat4.translate = function(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];

        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

mat4.scale = function(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];

    return out;
};

mat4.rotateX = function(out, a, angle) {
    var s = Math.sin(angle),
        c = Math.cos(angle),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;

    return out;
};

mat4.rotateY = function(out, a, angle) {
    var s = mathf.sin(angle),
        c = mathf.cos(angle),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) {
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;

    return out;
};

mat4.rotateZ = function(out, a, angle) {
    var s = mathf.sin(angle),
        c = mathf.cos(angle),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) {
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;

    return out;
};

mat4.makeTranslation = function(out, v) {

    return mat4.set(
        out,
        1, 0, 0, v[0],
        0, 1, 0, v[1],
        0, 0, 1, v[2],
        0, 0, 0, 1
    );
};

mat4.makeScale = function(out, v) {

    return mat4.set(
        out,
        v[0], 0, 0, 0,
        0, v[1], 0, 0,
        0, 0, v[2], 0,
        0, 0, 0, 1
    );
};

mat4.makeRotationX = function(out, angle) {
    var c = mathf.cos(angle),
        s = mathf.sin(angle);

    return mat4.set(
        out,
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    );
};

mat4.makeRotationY = function(out, angle) {
    var c = mathf.cos(angle),
        s = mathf.sin(angle);

    return mat4.set(
        out,
        c, 0, s, 0,
        0, 1, 0, 0, -s, 0, c, 0,
        0, 0, 0, 1
    );
};

mat4.makeRotationZ = function(out, angle) {
    var c = mathf.cos(angle),
        s = mathf.sin(angle);

    return mat4.set(
        out,
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
};

mat4.fromQuat = function(out, q) {
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[4] = xy - wz;
    out[8] = xz + wy;

    out[1] = xy + wz;
    out[5] = 1 - (xx + zz);
    out[9] = yz - wx;

    out[2] = xz - wy;
    out[6] = yz + wx;
    out[10] = 1 - (xx + yy);

    out[3] = 0;
    out[7] = 0;
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

mat4.frustum = function(out, left, right, top, bottom, near, far) {
    var x = 2 * near / (right - left),
        y = 2 * near / (top - bottom),

        a = (right + left) / (right - left),
        b = (top + bottom) / (top - bottom),
        c = -(far + near) / (far - near),
        d = -2 * far * near / (far - near);

    out[0] = x;
    out[4] = 0;
    out[8] = a;
    out[12] = 0;
    out[1] = 0;
    out[5] = y;
    out[9] = b;
    out[13] = 0;
    out[2] = 0;
    out[6] = 0;
    out[10] = c;
    out[14] = d;
    out[3] = 0;
    out[7] = 0;
    out[11] = -1;
    out[15] = 0;

    return out;
};

mat4.perspective = function(out, fov, aspect, near, far) {
    var ymax = near * mathf.tan(fov * 0.5),
        ymin = -ymax,
        xmin = ymin * aspect,
        xmax = ymax * aspect;

    return mat4.frustum(out, xmin, xmax, ymax, ymin, near, far);
};

mat4.orthographic = function(out, left, right, top, bottom, near, far) {
    var w = right - left,
        h = top - bottom,
        p = far - near,

        x = (right + left) / w,
        y = (top + bottom) / h,
        z = (far + near) / p;

    out[0] = 2 / w;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 2 / h;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = -2 / p;
    out[11] = 0;
    out[12] = -x;
    out[13] = -y;
    out[14] = -z;
    out[15] = 1;

    return out;
};

mat4.equal = function(a, b) {
    return !(
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3] ||
        a[4] !== b[4] ||
        a[5] !== b[5] ||
        a[6] !== b[6] ||
        a[7] !== b[7] ||
        a[8] !== b[8] ||
        a[9] !== b[9] ||
        a[10] !== b[10] ||
        a[11] !== b[11] ||
        a[12] !== b[12] ||
        a[13] !== b[13] ||
        a[14] !== b[14] ||
        a[15] !== b[15]
    );
};

mat4.notEqual = function(a, b) {
    return (
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3] ||
        a[4] !== b[4] ||
        a[5] !== b[5] ||
        a[6] !== b[6] ||
        a[7] !== b[7] ||
        a[8] !== b[8] ||
        a[9] !== b[9] ||
        a[10] !== b[10] ||
        a[11] !== b[11] ||
        a[12] !== b[12] ||
        a[13] !== b[13] ||
        a[14] !== b[14] ||
        a[15] !== b[15]
    );
};

mat4.str = function(out) {
    return (
        "Mat4[" + out[0] + ", " + out[4] + ", " + out[8] + ", " + out[12] + "]\n" +
        "     [" + out[1] + ", " + out[5] + ", " + out[9] + ", " + out[13] + "]\n" +
        "     [" + out[2] + ", " + out[6] + ", " + out[10] + ", " + out[14] + "]\n" +
        "     [" + out[3] + ", " + out[7] + ", " + out[11] + ", " + out[15] + "]"
    );
};


},
function(require, exports, module, global) {

var Uniform = require(64);


module.exports = UniformTexture;


function UniformTexture(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
}
Uniform.extend(UniformTexture);

UniformTexture.prototype.set = function(value, force) {
    this.context.setTexture(this.location, value, force);
    return this;
};


},
function(require, exports, module, global) {

var Uniform = require(64);


module.exports = UniformTextureCube;


function UniformTextureCube(context, name, location, size) {
    Uniform.call(this, context, name, location, size);
}
Uniform.extend(UniformTextureCube);

UniformTextureCube.prototype.set = function(value, force) {
    this.context.setTexture(this.location, value, force);
    return this;
};


},
function(require, exports, module, global) {

module.exports = {
    INT: require(83),
    FLOAT: require(85),

    INT_VEC2: require(86),
    INT_VEC3: require(87),
    INT_VEC4: require(88),

    FLOAT_VEC2: require(89),
    FLOAT_VEC3: require(90),
    FLOAT_VEC4: require(91)
};


},
function(require, exports, module, global) {

var Attribute = require(84);


module.exports = Attribute1i;


function Attribute1i(context, name, location) {
    Attribute.call(this, context, name, location);
}
Attribute.extend(Attribute1i);

Attribute1i.prototype.set = function(buffer, offset, force) {
    var context = this.context,
        gl = context.gl;

    context.setAttribPointer(this.location, 1, gl.FLOAT, buffer.stride, offset, context.setArrayBuffer(buffer) || force);
    return this;
};


},
function(require, exports, module, global) {

var inherits = require(12);


module.exports = Attribute;


function Attribute(context, name, location) {
    this.name = name;
    this.location = location;
    this.context = context;
}

Attribute.extend = function(child) {
    return inherits(child, this);
};

Attribute.prototype.set = function( /* buffer, offset, force */ ) {
    return this;
};


},
function(require, exports, module, global) {

var Attribute = require(84);


module.exports = Attribute1f;


function Attribute1f(context, name, location) {
    Attribute.call(this, context, name, location);
}
Attribute.extend(Attribute1f);

Attribute1f.prototype.set = function(buffer, offset, force) {
    var context = this.context,
        gl = context.gl;

    context.setAttribPointer(this.location, 1, gl.FLOAT, buffer.stride, offset, context.setArrayBuffer(buffer) || force);
    return this;
};


},
function(require, exports, module, global) {

var Attribute = require(84);


module.exports = Attribute2i;


function Attribute2i(context, name, location) {
    Attribute.call(this, context, name, location);
}
Attribute.extend(Attribute2i);

Attribute2i.prototype.set = function(buffer, offset, force) {
    var context = this.context,
        gl = context.gl;

    context.setAttribPointer(this.location, 2, gl.FLOAT, buffer.stride, offset, context.setArrayBuffer(buffer) || force);
    return this;
};


},
function(require, exports, module, global) {

var Attribute = require(84);


module.exports = Attribute3i;


function Attribute3i(context, name, location) {
    Attribute.call(this, context, name, location);
}
Attribute.extend(Attribute3i);

Attribute3i.prototype.set = function(buffer, offset, force) {
    var context = this.context,
        gl = context.gl;

    context.setAttribPointer(this.location, 3, gl.FLOAT, buffer.stride, offset, context.setArrayBuffer(buffer) || force);
    return this;
};


},
function(require, exports, module, global) {

var Attribute = require(84);


module.exports = Attribute4i;


function Attribute4i(context, name, location) {
    Attribute.call(this, context, name, location);
}
Attribute.extend(Attribute4i);

Attribute4i.prototype.set = function(buffer, offset, force) {
    var context = this.context,
        gl = context.gl;

    context.setAttribPointer(this.location, 4, gl.FLOAT, buffer.stride, offset, context.setArrayBuffer(buffer) || force);
    return this;
};


},
function(require, exports, module, global) {

var Attribute = require(84);


module.exports = Attribute2f;


function Attribute2f(context, name, location) {
    Attribute.call(this, context, name, location);
}
Attribute.extend(Attribute2f);

Attribute2f.prototype.set = function(buffer, offset, force) {
    var context = this.context,
        gl = context.gl;

    context.setAttribPointer(this.location, 2, gl.FLOAT, buffer.stride, offset, context.setArrayBuffer(buffer) || force);
    return this;
};


},
function(require, exports, module, global) {

var Attribute = require(84);


module.exports = Attribute3f;


function Attribute3f(context, name, location) {
    Attribute.call(this, context, name, location);
}
Attribute.extend(Attribute3f);

Attribute3f.prototype.set = function(buffer, offset, force) {
    var context = this.context,
        gl = context.gl;

    context.setAttribPointer(this.location, 3, gl.FLOAT, buffer.stride, offset, context.setArrayBuffer(buffer) || force);
    return this;
};


},
function(require, exports, module, global) {

var Attribute = require(84);


module.exports = Attribute4f;


function Attribute4f(context, name, location) {
    Attribute.call(this, context, name, location);
}
Attribute.extend(Attribute4f);

Attribute4f.prototype.set = function(buffer, offset, force) {
    var context = this.context,
        gl = context.gl;

    context.setAttribPointer(this.location, 4, gl.FLOAT, buffer.stride, offset, context.setArrayBuffer(buffer) || force);
    return this;
};


},
function(require, exports, module, global) {

var enums = require(46);


var emitterRenderMode = enums([
    "NONE",
    "NORMAL",
    "POINT",
    "CROSS"
]);


module.exports = emitterRenderMode;


},
function(require, exports, module, global) {

var enums = require(46);


var interpolation = enums([
    "NONE",
    "LINEAR",
    "LINEAR_BLEND",
    "RANDOM",
    "RANDOM_BLEND"
]);


module.exports = interpolation;


},
function(require, exports, module, global) {

var enums = require(46);


var normalMode = enums([
    "CAMERA_FACING",
    "SPHERICAL",
    "CYLINDIRCAL"
]);


module.exports = normalMode;


},
function(require, exports, module, global) {

var enums = require(46);


var screenAlignment = enums([
    "FACING_CAMERA_POSITION",
    "SQUARE",
    "RECTANGLE",
    "VELOCITY",
    "TYPE_SPECIFIC"
]);


module.exports = screenAlignment;


},
function(require, exports, module, global) {

var enums = require(46);


var side = enums([
    "NONE",
    "FRONT",
    "BACK",
    "BOTH"
]);


module.exports = side;


},
function(require, exports, module, global) {

var enums = require(46);


var sortMode = enums([
    "NONE",
    "VIEW_PROJ_DEPTH",
    "DISTANCE_TO_VIEW",
    "AGE_OLDEST_FIRST",
    "AGE_NEWEST_FIRST"
]);


module.exports = sortMode;


},
function(require, exports, module, global) {

var enums = require(46);


var wrapMode = enums([
    "ONCE",
    "LOOP",
    "PING_PONG",
    "CLAMP"
]);


module.exports = wrapMode;


},
function(require, exports, module, global) {

var isString = require(9),
    isNumber = require(33),
    indexOf = require(61),
    Class = require(2),
    Assets = require(100),
    createLoop = require(23),
    Scene = require(101);


var ClassPrototype = Class.prototype,
    BaseApplicationPrototype;


module.exports = BaseApplication;


function BaseApplication() {
    var _this = this;

    Class.call(this);

    this.assets = Assets.create();

    this.__scenes = [];
    this.__sceneHash = {};

    this.__loop = createLoop(function loop() {
        _this.loop();
    }, null);

}
Class.extend(BaseApplication, "odin.BaseApplication");
BaseApplicationPrototype = BaseApplication.prototype;

BaseApplicationPrototype.construct = function() {

    ClassPrototype.construct.call(this);

    return this;
};

BaseApplicationPrototype.destructor = function() {
    var scenes = this.__scenes,
        sceneHash = this.__sceneHash,
        i = -1,
        il = scenes.length - 1,
        scene;

    ClassPrototype.destructor.call(this);

    while (i++ < il) {
        scene = scenes[i];
        scene.destructor();
        delete sceneHash[scene.name];
        scenes.splice(i, 1);
    }

    this.assets.destructor();
    this.__loop.pause();

    return this;
};

BaseApplicationPrototype.init = function() {

    this.__loop.run();
    this.emit("init");

    return this;
};

BaseApplicationPrototype.pause = function() {

    this.__loop.pause();
    this.emit("pause");

    return this;
};

BaseApplicationPrototype.resume = function() {

    this.__loop.run();
    this.emit("resume");

    return this;
};

BaseApplicationPrototype.isRunning = function() {
    return this.__loop.isRunning();
};

BaseApplicationPrototype.isPaused = function() {
    return this.__loop.isPaused();
};

BaseApplicationPrototype.loop = function() {

    this.emit("loop");

    return this;
};

BaseApplicationPrototype.addScene = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        BaseApplication_addScene(this, arguments[i]);
    }
    return this;
};

function BaseApplication_addScene(_this, scene) {
    var scenes = _this.__scenes,
        sceneHash = _this.__sceneHash,
        name = scene.name,
        json;

    if (!sceneHash[name]) {
        json = (scene instanceof Scene) ? scene.toJSON() : scene;

        sceneHash[name] = json;
        scenes[scenes.length] = json;

        _this.emit("addScene", name);
    } else {
        throw new Error("Application addScene(...scenes) Scene is already a member of Application");
    }
}

BaseApplicationPrototype.removeScene = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        BaseApplication_removeScene(this, arguments[i]);
    }
    return this;
};

function BaseApplication_removeScene(_this, scene) {
    var scenes = _this.__scenes,
        sceneHash = _this.__sceneHash,
        json, name;

    if (isString(scene)) {
        json = sceneHash[scene];
    } else if (isNumber(scene)) {
        json = scenes[scene];
    }

    name = json.name;

    if (sceneHash[name]) {

        sceneHash[name] = null;
        scenes.splice(indexOf(scenes, json), 1);

        _this.emit("removeScene", name);
    } else {
        throw new Error("Application removeScene(...scenes) Scene not a member of Application");
    }
}


},
function(require, exports, module, global) {

var Class = require(2),
    indexOf = require(61);


var ClassPrototype = Class.prototype,
    AssetsPrototype;


module.exports = Assets;


function Assets() {

    Class.call(this);

    this.__notLoaded = [];
    this.__array = [];
    this.__hash = {};
}
Class.extend(Assets, "odin.Assets");
AssetsPrototype = Assets.prototype;

AssetsPrototype.construct = function() {

    ClassPrototype.construct.call(this);

    return this;
};

AssetsPrototype.destructor = function() {
    var array = this.__array,
        hash = this.__hash,
        i = -1,
        il = array.length - 1,
        asset;

    ClassPrototype.destructor.call(this);

    while (i++ < il) {
        asset = array[i];
        asset.destructor();

        array.splice(i, 1);
        delete hash[asset.name];
    }

    this.__notLoaded.length = 0;

    return this;
};

AssetsPrototype.has = function(name) {
    return !!this.__hash[name];
};

AssetsPrototype.get = function(name) {
    return this.__hash[name];
};

AssetsPrototype.addAsset = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Assets_addAsset(this, arguments[i]);
    }

    return this;
};

function Assets_addAsset(_this, asset) {
    var name = asset.name,
        hash = _this.__hash,
        notLoaded = _this.__notLoaded,
        array = _this.__array;

    if (!hash[name]) {
        hash[name] = asset;
        array[array.length] = asset;

        if (asset.src != null) {
            notLoaded[notLoaded.length] = asset;
        }
    } else {
        throw new Error("Assets addAsset(...assets) Assets already has member named " + name);
    }
}

AssetsPrototype.removeAsset = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Assets_removeAsset(this, arguments[i]);
    }

    return this;
};

function Assets_removeAsset(_this, asset) {
    var name = asset.name,
        hash = _this.__hash,
        notLoaded = _this.__notLoaded,
        array = _this.__array,
        index;

    if (hash[name]) {
        delete hash[name];
        array.splice(indexOf(array, asset), 1);

        if ((index = indexOf(notLoaded, asset))) {
            notLoaded.splice(index, 1);
        }
    } else {
        throw new Error("Assets removeAsset(...assets) Assets do not have a member named " + name);
    }
}

AssetsPrototype.load = function(callback) {
    var _this = this,
        notLoaded = this.__notLoaded,
        length = notLoaded.length,
        i, il, called, done;

    if (length === 0) {
        callback();
    } else {
        i = -1;
        il = length - 1;
        called = false;

        done = function done(err) {
            if (called) {
                return;
            }
            if (err || --length === 0) {
                called = true;
                if (callback) {
                    callback(err);
                }
                _this.emit("load");
            }
        };

        while (i++ < il) {
            notLoaded[i].load(done);
        }
        notLoaded.length = 0;
    }

    return this;
};


},
function(require, exports, module, global) {

var indexOf = require(61),
    Input = require(102),
    Class = require(2),
    Time = require(124),
    Entity = require(125);


var ClassPrototype = Class.prototype,
    ScenePrototype;


module.exports = Scene;


function Scene() {

    Class.call(this);

    this.name = null;

    this.time = new Time();
    this.input = new Input();

    this.assets = null;
    this.application = null;

    this.__entities = [];
    this.__entityHash = {};

    this.__managers = [];
    this.managers = {};

    this.__plugins = [];
    this.plugins = {};

    this.__init = false;
    this.__awake = false;
}
Class.extend(Scene, "odin.Scene");
ScenePrototype = Scene.prototype;

ScenePrototype.construct = function(name) {

    ClassPrototype.construct.call(this);

    this.name = name;
    this.time.construct();
    this.input.construct();

    this.__init = false;
    this.__awake = false;

    return this;
};

ScenePrototype.destructor = function() {
    var entities = this.__entities,
        i = -1,
        il = entities.length - 1;

    ClassPrototype.destructor.call(this);

    while (i++ < il) {
        entities[i].destroy(false).destructor();
    }

    this.name = null;
    this.input.destructor();
    this.application = null;

    this.__init = false;
    this.__awake = false;

    return this;
};

ScenePrototype.init = function(element) {

    this.__init = true;
    this.input.attach(element);
    this.sortManagers();
    this.emit("init");

    return this;
};

ScenePrototype.awake = function() {

    this.__awake = true;
    this.awakePlugins();
    this.awakeManagers();
    this.emit("awake");

    return this;
};

ScenePrototype.update = function() {
    var time = this.time;

    time.update();
    this.input.update(time.time, time.frameCount);

    this.updatePlugins();
    this.updateManagers();

    return this;
};

ScenePrototype.clear = function(emitEvent) {
    if (emitEvent !== false) {
        this.emit("clear");
    }
    return this;
};

ScenePrototype.destroy = function(emitEvent) {
    var entities = this.__entities,
        i = -1,
        il = entities.length - 1;

    if (emitEvent !== false) {
        this.emit("destroy");
    }

    while (i++ < il) {
        entities[i].destroy();
    }

    this.destroyPlugins();

    return this;
};

ScenePrototype.has = function(entity) {
    return !!this.__entityHash[entity.__id];
};

ScenePrototype.find = function(name) {
    var entities = this.__entities,
        i = -1,
        il = entities.length - 1,
        entity;

    while (i++ < il) {
        entity = entities[i];

        if (entity.name === name) {
            return entity;
        }
    }

    return undefined;
};

ScenePrototype.addEntity = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Scene_addEntity(this, arguments[i]);
    }
    return this;
};

function Scene_addEntity(_this, entity) {
    var entities = _this.__entities,
        entityHash = _this.__entityHash,
        id = entity.__id;

    if (!entityHash[id]) {
        entity.scene = _this;
        entities[entities.length] = entity;
        entityHash[id] = entity;

        Scene_addObjectComponents(_this, entity.__componentArray);
        Scene_addObjectChildren(_this, entity.children);

        _this.emit("addEntity", entity);
    } else {
        throw new Error("Scene addEntity(...entities) trying to add object that is already a member of Scene");
    }
}

function Scene_addObjectComponents(_this, components) {
    var i = -1,
        il = components.length - 1;

    while (i++ < il) {
        _this.__addComponent(components[i]);
    }
}

function Scene_addObjectChildren(_this, children) {
    var i = -1,
        il = children.length - 1;

    while (i++ < il) {
        Scene_addEntity(_this, children[i]);
    }
}

ScenePrototype.__addComponent = function(component) {
    var className = component.className,
        managerHash = this.managers,
        managers = this.__managers,
        manager = managerHash[className];

    if (!manager) {
        manager = component.Manager.create();

        manager.scene = this;
        managers[managers.length] = manager;
        managerHash[className] = manager;

        sortManagers(this);
        manager.init();

        this.emit("addManager", manager);
    }

    manager.addComponent(component);
    component.manager = manager;

    this.emit("add-" + className, component);

    if (this.__init) {
        component.init();
    }
    if (this.__awake) {
        manager.sort();
        component.awake();
    }

    return this;
};

ScenePrototype.removeEntity = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Scene_removeEntity(this, arguments[i]);
    }
    return this;
};

function Scene_removeEntity(_this, entity) {
    var entities = _this.__entities,
        entityHash = _this.__entityHash,
        id = entity.__id;

    if (entityHash[id]) {
        _this.emit("removeEntity", entity);

        entity.scene = null;

        entities.splice(indexOf(entities, entity), 1);
        delete entityHash[id];

        Scene_removeObjectComponents(_this, entity.__componentArray);
        Scene_removeObjectChildren(_this, entity.children);
    } else {
        throw new Error("Scene removeEntity(...entities) trying to remove object that is not a member of Scene");
    }
}

function Scene_removeObjectComponents(_this, components) {
    var i = -1,
        il = components.length - 1;

    while (i++ < il) {
        _this.__removeComponent(components[i]);
    }
}

function Scene_removeObjectChildren(_this, children) {
    var i = -1,
        il = children.length - 1;

    while (i++ < il) {
        Scene_removeEntity(_this, children[i]);
    }
}

ScenePrototype.__removeComponent = function(component) {
    var className = component.className,
        managerHash = this.managers,
        managers = this.__managers,
        manager = managerHash[className];

    if (manager) {
        this.emit("remove-" + className, component);

        manager.removeComponent(component);
        component.manager = null;

        if (manager.isEmpty()) {
            manager.clear();
            this.emit("removeManager", manager);

            manager.scene = null;
            managers.splice(indexOf(managers, manager), 1);
            delete managerHash[className];
        }
    }

    if (this.__awake) {
        component.clear();
    }

    return this;
};

function sortManagers(_this) {
    _this.__managers.sort(sortManagersFn);
}

function sortManagersFn(a, b) {
    return a.order - b.order;
}

ScenePrototype.hasManager = function(name) {
    return !!this.managers[name];
};

ScenePrototype.getManager = function(name) {
    return this.managers[name];
};

function clearManagers_callback(manager) {
    manager.clear(clearManagers_callback.emitEvents);
}
clearManagers_callback.set = function set(emitEvents) {
    this.emitEvents = emitEvents;
    return this;
};
ScenePrototype.clearManagers = function clearManagers(emitEvents) {
    return this.eachManager(clearManagers_callback.set(emitEvents));
};

function initManagers_callback(manager) {
    manager.init();
}
ScenePrototype.initManagers = function initManagers() {
    return this.eachManager(initManagers_callback);
};

function sortManagers_callback(manager) {
    manager.sort();
}
ScenePrototype.sortManagers = function sortManagers() {
    return this.eachManager(sortManagers_callback);
};

function awakeManagers_callback(manager) {
    manager.awake();
}
ScenePrototype.awakeManagers = function awakeManagers() {
    return this.eachManager(awakeManagers_callback);
};

function updateManagers_callback(manager) {
    manager.update();
}
ScenePrototype.updateManagers = function updateManagers() {
    return this.eachManager(updateManagers_callback);
};

function destroyManagers_callback(manager) {
    manager.destroy();
}
ScenePrototype.destroyManagers = function destroyManagers() {
    return this.eachManager(destroyManagers_callback);
};

ScenePrototype.eachManager = function eachManager(fn) {
    var managers = this.__managers,
        i = -1,
        il = managers.length - 1;

    while (i++ < il) {
        if (fn(managers[i]) === false) {
            break;
        }
    }
    return this;
};

ScenePrototype.addPlugin = function addPlugin() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        ScenePrototype_addPlugin(this, arguments[i]);
    }

    return this;
};

function ScenePrototype_addPlugin(_this, plugin) {
    var plugins = _this.__plugins,
        pluginHash = _this.plugins,
        className = plugin.className;

    if (!pluginHash[className]) {
        plugin.scene = _this;
        plugins[plugins.length] = plugin;
        pluginHash[className] = plugin;
        plugin.init();
        _this.emit("addPlugin", plugin);
    } else {
        throw new Error("Scene addPlugin(...plugins) trying to add plugin " + className + " that is already a member of Scene");
    }
}

ScenePrototype.removePlugin = function removePlugin() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        ScenePrototype_removePlugin(this, arguments[i]);
    }

    return this;
};

function ScenePrototype_removePlugin(_this, plugin) {
    var plugins = _this.__plugins,
        pluginHash = _this.plugins,
        className = plugin.className;

    if (pluginHash[className]) {
        _this.emit("removePlugin", plugin);
        plugin.scene = null;
        plugins.splice(indexOf(plugins, plugin), 1);
        delete pluginHash[className];
    } else {
        throw new Error(
            "Scene removePlugin(...plugins) trying to remove plugin " + className + " that is not a member of Scene"
        );
    }
}

ScenePrototype.hasPlugin = function(name) {
    return !!this.plugins[name];
};

ScenePrototype.getPlugin = function(name) {
    return this.plugins[name];
};

function clearPlugins_callback(plugin) {
    plugin.clear(clearPlugins_callback.emitEvents);
}
clearPlugins_callback.set = function set(emitEvents) {
    this.emitEvents = emitEvents;
    return this;
};
ScenePrototype.clearPlugins = function clearPlugins(emitEvents) {
    return this.eachPlugin(clearPlugins_callback.set(emitEvents));
};

function awakePlugins_callback(plugin) {
    plugin.awake();
}
ScenePrototype.awakePlugins = function awakePlugins() {
    return this.eachPlugin(awakePlugins_callback);
};

function updatePlugins_callback(plugin) {
    plugin.update();
}
ScenePrototype.updatePlugins = function updatePlugins() {
    return this.eachPlugin(updatePlugins_callback);
};

function destroyPlugins_callback(plugin) {
    plugin.destroy();
}
ScenePrototype.destroyPlugins = function destroyPlugins() {
    return this.eachPlugin(destroyPlugins_callback);
};

ScenePrototype.eachPlugin = function eachPlugin(fn) {
    var plugins = this.__plugins,
        i = -1,
        il = plugins.length - 1;

    while (i++ < il) {
        if (fn(plugins[i]) === false) {
            break;
        }
    }
    return this;
};

ScenePrototype.toJSON = function(json) {
    var entities = this.__entities,
        plugins = this.__plugins,
        i = -1,
        il = entities.length - 1,
        index, jsonEntities, entity, jsonPlugins;

    json = ClassPrototype.toJSON.call(this, json);

    json.name = this.name;
    jsonEntities = json.entities || (json.entities = []);
    jsonPlugins = json.plugins || (json.plugins = []);

    while (i++ < il) {
        entity = entities[i];

        if (entity.depth === 0) {
            index = jsonEntities.length;
            jsonEntities[index] = entity.toJSON(jsonEntities[index]);
        }
    }

    i = -1;
    il = plugins.length - 1;
    while (i++ < il) {
        index = jsonPlugins.length;
        jsonPlugins[index] = plugins[i].toJSON(jsonPlugins[index]);
    }

    return json;
};

ScenePrototype.fromJSON = function(json) {
    var jsonEntities = json.entities,
        jsonPlugins = json.plugins,
        i = -1,
        il = jsonEntities.length - 1,
        entity, jsonPlugin, plugin;

    ClassPrototype.fromJSON.call(this, json);

    this.name = json.name;

    while (i++ < il) {
        entity = new Entity();
        entity.generateNewId();
        entity.scene = this;
        entity.fromJSON(jsonEntities[i]);
        this.addEntity(entity);
    }

    i = -1;
    il = jsonPlugins.length - 1;
    while (i++ < il) {
        jsonPlugin = jsonPlugins[i];
        plugin = Class.newClass(jsonPlugin.className);
        plugin.generateNewId();
        plugin.scene = this;
        plugin.fromJSON(jsonPlugin);
        this.addPlugin(plugin);
    }

    return this;
};


},
function(require, exports, module, global) {

var vec3 = require(38),
    EventEmitter = require(20),
    Handler = require(103),
    Mouse = require(116),
    Buttons = require(117),
    Touches = require(119),
    Axes = require(121),
    eventHandlers = require(123);


var MOUSE_BUTTONS = [
        "mouse0",
        "mouse1",
        "mouse2"
    ],
    InputPrototype;


module.exports = Input;


function Input() {

    EventEmitter.call(this, -1);

    this.__lastTime = null;
    this.__frame = null;

    this.__stack = [];
    this.__handler = null;

    this.mouse = new Mouse();
    this.buttons = new Buttons();
    this.touches = new Touches();
    this.axes = new Axes();
    this.acceleration = vec3.create();
}
EventEmitter.extend(Input);
InputPrototype = Input.prototype;

Input.create = function() {
    return (new Input()).construct();
};

InputPrototype.construct = function() {

    this.mouse.construct();
    this.buttons.construct();
    this.touches.construct();
    this.axes.construct();

    return this;
};

InputPrototype.destructor = function() {

    this.__lastTime = null;
    this.__frame = null;

    this.__stack.length = 0;
    this.__handler = null;

    this.mouse.destructor();
    this.buttons.destructor();
    this.touches.destructor();
    this.axes.destructor();
    vec3.set(this.acceleration, 0, 0, 0);

    return this;
};

InputPrototype.attach = function(element) {
    var handler = this.__handler;

    if (!handler) {
        handler = this.__handler = Handler.create(this);
    } else {
        handler.detach(element);
    }

    handler.attach(element);

    return this;
};

InputPrototype.server = function(socket) {
    var stack = this.__stack;

    socket.on("inputevent", function(e) {
        stack[stack.length] = e;
    });

    return this;
};

InputPrototype.client = function(socket) {
    var handler = this.__handler,
        send = createSendFn(socket);

    handler.on("event", function(e) {
        send("inputevent", e);
    });

    return this;
};

function createSendFn(socket) {
    if (socket.emit) {
        return function send(type, data) {
            return socket.emit(type, data);
        };
    } else {
        return function send(type, data) {
            return socket.send(type, data);
        };
    }
}

InputPrototype.axis = function(name) {
    var axis = this.axes.__hash[name];
    return axis ? axis.value : 0;
};

InputPrototype.touch = function(index) {
    return this.touches.__array[index];
};

InputPrototype.mouseButton = function(id) {
    var button = this.buttons.__hash[MOUSE_BUTTONS[id]];
    return button && button.value;
};


InputPrototype.mouseButtonDown = function(id) {
    var button = this.buttons.__hash[MOUSE_BUTTONS[id]];
    return !!button && button.value && (button.frameDown >= this.__frame);
};


InputPrototype.mouseButtonUp = function(id) {
    var button = this.buttons.__hash[MOUSE_BUTTONS[id]];
    return button != null ? (button.frameUp >= this.__frame) : true;
};

InputPrototype.key = function(name) {
    var button = this.buttons.__hash[name];
    return !!button && button.value;
};

InputPrototype.keyDown = function(name) {
    var button = this.buttons.__hash[name];
    return !!button && button.value && (button.frameDown >= this.__frame);
};

InputPrototype.keyUp = function(name) {
    var button = this.buttons.__hash[name];
    return button != null ? (button.frameUp >= this.__frame) : true;
};

InputPrototype.update = function(time, frame) {
    var stack = this.__stack,
        i = -1,
        il = stack.length - 1,
        event, lastTime;

    this.__frame = frame;
    this.mouse.wheel = 0;

    while (i++ < il) {
        event = stack[i];

        eventHandlers[event.type](this, event, time, frame);

        if (event.destroy) {
            event.destroy();
        }
    }

    stack.length = 0;

    lastTime = this.__lastTime || (this.__lastTime = time);
    this.__lastTime = time;

    this.axes.update(this, time - lastTime);
    this.emit("update");

    return this;
};


},
function(require, exports, module, global) {

var EventEmitter = require(20),
    focusNode = require(104),
    blurNode = require(105),
    getActiveElement = require(106),
    eventListener = require(34),
    events = require(108);


var HandlerPrototype;


module.exports = Handler;


function Handler() {

    EventEmitter.call(this, -1);

    this.__input = null;
    this.__element = null;

    this.__handler = null;

    this.__focusHandler = null;
    this.__blurHandler = null;
}
EventEmitter.extend(Handler);
HandlerPrototype = Handler.prototype;

Handler.create = function(input) {
    return (new Handler()).construct(input);
};

HandlerPrototype.construct = function(input) {

    this.__input = input;

    return this;
};

HandlerPrototype.destructor = function() {

    this.__input = null;
    this.__element = null;

    this.__handler = null;

    this.__focusHandler = null;
    this.__blurHandler = null;

    return this;
};

HandlerPrototype.attach = function(element) {
    var _this, input, stack;

    if (element === this.__element) {
        return this;
    }

    _this = this;

    input = this.__input;
    stack = input.__stack;

    this.__handler = function(e) {
        var type = e.type,
            event;

        e.preventDefault();

        event = events[type].create(e);

        _this.emit("event", event);
        stack[stack.length] = event;
    };

    this.__focusHandler = function() {
        if (getActiveElement() !== element) {
            focusNode(element);
        }
    };

    this.__blurHandler = function() {
        if (getActiveElement() === element) {
            blurNode(element);
        }
    };

    element.setAttribute("tabindex", 1);
    focusNode(element);
    eventListener.on(element, "mouseover touchstart", this.__focusHandler);
    eventListener.on(element, "mouseout touchcancel", this.__blurHandler);

    eventListener.on(
        element,
        "mousedown mouseup mousemove mouseout wheel " +
        "keydown keyup " +
        "touchstart touchmove touchend touchcancel",
        this.__handler
    );
    eventListener.on(window, "devicemotion", this.__handler);

    this.__element = element;

    return this;
};

HandlerPrototype.detach = function() {
    var element = this.__element;

    if (element) {
        element.removeAttribute("tabindex");
        eventListener.off(element, "mouseover touchstart", this.__focusHandler);
        eventListener.off(element, "mouseout touchcancel", this.__blurHandler);

        eventListener.off(
            element,
            "mousedown mouseup mousemove mouseout wheel " +
            "keydown keyup " +
            "touchstart touchmove touchend touchcancel",
            this.__handler
        );
        eventListener.off(window, "devicemotion", this.__handler);
    }

    this.__element = null;
    this.__handler = null;
    this.__nativeHandler = null;

    return this;
};


},
function(require, exports, module, global) {

var isNode = require(36);


module.exports = focusNode;


function focusNode(node) {
    if (isNode(node) && node.focus) {
        try {
            node.focus();
        } catch (e) {}
    }
}


},
function(require, exports, module, global) {

var isNode = require(36);


module.exports = blurNode;


function blurNode(node) {
    if (isNode(node) && node.blur) {
        try {
            node.blur();
        } catch (e) {}
    }
}


},
function(require, exports, module, global) {

var isDocument = require(107),
    environment = require(25);


var document = environment.document;


module.exports = getActiveElement;


function getActiveElement(ownerDocument) {
    ownerDocument = isDocument(ownerDocument) ? ownerDocument : document;

    try {
        return ownerDocument.activeElement || ownerDocument.body;
    } catch (e) {
        return ownerDocument.body;
    }
}


},
function(require, exports, module, global) {

var isNode = require(36);


module.exports = isDocument;


function isDocument(obj) {
    return isNode(obj) && obj.nodeType === 9;
}


},
function(require, exports, module, global) {

var MouseEvent = require(109),
    WheelEvent = require(111),
    KeyEvent = require(112),
    TouchEvent = require(114),
    DeviceMotionEvent = require(115);


module.exports = {
    mousedown: MouseEvent,
    mouseup: MouseEvent,
    mousemove: MouseEvent,
    mouseout: MouseEvent,

    wheel: WheelEvent,

    keyup: KeyEvent,
    keydown: KeyEvent,

    touchstart: TouchEvent,
    touchmove: TouchEvent,
    touchend: TouchEvent,
    touchcancel: TouchEvent,

    devicemotion: DeviceMotionEvent
};


},
function(require, exports, module, global) {

var createPool = require(110),
    environment = require(25);


var window = environment.window,
    MouseEventPrototype;


module.exports = MouseEvent;


function MouseEvent(e) {
    var target = e.target;

    this.type = e.type;

    this.x = getMouseX(e, target);
    this.y = getMouseY(e, target);
    this.button = getButton(e);
}
createPool(MouseEvent);
MouseEventPrototype = MouseEvent.prototype;

MouseEvent.create = function(e) {
    return MouseEvent.getPooled(e);
};

MouseEventPrototype.destroy = function() {
    MouseEvent.release(this);
};

MouseEventPrototype.destructor = function() {
    this.type = null;
    this.x = null;
    this.y = null;
    this.button = null;
};

function getMouseX(e, target) {
    return e.clientX - ((target.offsetLeft || 0) - (window.pageXOffset || 0));
}

function getMouseY(e, target) {
    return e.clientY - ((target.offsetTop || 0) - (window.pageYOffset || 0));
}

function getButton(e) {
    var button = e.button;

    return (
        e.which != null ? button : (
            button === 2 ? 2 : button === 4 ? 1 : 0
        )
    );
}


},
function(require, exports, module, global) {

var isFunction = require(5),
    isNumber = require(33),
    defineProperty = require(19);


var descriptor = {
    configurable: false,
    enumerable: false,
    writable: false,
    value: null
};


module.exports = createPool;


function createPool(Constructor, poolSize) {
    addProperty(Constructor, "instancePool", []);
    addProperty(Constructor, "getPooled", createPooler(Constructor));
    addProperty(Constructor, "release", createReleaser(Constructor));

    if (!Constructor.poolSize) {
        Constructor.poolSize = isNumber(poolSize) ? (poolSize < -1 ? -1 : poolSize) : -1;
    }

    return Constructor;
}

function addProperty(object, name, value) {
    descriptor.value = value;
    defineProperty(object, name, descriptor);
    descriptor.value = null;
}

function createPooler(Constructor) {
    switch (Constructor.length) {
        case 0:
            return createNoArgumentPooler(Constructor);
        case 1:
            return createOneArgumentPooler(Constructor);
        case 2:
            return createTwoArgumentsPooler(Constructor);
        case 3:
            return createThreeArgumentsPooler(Constructor);
        case 4:
            return createFourArgumentsPooler(Constructor);
        case 5:
            return createFiveArgumentsPooler(Constructor);
        default:
            return createApplyPooler(Constructor);
    }
}

function createNoArgumentPooler(Constructor) {
    return function pooler() {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            return instance;
        } else {
            return new Constructor();
        }
    };
}

function createOneArgumentPooler(Constructor) {
    return function pooler(a0) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0);
            return instance;
        } else {
            return new Constructor(a0);
        }
    };
}

function createTwoArgumentsPooler(Constructor) {
    return function pooler(a0, a1) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1);
            return instance;
        } else {
            return new Constructor(a0, a1);
        }
    };
}

function createThreeArgumentsPooler(Constructor) {
    return function pooler(a0, a1, a2) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1, a2);
            return instance;
        } else {
            return new Constructor(a0, a1, a2);
        }
    };
}

function createFourArgumentsPooler(Constructor) {
    return function pooler(a0, a1, a2, a3) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1, a2, a3);
            return instance;
        } else {
            return new Constructor(a0, a1, a2, a3);
        }
    };
}

function createFiveArgumentsPooler(Constructor) {
    return function pooler(a0, a1, a2, a3, a4) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1, a2, a3, a4);
            return instance;
        } else {
            return new Constructor(a0, a1, a2, a3, a4);
        }
    };
}

function createApplyConstructor(Constructor) {
    function F(args) {
        return Constructor.apply(this, args);
    }
    F.prototype = Constructor.prototype;

    return function applyConstructor(args) {
        return new F(args);
    };
}

function createApplyPooler(Constructor) {
    var applyConstructor = createApplyConstructor(Constructor);

    return function pooler() {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.apply(instance, arguments);
            return instance;
        } else {
            return applyConstructor(arguments);
        }
    };
}

function createReleaser(Constructor) {
    return function releaser(instance) {
        var instancePool = Constructor.instancePool;

        if (isFunction(instance.destructor)) {
            instance.destructor();
        }
        if (Constructor.poolSize === -1 || instancePool.length < Constructor.poolSize) {
            instancePool[instancePool.length] = instance;
        }
    };
}


},
function(require, exports, module, global) {

var createPool = require(110);


var WheelEventPrototype;


module.exports = WheelEvent;


function WheelEvent(e) {
    this.type = e.type;
    this.deltaX = getDeltaX(e);
    this.deltaY = getDeltaY(e);
    this.deltaZ = e.deltaZ || 0;
}
createPool(WheelEvent);
WheelEventPrototype = WheelEvent.prototype;

WheelEvent.create = function(e) {
    return WheelEvent.getPooled(e);
};

WheelEventPrototype.destroy = function() {
    WheelEvent.release(this);
};

WheelEventPrototype.destructor = function() {
    this.type = null;
    this.deltaX = null;
    this.deltaY = null;
    this.deltaZ = null;
};

function getDeltaX(e) {
    return e.deltaX != null ? e.deltaX : (
        e.wheelDeltaX != null ? -e.wheelDeltaX : 0
    );
}

function getDeltaY(e) {
    return e.deltaY != null ? e.deltaY : (
        e.wheelDeltaY != null ? -e.wheelDeltaY : (
            e.wheelDelta != null ? -e.wheelDelta : 0
        )
    );
}


},
function(require, exports, module, global) {

var createPool = require(110),
    keyCodes = require(113);


var KeyEventPrototype;


module.exports = KeyEvent;


function KeyEvent(e) {
    var keyCode = e.keyCode;

    this.type = e.type;
    this.key = keyCodes[keyCode];
    this.keyCode = keyCode;
}
createPool(KeyEvent);
KeyEventPrototype = KeyEvent.prototype;

KeyEvent.create = function(e) {
    return KeyEvent.getPooled(e);
};

KeyEventPrototype.destroy = function() {
    KeyEvent.release(this);
};

KeyEventPrototype.destructor = function() {
    this.type = null;
    this.key = null;
    this.keyCode = null;
};


},
function(require, exports, module, global) {

module.exports = {
    0: "\\",
    8: "backspace",
    9: "tab",
    12: "num",
    13: "enter",
    16: "shift",
    17: "ctrl",
    18: "alt",
    19: "pause",
    20: "caps",
    27: "esc",
    32: "space",
    33: "pageup",
    34: "pagedown",
    35: "end",
    36: "home",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    44: "print",
    45: "insert",
    46: "delete",
    48: "0",
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    65: "a",
    66: "b",
    67: "c",
    68: "d",
    69: "e",
    70: "f",
    71: "g",
    72: "h",
    73: "i",
    74: "j",
    75: "k",
    76: "l",
    77: "m",
    78: "n",
    79: "o",
    80: "p",
    81: "q",
    82: "r",
    83: "s",
    84: "t",
    85: "u",
    86: "v",
    87: "w",
    88: "x",
    89: "y",
    90: "z",
    91: "cmd",
    92: "cmd",
    93: "cmd",
    96: "num_0",
    97: "num_1",
    98: "num_2",
    99: "num_3",
    100: "num_4",
    101: "num_5",
    102: "num_6",
    103: "num_7",
    104: "num_8",
    105: "num_9",
    106: "num_multiply",
    107: "num_add",
    108: "num_enter",
    109: "num_subtract",
    110: "num_decimal",
    111: "num_divide",
    112: "f1",
    113: "f2",
    114: "f3",
    115: "f4",
    116: "f5",
    117: "f6",
    118: "f7",
    119: "f8",
    120: "f9",
    121: "f10",
    122: "f11",
    123: "f12",
    124: "print",
    144: "num",
    145: "scroll",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "\'",
    223: "`",
    224: "cmd",
    225: "alt",
    57392: "ctrl",
    63289: "num",
    59: ";",
    61: "-",
    173: "="
};


},
function(require, exports, module, global) {

var createPool = require(110);


var TouchEventPrototype,
    TouchPrototype;


module.exports = TouchEvent;


function TouchEvent(e) {
    var target = e.target;

    this.type = e.type;
    this.touches = getTouches(this.touches, e.touches, target);
    this.targetTouches = getTouches(this.targetTouches, e.targetTouches, target);
    this.changedTouches = getTouches(this.changedTouches, e.changedTouches, target);
}
createPool(TouchEvent);
TouchEventPrototype = TouchEvent.prototype;

TouchEvent.create = function(e) {
    return TouchEvent.getPooled(e);
};

TouchEventPrototype.destroy = function() {
    TouchEvent.release(this);
};

TouchEventPrototype.destructor = function() {
    this.type = null;
    destroyTouches(this.touches);
    destroyTouches(this.targetTouches);
    destroyTouches(this.changedTouches);
};

function getTouches(touches, nativeTouches, target) {
    var length = nativeTouches.length,
        i = -1,
        il = length - 1,
        touch, nativeTouch;

    touches = touches || [];

    while (i++ < il) {
        nativeTouch = nativeTouches[i];
        touch = Touch.create(nativeTouch, target);
        touches[i] = touch;
    }

    return touches;
}

function destroyTouches(touches) {
    var i = -1,
        il = touches.length - 1;

    while (i++ < il) {
        touches[i].destroy();
    }

    touches.length = 0;
}

function Touch(nativeTouch, target) {
    this.identifier = nativeTouch.identifier;
    this.x = getTouchX(nativeTouch, target);
    this.y = getTouchY(nativeTouch, target);
    this.radiusX = getRadiusX(nativeTouch);
    this.radiusY = getRadiusY(nativeTouch);
    this.rotationAngle = getRotationAngle(nativeTouch);
    this.force = getForce(nativeTouch);
}
createPool(Touch);
TouchPrototype = Touch.prototype;

Touch.create = function(nativeTouch, target) {
    return Touch.getPooled(nativeTouch, target);
};

TouchPrototype.destroy = function() {
    Touch.release(this);
};

TouchPrototype.destructor = function() {
    this.identifier = null;
    this.x = null;
    this.y = null;
    this.radiusX = null;
    this.radiusY = null;
    this.rotationAngle = null;
    this.force = null;
};

function getTouchX(touch, target) {
    return touch.clientX - ((target.offsetLeft || 0) - (window.pageXOffset || 0));
}

function getTouchY(touch, target) {
    return touch.clientY - ((target.offsetTop || 0) - (window.pageYOffset || 0));
}

function getRadiusX(nativeTouch) {
    return (
        nativeTouch.radiusX != null ? nativeTouch.radiusX :
        nativeTouch.webkitRadiusX != null ? nativeTouch.webkitRadiusX :
        nativeTouch.mozRadiusX != null ? nativeTouch.mozRadiusX :
        nativeTouch.msRadiusX != null ? nativeTouch.msRadiusX :
        nativeTouch.oRadiusX != null ? nativeTouch.oRadiusX :
        0
    );
}

function getRadiusY(nativeTouch) {
    return (
        nativeTouch.radiusY != null ? nativeTouch.radiusY :
        nativeTouch.webkitRadiusY != null ? nativeTouch.webkitRadiusY :
        nativeTouch.mozRadiusY != null ? nativeTouch.mozRadiusY :
        nativeTouch.msRadiusY != null ? nativeTouch.msRadiusY :
        nativeTouch.oRadiusY != null ? nativeTouch.oRadiusY :
        0
    );
}

function getRotationAngle(nativeTouch) {
    return (
        nativeTouch.rotationAngle != null ? nativeTouch.rotationAngle :
        nativeTouch.webkitRotationAngle != null ? nativeTouch.webkitRotationAngle :
        nativeTouch.mozRotationAngle != null ? nativeTouch.mozRotationAngle :
        nativeTouch.msRotationAngle != null ? nativeTouch.msRotationAngle :
        nativeTouch.oRotationAngle != null ? nativeTouch.oRotationAngle :
        0
    );
}

function getForce(nativeTouch) {
    return (
        nativeTouch.force != null ? nativeTouch.force :
        nativeTouch.webkitForce != null ? nativeTouch.webkitForce :
        nativeTouch.mozForce != null ? nativeTouch.mozForce :
        nativeTouch.msForce != null ? nativeTouch.msForce :
        nativeTouch.oForce != null ? nativeTouch.oForce :
        1
    );
}


},
function(require, exports, module, global) {

var createPool = require(110);


var DeviceMotionEventPrototype;


module.exports = DeviceMotionEvent;


function DeviceMotionEvent(e) {
    this.type = e.type;
    this.accelerationIncludingGravity = e.accelerationIncludingGravity;
}
createPool(DeviceMotionEvent);
DeviceMotionEventPrototype = DeviceMotionEvent.prototype;

DeviceMotionEvent.create = function(e) {
    return DeviceMotionEvent.getPooled(e);
};

DeviceMotionEventPrototype.destroy = function() {
    DeviceMotionEvent.release(this);
};

DeviceMotionEventPrototype.destructor = function() {
    this.type = null;
    this.accelerationIncludingGravity = null;
};


},
function(require, exports, module, global) {

var vec2 = require(68);


var MousePrototype;


module.exports = Mouse;


function Mouse() {
    this.position = vec2.create();
    this.delta = vec2.create();
    this.wheel = null;
    this.__first = null;
}
MousePrototype = Mouse.prototype;

Mouse.create = function() {
    return (new Mouse()).construct();
};

MousePrototype.construct = function() {

    this.wheel = 0;
    this.__first = false;

    return this;
};

MousePrototype.destructor = function() {

    vec2.set(this.position, 0, 0);
    vec2.set(this.delta, 0, 0);
    this.wheel = null;
    this.__first = null;

    return this;
};

MousePrototype.update = function(x, y) {
    var first = this.__first,
        position = this.position,
        delta = this.delta,

        lastX = first ? position[0] : x,
        lastY = first ? position[1] : y;

    position[0] = x;
    position[1] = y;

    delta[0] = x - lastX;
    delta[1] = y - lastY;

    this.__first = true;
};

MousePrototype.toJSON = function(json) {

    json = json || {};

    json.position = vec2.copy(json.position || [], this.position);
    json.delta = vec2.copy(json.delta || [], this.delta);
    json.wheel = this.wheel;

    return json;
};

MousePrototype.fromJSON = function(json) {

    vec2.copy(this.position, json.position);
    vec2.copy(this.delta, json.delta);
    this.wheel = json.wheel;

    return this;
};


},
function(require, exports, module, global) {

var Button = require(118);


var ButtonsPrototype;


module.exports = Buttons;


function Buttons() {
    this.__array = [];
    this.__hash = {};
}
ButtonsPrototype = Buttons.prototype;

Buttons.create = function() {
    return (new Buttons()).construct();
};

ButtonsPrototype.construct = function() {

    Buttons_add(this, "mouse0");
    Buttons_add(this, "mouse1");
    Buttons_add(this, "mouse2");

    return this;
};

ButtonsPrototype.destructor = function() {
    var array = this.__array,
        hash = this.__hash,
        i = -1,
        il = array.length - 1,
        button;

    while (i++ < il) {
        button = array[i];
        button.destructor();
        array.splice(i, 1);
        delete hash[button.name];
    }

    return this;
};

ButtonsPrototype.on = function(name, time, frame) {
    return (this.__hash[name] || Buttons_add(this, name)).on(time, frame);
};

ButtonsPrototype.off = function(name, time, frame) {
    return (this.__hash[name] || Buttons_add(this, name)).off(time, frame);
};

ButtonsPrototype.allOff = function(time, frame) {
    var array = this.__array,
        i = -1,
        il = array.length - 1;

    while (i++ < il) {
        array[i].off(time, frame);
    }

    return this;
};

function Buttons_add(_this, name) {
    var button = Button.create(name),
        array = _this.__array;

    array[array.length] = button;
    _this.__hash[name] = button;

    return button;
}

ButtonsPrototype.toJSON = function(json) {

    json = json || {};

    json.array = eachToJSON(this.__array, json.array || []);

    return json;
};

function eachToJSON(array, out) {
    var i = -1,
        il = array.length - 1;

    while (i++ < il) {
        out[i] = array[i].toJSON(out[i]);
    }

    return out;
}

ButtonsPrototype.fromJSON = function(json) {
    var jsonArray = json.array,
        i = -1,
        il = jsonArray.length - 1,
        array = this.__array,
        hash = this.__hash = {},
        button;

    array.length = 0;

    while (i++ < il) {
        button = new Button();
        button.fromJSON(jsonArray[i]);

        array[array.length] = button;
        hash[button.name] = button;
    }

    return this;
};


},
function(require, exports, module, global) {

var ButtonPrototype;


module.exports = Button;


function Button() {
    this.name = null;

    this.timeDown = null;
    this.timeUp = null;

    this.frameDown = null;
    this.frameUp = null;

    this.value = null;
    this.__first = null;
}
ButtonPrototype = Button.prototype;

Button.create = function(name) {
    return (new Button()).construct(name);
};

ButtonPrototype.construct = function(name) {

    this.name = name;

    this.timeDown = -1;
    this.timeUp = -1;

    this.frameDown = -1;
    this.frameUp = -1;

    this.value = false;
    this.__first = true;

    return this;
};

ButtonPrototype.destructor = function() {

    this.name = null;

    this.timeDown = null;
    this.timeUp = null;

    this.frameDown = null;
    this.frameUp = null;

    this.value = null;
    this.__first = null;

    return this;
};

ButtonPrototype.on = function(time, frame) {

    if (this.__first) {
        this.frameDown = frame;
        this.timeDown = time;
        this.__first = false;
    }

    this.value = true;

    return this;
};

ButtonPrototype.off = function(time, frame) {

    this.frameUp = frame;
    this.timeUp = time;
    this.value = false;
    this.__first = true;

    return this;
};

ButtonPrototype.toJSON = function(json) {

    json = json || {};

    json.name = this.name;

    json.timeDown = this.timeDown;
    json.timeUp = this.timeUp;

    json.frameDown = this.frameDown;
    json.frameUp = this.frameUp;

    json.value = this.value;

    return json;
};

ButtonPrototype.fromJSON = function(json) {

    this.name = json.name;

    this.timeDown = json.timeDown;
    this.timeUp = json.timeUp;

    this.frameDown = json.frameDown;
    this.frameUp = json.frameUp;

    this.value = json.value;
    this.__first = true;

    return this;
};


},
function(require, exports, module, global) {

var indexOf = require(61),
    Touch = require(120);


var TouchesPrototype;


module.exports = Touches;


function Touches() {
    this.__array = [];
}
TouchesPrototype = Touches.prototype;

Touches.create = function() {
    return (new Touches()).construct();
};

TouchesPrototype.construct = function() {
    return this;
};

TouchesPrototype.destructor = function() {
    this.__array.length = 0;
    return this;
};

function findTouch(array, id) {
    var i = -1,
        il = array.length - 1,
        touch;

    while (i++ < il) {
        touch = array[i];

        if (touch.id === id) {
            return touch;
        }
    }

    return null;
}

TouchesPrototype.__start = function(targetTouch) {
    var array = this.__array,
        oldTouch = findTouch(array, targetTouch.identifier),
        touch;

    if (oldTouch === null) {
        touch = Touch.create(targetTouch);
        array[array.length] = touch;
        return touch;
    } else {
        return oldTouch;
    }
};

TouchesPrototype.__end = function(changedTouch) {
    var array = this.__array,
        touch = findTouch(array, changedTouch.identifier);

    if (touch !== null) {
        array.splice(indexOf(array, touch), 1);
    }

    return touch;
};

TouchesPrototype.__move = function(changedTouch) {
    var touch = findTouch(this.__array, changedTouch.identifier);

    if (touch !== null) {
        touch.update(changedTouch);
    }

    return touch;
};

TouchesPrototype.get = function(index) {
    return this.__array[index];
};

TouchesPrototype.allOff = function() {
    var array = this.__array,
        i = -1,
        il = array.length - 1;

    while (i++ < il) {
        array[i].destroy();
    }
    array.length = 0;
};

TouchesPrototype.toJSON = function(json) {

    json = json || {};

    json.array = eachToJSON(this.__array, json.array || []);

    return json;
};

function eachToJSON(array, out) {
    var i = -1,
        il = array.length - 1;

    while (i++ < il) {
        out[i] = array[i].toJSON(out[i]);
    }

    return out;
}

TouchesPrototype.fromJSON = function(json) {
    var jsonArray = json.array,
        i = -1,
        il = jsonArray.length - 1,
        array = this.__array,
        hash = this.__hash = {},
        button;

    array.length = 0;

    while (i++ < il) {
        button = Touch.create();
        button.fromJSON(jsonArray[i]);

        array[array.length] = button;
        hash[button.name] = button;
    }

    return this;
};


},
function(require, exports, module, global) {

var vec2 = require(68),
    createPool = require(110);


var TouchPrototype;


module.exports = Touch;


function Touch() {

    this.id = null;
    this.index = null;

    this.radiusX = null;
    this.radiusY = null;
    this.rotationAngle = null;
    this.force = null;

    this.delta = vec2.create();
    this.position = vec2.create();
}
createPool(Touch);
TouchPrototype = Touch.prototype;

Touch.create = function(e) {
    return (Touch.getPooled()).construct(e);
};

TouchPrototype.destroy = function() {
    return Touch.release(this);
};

TouchPrototype.construct = function(e) {

    this.id = e.identifier;

    vec2.set(this.delta, 0, 0);
    vec2.set(this.position, e.x, e.y);

    this.radiusX = e.radiusX;
    this.radiusY = e.radiusY;
    this.rotationAngle = e.rotationAngle;
    this.force = e.force;

    return this;
};

TouchPrototype.destructor = function() {

    this.id = null;

    this.radiusX = null;
    this.radiusY = null;
    this.rotationAngle = null;
    this.force = null;

    vec2.set(this.delta, 0, 0);
    vec2.set(this.position, 0, 0);

    return this;
};

TouchPrototype.update = function(e) {
    var position = this.position,
        delta = this.delta,

        x = e.x,
        y = e.y,

        lastX = position[0],
        lastY = position[1];

    position[0] = x;
    position[1] = y;

    delta[0] = x - lastX;
    delta[1] = y - lastY;

    this.radiusX = e.radiusX;
    this.radiusY = e.radiusY;
    this.rotationAngle = e.rotationAngle;
    this.force = e.force;

    return this;
};

TouchPrototype.toJSON = function(json) {
    json = json || {};

    json.id = this.id;

    json.radiusX = this.radiusX;
    json.radiusY = this.radiusY;
    json.rotationAngle = this.rotationAngle;
    json.force = this.force;

    json.delta = vec2.copy(json.delta || [], this.delta);
    json.position = vec2.copy(json.position || [], this.position);

    return json;
};

TouchPrototype.fromJSON = function(json) {

    this.id = json.id;

    this.radiusX = json.radiusX;
    this.radiusY = json.radiusY;
    this.rotationAngle = json.rotationAngle;
    this.force = json.force;

    vec2.copy(this.delta, json.delta);
    vec2.copy(this.position, json.position);

    return this;
};


},
function(require, exports, module, global) {

var Axis = require(122);


var AxesPrototype;


module.exports = Axes;


function Axes() {
    this.__array = [];
    this.__hash = {};
}
AxesPrototype = Axes.prototype;

Axes.create = function() {
    return (new Axes()).construct();
};

AxesPrototype.construct = function() {

    this.add({
        name: "horizontal",
        posButton: "right",
        negButton: "left",
        altPosButton: "d",
        altNegButton: "a",
        type: Axis.ButtonType
    });

    this.add({
        name: "vertical",
        posButton: "up",
        negButton: "down",
        altPosButton: "w",
        altNegButton: "s",
        type: Axis.ButtonType
    });

    this.add({
        name: "fire",
        posButton: "ctrl",
        negButton: "",
        altPosButton: "mouse0",
        altNegButton: "",
        type: Axis.ButtonType
    });

    this.add({
        name: "jump",
        posButton: "space",
        negButton: "",
        altPosButton: "mouse2",
        altNegButton: "",
        type: Axis.ButtonType
    });

    this.add({
        name: "mouseX",
        type: Axis.MouseType,
        axis: 0
    });

    this.add({
        name: "mouseY",
        type: Axis.MouseType,
        axis: 1
    });

    this.add({
        name: "touchX",
        type: Axis.TouchType,
        axis: 0
    });

    this.add({
        name: "touchY",
        type: Axis.TouchType,
        axis: 1
    });

    this.add({
        name: "mouseWheel",
        type: Axis.WheelType
    });

    return this;
};

AxesPrototype.destructor = function() {
    var array = this.__array,
        hash = this.__hash,
        i = -1,
        il = array.length - 1,
        axis;

    while (i++ < il) {
        axis = array[i];
        axis.destructor();
        array.splice(i, 1);
        delete hash[axis.name];
    }

    return this;
};

AxesPrototype.add = function(options) {
    var hash = this.__hash,
        array = this.__array,
        instance;

    options = options || {};

    if (hash[name]) {
        throw new Error(
            'Axes add(): Axes already have Axis named ' + name + ' use Axes.get("' + name + '") and edit it instead'
        );
    }

    instance = Axis.create(
        options.name,
        options.negButton, options.posButton,
        options.altNegButton, options.altPosButton,
        options.gravity, options.sensitivity, options.dead, options.type, options.axis, options.index, options.joyNum
    );

    array[array.length] = instance;
    hash[instance.name] = instance;

    return instance;
};

AxesPrototype.get = function(name) {
    return this.__hash[name];
};

AxesPrototype.update = function(input, dt) {
    var array = this.__array,
        i = -1,
        il = array.length - 1;

    while (i++ < il) {
        array[i].update(input, dt);
    }

    return this;
};

AxesPrototype.toJSON = function(json) {

    json = json || {};

    json.array = eachToJSON(this.__array, json.array || []);

    return json;
};

function eachToJSON(array, out) {
    var i = -1,
        il = array.length - 1;

    while (i++ < il) {
        out[i] = array[i].toJSON(out[i]);
    }

    return out;
}

AxesPrototype.fromJSON = function(json) {
    var jsonArray = json.array,
        i = -1,
        il = jsonArray.length - 1,
        array = this.__array,
        hash = this.__hash = {},
        axis;

    array.length = 0;

    while (i++ < il) {
        axis = new Axis();
        axis.fromJSON(jsonArray[i]);

        array[array.length] = axis;
        hash[axis.name] = axis;
    }

    return this;
};


},
function(require, exports, module, global) {

var mathf = require(31);


var AxisPrototype;


module.exports = Axis;


function Axis() {
    this.name = null;

    this.negButton = null;
    this.posButton = null;

    this.altNegButton = null;
    this.altPosButton = null;

    this.gravity = null;
    this.sensitivity = null;

    this.dead = null;

    this.type = null;
    this.axis = null;
    this.index = null;

    this.joyNum = null;

    this.value = null;
}
AxisPrototype = Axis.prototype;

Axis.ButtonType = 1;
Axis.MouseType = 2;
Axis.TouchType = 3;
Axis.WheelType = 4;
Axis.JoystickType = 5;

Axis.create = function(
    name,
    negButton, posButton,
    altNegButton, altPosButton,
    gravity, sensitivity, dead, type, axis, index, joyNum
) {
    return (new Axis()).construct(
        name,
        negButton, posButton,
        altNegButton, altPosButton,
        gravity, sensitivity, dead, type, axis, index, joyNum
    );
};

AxisPrototype.construct = function(
    name,
    negButton, posButton,
    altNegButton, altPosButton,
    gravity, sensitivity, dead, type, axis, index, joyNum
) {

    this.name = name != null ? name : "unknown";

    this.negButton = negButton != null ? negButton : "";
    this.posButton = posButton != null ? posButton : "";

    this.altNegButton = altNegButton != null ? altNegButton : "";
    this.altPosButton = altPosButton != null ? altPosButton : "";

    this.gravity = gravity != null ? gravity : 3;
    this.sensitivity = sensitivity != null ? sensitivity : 3;

    this.dead = dead != null ? dead : 0.001;

    this.type = type != null ? type : Axis.ButtonType;
    this.axis = axis != null ? axis : "x";
    this.index = index != null ? index : 0;

    this.joyNum = joyNum != null ? joyNum : 0;

    this.value = 0;

    return this;
};

AxisPrototype.destructor = function() {

    this.name = null;

    this.negButton = null;
    this.posButton = null;

    this.altNegButton = null;
    this.altPosButton = null;

    this.gravity = null;
    this.sensitivity = null;

    this.dead = null;

    this.type = null;
    this.axis = null;
    this.index = null;

    this.joyNum = null;

    this.value = null;

    return this;
};

AxisPrototype.update = function(input, dt) {
    var value = this.value,
        type = this.type,
        sensitivity = this.sensitivity,
        buttons, button, altButton, neg, pos, touch, tmp;

    if (type === Axis.ButtonType) {
        buttons = input.buttons.__hash;

        button = buttons[this.negButton];
        altButton = buttons[this.altNegButton];
        neg = button && button.value || altButton && altButton.value;

        button = buttons[this.posButton];
        altButton = buttons[this.altPosButton];
        pos = button && button.value || altButton && altButton.value;

    } else if (type === Axis.MouseType) {
        this.value = input.mouse.delta[this.axis];
        return this;
    } else if (type === Axis.TouchType) {
        touch = input.touches.__array[this.index];

        if (touch) {
            this.value = touch.delta[this.axis];
        } else {
            return this;
        }
    } else if (type === Axis.WheelType) {
        value += input.mouse.wheel;
    } else if (type === Axis.JoystickType) {
        return this;
    }

    if (neg) {
        value -= sensitivity * dt;
    }
    if (pos) {
        value += sensitivity * dt;
    }

    if (!pos && !neg && value !== 0) {
        tmp = mathf.abs(value);
        value -= mathf.clamp(mathf.sign(value) * this.gravity * dt, -tmp, tmp);
    }

    value = mathf.clamp(value, -1, 1);
    if (mathf.abs(value) <= this.dead) {
        value = 0;
    }

    this.value = value;

    return this;
};

AxisPrototype.fromJSON = function(json) {
    this.name = json.name;

    this.negButton = json.negButton;
    this.posButton = json.posButton;

    this.altNegButton = json.altNegButton;
    this.altPosButton = json.altPosButton;

    this.gravity = json.gravity;
    this.sensitivity = json.sensitivity;

    this.dead = json.dead;

    this.type = json.type;
    this.axis = json.axis;
    this.index = json.index;

    this.joyNum = json.joyNum;

    this.value = json.value;

    return this;
};

AxisPrototype.toJSON = function(json) {

    json = json || {};

    json.name = this.name;

    json.negButton = this.negButton;
    json.posButton = this.posButton;

    json.altNegButton = this.altNegButton;
    json.altPosButton = this.altPosButton;

    json.gravity = this.gravity;
    json.sensitivity = this.sensitivity;

    json.dead = this.dead;

    json.type = this.type;
    json.axis = this.axis;
    json.index = this.index;

    json.joyNum = this.joyNum;

    json.value = this.value;

    return json;
};


},
function(require, exports, module, global) {

var mathf = require(31);


var eventHandlers = exports,
    mouseButtons = [
        "mouse0",
        "mouse1",
        "mouse2"
    ];


eventHandlers.keyup = function(input, e, time, frame) {
    var key = e.key,
        button = input.buttons.off(key, time, frame);

    input.emit("keyup", e, button);
};

eventHandlers.keydown = function(input, e, time, frame) {
    var key = e.key,
        button = input.buttons.on(key, time, frame);

    input.emit("keydown", e, button);
};


eventHandlers.mousemove = function(input, e) {
    input.mouse.update(e.x, e.y);
    input.emit("mousemove", e, input.mouse);
};

eventHandlers.mousedown = function(input, e, time, frame) {
    var button = input.buttons.on(mouseButtons[e.button], time, frame);

    input.emit("mousedown", e, button, input.mouse);
};

eventHandlers.mouseup = function(input, e, time, frame) {
    var button = input.buttons.off(mouseButtons[e.button], time, frame);

    input.emit("mouseup", e, button, input.mouse);
};

eventHandlers.mouseout = function(input, e, time, frame) {

    input.mouse.update(e.x, e.y);
    input.buttons.allOff(time, frame);

    input.emit("mouseout", e, input.mouse);
};

eventHandlers.wheel = function(input, e) {
    var value = mathf.sign(e.deltaY);

    input.mouse.wheel = value;
    input.emit("wheel", e, value, input.mouse);
};


eventHandlers.touchstart = function(input, e) {
    var touches = input.touches,
        targetTouches = e.targetTouches,
        i = -1,
        il = targetTouches.length - 1,
        touch;

    while (i++ < il) {
        touch = touches.__start(targetTouches[i]);

        if (touch) {
            input.emit("touchstart", e, touch, touches);
        }
    }
};

eventHandlers.touchend = function(input, e) {
    var touches = input.touches,
        changedTouches = e.changedTouches,
        i = -1,
        il = changedTouches.length - 1,
        touch;

    while (i++ < il) {
        touch = touches.__end(changedTouches[i]);

        if (touch) {
            input.emit("touchend", e, touch, touches);
            touch.destroy();
        }
    }
};

eventHandlers.touchmove = function(input, e) {
    var touches = input.touches,
        changedTouches = e.changedTouches,
        i = -1,
        il = changedTouches.length - 1,
        touch;

    while (i++ < il) {
        touch = touches.__move(changedTouches[i]);

        if (touch) {
            input.emit("touchmove", e, touch, touches);
        }
    }
};

eventHandlers.touchcancel = function(input, e) {
    input.emit("touchcancel", e);
    input.touches.allOff();
};

eventHandlers.devicemotion = function(input, e) {
    var acc = e.accelerationIncludingGravity,
        acceleration;

    if (acc && (acc.x || acc.y || acc.z)) {
        acceleration = input.acceleration;

        acceleration.x = acc.x;
        acceleration.y = acc.y;
        acceleration.z = acc.z;

        input.emit("acceleration", e, acceleration);
    }
};


},
function(require, exports, module, global) {

var time = require(27);


var TimePrototype;


module.exports = Time;


function Time() {
    var _this = this,
        START = time.now() * 0.001,
        scale = 1,

        globalFixed = 1 / 60,
        fixedDelta = 1 / 60,

        frameCount = 0,
        last = -1 / 60,
        current = 0,
        delta = 1 / 60,
        fpsFrame = 0,
        fpsLast = 0,

        MIN_DELTA = 0.000001,
        MAX_DELTA = 1;

    this.time = 0;
    this.fps = 60;
    this.delta = 1 / 60;
    this.frameCount = 0;

    this.start = function() {
        return START;
    };

    this.update = function() {
        _this.frameCount = frameCount++;

        last = _this.time;
        current = _this.now() - START;

        fpsFrame++;
        if (fpsLast + 1 < current) {
            _this.fps = fpsFrame / (current - fpsLast);

            fpsLast = current;
            fpsFrame = 0;
        }

        delta = (current - last) * _this.scale;
        _this.delta = delta < MIN_DELTA ? MIN_DELTA : delta > MAX_DELTA ? MAX_DELTA : delta;

        _this.time = current;
    };

    this.setStartTime = function(value) {
        START = value;
    };

    this.setFrame = function(value) {
        frameCount = value;
    };

    this.scale = scale;
    this.setScale = function(value) {
        _this.scale = value;
        _this.fixedDelta = globalFixed * value;
    };

    this.fixedDelta = fixedDelta;
    this.setFixedDelta = function(value) {
        globalFixed = value;
        _this.fixedDelta = globalFixed * scale;
    };

    this.construct = function() {
        START = time.now() * 0.001;
        frameCount = 0;

        _this.time = 0;
        _this.fps = 60;
        _this.delta = 1 / 60;
        _this.frameCount = frameCount;

        _this.setScale(1);
        _this.setFixedDelta(1 / 60);
    };

    this.toJSON = function(json) {

        json = json || {};

        json.start = _this.start();
        json.frameCount = _this.frameCount;
        json.scale = _this.scale;
        json.fixedDelta = _this.fixedDelta;

        return json;
    };

    this.fromJSON = function(json) {

        json = json || {};

        _this.setStartTime(json.start);
        _this.setFrame(json.frameCount);
        _this.setScale(json.scale);
        _this.setFixedDelta(json.fixedDelta);

        return _this;
    };
}
TimePrototype = Time.prototype;

Time.create = function() {
    return new Time();
};

TimePrototype.now = function() {
    return time.now() * 0.001;
};

TimePrototype.stamp = function() {
    return time.stamp() * 0.001;
};

TimePrototype.stampMS = function() {
    return time.stamp();
};


},
function(require, exports, module, global) {

var indexOf = require(61),
    Class = require(2);


var ClassPrototype = Class.prototype,
    EntityPrototype;


module.exports = Entity;


function Entity() {

    Class.call(this);

    this.name = null;

    this.__componentArray = [];
    this.components = {};

    this.depth = null;
    this.scene = null;
    this.root = null;
    this.parent = null;
    this.children = [];
}
Class.extend(Entity, "odin.Entity");
EntityPrototype = Entity.prototype;

EntityPrototype.construct = function(name) {

    ClassPrototype.construct.call(this);

    this.name = name || this.__id;

    this.depth = 0;
    this.root = this;

    return this;
};

EntityPrototype.destructor = function() {
    var components = this.__componentArray,
        i = -1,
        il = components.length - 1;

    ClassPrototype.destructor.call(this);

    while (i++ < il) {
        components[i].destroy(false).destructor();
    }

    this.name = null;

    this.depth = null;
    this.scene = null;
    this.root = null;
    this.parent = null;
    this.children.length = 0;

    return this;
};

EntityPrototype.destroy = function(emitEvent) {
    var scene = this.scene;

    if (scene) {
        if (emitEvent !== false) {
            this.emit("destroy");
        }
        scene.remove(this);
    }

    return this;
};

EntityPrototype.hasComponent = function(name) {
    return !!this.components[name];
};

EntityPrototype.getComponent = function(name) {
    return this.components[name];
};

EntityPrototype.addComponent = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Entity_addComponent(this, arguments[i]);
    }

    return this;
};

function Entity_addComponent(_this, component) {
    var className = component.className,
        componentHash = _this.components,
        components = _this.__componentArray,
        scene = _this.scene;

    if (!componentHash[className]) {
        component.entity = _this;

        components[components.length] = component;
        componentHash[className] = component;

        if (scene) {
            scene.__addComponent(component);
        }

        component.init();
    } else {
        throw new Error(
            "Entity addComponent(...components) trying to add " +
            "components that is already a member of Entity"
        );
    }
}

EntityPrototype.removeComponent = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Entity_removeComponent(this, arguments[i]);
    }
    return this;
};

function Entity_removeComponent(_this, component) {
    var className = component.className,
        componentHash = _this.components,
        components = _this.__componentArray,
        index = components.indexOf(components, component),
        scene = _this.scene;

    if (index === -1) {
        if (scene) {
            scene.__removeComponent(component);
        }

        component.entity = null;

        components.splice(index, 1);
        delete componentHash[className];
    } else {
        throw new Error(
            "Entity removeComponent(...components) trying to remove " +
            "component that is already not a member of Entity"
        );
    }
}

EntityPrototype.addChild = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Entity_addChild(this, arguments[i]);
    }
    return this;
};

function Entity_addChild(_this, entity) {
    var children = _this.children,
        index = indexOf(children, entity),
        root = _this,
        depth = 0,
        scene = _this.scene;

    if (index === -1) {
        if (entity.parent) {
            entity.parent.removeChild(entity);
        }

        children[children.length] = entity;

        entity.parent = _this;

        while (root.parent) {
            root = root.parent;
            depth++;
        }
        _this.root = root;
        entity.root = root;

        updateDepth(_this, depth);

        _this.emit("addChild", entity);

        if (scene && entity.scene !== scene) {
            scene.addEntity(entity);
        }
    } else {
        throw new Error(
            "Entity add(...entities) trying to add object " +
            "that is already a member of Entity"
        );
    }
}

EntityPrototype.removeChild = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Entity_removeChild(this, arguments[i]);
    }
    return this;
};

function Entity_removeChild(_this, entity) {
    var children = _this.children,
        index = indexOf(children, entity),
        scene = _this.scene;

    if (index !== -1) {
        _this.emit("removeChild", entity);

        children.splice(index, 1);

        entity.parent = null;
        entity.root = entity;

        updateDepth(entity, 0);

        if (scene && entity.scene === scene) {
            scene.remove(entity);
        }
    } else {
        throw new Error(
            "Entity removeChild(...entities) trying to remove " +
            "object that is not a member of Entity"
        );
    }
}

function updateDepth(child, depth) {
    var children = child.children,
        i = -1,
        il = children.length - 1;

    child.depth = depth;

    while (i++ < il) {
        updateDepth(children[i], depth + 1);
    }
}

EntityPrototype.toJSON = function(json) {
    var components = this.__componentArray,
        children = this.children,
        i = -1,
        il = components.length - 1,
        jsonComponents, jsonChildren;

    json = ClassPrototype.toJSON.call(this, json);

    jsonComponents = json.components || (json.components = []);

    while (i++ < il) {
        jsonComponents[i] = components[i].toJSON(jsonComponents[i]);
    }

    i = -1;
    il = children.length - 1;

    jsonChildren = json.children || (json.children = []);

    while (i++ < il) {
        jsonChildren[i] = children[i].toJSON(jsonChildren[i]);
    }

    json.name = this.name;

    return json;
};

EntityPrototype.fromJSON = function(json) {
    var scene = this.scene,
        jsonComponents = json.components,
        jsonChildren = json.children,
        i = -1,
        il = jsonComponents.length - 1,
        component, entity;

    ClassPrototype.fromJSON.call(this, json);

    this.name = json.name;

    while (i++ < il) {
        json = jsonComponents[i];
        component = Class.newClass(json.className);
        component.entity = this;
        component.fromJSON(json);
        this.addComponent(component);
    }

    i = -1;
    il = jsonChildren.length - 1;

    while (i++ < il) {
        entity = new Entity();
        entity.generateNewId();
        entity.scene = scene;
        entity.fromJSON(jsonChildren[i]);
        this.addChild(entity);
    }

    return this;
};


},
function(require, exports, module, global) {

var isString = require(9),
    isNumber = require(33),
    Class = require(2),
    BaseApplication = require(99);


var BaseApplicationPrototype = BaseApplication.prototype,
    ApplicationPrototype;


module.exports = Application;


function Application() {
    BaseApplication.call(this);
}
BaseApplication.extend(Application, "odin.Application");
ApplicationPrototype = Application.prototype;

ApplicationPrototype.construct = function() {

    BaseApplicationPrototype.construct.call(this);

    return this;
};

ApplicationPrototype.destructor = function() {

    BaseApplicationPrototype.destructor.call(this);

    return this;
};

ApplicationPrototype.setElement = function(element) {

    this.__loop.setElement(element);

    return this;
};

ApplicationPrototype.createScene = function(scene) {
    var scenes = this.__scenes,
        sceneHash = this.__sceneHash,
        newScene;

    if (isString(scene)) {
        scene = sceneHash[scene];
    } else if (isNumber(scene)) {
        scene = scenes[scene];
    }

    if (sceneHash[scene.name]) {
        newScene = Class.createFromJSON(scene);

        newScene.application = this;
        newScene.init();

        this.emit("createScene", newScene);

        newScene.awake();

        return newScene;
    } else {
        throw new Error("Application.createScene(scene) Scene could not be found in Application");
    }

    return null;
};

ApplicationPrototype.init = function() {

    BaseApplicationPrototype.init.call(this);

    return this;
};

ApplicationPrototype.loop = function() {

    BaseApplicationPrototype.loop.call(this);

    return this;
};


},
function(require, exports, module, global) {

var Class = require(2);


var ClassPrototype = Class.prototype,
    AssetPrototype;


module.exports = Asset;


function Asset() {

    Class.call(this);

    this.name = null;
    this.src = null;
    this.data = null;
}
Class.extend(Asset, "odin.Asset");
AssetPrototype = Asset.prototype;

AssetPrototype.construct = function(name, src) {

    ClassPrototype.construct.call(this);

    this.name = name;
    this.src = src;

    return this;
};

AssetPrototype.destructor = function() {

    ClassPrototype.destructor.call(this);

    this.name = null;
    this.src = null;
    this.data = null;

    return this;
};

AssetPrototype.setSrc = function(src) {
    this.src = src;
    return this;
};

AssetPrototype.parse = function() {
    this.emit("parse");
    return this;
};

AssetPrototype.load = function(callback) {
    this.emit("load");
    callback();
    return this;
};


},
function(require, exports, module, global) {

var environment = require(25),
    eventListener = require(34),
    HttpError = require(129),
    Asset = require(127);


var AssetPrototype = Asset.prototype,
    ImageAssetPrototype;


module.exports = ImageAsset;


function ImageAsset() {

    Asset.call(this);

    this.__listenedTo = null;
}
Asset.extend(ImageAsset, "odin.ImageAsset");
ImageAssetPrototype = ImageAsset.prototype;

ImageAssetPrototype.construct = function(name, src) {

    AssetPrototype.construct.call(this, name, src);

    this.data = environment.browser ? new Image() : null;
    this.__listenedTo = false;

    return this;
};

ImageAssetPrototype.destructor = function() {

    AssetPrototype.destructor.call(this);

    this.__listenedTo = null;

    return this;
};

ImageAssetPrototype.setSrc = function(src) {

    AssetPrototype.setSrc.call(this, src);

    if (this.__listenedTo) {
        this.image.src = src;
    }

    return this;
};

ImageAssetPrototype.load = function(callback) {
    var _this = this,
        src = this.src,
        image = this.data;

    eventListener.on(image, "load", function() {
        _this.parse();
        _this.emit("load");
        callback();
    });

    eventListener.on(image, "error", function(e) {
        var err = new HttpError(e.status, src);

        _this.emit("error", err);
        callback(err);
    });

    image.src = src;
    this.__listenedTo = true;

    return this;
};


},
function(require, exports, module, global) {

var forEach = require(47),
    create = require(13),
    STATUS_CODES = require(130);


var STATUS_NAMES = {},
    STATUS_STRINGS = {};


forEach(STATUS_CODES, function(status, code) {
    var name;

    if (code < 400) {
        return;
    }

    name = status.replace(/\s+/g, "");

    if (!(/\w+Error$/.test(name))) {
        name += "Error";
    }

    STATUS_NAMES[code] = name;
    STATUS_STRINGS[code] = status;
});


function HttpError(code, message) {
    if (message instanceof Error) {
        message = message.message;
    }

    if (code instanceof Error) {
        message = code.message;
        code = 500;
    } else if (typeof(code) === "string") {
        message = code;
        code = 500;
    } else {
        code = code || 500;
    }

    Error.call(this);

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }

    this.name = STATUS_NAMES[code] || "UnknownHttpError";
    this.code = code;
    this.message = this.name + ": " + code + " " + (message || STATUS_STRINGS[code]);
}
HttpError.prototype = create(Error.prototype);
HttpError.prototype.constructor = HttpError;

HttpError.prototype.toString = function() {

    return this.message;
};

HttpError.prototype.toJSON = function(json) {
    json = json || {};

    json.name = this.name;
    json.code = this.code;
    json.message = this.message;

    return json;
};

HttpError.prototype.fromJSON = function(json) {

    this.name = json.name;
    this.code = json.code;
    this.message = json.message;

    return this;
};


module.exports = HttpError;


},
function(require, exports, module, global) {

module.exports = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Moved Temporarily",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Time-out",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-URI Too Large",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Unordered Collection",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Time-out",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    509: "Bandwidth Limit Exceeded",
    510: "Not Extended",
    511: "Network Authentication Required"
};


},
function(require, exports, module, global) {

var request = require(132),
    HttpError = require(129),
    Asset = require(127);


var JSONAssetPrototype;


module.exports = JSONAsset;


function JSONAsset() {
    Asset.call(this);
}
Asset.extend(JSONAsset, "odin.JSONAsset");
JSONAssetPrototype = JSONAsset.prototype;

JSONAssetPrototype.load = function(callback) {
    var _this = this,
        src = this.src;

    request.get(src, {
        requestHeaders: {
            "Content-Type": "application/json"
        },
        success: function(response) {
            _this.data = response.data;
            _this.parse();
            _this.emit("load");
            callback();
        },
        error: function(response) {
            var err = new HttpError(response.statusCode, src);

            _this.emit("error", err);
            callback(err);
        }
    });

    return this;
};


},
function(require, exports, module, global) {

module.exports = require(133)(require(136));


},
function(require, exports, module, global) {

module.exports = function createRequest(request) {
    var methods = require(134),
        forEach = require(47),
        EventEmitter = require(20),
        defaults = require(135);


    forEach(methods, function(method) {
        var upper = method.toUpperCase();

        request[method] = function(url, options) {
            options = options || {};

            options.url = url;
            options.method = upper;

            return request(options);
        };
    });
    request.mSearch = request["m-search"];

    forEach(["post", "patch", "put"], function(method) {
        var upper = method.toUpperCase();

        request[method] = function(url, data, options) {
            options = options || {};

            options.url = url;
            options.data = data;
            options.method = upper;

            return request(options);
        };
    });

    request.defaults = defaults.values;
    request.plugins = new EventEmitter(-1);

    return request;
};


},
function(require, exports, module, global) {

module.exports = [
    "checkout",
    "connect",
    "copy",
    "delete",
    "get",
    "head",
    "lock",
    "m-search",
    "merge",
    "mkactivity",
    "mkcol",
    "move",
    "notify",
    "options",
    "patch",
    "post",
    "propfind",
    "proppatch",
    "purge",
    "put",
    "report",
    "search",
    "subscribe",
    "trace",
    "unlock",
    "unsubscribe"
];


},
function(require, exports, module, global) {

var extend = require(16),
    isString = require(9),
    isFunction = require(5);


function defaults(options) {
    options = extend({}, defaults.values, options);

    options.url = isString(options.url || (options.url = options.src)) ? options.url : null;
    options.method = isString(options.method) ? options.method.toUpperCase() : "GET";

    options.data = options.data;

    options.transformRequest = isFunction(options.transformRequest) ? options.transformRequest : null;
    options.transformResponse = isFunction(options.transformResponse) ? options.transformResponse : null;

    options.withCredentials = options.withCredentials != null ? !!options.withCredentials : false;
    options.headers = extend({}, defaults.values.headers, options.headers);
    options.async = options.async != null ? !!options.async : true;

    options.success = isFunction(options.success) ? options.success : null;
    options.error = isFunction(options.error) ? options.error : null;
    options.isPromise = !isFunction(options.success) && !isFunction(options.error);

    options.user = isString(options.user) ? options.user : undefined;
    options.password = isString(options.password) ? options.password : undefined;

    return options;
}

defaults.values = {
    url: "",
    method: "GET",
    headers: {
        Accept: "*/*",
        "X-Requested-With": "XMLHttpRequest"
    }
};


module.exports = defaults;


},
function(require, exports, module, global) {

var PromisePolyfill = require(137),
    XMLHttpRequestPolyfill = require(139),
    isFunction = require(5),
    isString = require(9),
    forEach = require(47),
    trim = require(140),
    extend = require(16),
    Response = require(141),
    defaults = require(135),
    camelcaseHeader = require(142),
    parseContentType = require(145);


var supportsFormData = typeof(FormData) !== "undefined";


defaults.values.XMLHttpRequest = XMLHttpRequestPolyfill;


function parseResponseHeaders(responseHeaders) {
    var headers = {},
        raw = responseHeaders.split("\n");

    forEach(raw, function(header) {
        var tmp = header.split(":"),
            key = tmp[0],
            value = tmp[1];

        if (key && value) {
            key = camelcaseHeader(key);
            value = trim(value);

            if (key === "Content-Length") {
                value = +value;
            }

            headers[key] = value;
        }
    });

    return headers;
}


function addEventListener(xhr, event, listener) {
    if (isFunction(xhr.addEventListener)) {
        xhr.addEventListener(event, listener, false);
    } else if (isFunction(xhr.attachEvent)) {
        xhr.attachEvent("on" + event, listener);
    } else {
        xhr["on" + event] = listener;
    }
}

function request(options) {
    var xhr = new defaults.values.XMLHttpRequest(),
        plugins = request.plugins,
        canSetRequestHeader = isFunction(xhr.setRequestHeader),
        canOverrideMimeType = isFunction(xhr.overrideMimeType),
        isFormData, defer;

    options = defaults(options);

    plugins.emit("before", xhr, options);

    isFormData = (supportsFormData && options.data instanceof FormData);

    if (options.isPromise) {
        defer = PromisePolyfill.defer();
    }

    function onSuccess(response) {
        plugins.emit("response", response, xhr, options);
        plugins.emit("load", response, xhr, options);

        if (options.isPromise) {
            defer.resolve(response);
        } else {
            if (options.success) {
                options.success(response);
            }
        }
    }

    function onError(response) {
        plugins.emit("response", response, xhr, options);
        plugins.emit("error", response, xhr, options);

        if (options.isPromise) {
            defer.reject(response);
        } else {
            if (options.error) {
                options.error(response);
            }
        }
    }

    function onComplete() {
        var statusCode = +xhr.status,
            responseText = xhr.responseText,
            response = new Response();

        response.url = xhr.responseURL || options.url;
        response.method = options.method;

        response.statusCode = statusCode;

        response.responseHeaders = xhr.getAllResponseHeaders ? parseResponseHeaders(xhr.getAllResponseHeaders()) : {};
        response.requestHeaders = options.headers ? extend({}, options.headers) : {};

        response.data = null;

        if (responseText) {
            if (options.transformResponse) {
                response.data = options.transformResponse(responseText);
            } else {
                if (parseContentType(response.responseHeaders["Content-Type"]) === "application/json") {
                    try {
                        response.data = JSON.parse(responseText);
                    } catch (e) {
                        response.data = e;
                        onError(response);
                        return;
                    }
                } else if (responseText) {
                    response.data = responseText;
                }
            }
        }

        if ((statusCode > 199 && statusCode < 301) || statusCode === 304) {
            onSuccess(response);
        } else {
            onError(response);
        }
    }

    function onReadyStateChange() {
        switch (+xhr.readyState) {
            case 1:
                plugins.emit("request", xhr, options);
                break;
            case 4:
                onComplete();
                break;
        }
    }

    addEventListener(xhr, "readystatechange", onReadyStateChange);

    if (options.withCredentials && options.async) {
        xhr.withCredentials = options.withCredentials;
    }

    xhr.open(
        options.method,
        options.url,
        options.async,
        options.username,
        options.password
    );

    if (canSetRequestHeader) {
        forEach(options.headers, function(value, key) {
            if (isString(value)) {
                if (key === "Content-Type" && canOverrideMimeType) {
                    xhr.overrideMimeType(value);
                }
                xhr.setRequestHeader(key, value);
            }
        });
    }

    if (options.transformRequest) {
        options.data = options.transformRequest(options.data);
    } else {
        if (!isString(options.data) && !isFormData) {
            if (options.headers["Content-Type"] === "application/json") {
                options.data = JSON.stringify(options.data);
            } else {
                options.data = options.data + "";
            }
        }
    }

    xhr.send(options.data);

    return defer ? defer.promise : undefined;
}


module.exports = request;


},
function(require, exports, module, global) {

var process = require(28);
var isArray = require(58),
    isObject = require(11),
    isFunction = require(5),
    createStore = require(138),
    fastSlice = require(21);


var PromisePolyfill, PrivatePromise;


if (typeof(Promise) !== "undefined") {
    PromisePolyfill = Promise;
} else {
    PrivatePromise = (function() {

        function PrivatePromise(resolver) {
            var _this = this;

            this.handlers = [];
            this.state = null;
            this.value = null;

            handleResolve(
                resolver,
                function resolve(newValue) {
                    resolveValue(_this, newValue);
                },
                function reject(newValue) {
                    rejectValue(_this, newValue);
                }
            );
        }

        PrivatePromise.store = createStore();

        PrivatePromise.handle = function(_this, onFulfilled, onRejected, resolve, reject) {
            handle(_this, new Handler(onFulfilled, onRejected, resolve, reject));
        };

        function Handler(onFulfilled, onRejected, resolve, reject) {
            this.onFulfilled = isFunction(onFulfilled) ? onFulfilled : null;
            this.onRejected = isFunction(onRejected) ? onRejected : null;
            this.resolve = resolve;
            this.reject = reject;
        }

        function handleResolve(resolver, onFulfilled, onRejected) {
            var done = false;

            try {
                resolver(
                    function(value) {
                        if (done) {
                            return;
                        }
                        done = true;
                        onFulfilled(value);
                    },
                    function(reason) {
                        if (done) {
                            return;
                        }
                        done = true;
                        onRejected(reason);
                    }
                );
            } catch (err) {
                if (done) {
                    return;
                }
                done = true;
                onRejected(err);
            }
        }

        function resolveValue(_this, newValue) {
            try {
                if (newValue === _this) {
                    throw new TypeError("A promise cannot be resolved with itself");
                }

                if (newValue && (isObject(newValue) || isFunction(newValue))) {
                    if (isFunction(newValue.then)) {
                        handleResolve(
                            function resolver(resolve, reject) {
                                newValue.then(resolve, reject);
                            },
                            function resolve(newValue) {
                                resolveValue(_this, newValue);
                            },
                            function reject(newValue) {
                                rejectValue(_this, newValue);
                            }
                        );
                        return;
                    }
                }
                _this.state = true;
                _this.value = newValue;
                finale(_this);
            } catch (err) {
                rejectValue(_this, err);
            }
        }

        function rejectValue(_this, newValue) {
            _this.state = false;
            _this.value = newValue;
            finale(_this);
        }

        function finale(_this) {
            var handlers = _this.handlers,
                i = -1,
                il = handlers.length - 1;

            while (i++ < il) {
                handle(_this, handlers[i]);
            }

            handlers.length = 0;
        }

        function handle(_this, handler) {
            var state = _this.state;

            if (_this.state === null) {
                _this.handlers.push(handler);
                return;
            }

            process.nextTick(function nextTick() {
                var callback = state ? handler.onFulfilled : handler.onRejected,
                    value = _this.value,
                    out;

                if (callback === null) {
                    (state ? handler.resolve : handler.reject)(value);
                    return;
                }

                try {
                    out = callback(value);
                } catch (err) {
                    handler.reject(err);
                    return;
                }

                handler.resolve(out);
            });
        }

        return PrivatePromise;
    }());

    PromisePolyfill = function Promise(resolver) {

        if (!(this instanceof PromisePolyfill)) {
            throw new TypeError("Promise(resolver) \"this\" must be an instance of of Promise");
        }
        if (!isFunction(resolver)) {
            throw new TypeError("Promise(resolver) You must pass a resolver function as the first argument to the promise constructor");
        }

        PrivatePromise.store.set(this, new PrivatePromise(resolver));
    };

    PromisePolyfill.prototype.then = function(onFulfilled, onRejected) {
        var _this = PrivatePromise.store.get(this);

        return new PromisePolyfill(function resolver(resolve, reject) {
            PrivatePromise.handle(_this, onFulfilled, onRejected, resolve, reject);
        });
    };
}


if (!isFunction(PromisePolyfill.prototype["catch"])) {
    PromisePolyfill.prototype["catch"] = function(onRejected) {
        return this.then(null, onRejected);
    };
}

if (!isFunction(PromisePolyfill.resolve)) {
    PromisePolyfill.resolve = function(value) {
        if (value instanceof PromisePolyfill) {
            return value;
        }

        return new PromisePolyfill(function resolver(resolve) {
            resolve(value);
        });
    };
}

if (!isFunction(PromisePolyfill.reject)) {
    PromisePolyfill.reject = function(value) {
        return new PromisePolyfill(function resolver(resolve, reject) {
            reject(value);
        });
    };
}

if (!isFunction(PromisePolyfill.defer)) {
    PromisePolyfill.defer = function() {
        var deferred = {};

        deferred.promise = new PromisePolyfill(function resolver(resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });

        return deferred;
    };
}

if (!isFunction(PromisePolyfill.all)) {
    PromisePolyfill.all = function(value) {
        var args = (arguments.length === 1 && isArray(value)) ? value : fastSlice(arguments);

        return new PromisePolyfill(function resolver(resolve, reject) {
            var length = args.length,
                i = -1,
                il = length - 1;

            if (length === 0) {
                resolve([]);
                return;
            }

            function resolveValue(index, value) {
                try {
                    if (value && (isObject(value) || isFunction(value)) && isFunction(value.then)) {
                        value.then(function(v) {
                            resolveValue(index, v);
                        }, reject);
                        return;
                    }
                    if (--length === 0) {
                        resolve(args);
                    }
                } catch (e) {
                    reject(e);
                }
            }

            while (i++ < il) {
                resolveValue(i, args[i]);
            }
        });
    };
}

if (!isFunction(PromisePolyfill.race)) {
    PromisePolyfill.race = function(values) {
        return new PromisePolyfill(function resolver(resolve, reject) {
            var i = -1,
                il = values.length - 1,
                value;

            while (i++ < il) {
                value = values[i];

                if (value && (isObject(value) || isFunction(value)) && isFunction(value.then)) {
                    value.then(resolve, reject);
                }
            }
        });
    };
}


module.exports = PromisePolyfill;


},
function(require, exports, module, global) {

var has = require(3),
    defineProperty = require(19),
    isPrimitive = require(15);


var emptyObject = {};


module.exports = createStore;


function privateStore(key, privateKey) {
    var store = {
            identity: privateKey
        },
        valueOf = key.valueOf;

    defineProperty(key, "valueOf", {
        value: function(value) {
            return value !== privateKey ? valueOf.apply(this, arguments) : store;
        },
        writable: true
    });

    return store;
}

function createStore() {
    var privateKey = {};

    function get(key) {
        if (isPrimitive(key)) {
            throw new TypeError("Invalid value used as key");
        }

        return key.valueOf(privateKey) || emptyObject;
    }

    function set(key) {
        var store;

        if (isPrimitive(key)) {
            throw new TypeError("Invalid value used as key");
        }

        store = key.valueOf(privateKey);

        if (!store || store.identity !== privateKey) {
            store = privateStore(key, privateKey);
        }

        return store;
    }

    return {
        get: function(key) {
            return get(key).value;
        },
        set: function(key, value) {
            set(key).value = value;
        },
        has: function(key) {
            return has(get(key), "value");
        },
        remove: function(key) {
            var store = get(key);
            return store === emptyObject ? false : delete store.value;
        },
        clear: function() {
            privateKey = {};
        }
    };
}


},
function(require, exports, module, global) {

var extend = require(16),
    environment = require(25);


var window = environment.window,

    ActiveXObject = window.ActiveXObject,

    XMLHttpRequestPolyfill = (
        window.XMLHttpRequest ||
        (function getRequestObjectType(types) {
            var i = -1,
                il = types.length - 1,
                instance, createType;

            while (i++ < il) {
                try {
                    createType = types[i];
                    instance = createType();
                    break;
                } catch (e) {}
            }

            if (!createType) {
                throw new Error("XMLHttpRequest not supported by this browser");
            }

            return function XMLHttpRequest() {
                return createType();
            };
        }([
            function createActiveObject() {
                return new ActiveXObject("Msxml2.XMLHTTP");
            },
            function createActiveObject() {
                return new ActiveXObject("Msxml3.XMLHTTP");
            },
            function createActiveObject() {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
        ]))
    ),

    XMLHttpRequestPolyfillPrototype = XMLHttpRequestPolyfill.prototype;


if (XMLHttpRequestPolyfillPrototype.setRequestHeader) {
    XMLHttpRequestPolyfillPrototype.nativeSetRequestHeader = XMLHttpRequestPolyfillPrototype.setRequestHeader;

    XMLHttpRequestPolyfillPrototype.setRequestHeader = function setRequestHeader(key, value) {
        (this.__requestHeaders__ || (this.__requestHeaders__ = {}))[key] = value;
        return this.nativeSetRequestHeader(key, value);
    };
}

XMLHttpRequestPolyfillPrototype.getRequestHeader = function getRequestHeader(key) {
    return (this.__requestHeaders__ || (this.__requestHeaders__ = {}))[key];
};

XMLHttpRequestPolyfillPrototype.getRequestHeaders = function getRequestHeaders() {
    return extend({}, this.__requestHeaders__);
};


module.exports = XMLHttpRequestPolyfill;


},
function(require, exports, module, global) {

var isNative = require(4),
    toString = require(8);


var StringPrototype = String.prototype,

    reTrim = /^[\s\xA0]+|[\s\xA0]+$/g,
    reTrimLeft = /^[\s\xA0]+/g,
    reTrimRight = /[\s\xA0]+$/g,

    baseTrim, baseTrimLeft, baseTrimRight;


module.exports = trim;


if (isNative(StringPrototype.trim)) {
    baseTrim = function baseTrim(str) {
        return str.trim();
    };
} else {
    baseTrim = function baseTrim(str) {
        return str.replace(reTrim, "");
    };
}

if (isNative(StringPrototype.trimLeft)) {
    baseTrimLeft = function baseTrimLeft(str) {
        return str.trimLeft();
    };
} else {
    baseTrimLeft = function baseTrimLeft(str) {
        return str.replace(reTrimLeft, "");
    };
}

if (isNative(StringPrototype.trimRight)) {
    baseTrimRight = function baseTrimRight(str) {
        return str.trimRight();
    };
} else {
    baseTrimRight = function baseTrimRight(str) {
        return str.replace(reTrimRight, "");
    };
}


function trim(str) {
    return baseTrim(toString(str));
}

trim.left = function trimLeft(str) {
    return baseTrimLeft(toString(str));
};

trim.right = function trimRight(str) {
    return baseTrimRight(toString(str));
};


},
function(require, exports, module, global) {

module.exports = Response;


function Response() {
    this.data = null;
    this.method = null;
    this.requestHeaders = null;
    this.responseHeaders = null;
    this.statusCode = null;
    this.url = null;
}


},
function(require, exports, module, global) {

var map = require(143),
    capitalizeString = require(144);


module.exports = function camelcaseHeader(str) {
    return map(str.split("-"), capitalizeString).join("-");
};


},
function(require, exports, module, global) {

var keys = require(17),
    isNullOrUndefined = require(6),
    fastBindThis = require(48),
    isArrayLike = require(42);


module.exports = map;


function map(object, callback, thisArg) {
    callback = isNullOrUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 2);
    return isArrayLike(object) ? mapArray(object, callback) : mapObject(object, callback);
}

function mapArray(array, callback) {
    var length = array.length,
        i = -1,
        il = length - 1,
        result = new Array(length);

    while (i++ < il) {
        result[i] = callback(array[i], i);
    }

    return result;
}

function mapObject(object, callback) {
    var objectKeys = keys(object),
        i = -1,
        il = objectKeys.length - 1,
        result = {},
        key;

    while (i++ < il) {
        key = objectKeys[i];
        result[key] = callback(object[key], key);
    }

    return result;
}


},
function(require, exports, module, global) {

module.exports = capitalizeString;


function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


},
function(require, exports, module, global) {

module.exports = function parseContentType(str) {
    var index;

    if (str) {
        if ((index = str.indexOf(";")) !== -1) {
            str = str.substring(0, index);
        }
        if ((index = str.indexOf(",")) !== -1) {
            return str.substring(0, index);
        }

        return str;
    }

    return "application/octet-stream";
};


},
function(require, exports, module, global) {

var vec2 = require(68),
    WebGLContext = require(30),
    ImageAsset = require(128);


var ImageAssetPrototype = ImageAsset.prototype,

    enums = WebGLContext.enums,
    filterMode = enums.filterMode,
    textureFormat = enums.textureFormat,
    textureWrap = enums.textureWrap,
    textureType = enums.textureType,

    TexturePrototype;


module.exports = Texture;


function Texture() {

    ImageAsset.call(this);

    this.width = null;
    this.height = null;

    this.__invWidth = null;
    this.__invHeight = null;

    this.offset = vec2.create();
    this.repeat = vec2.create(1, 1);

    this.generateMipmap = null;
    this.flipY = null;
    this.premultiplyAlpha = null;

    this.anisotropy = null;

    this.filter = null;
    this.format = null;
    this.wrap = null;
    this.type = null;
}
ImageAsset.extend(Texture, "odin.Texture");
TexturePrototype = Texture.prototype;

TexturePrototype.construct = function(name, src, options) {

    ImageAssetPrototype.construct.call(this, name, src);

    options = options || {};

    this.generateMipmap = options.generateMipmap != null ? !!options.generateMipmap : true;
    this.flipY = options.flipY != null ? !!options.flipY : false;
    this.premultiplyAlpha = options.premultiplyAlpha != null ? !!options.premultiplyAlpha : false;

    this.anisotropy = options.anisotropy != null ? options.anisotropy : 1;

    this.filter = options.filter != null ? options.filter : filterMode.Linear;
    this.format = options.format != null ? options.format : textureFormat.RGBA;
    this.wrap = options.wrap != null ? options.wrap : textureWrap.Repeat;
    this.type = options.type != null ? options.type : textureType.UnsignedByte;

    return this;
};

TexturePrototype.destructor = function() {

    ImageAssetPrototype.destructor.call(this);

    this.width = null;
    this.height = null;

    this.__invWidth = null;
    this.__invHeight = null;

    vec2.set(this.offset, 0, 0);
    vec2.set(this.repeat, 1, 1);

    this.generateMipmap = null;
    this.flipY = null;
    this.premultiplyAlpha = null;

    this.anisotropy = null;

    this.filter = null;
    this.format = null;
    this.wrap = null;
    this.type = null;

    return this;
};

TexturePrototype.parse = function() {
    var data = this.data;

    if (data != null) {
        this.setSize(data.width || 1, data.height || 1);
    }

    ImageAssetPrototype.parse.call(this);

    return this;
};

TexturePrototype.setSize = function(width, height) {

    this.width = width;
    this.height = height;

    this.__invWidth = 1 / this.width;
    this.__invHeight = 1 / this.height;

    this.emit("update");

    return this;
};

TexturePrototype.setOffset = function(x, y) {

    vec2.set(this.offset, x, y);
    this.emit("update");

    return this;
};

TexturePrototype.setRepeat = function(x, y) {

    vec2.set(this.repeat, x, y);
    this.emit("update");

    return this;
};

TexturePrototype.setMipmap = function(value) {

    this.generateMipmap = value != null ? !!value : this.generateMipmap;
    this.emit("update");

    return this;
};

TexturePrototype.setAnisotropy = function(value) {

    this.anisotropy = value;
    this.emit("update");

    return this;
};

TexturePrototype.setFilter = function(value) {

    this.filter = value;
    this.emit("update");

    return this;
};

TexturePrototype.setFormat = function(value) {

    this.format = value;
    this.emit("update");

    return this;
};

TexturePrototype.setWrap = function(value) {

    this.wrap = value;
    this.emit("update");

    return this;
};

TexturePrototype.setType = function(value) {

    this.type = value;
    this.emit("update");

    return this;
};


},
function(require, exports, module, global) {

var JSONAsset = require(131),
    Shader = require(148),
    enums = require(29);


var JSONAssetPrototype = JSONAsset.prototype,
    MaterialPrototype;


module.exports = Material;


function Material() {

    JSONAsset.call(this);

    this.shader = null;

    this.side = null;
    this.blending = null;

    this.wireframe = null;
    this.wireframeLineWidth = null;

    this.receiveShadow = null;
    this.castShadow = null;

    this.uniforms = null;
}
JSONAsset.extend(Material, "odin.Material");
MaterialPrototype = Material.prototype;

MaterialPrototype.construct = function(name, src, options) {

    JSONAssetPrototype.construct.call(this, name, src);

    options = options || {};

    if (options.shader) {
        this.shader = options.shader;
    } else {
        if (options.vertex && options.fragment) {
            this.shader = Shader.create(options.vertex, options.fragment);
        }
    }

    this.uniforms = options.uniforms || {};

    this.side = options.side != null ? options.side : enums.side.FRONT;
    this.blending = options.blending != null ? options.blending : enums.blending.DEFAULT;

    this.wireframe = options.wireframe != null ? !!options.wireframe : false;
    this.wireframeLineWidth = options.wireframeLineWidth != null ? options.wireframeLineWidth : 1;

    this.receiveShadow = options.receiveShadow != null ? !!options.receiveShadow : true;
    this.castShadow = options.castShadow != null ? !!options.castShadow : true;

    return this;
};

MaterialPrototype.destructor = function() {

    JSONAssetPrototype.destructor.call(this);

    this.side = null;
    this.blending = null;

    this.wireframe = null;
    this.wireframeLineWidth = null;

    this.receiveShadow = null;
    this.castShadow = null;

    this.uniforms = null;

    return this;
};

MaterialPrototype.parse = function() {
    JSONAssetPrototype.parse.call(this);
    return this;
};


},
function(require, exports, module, global) {

var map = require(143),
    keys = require(17),
    template = require(149),
    pushUnique = require(150),
    Class = require(2),
    chunks = require(151);


var ClassPrototype = Class.prototype,

    VERTEX = "vertex",
    FRAGMENT = "fragment",

    chunkRegExps = map(keys(chunks), function(key) {
        return {
            key: key,
            regexp: new RegExp("\\b" + key + "\\b")
        };
    }),

    ShaderPrototype;


module.exports = Shader;


function Shader() {

    Class.call(this);

    this.vertex = null;
    this.fragment = null;
    this.templateVariables = [];
}
Class.extend(Shader, "odin.Shader");
ShaderPrototype = Shader.prototype;

ShaderPrototype.construct = function(vertex, fragment) {

    ClassPrototype.construct.call(this);

    if (vertex && fragment) {
        this.set(vertex, fragment);
    }

    return this;
};

ShaderPrototype.destructor = function() {

    ClassPrototype.destructor.call(this);

    this.vertex = null;
    this.fragment = null;
    this.templateVariables.length = 0;

    return this;
};

ShaderPrototype.set = function(vertex, fragment) {

    this.templateVariables.length = 0;
    this.vertex = Shader_compile(this, vertex, VERTEX);
    this.fragment = Shader_compile(this, fragment, FRAGMENT);

    return this;
};

function Shader_compile(_this, shader, type) {
    var templateVariables = _this.templateVariables,
        shaderChunks = [],
        out = "",
        i = -1,
        il = chunkRegExps.length - 1,
        chunkRegExp;

    while (i++ < il) {
        chunkRegExp = chunkRegExps[i];

        if (chunkRegExp.regexp.test(shader)) {
            requireChunk(shaderChunks, templateVariables, chunks[chunkRegExp.key], type);
        }
    }

    i = -1;
    il = shaderChunks.length - 1;
    while (i++ < il) {
        out += shaderChunks[i].code;
    }

    return template(out + "\n" + shader);
}

function requireChunk(shaderChunks, templateVariables, chunk, type) {
    var requires, i, il;

    if (
        type === VERTEX && chunk.vertex ||
        type === FRAGMENT && chunk.fragment
    ) {
        requires = chunk.requires;
        i = -1;
        il = requires.length - 1;

        while (i++ < il) {
            requireChunk(shaderChunks, templateVariables, chunks[requires[i]], type);
        }

        pushUnique(shaderChunks, chunk);

        if (chunk.template) {
            pushUnique.array(templateVariables, chunk.template);
        }
    }
}


},
function(require, exports, module, global) {

var reEscaper = /\\|'|\r|\n|\t|\u2028|\u2029/g,
    ESCAPES = {
        "'": "'",
        "\\": "\\",
        "\r": "r",
        "\n": "n",
        "\t": "t",
        "\u2028": "u2028",
        "\u2029": "u2029"
    };


module.exports = template;


function template(text, data, settings) {
    var templateSettings = template.settings,

        match = "([\\s\\S]+?)",
        source = "__p+='",
        index = 0,

        render, start, end, evaluate, interpolate, escape;

    settings || (settings = {});

    for (var key in templateSettings) {
        if (settings[key] == null) settings[key] = templateSettings[key];
    }

    start = settings.start;
    end = settings.end;

    evaluate = start + match + end;
    interpolate = start + "=" + match + end;
    escape = start + "-" + match + end;

    text.replace(
        new RegExp(escape + "|" + interpolate + "|" + evaluate + "|$", "g"),
        function(match, escape, interpolate, evaluate, offset) {

            source += text.slice(index, offset).replace(reEscaper, function(match) {
                return '\\' + ESCAPES[match];
            });

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            index = offset + match.length;

            return match;
        }
    );
    source += "';\n";

    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
    source = "var __t,__p='',__j=Array.prototype.join;\n" + source + "return __p;\n";

    try {
        render = new Function(settings.variable || 'obj', source);
    } catch (e) {
        e.source = source;
        throw e;
    }

    return data != null ? render(data) : function temp(data) {
        return render.call(this, data);
    };
}

template.settings = {
    start: "<%",
    end: "%>",
    interpolate: "=",
    escape: "-"
};


},
function(require, exports, module, global) {

var indexOf = require(61);


module.exports = pushUnique;

function pushUnique(array) {
    var i = 0,
        il = arguments.length - 1;

    while (i++ < il) {
        basePushUnique(array, arguments[i]);
    }

    return array;
}

pushUnique.array = function(array, values) {
    var i = -1,
        il = values.length - 1;

    while (i++ < il) {
        basePushUnique(array, values[i]);
    }

    return array;
};

function basePushUnique(array, value) {
    if (indexOf(array, value) === -1) {
        array[array.length] = value;
    }
}


},
function(require, exports, module, global) {

var ShaderChunk = require(152);


var chunks = exports;

chunks.perspectiveMatrix = ShaderChunk.create({
    code: "uniform mat4 perspectiveMatrix;\n"
});

chunks.modelViewMatrix = ShaderChunk.create({
    code: "uniform mat4 modelViewMatrix;\n"
});

chunks.normalMatrix = ShaderChunk.create({
    code: "uniform mat3 normalMatrix;\n"
});

chunks.size = ShaderChunk.create({
    code: "uniform vec2 size;\n"
});

chunks.clipping = ShaderChunk.create({
    code: "uniform vec4 clipping;\n"
});

chunks.position = ShaderChunk.create({
    code: "attribute vec3 position;\n",
    fragment: false
});

chunks.normal = ShaderChunk.create({
    code: "attribute vec3 normal;\n",
    fragment: false
});

chunks.tangent = ShaderChunk.create({
    code: "attribute vec4 tangent;\n",
    fragment: false
});

chunks.color = ShaderChunk.create({
    code: "attribute vec3 color;\n",
    fragment: false
});

chunks.uv = ShaderChunk.create({
    code: "attribute vec2 uv;\n",
    fragment: false
});

chunks.uv2 = ShaderChunk.create({
    code: "attribute vec2 uv2;\n",
    fragment: false
});

chunks.boneWeight = ShaderChunk.create({
    code: [
        "<% if (useBones) { %>",
        "attribute vec<%= boneWeightCount %> boneWeight;",
        "<% } %>",
        ""
    ].join("\n"),
    template: ["useBones", "boneWeightCount"],
    fragment: false
});

chunks.boneIndex = ShaderChunk.create({
    code: [
        "<% if (useBones) { %>",
        "attribute vec<%= boneWeightCount %> boneIndex;",
        "<% } %>",
        ""
    ].join("\n"),
    template: ["useBones", "boneWeightCount"],
    fragment: false
});

chunks.normalMatrix = ShaderChunk.create({
    code: "uniform mat3 normalMatrix;\n"
});

chunks.boneMatrix = ShaderChunk.create({
    code: [
        "<% if (useBones) { %>",
        "uniform mat4 boneMatrix[<%= boneCount %>];",
        "<% } %>",
        ""
    ].join("\n"),
    template: ["useBones", "boneCount"]
});

chunks.dHdxy_fwd = ShaderChunk.create({
    code: [
        "vec2 dHdxy_fwd(sampler2D map, vec2 uv, float scale) {",

        "    vec2 dSTdx = dFdx(uv);",
        "    vec2 dSTdy = dFdy(uv);",

        "    float Hll = scale * texture2D(map, uv).x;",
        "    float dBx = scale * texture2D(map, uv + dSTdx).x - Hll;",
        "    float dBy = scale * texture2D(map, uv + dSTdy).x - Hll;",

        "    return vec2(dBx, dBy);",
        "}",
        ""
    ].join("\n"),
    extensions: ["OES_standard_derivatives"]
});

chunks.perturbNormalArb = ShaderChunk.create({
    code: [
        "vec3 perturbNormalArb(vec3 surf_position, vec3 surf_normal, vec2 dHdxy) {",

        "    vec3 vSigmaX = dFdx(surf_position);",
        "    vec3 vSigmaY = dFdy(surf_position);",
        "    vec3 vN = surf_normal;",

        "    vec3 R1 = cross(vSigmaY, vN);",
        "    vec3 R2 = cross(vN, vSigmaX);",

        "    float fDet = dot(vSigmaX, R1);",
        "    vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);",

        "    return normalize(abs(fDet) * surf_normal - vGrad);",
        "}",
        ""
    ].join("\n"),
    extensions: ["OES_standard_derivatives"]
});

chunks.perturbNormal2Arb = ShaderChunk.create({
    code: [
        "vec3 perturbNormal2Arb(sampler2D map, vec2 uv, vec3 eye_position, vec3 surf_normal, float scale) {",

        "    vec3 q0 = dFdx(eye_position.xyz);",
        "    vec3 q1 = dFdy(eye_position.xyz);",
        "    vec2 st0 = dFdx(uv.st);",
        "    vec2 st1 = dFdy(uv.st);",

        "    vec3 S = normalize(q0 * st1.t - q1 * st0.t);",
        "    vec3 T = normalize(-q0 * st1.s + q1 * st0.s);",
        "    vec3 N = normalize(surf_normal);",

        "    vec3 mapN = texture2D(map, uv).xyz * 2.0 - 1.0;",
        "    mapN.xy = scale * mapN.xy;",
        "    mat3 tsn = mat3(S, T, N);",

        "    return normalize(tsn * mapN);",
        "}",
        ""
    ].join("\n"),
    extensions: ["OES_standard_derivatives"]
});

chunks.getBoneMatrix = ShaderChunk.create({
    code: [
        "<% if (useBones) { %>",
        "mat4 getBoneMatrix_result;",
        "bool getBoneMatrix_bool = false;",
        "mat4 getBoneMatrix() {",
        "    if (getBoneMatrix_bool == false) {",
        "        getBoneMatrix_bool = true;",
        "        getBoneMatrix_result = boneWeight.x * boneMatrix[int(boneIndex.x)];",
        "        getBoneMatrix_result = getBoneMatrix_result + boneWeight.y * boneMatrix[int(boneIndex.y)];",
        "        <% if (boneWeightCount > 2) { %>",
        "        getBoneMatrix_result = getBoneMatrix_result + boneWeight.z * boneMatrix[int(boneIndex.z)];",
        "        <% } %>",
        "        <% if (boneWeightCount > 3) { %>",
        "        getBoneMatrix_result = getBoneMatrix_result + boneWeight.w * boneMatrix[int(boneIndex.w)];",
        "        <% } %>",
        "    }",
        "    return getBoneMatrix_result;",
        "}",
        "<% } %>",
        ""
    ].join("\n"),
    template: ["useBones", "boneWeightCount"],
    requires: ["boneWeight", "boneIndex", "boneMatrix"],
    fragment: false
});

chunks.getBonePosition = ShaderChunk.create({
    code: [
        "<% if (useBones) { %>",
        "vec4 getBonePosition() {",
        "    return getBoneMatrix() * vec4(position, 1.0);",
        "}",
        "<% } %>",
        ""
    ].join("\n"),
    template: ["useBones"],
    requires: ["getBoneMatrix", "position"],
    fragment: false
});

chunks.getPosition = ShaderChunk.create({
    code: [
        "vec4 getPosition_result;",
        "bool getPosition_bool = false;",
        "vec4 getPosition() {",
        "    if (getPosition_bool == false) {",
        "        getPosition_bool = true;",
        "        <% if (useBones) { %>",
        "        getPosition_result = getBonePosition();",
        "        <% } else if (isSprite) { %>",
        "        getPosition_result = vec4(position.x * size.x, position.y * size.y, position.z, 1.0);",
        "        <% } else { %>",
        "        getPosition_result = vec4(position, 1.0);",
        "        <% } %>",
        "    }",
        "    return getPosition_result;",
        "}",
        ""
    ].join("\n"),
    template: ["useBones", "isSprite"],
    requires: ["size", "getBonePosition", "position"],
    fragment: false
});

chunks.getBoneNormal = ShaderChunk.create({
    code: [
        "<% if (useBones) { %>",
        "vec4 getBoneNormal() {",
        "    return getBoneMatrix() * vec4(normal, 0.0);",
        "}",
        "<% } %>",
        ""
    ].join("\n"),
    requires: ["getBoneMatrix", "normal"],
    fragment: false
});

chunks.getNormal = ShaderChunk.create({
    code: [
        "vec3 getNormal_result;",
        "bool getNormal_bool = false;",
        "vec3 getNormal() {",
        "    if (getNormal_bool == false) {",
        "        getNormal_bool = true;",
        "        <% if (useBones) { %>",
        "        getNormal_result = normalMatrix * getBoneNormal().xyz;",
        "        <% } else { %>",
        "        getNormal_result = normalMatrix * normal;",
        "        <% } %>",
        "    }",
        "    return getNormal_result;",
        "}",
        ""
    ].join("\n"),
    template: ["useBones"],
    requires: ["getBoneNormal", "normalMatrix", "normal"],
    fragment: false
});

chunks.getUV = ShaderChunk.create({
    code: [
        "vec2 getUV() {",
        "    <% if (isSprite) { %>",
        "    return clipping.xy + (uv * clipping.zw);",
        "    <% } else { %>",
        "    return uv;",
        "    <% } %>",
        "}",
        ""
    ].join("\n"),
    template: ["isSprite"],
    requires: ["clipping", "uv"],
    fragment: false
});


},
function(require, exports, module, global) {

var isArray = require(58);


var ShaderChunkPrototype;


module.exports = ShaderChunk;


function ShaderChunk() {
    this.code = null;
    this.template = null;
    this.vertex = null;
    this.fragment = null;
    this.requires = null;
    this.extensions = null;
}
ShaderChunkPrototype = ShaderChunk.prototype;

ShaderChunk.create = function(options) {
    return (new ShaderChunk()).construct(options);
};

ShaderChunkPrototype.construct = function(options) {

    options = options || {};

    this.code = options.code;
    this.template = options.template;
    this.vertex = options.vertex != null ? !!options.vertex : true;
    this.fragment = options.fragment != null ? !!options.fragment : true;
    this.requires = isArray(options.requires) ? options.requires : [];
    this.extensions = isArray(options.extensions) ? options.extensions : [];

    return this;
};

ShaderChunkPrototype.destructor = function() {

    this.code = null;
    this.template = null;
    this.vertex = null;
    this.fragment = null;
    this.requires = null;
    this.extensions = null;

    return this;
};


},
function(require, exports, module, global) {

var vec3 = require(38),
    quat = require(154),
    mat4 = require(79),
    mathf = require(31),
    aabb3 = require(155),
    FastHash = require(60),
    Attribute = require(156),
    JSONAsset = require(131),
    GeometryBone = require(157);


var JSONAssetPrototype = JSONAsset.prototype,
    NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array,
    NativeUint16Array = typeof(Uint16Array) !== "undefined" ? Uint16Array : Array,
    GeometryPrototype;


module.exports = Geometry;


function Geometry() {

    JSONAsset.call(this);

    this.index = null;
    this.bones = [];

    this.attributes = new FastHash("name");
    this.aabb = aabb3.create();

    this.boundingCenter = vec3.create();
    this.boundingRadius = 0;

    this.boneWeightCount = 3;
}
JSONAsset.extend(Geometry, "odin.Geometry");
GeometryPrototype = Geometry.prototype;

GeometryPrototype.construct = function(name, src, options) {

    JSONAssetPrototype.construct.call(this, name, src, options);

    return this;
};

GeometryPrototype.destructor = function() {

    JSONAssetPrototype.destructor.call(this);

    this.index = null;
    this.bones.length = 0;

    this.attributes.clear();
    aabb3.clear(this.aabb);

    vec3.set(this.boundingCenter, 0, 0, 0);
    this.boundingRadius = 0;

    return this;
};

GeometryPrototype.getAttribute = function(name) {
    return this.attributes.get(name);
};

GeometryPrototype.addAttribute = function(name, length, itemSize, ArrayType, dynamic, items) {
    this.attributes.add(Attribute.create(this, name, length, itemSize, ArrayType, dynamic, items));
    return this;
};

GeometryPrototype.removeAttribute = function(name) {
    this.attributes.remove(name);
    return this;
};

GeometryPrototype.parse = function() {
    var data = this.data,
        dataBones = data.bones,
        bones = this.bones,
        items, i, il, bone, dataBone;

    if ((items = (data.index || data.indices || data.faces)) && items.length) {
        this.index = new NativeUint16Array(items);
    }
    if (data.boneWeightCount) {
        this.boneWeightCount = data.boneWeightCount;
    } else {
        data.boneWeightCount = 3;
    }

    if ((items = (data.position || data.vertices)) && items.length) {
        this.addAttribute("position", items.length, 3, NativeFloat32Array, false, items);
    }
    if ((items = (data.normal || data.normals)) && items.length) {
        this.addAttribute("normal", items.length, 3, NativeFloat32Array, false, items);
    }
    if ((items = (data.tangent || data.tangents)) && items.length) {
        this.addAttribute("tangent", items.length, 4, NativeFloat32Array, false, items);
    }
    if ((items = (data.color || data.colors)) && items.length) {
        this.addAttribute("color", items.length, 3, NativeFloat32Array, false, items);
    }
    if ((items = (data.uv || data.uvs)) && items.length) {
        this.addAttribute("uv", items.length, 2, NativeFloat32Array, false, items);
    }
    if ((items = (data.uv2 || data.uvs2)) && items.length) {
        this.addAttribute("uv2", items.length, 2, NativeFloat32Array, false, items);
    }
    if ((items = (data.boneWeight || data.boneWeights)) && items.length) {
        this.addAttribute("boneWeight", items.length, this.boneWeightCount, NativeFloat32Array, false, items);
    }
    if ((items = (data.boneIndex || data.boneIndices)) && items.length) {
        this.addAttribute("boneIndex", items.length, this.boneWeightCount, NativeFloat32Array, false, items);
    }

    i = -1;
    il = dataBones.length - 1;
    while (i++ < il) {
        dataBone = dataBones[i];
        bone = GeometryBone.create(dataBone.parent, dataBone.name);

        vec3.copy(bone.position, dataBone.position);
        quat.copy(bone.rotation, dataBone.rotation);
        vec3.copy(bone.scale, dataBone.scale);
        mat4.copy(bone.bindPose, dataBone.bindPose);
        bone.skinned = !!dataBone.skinned;

        bones[bones.length] = bone;
    }

    this.calculateAABB();
    this.calculateBoundingSphere();

    JSONAssetPrototype.parse.call(this);

    return this;
};

GeometryPrototype.calculateAABB = function() {
    var position = this.attributes.__hash.position;

    if (position) {
        aabb3.fromPointArray(this.aabb, position.array);
    }
    return this;
};

GeometryPrototype.calculateBoundingSphere = function() {
    var position = this.attributes.__hash.position,
        bx = 0,
        by = 0,
        bz = 0,
        maxRadiusSq, maxRadiusSqTest, x, y, z, array, i, il, invLength;

    if (position) {
        array = position.array;
        maxRadiusSq = 0;

        i = 0;
        il = array.length;

        while (i < il) {
            x = array[i];
            y = array[i + 1];
            z = array[i + 2];

            bx += x;
            by += y;
            bz += z;

            maxRadiusSqTest = x * x + y * y + z * z;

            if (maxRadiusSq < maxRadiusSqTest) {
                maxRadiusSq = maxRadiusSqTest;
            }

            i += 3;
        }

        invLength = il === 0 ? 0 : 1 / il;
        bx *= invLength;
        by *= invLength;
        bz *= invLength;

        vec3.set(this.boundingCenter, bx, by, bz);
        this.boundingRadius = maxRadiusSq !== 0 ? mathf.sqrt(maxRadiusSq) : 0;
    }

    return this;
};

var calculateNormals_u = vec3.create(),
    calculateNormals_v = vec3.create(),
    calculateNormals_uv = vec3.create(),

    calculateNormals_va = vec3.create(),
    calculateNormals_vb = vec3.create(),
    calculateNormals_vc = vec3.create(),

    calculateNormals_faceNormal = vec3.create();

GeometryPrototype.calculateNormals = function() {
    var u = calculateNormals_u,
        v = calculateNormals_v,
        uv = calculateNormals_uv,
        faceNormal = calculateNormals_faceNormal,

        va = calculateNormals_va,
        vb = calculateNormals_vb,
        vc = calculateNormals_vc,

        attributes = this.attributes,
        attributesHash = attributes.__hash,
        position = attributesHash.position,
        normal = attributesHash.normal,
        index = this.index,
        x, y, z, nx, ny, nz, length, i, il, a, b, c, n;

    position = position ? position.array : null;

    if (position == null) {
        throw new Error("Geometry.calculateNormals: missing required attribures position");
    }
    if (index == null) {
        throw new Error("Geometry.calculateNormals: missing required attribures index");
    }

    length = position.length;

    if (normal == null) {
        this.addAttribute("normal", length, 3, NativeFloat32Array);
        normal = attributesHash.normal.array;
    } else {
        normal = normal.array;
        i = -1;
        il = length - 1;
        while (i++ < il) {
            normal[i] = 0;
        }
    }

    if (index) {
        i = 0;
        il = length;

        while (i < il) {
            a = index[i];
            b = index[i + 1];
            c = index[i + 2];

            x = position[a * 3];
            y = position[a * 3 + 1];
            z = position[a * 3 + 2];
            vec3.set(va, x, y, z);

            x = position[b * 3];
            y = position[b * 3 + 1];
            z = position[b * 3 + 2];
            vec3.set(vb, x, y, z);

            x = position[c * 3];
            y = position[c * 3 + 1];
            z = position[c * 3 + 2];
            vec3.set(vc, x, y, z);

            vec3.sub(u, vc, vb);
            vec3.sub(v, va, vb);

            vec3.cross(uv, u, v);

            vec3.copy(faceNormal, uv);
            vec3.normalize(faceNormal, faceNormal);
            nx = faceNormal[0];
            ny = faceNormal[1];
            nz = faceNormal[2];

            normal[a * 3] += nx;
            normal[a * 3 + 1] += ny;
            normal[a * 3 + 2] += nz;

            normal[b * 3] += nx;
            normal[b * 3 + 1] += ny;
            normal[b * 3 + 2] += nz;

            normal[c * 3] += nx;
            normal[c * 3 + 1] += ny;
            normal[c * 3 + 2] += nz;

            i += 3;
        }

        i = 0;
        il = length;

        while (i < il) {
            x = normal[i];
            y = normal[i + 1];
            z = normal[i + 2];

            n = 1 / mathf.sqrt(x * x + y * y + z * z);

            normal[i] *= n;
            normal[i + 1] *= n;
            normal[i + 2] *= n;

            i += 3;
        }

        this.emit("update");
    }

    return this;
};

var calculateTangents_tan1 = [],
    calculateTangents_tan2 = [],
    calculateTangents_sdir = vec3.create(),
    calculateTangents_tdir = vec3.create(),
    calculateTangents_n = vec3.create(),
    calculateTangents_t = vec3.create(),
    calculateTangents_tmp1 = vec3.create(),
    calculateTangents_tmp2 = vec3.create(),
    calculateTangents_tmp3 = vec3.create();
GeometryPrototype.calculateTangents = function() {
    var tan1 = calculateTangents_tan1,
        tan2 = calculateTangents_tan2,
        sdir = calculateTangents_sdir,
        tdir = calculateTangents_tdir,
        n = calculateTangents_n,
        t = calculateTangents_t,
        tmp1 = calculateTangents_tmp1,
        tmp2 = calculateTangents_tmp2,
        tmp3 = calculateTangents_tmp3,

        attributes = this.attributes,
        index = this.index,
        attributeHash = attributes.__hash,
        position = attributeHash.position,
        normal = attributeHash.normal,
        tangent = attributeHash.tangent,
        uv = attributeHash.uv,

        v1 = tmp1,
        v2 = tmp2,
        v3 = tmp3,
        w1x, w1y, w2x, w2y, w3x, w3y,

        x1, x2, y1, y2, z1, z2,
        s1, s2, t1, t2,
        a, b, c, x, y, z,

        length, r, w, i, il, j, tmp;

    position = position ? position.array : null;
    uv = uv ? uv.array : null;
    normal = normal ? normal.array : null;

    if (normal == null) {
        throw new Error("Geometry.calculateTangents: missing required attribure normal");
    }
    if (uv == null) {
        throw new Error("Geometry.calculateTangents: missing required attribure uv");
    }
    if (index == null) {
        throw new Error("Geometry.calculateTangents: missing indices");
    }
    if (position == null) {
        throw new Error("Geometry.calculateTangents: missing required attribure position");
    }

    length = position.length;

    if (tangent == null) {
        this.addAttribute("tangent", (4 / 3) * length, 4, NativeFloat32Array);
        tangent = attributeHash.tangent.array;
    } else {
        tangent = tangent.array;
        i = -1;
        il = length - 1;
        while (i++ < il) {
            tangent[i] = 0;
        }
    }

    i = -1;
    il = length - 1;
    while (i++ < il) {
        vec3.set(tan1[i] || (tan1[i] = vec3.create()), 0, 0, 0);
        vec3.set(tan2[i] || (tan2[i] = vec3.create()), 0, 0, 0);
    }

    i = 0;
    il = length / 3;

    while (i < il) {
        a = index[i];
        b = index[i + 1];
        c = index[i + 2];

        x = position[a * 3];
        y = position[a * 3 + 1];
        z = position[a * 3 + 2];
        vec3.set(v1, x, y, z);

        x = position[b * 3];
        y = position[b * 3 + 1];
        z = position[b * 3 + 2];
        vec3.set(v2, x, y, z);

        x = position[c * 3];
        y = position[c * 3 + 1];
        z = position[c * 3 + 2];
        vec3.set(v3, x, y, z);

        w1x = uv[a];
        w1y = uv[a + 1];
        w2x = uv[b];
        w2y = uv[b + 1];
        w3x = uv[c];
        w3y = uv[c + 1];

        x1 = v2[0] - v1[0];
        x2 = v3[0] - v1[0];
        y1 = v2[1] - v1[1];
        y2 = v3[1] - v1[1];
        z1 = v2[2] - v1[2];
        z2 = v3[2] - v1[2];

        s1 = w2x - w1x;
        s2 = w3x - w1x;
        t1 = w2y - w1y;
        t2 = w3y - w1y;

        r = s1 * t2 - s2 * t1;
        r = r !== 0 ? 1 / r : 0;

        vec3.set(
            sdir, (t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r
        );

        vec3.set(
            tdir, (s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r
        );

        tmp = tan1[a];
        vec3.add(tmp, tmp, sdir);
        tmp = tan1[b];
        vec3.add(tmp, tmp, sdir);
        tmp = tan1[c];
        vec3.add(tmp, tmp, sdir);

        tmp = tan2[a];
        vec3.add(tmp, tmp, tdir);
        tmp = tan2[b];
        vec3.add(tmp, tmp, tdir);
        tmp = tan2[c];
        vec3.add(tmp, tmp, tdir);

        i += 3;
    }

    j = 0;
    i = 0;
    il = length;

    while (i < il) {
        vec3.copy(t, tan1[i]);

        n[0] = normal[i];
        n[1] = normal[i + 1];
        n[2] = normal[i + 2];

        vec3.copy(tmp1, t);
        vec3.sub(tmp1, tmp1, vec3.smul(n, n, vec3.dot(n, t)));
        vec3.normalize(tmp1, tmp1);

        n[0] = normal[i];
        n[1] = normal[i + 1];
        n[2] = normal[i + 2];
        vec3.cross(tmp2, n, t);

        w = (vec3.dot(tmp2, tan2[i]) < 0.0) ? -1.0 : 1.0;

        tangent[j] = tmp1[0];
        tangent[j + 1] = tmp1[1];
        tangent[j + 2] = tmp1[2];
        tangent[j + 3] = w;

        j += 4;
        i += 3;
    }

    this.emit("update");

    return this;
};


},
function(require, exports, module, global) {

var mathf = require(31),
    vec3 = require(38),
    vec4 = require(39);


var quat = exports;


quat.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


quat.create = function(x, y, z, w) {
    var out = new quat.ArrayType(4);

    out[0] = x !== undefined ? x : 0;
    out[1] = y !== undefined ? y : 0;
    out[2] = z !== undefined ? z : 0;
    out[3] = w !== undefined ? w : 1;

    return out;
};

quat.copy = vec4.copy;

quat.clone = function(a) {
    var out = new quat.ArrayType(4);

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    return out;
};

quat.set = vec4.set;

quat.lengthSqValues = vec4.lengthSqValues;

quat.lengthValues = vec4.lengthValues;

quat.invLengthValues = vec4.invLengthValues;

quat.dot = vec4.dot;

quat.lengthSq = vec4.lengthSq;

quat.length = vec4.length;

quat.invLength = vec4.invLength;

quat.setLength = vec4.setLength;

quat.normalize = vec4.normalize;

quat.lerp = vec4.lerp;

quat.min = vec4.min;

quat.max = vec4.max;

quat.clamp = vec4.clamp;

quat.equal = vec4.equal;

quat.notEqual = vec4.notEqual;

quat.str = function(out) {

    return "Quat(" + out[0] + ", " + out[1] + ", " + out[2] + ", " + out[3] + ")";
};


quat.mul = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;

    return out;
};

quat.div = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        bx = -b[0],
        by = -b[1],
        bz = -b[2],
        bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;

    return out;
};

quat.inverse = function(out, a) {
    var d = quat.dot(a, a);

    d = d !== 0 ? 1 / d : d;

    out[0] = a[0] * -d;
    out[1] = a[1] * -d;
    out[2] = a[2] * -d;
    out[3] = a[3] * d;

    return out;
};

quat.conjugate = function(out, a) {

    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];

    return out;
};

quat.calculateW = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = -mathf.sqrt(mathf.abs(1 - x * x - y * y - z * z));

    return out;
};

quat.nlerp = function(out, a, b, x) {

    return quat.normalize(quat.lerp(out, a, b, x));
};

quat.slerp = function(out, a, b, x) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3],

        cosom = ax * bx + ay * by + az * bz + aw * bw,
        omega, sinom, scale0, scale1;

    if (cosom < 0.0) {
        cosom *= -1;
        bx *= -1;
        by *= -1;
        bz *= -1;
        bw *= -1;
    }

    if (1 - cosom > mathf.EPSILON) {
        omega = mathf.acos(cosom);

        sinom = mathf.sin(omega);
        sinom = sinom !== 0 ? 1 / sinom : sinom;

        scale0 = mathf.sin((1 - x) * omega) * sinom;
        scale1 = mathf.sin(x * omega) * sinom;
    } else {
        scale0 = 1 - x;
        scale1 = x;
    }

    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;

    return out;
};

quat.rotationX = function(out) {
    var z = out[2],
        w = out[3];

    return mathf.atan2(2 * out[0] * w + 2 * out[1] * z, 1 - 2 * (z * z + w * w));
};

quat.rotationY = function(out) {
    var theta = 2 * (out[0] * out[2] + out[3] * out[1]);

    return mathf.asin((theta < -1 ? -1 : theta > 1 ? 1 : theta));
};

quat.rotationZ = function(out) {
    var y = out[1],
        z = out[2];

    return mathf.atan2(2 * out[0] * y + 2 * z * out[3], 1 - 2 * (y * y + z * z));
};

quat.rotateX = function(out, a, angle) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        halfAngle = angle * 0.5,
        bx = mathf.sin(halfAngle),
        bw = mathf.cos(halfAngle);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;

    return out;
};

quat.rotateY = function(out, a, angle) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        halfAngle = angle * 0.5,
        by = Math.sin(halfAngle),
        bw = Math.cos(halfAngle);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;

    return out;
};

quat.rotateZ = function(out, a, angle) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        halfAngle = angle * 0.5,
        bz = Math.sin(halfAngle),
        bw = Math.cos(halfAngle);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;

    return out;
};

quat.rotate = function(out, a, x, y, z) {

    if (z !== undefined) {
        quat.rotateZ(out, a, z);
    }
    if (x !== undefined) {
        quat.rotateX(out, a, x);
    }
    if (y !== undefined) {
        quat.rotateY(out, a, y);
    }

    return out;
};

var lookRotation_up = vec3.create(0, 0, 1);
quat.lookRotation = function(out, forward, up) {
    var fx, fy, fz, ux, uy, uz, ax, ay, az, d, dsq, s;

    up = up || lookRotation_up;

    fx = forward[0];
    fy = forward[1];
    fz = forward[2];
    ux = up[0];
    uy = up[1];
    uz = up[2];

    ax = uy * fz - uz * fy;
    ay = uz * fx - ux * fz;
    az = ux * fy - uy * fx;

    d = (1 + ux * fx + uy * fy + uz * fz) * 2;
    dsq = d * d;
    s = dsq !== 0 ? 1 / dsq : dsq;

    out[0] = ax * s;
    out[1] = ay * s;
    out[2] = az * s;
    out[3] = dsq * 0.5;

    return out;
};

quat.fromAxisAngle = function(out, axis, angle) {
    var halfAngle = angle * 0.5,
        s = mathf.sin(halfAngle);

    out[0] = axis[0] * s;
    out[1] = axis[1] * s;
    out[2] = axis[2] * s;
    out[3] = mathf.cos(halfAngle);

    return out;
};

quat.fromMat = function(
    out,
    m11, m12, m13,
    m21, m22, m23,
    m31, m32, m33
) {
    var trace = m11 + m22 + m33,
        s, invS;

    if (trace > 0) {
        s = 0.5 / mathf.sqrt(trace + 1);

        out[3] = 0.25 / s;
        out[0] = (m32 - m23) * s;
        out[1] = (m13 - m31) * s;
        out[2] = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
        s = 2 * mathf.sqrt(1 + m11 - m22 - m33);
        invS = 1 / s;

        out[3] = (m32 - m23) * invS;
        out[0] = 0.25 * s;
        out[1] = (m12 + m21) * invS;
        out[2] = (m13 + m31) * invS;
    } else if (m22 > m33) {
        s = 2 * mathf.sqrt(1 + m22 - m11 - m33);
        invS = 1 / s;

        out[3] = (m13 - m31) * invS;
        out[0] = (m12 + m21) * invS;
        out[1] = 0.25 * s;
        out[2] = (m23 + m32) * invS;
    } else {
        s = 2 * mathf.sqrt(1 + m33 - m11 - m22);
        invS = 1 / s;

        out[3] = (m21 - m12) * invS;
        out[0] = (m13 + m31) * invS;
        out[1] = (m23 + m32) * invS;
        out[2] = 0.25 * s;
    }

    return out;
};

quat.fromMat3 = function(out, m) {
    return quat.fromMat(
        out,
        m[0], m[3], m[6],
        m[1], m[4], m[7],
        m[2], m[5], m[8]
    );
};

quat.fromMat4 = function(out, m) {
    return quat.fromMat(
        out,
        m[0], m[4], m[8],
        m[1], m[5], m[9],
        m[2], m[6], m[10]
    );
};


},
function(require, exports, module, global) {

var vec3 = require(38);


var aabb3 = exports;


function AABB3() {
    this.min = vec3.create(Infinity, Infinity, Infinity);
    this.max = vec3.create(-Infinity, -Infinity, -Infinity);
}


aabb3.create = function(min, max) {
    var out = new AABB3();

    if (min) {
        vec3.copy(out.min, min);
    }
    if (max) {
        vec3.copy(out.max, max);
    }

    return out;
};

aabb3.copy = function(out, a) {

    vec3.copy(out.min, a.min);
    vec3.copy(out.max, a.max);

    return out;
};

aabb3.clone = function(a) {
    return aabb3.create(a.min, a.max);
};

aabb3.set = function(out, min, max) {

    if (min) {
        vec3.copy(out.min, min);
    }
    if (max) {
        vec3.copy(out.max, max);
    }

    return out;
};

aabb3.expandPoint = function(out, point) {

    vec3.min(out.min, point);
    vec3.max(out.max, point);

    return out;
};

aabb3.expandVector = function(out, vector) {

    vec3.sub(out.min, vector);
    vec3.add(out.max, vector);

    return out;
};

aabb3.expandScalar = function(out, scalar) {

    vec3.ssub(out.min, scalar);
    vec3.sadd(out.max, scalar);

    return out;
};

aabb3.union = function(out, a, b) {

    vec3.min(out.min, a.min, b.min);
    vec3.max(out.max, a.max, b.max);

    return out;
};

aabb3.clear = function(out) {

    vec3.set(out.min, Infinity, Infinity, Infinity);
    vec3.set(out.max, -Infinity, -Infinity, -Infinity);

    return out;
};

aabb3.contains = function(out, point) {
    var min = out.min,
        max = out.max,
        px = point[0],
        py = point[1],
        pz = point[2];

    return !(
        px < min[0] || px > max[0] ||
        py < min[1] || py > max[1] ||
        pz < min[2] || pz > max[2]
    );
};

aabb3.intersects = function(a, b) {
    var aMin = a.min,
        aMax = a.max,
        bMin = b.min,
        bMax = b.max;

    return !(
        bMax[0] < aMin[0] || bMin[0] > aMax[0] ||
        bMax[1] < aMin[1] || bMin[1] > aMax[1] ||
        bMax[2] < aMin[2] || bMin[2] > aMax[2]
    );
};

aabb3.fromPoints = function(out, points) {
    var i = points.length,
        minx = Infinity,
        miny = Infinity,
        minz = Infinity,
        maxx = -Infinity,
        maxy = -Infinity,
        maxz = -Infinity,
        min = out.min,
        max = out.max,
        x, y, z, v;

    while (i--) {
        v = points[i];
        x = v[0];
        y = v[1];
        z = v[2];

        minx = minx > x ? x : minx;
        miny = miny > y ? y : miny;
        minz = minz > z ? z : minz;

        maxx = maxx < x ? x : maxx;
        maxy = maxy < y ? y : maxy;
        maxz = maxz < z ? z : maxz;
    }

    min[0] = minx;
    min[1] = miny;
    min[2] = minz;
    max[0] = maxx;
    max[1] = maxy;
    max[2] = maxz;

    return out;
};

aabb3.fromPointArray = function(out, points) {
    var i = 0,
        il = points.length,
        minx = Infinity,
        miny = Infinity,
        minz = Infinity,
        maxx = -Infinity,
        maxy = -Infinity,
        maxz = -Infinity,
        min = out.min,
        max = out.max,
        x, y, z;

    while (i < il) {
        x = points[i];
        y = points[i + 1];
        z = points[i + 2];
        i += 3;

        minx = minx > x ? x : minx;
        miny = miny > y ? y : miny;
        minz = minz > z ? z : minz;

        maxx = maxx < x ? x : maxx;
        maxy = maxy < y ? y : maxy;
        maxz = maxz < z ? z : maxz;
    }

    min[0] = minx;
    min[1] = miny;
    min[2] = minz;
    max[0] = maxx;
    max[1] = maxy;
    max[2] = maxz;

    return out;
};

aabb3.fromCenterSize = function(out, center, size) {
    var min = out.min,
        max = out.max,
        x = center[0],
        y = center[1],
        z = center[2],
        hx = size[0] * 0.5,
        hy = size[1] * 0.5,
        hz = size[2] * 0.5;

    min[0] = x - hx;
    min[1] = y - hy;
    min[2] = z - hz;

    max[0] = x + hx;
    max[1] = y + hy;
    max[2] = z + hz;

    return out;
};

aabb3.fromCenterRadius = function(out, center, radius) {
    var min = out.min,
        max = out.max,
        x = center[0],
        y = center[1],
        z = center[2];

    min[0] = x - radius;
    min[1] = y - radius;
    min[2] = z - radius;

    max[0] = x + radius;
    max[1] = y + radius;
    max[2] = z + radius;

    return out;
};

aabb3.equal = function(a, b) {
    return (
        vec3.equal(a.min, b.min) ||
        vec3.equal(a.max, b.max)
    );
};

aabb3.notEqual = function(a, b) {
    return (
        vec3.notEqual(a.min, b.min) ||
        vec3.notEqual(a.max, b.max)
    );
};

aabb3.str = function(out) {

    return "AABB3(" + vec3.str(out.min) + ", " + vec3.str(out.max) + ")";
};

aabb3.toJSON = function(out, json) {
    json = json || {};

    json.min = vec3.copy(json.min || [], out.min);
    json.max = vec3.copy(json.max || [], out.max);

    return json;
};

aabb3.fromJSON = function(out, json) {

    vec3.copy(out.min, json.min);
    vec3.copy(out.max, json.max);

    return json;
};


},
function(require, exports, module, global) {

var NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array,
    AttributePrototype;


module.exports = Attribute;


function Attribute() {
    this.geometry = null;
    this.name = null;
    this.array = null;
    this.itemSize = null;
    this.dynamic = null;
}
AttributePrototype = Attribute.prototype;

Attribute.create = function(geometry, name, length, itemSize, ArrayType, dynamic, items) {
    return (new Attribute()).construct(geometry, name, length, itemSize, ArrayType, dynamic, items);
};

AttributePrototype.construct = function(geometry, name, length, itemSize, ArrayType, dynamic, items) {

    ArrayType = ArrayType || NativeFloat32Array;

    this.geometry = geometry;
    this.name = name;
    this.array = new ArrayType(length);
    this.itemSize = itemSize;
    this.dynamic = !!dynamic;

    if (items) {
        this.array.set(items);
    }

    return this;
};

AttributePrototype.destructor = function() {

    this.geometry = null;
    this.name = null;
    this.array = null;
    this.itemSize = null;
    this.dynamic = null;

    return this;
};

AttributePrototype.setDynamic = function(value) {
    if (this.dynamic === value) {
        return this;
    }

    this.dynamic = value;
    return this;
};

AttributePrototype.set = function(array) {

    this.array.set(array);
    return this;
};

AttributePrototype.setX = function(index, x) {

    this.array[index * this.itemSize] = x;
    return this;
};

AttributePrototype.setY = function(index, y) {

    this.array[index * this.itemSize + 1] = y;
    return this;
};

AttributePrototype.setZ = function(index, z) {

    this.array[index * this.itemSize + 2] = z;
    return this;
};

AttributePrototype.setXY = function(index, x, y) {
    var array = this.array;

    index = index * this.itemSize;
    array[index] = x;
    array[index + 1] = y;

    return this;
};

AttributePrototype.setXYZ = function(index, x, y, z) {
    var array = this.array;

    index = index * this.itemSize;
    array[index] = x;
    array[index + 1] = y;
    array[index + 2] = z;

    return this;
};

AttributePrototype.setXYZW = function(index, x, y, z, w) {
    var array = this.array;

    index = index * this.itemSize;
    array[index] = x;
    array[index + 1] = y;
    array[index + 2] = z;
    array[index + 3] = w;

    return this;
};


},
function(require, exports, module, global) {

var vec3 = require(38),
    quat = require(154),
    mat4 = require(79);


var UNKNOWN_BONE_COUNT = 1,
    GeometryBonePrototype;


module.exports = GeometryBone;


function GeometryBone() {
    this.parentIndex = null;
    this.name = null;

    this.skinned = null;
    this.position = vec3.create();
    this.rotation = quat.create();
    this.scale = vec3.create(1, 1, 1);
    this.bindPose = mat4.create();
}
GeometryBonePrototype = GeometryBone.prototype;

GeometryBone.create = function(parentIndex, name) {
    return (new GeometryBone()).construct(parentIndex, name);
};

GeometryBonePrototype.construct = function(parentIndex, name) {

    this.parentIndex = parentIndex != null ? parentIndex : -1;
    this.name = name != null ? name : "GeometryBone" + UNKNOWN_BONE_COUNT++;
    this.skinned = false;

    return this;
};

GeometryBonePrototype.destructor = function() {

    this.parentIndex = null;
    this.name = null;

    this.skinned = null;
    vec3.set(this.position, 0, 0, 0);
    quat.set(this.rotation, 0, 0, 0, 1);
    vec3.set(this.scale, 1, 1, 1);
    mat4.identity(this.bindPose);

    return this;
};


},
function(require, exports, module, global) {

var isNumber = require(33),
    environment = require(25),
    eventListener = require(34),
    Class = require(2);


var ClassPrototype = Class.prototype,

    window = environment.window,
    document = environment.document,

    CanvasPrototype,
    addMeta, reScale, viewport, viewportWidth, viewportHeight, viewportScale, windowOnResize;


if (environment.browser) {
    addMeta = function addMeta(id, name, content) {
        var meta = document.createElement("meta"),
            head = document.head;

        meta.id = id;
        meta.name = name;
        meta.content = content;
        head.insertBefore(meta, head.firstChild);

        return meta;
    };

    reScale = /-scale\s *=\s*[.0-9]+/g;
    viewport = addMeta("viewport", "viewport", "initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no");
    viewportWidth = addMeta("viewport-width", "viewport", "width=device-width");
    viewportHeight = addMeta("viewport-height", "viewport", "height=device-height");
    viewportScale = viewport.getAttribute("content");

    windowOnResize = function windowOnResize() {
        viewport.setAttribute("content", viewportScale.replace(reScale, "-scale=" + (1 / (window.devicePixelRatio || 1))));
        viewportWidth.setAttribute("content", "width=" + window.innerWidth);
        viewportHeight.setAttribute("content", "height=" + window.innerHeight);
        window.scrollTo(0, 1);
    };

    eventListener.on(window, "resize orientationchange", windowOnResize);
    windowOnResize();
}


module.exports = Canvas;


function Canvas() {
    Class.call(this);

    this.element = null;
    this.context = null;

    this.fixed = null;
    this.keepAspect = null;

    this.width = null;
    this.height = null;

    this.aspect = null;

    this.pixelWidth = null;
    this.pixelHeight = null;

    this.__handler = null;
}
Class.extend(Canvas, "odin.Canvas");
CanvasPrototype = Canvas.prototype;

CanvasPrototype.construct = function(options) {
    var element = document.createElement("canvas");

    ClassPrototype.construct.call(this);

    options = options || {};
    options.parent = (options.parent && options.parent.appendChild) ? options.parent : document.body;

    if (options.disableContextMenu === true) {
        element.oncontextmenu = function oncontextmenu() {
            return false;
        };
    }

    options.parent.appendChild(element);
    this.element = element;

    this.fixed = options.fixed != null ? options.fixed : (options.width == null && options.height == null) ? true : false;
    this.keepAspect = options.keepAspect != null ? !!options.keepAspect : false;

    this.width = isNumber(options.width) ? options.width : window.innerWidth;
    this.height = isNumber(options.height) ? options.height : window.innerHeight;

    this.aspect = isNumber(options.aspect) && options.width == null && options.height == null ? options.aspect : this.width / this.height;

    this.pixelWidth = this.width;
    this.pixelHeight = this.height;

    if (this.fixed) {
        Canvas_setFixed(this);
    }

    return this;
};

CanvasPrototype.destructor = function() {

    ClassPrototype.destructor.call(this);

    if (this.fixed) {
        Canvas_removeFixed(this);
    }

    this.element = null;

    this.fixed = null;
    this.keepAspect = null;

    this.width = null;
    this.height = null;

    this.aspect = null;

    this.pixelWidth = null;
    this.pixelHeight = null;

    return this;
};

CanvasPrototype.setFixed = function(value) {
    if (value) {
        return Canvas_setFixed(this);
    } else {
        return Canvas_removeFixed(this);
    }
};

function Canvas_setFixed(_this) {
    var style = _this.element.style;

    style.position = "fixed";
    style.top = "50%";
    style.left = "50%";
    style.padding = "0px";
    style.marginLeft = "0px";
    style.marginTop = "0px";

    if (!_this.__handler) {
        _this.__handler = function handler() {
            Canvas_update(_this);
        };
    }

    eventListener.on(window, "resize orientationchange", _this.__handler);
    Canvas_update(_this);

    return _this;
}

function Canvas_removeFixed(_this) {
    var style = _this.element.style;

    style.position = "";
    style.top = "";
    style.left = "";
    style.padding = "";
    style.marginLeft = "";
    style.marginTop = "";

    if (_this.__handler) {
        eventListener.off(window, "resize orientationchange", _this.__handler);
    }

    return _this;
}

function Canvas_update(_this) {
    var w = window.innerWidth,
        h = window.innerHeight,
        aspect = w / h,
        element = _this.element,
        style = element.style,
        width, height;

    if (_this.keepAspect !== true) {
        width = w;
        height = h;
        _this.aspect = aspect;
    } else {
        if (aspect > _this.aspect) {
            width = h * _this.aspect;
            height = h;
        } else {
            width = w;
            height = w / _this.aspect;
        }
    }

    _this.pixelWidth = width | 0;
    _this.pixelHeight = height | 0;

    element.width = width;
    element.height = height;

    style.marginLeft = -(((width + 1) * 0.5) | 0) + "px";
    style.marginTop = -(((height + 1) * 0.5) | 0) + "px";

    style.width = (width | 0) + "px";
    style.height = (height | 0) + "px";

    _this.emit("resize", _this.pixelWidth, _this.pixelHeight);
}


},
function(require, exports, module, global) {

var indexOf = require(61),
    WebGLContext = require(30),
    mat4 = require(79),

    Class = require(2),
    side = require(96),

    MeshRenderer = require(160),
    SpriteRenderer = require(162),

    RendererGeometry = require(163),
    RendererMaterial = require(164);


var enums = WebGLContext.enums,
    ClassPrototype = Class.prototype,
    RendererPrototype;


module.exports = Renderer;


function Renderer() {
    var _this = this;

    Class.call(this);

    this.context = new WebGLContext();

    this.__rendererArray = [];
    this.renderers = {};

    this.__geometries = {};
    this.__materials = {};

    this.__programHash = {};
    this.__programs = [];

    this.onContextCreation = function() {
        _this.__onContextCreation();
    };
    this.onContextDestroy = function() {
        _this.__onContextDestroy();
    };
}
Class.extend(Renderer, "odin.Renderer");
RendererPrototype = Renderer.prototype;

RendererPrototype.construct = function() {

    ClassPrototype.construct.call(this);

    this.addRenderer(MeshRenderer.create(this), false, false);
    this.addRenderer(SpriteRenderer.create(this), false, false);
    this.sortRenderers();

    return this;
};

RendererPrototype.destructor = function() {

    ClassPrototype.destructor.call(this);

    this.context.clearGL();
    this.renderers = {};
    this.__rendererArray.length = 0;

    return this;
};

RendererPrototype.__onContextCreation = function() {
    var renderers = this.__rendererArray,
        i = -1,
        il = renderers.length - 1;

    while (i++ < il) {
        renderers[i].init();
    }

    return this;
};

RendererPrototype.__onContextDestroy = function() {
    var renderers = this.__rendererArray,
        i = -1,
        il = renderers.length - 1;

    while (i++ < il) {
        renderers[i].clear();
    }

    return this;
};

RendererPrototype.addRenderer = function(renderer, override, sort) {
    var renderers = this.__rendererArray,
        rendererHash = this.renderers,
        index = rendererHash[renderer.componentName];

    if (index && !override) {
        throw new Error("Renderer.addRenderer(renderer, [, override]) pass override=true to override renderers");
    }
    renderers[renderers.length] = rendererHash[renderer.componentName] = renderer;

    if (sort !== false) {
        this.sortRenderers();
    }

    return this;
};

RendererPrototype.removeRenderer = function(componentName) {
    var renderers = this.__rendererArray,
        rendererHash = this.renderers,
        renderer = rendererHash[componentName];

    if (renderer) {
        renderers.splice(indexOf(renderers, renderer), 1);
        delete rendererHash[componentName];
    }

    return this;
};

RendererPrototype.sortRenderers = function() {
    this.__rendererArray.sort(sortRenderers);
    return this;
};

function sortRenderers(a, b) {
    return a.order - b.order;
}

RendererPrototype.setCanvas = function(canvas, attributes) {
    var context = this.context;

    if (canvas && context.canvas !== canvas) {
        context.off("webglcontextcreation", this.onContextCreation);
        context.off("webglcontextrestored", this.onContextCreation);
        context.off("webglcontextcreationfailed", this.onContextDestroy);
        context.off("webglcontextlost", this.onContextDestroy);
    }

    context.on("webglcontextcreation", this.onContextCreation);
    context.on("webglcontextrestored", this.onContextCreation);
    context.on("webglcontextcreationfailed", this.onContextDestroy);
    context.on("webglcontextlost", this.onContextDestroy);

    context.setCanvas(canvas, attributes);

    return this;
};

RendererPrototype.geometry = function(geometry) {
    var geometries = this.__geometries;
    return geometries[geometry.__id] || (geometries[geometry.__id] = RendererGeometry.create(this.context, geometry));
};

RendererPrototype.material = function(material) {
    var materials = this.__materials;
    return materials[material.__id] || (materials[material.__id] = RendererMaterial.create(this, this.context, material));
};

RendererPrototype.bindMaterial = function(material) {
    this.setSide(material.side);
    this.context.setBlending(material.blending);
    if (material.wireframe) {
        this.context.setLineWidth(material.wireframeLineWidth);
    }
};

RendererPrototype.setSide = function(value) {
    switch (value) {
        case side.FRONT:
            this.context.setCullFace(enums.cullFace.BACK);
            break;
        case side.BACK:
            this.context.setCullFace(enums.cullFace.FRONT);
            break;
        case side.NONE:
            this.context.setCullFace(enums.cullFace.FRONT_AND_BACK);
            break;
        default:
            this.context.setCullFace(enums.cullFace.NONE);
            break;
    }
    return this;
};

var bindBoneUniforms_mat = mat4.create();
RendererPrototype.bindBoneUniforms = function(bones, glUniforms) {
    var boneMatrix = glUniforms.__hash.boneMatrix,
        boneMatrixValue, mat, i, il, index, bone;

    if (boneMatrix) {
        boneMatrixValue = boneMatrix.value;

        mat = bindBoneUniforms_mat;

        i = -1;
        il = bones.length - 1;
        index = 0;

        while (i++ < il) {
            bone = bones[i].components["odin.Bone"];
            mat4.mul(mat, bone.uniform, bone.bindPose);

            boneMatrixValue[index] = mat[0];
            boneMatrixValue[index + 1] = mat[1];
            boneMatrixValue[index + 2] = mat[2];
            boneMatrixValue[index + 3] = mat[3];
            boneMatrixValue[index + 4] = mat[4];
            boneMatrixValue[index + 5] = mat[5];
            boneMatrixValue[index + 6] = mat[6];
            boneMatrixValue[index + 7] = mat[7];
            boneMatrixValue[index + 8] = mat[8];
            boneMatrixValue[index + 9] = mat[9];
            boneMatrixValue[index + 10] = mat[10];
            boneMatrixValue[index + 11] = mat[11];
            boneMatrixValue[index + 12] = mat[12];
            boneMatrixValue[index + 13] = mat[13];
            boneMatrixValue[index + 14] = mat[14];
            boneMatrixValue[index + 15] = mat[15];

            index += 16;
        }

        boneMatrix.set(boneMatrixValue);
    }
};

RendererPrototype.bindUniforms = function(projection, modelView, normalMatrix, uniforms, glUniforms) {
    var glHash = glUniforms.__hash,
        glArray = glUniforms.__array,
        glUniform, uniform, i, il;

    if (glHash.modelViewMatrix) {
        glHash.modelViewMatrix.set(modelView);
    }
    if (glHash.perspectiveMatrix) {
        glHash.perspectiveMatrix.set(projection);
    }
    if (glHash.normalMatrix) {
        glHash.normalMatrix.set(normalMatrix);
    }

    i = -1;
    il = glArray.length - 1;

    while (i++ < il) {
        glUniform = glArray[i];

        if ((uniform = uniforms[glUniform.name])) {
            glUniform.set(uniform);
        }
    }

    return this;
};

RendererPrototype.bindAttributes = function(buffers, vertexBuffer, glAttributes) {
    var glArray = glAttributes.__array,
        i = -1,
        il = glArray.length - 1,
        glAttribute, buffer;

    while (i++ < il) {
        glAttribute = glArray[i];
        buffer = buffers[glAttribute.name];
        glAttribute.set(vertexBuffer, buffer.offset);
    }

    return this;
};

RendererPrototype.render = function(scene, camera) {
    var _this, context, renderers, renderer, managerHash, manager, i, il;

    _this = this;
    context = this.context;
    renderers = this.__rendererArray;
    managerHash = scene.managers;

    context.setViewport(0, 0, camera.width, camera.height);
    context.setClearColor(camera.background, 1);
    context.clearCanvas();

    i = -1;
    il = renderers.length - 1;

    while (i++ < il) {
        renderer = renderers[i];
        manager = managerHash[renderer.componentName];

        if (manager !== undefined && renderer.enabled) {
            renderer.beforeRender(camera, scene, manager);
            manager.forEach(renderer.bindRender(camera, scene, manager));
            renderer.afterRender(camera, scene, manager);
        }
    }

    return this;
};


},
function(require, exports, module, global) {

var mat3 = require(77),
    mat4 = require(79),
    ComponentRenderer = require(161);


var MeshRendererPrototype;


module.exports = MeshRenderer;


function MeshRenderer() {
    ComponentRenderer.call(this);
}
ComponentRenderer.extend(MeshRenderer, "odin.MeshRenderer", "odin.Mesh", 1);
MeshRendererPrototype = MeshRenderer.prototype;

var modelView = mat4.create(),
    normalMatrix = mat3.create();

MeshRendererPrototype.render = function(mesh, camera) {
    var renderer = this.renderer,
        context = renderer.context,
        gl = context.gl,

        components = mesh.entity.components,
        transform = components["odin.Transform"] || components["odin.Transform2D"],

        meshMaterial = mesh.material,
        meshGeometry = mesh.geometry,

        geometry = renderer.geometry(meshGeometry),
        program = renderer.material(meshMaterial).getProgramFor(meshGeometry),

        indexBuffer;

    transform.calculateModelView(camera.view, modelView);
    transform.calculateNormalMatrix(modelView, normalMatrix);

    context.setProgram(program);

    renderer.bindMaterial(meshMaterial);
    renderer.bindUniforms(camera.projection, modelView, normalMatrix, meshMaterial.uniforms, program.uniforms);
    renderer.bindBoneUniforms(mesh.bones, program.uniforms);
    renderer.bindAttributes(geometry.buffers.__hash, geometry.getVertexBuffer(), program.attributes);

    if (meshMaterial.wireframe !== true) {
        indexBuffer = geometry.getIndexBuffer();
        context.setElementArrayBuffer(indexBuffer);
        gl.drawElements(gl.TRIANGLES, indexBuffer.length, gl.UNSIGNED_SHORT, 0);
    } else {
        indexBuffer = geometry.getLineBuffer();
        context.setElementArrayBuffer(indexBuffer);
        gl.drawElements(gl.LINES, indexBuffer.length, gl.UNSIGNED_SHORT, 0);
    }

    return this;
};


},
function(require, exports, module, global) {

var Class = require(2);


var ComponentRendererPrototype;


module.exports = ComponentRenderer;


function renderEach(component) {
    return renderEach.render(
        component,
        renderEach.camera,
        renderEach.scene,
        renderEach.manager
    );
}

renderEach.set = function(render, camera, scene, manager) {
    renderEach.render = render;
    renderEach.camera = camera;
    renderEach.scene = scene;
    renderEach.manager = manager;
    return renderEach;
};


function ComponentRenderer() {
    var _this = this;

    Class.call(this);

    this.renderer = null;
    this.enabled = true;

    this.__render = function(component, camera, scene, manager) {
        _this.render(component, camera, scene, manager);
    };
}

ComponentRenderer.onExtend = function(child, className, componentName, order) {
    child.componentName = child.prototype.componentName = componentName;
    child.order = child.prototype.order = order || 0;
};

Class.extend(ComponentRenderer, "odin.ComponentRenderer");
ComponentRendererPrototype = ComponentRenderer.prototype;

ComponentRenderer.order = ComponentRendererPrototype.order = 0;

ComponentRendererPrototype.construct = function(renderer) {
    this.renderer = renderer;
    return this;
};

ComponentRendererPrototype.destructor = function() {
    this.renderer = null;
    return this;
};

ComponentRendererPrototype.bindRender = function(camera, scene, manager) {
    return renderEach.set(this.__render, camera, scene, manager);
};

ComponentRendererPrototype.enable = function() {
    this.enabled = true;
    return this;
};

ComponentRendererPrototype.disable = function() {
    this.enabled = false;
    return this;
};

ComponentRendererPrototype.init = function() {};

ComponentRendererPrototype.clear = function() {};

ComponentRendererPrototype.beforeRender = function( /* camera, scene, manager */ ) {};

ComponentRendererPrototype.afterRender = function( /* camera, scene, manager */ ) {};

ComponentRendererPrototype.render = function( /* component, camera, scene, manager */ ) {};


},
function(require, exports, module, global) {

var mat3 = require(77),
    mat4 = require(79),
    vec2 = require(68),
    vec4 = require(39),
    WebGLContext = require(30),
    Geometry = require(153),
    ComponentRenderer = require(161);


var depth = WebGLContext.enums.depth,

    NativeUint16Array = typeof(Uint16Array) !== "undefined" ? Uint16Array : Array,
    NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array,

    SpriteRendererPrototype;


module.exports = SpriteRenderer;


function SpriteRenderer() {
    var geometry = Geometry.create(),
        uv = [
            0.0, 0.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0
        ];

    ComponentRenderer.call(this);

    geometry
        .addAttribute("position", 12, 3, NativeFloat32Array, false, [-0.5, 0.5, 0.0, -0.5, -0.5, 0.0,
            0.5, 0.5, 0.0,
            0.5, -0.5, 0.0
        ])
        .addAttribute("normal", 12, 3, NativeFloat32Array, false, [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0
        ])
        .addAttribute("tangent", 16, 4, NativeFloat32Array, false, [
            0.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0
        ])
        .addAttribute("uv", 8, 2, NativeFloat32Array, false, uv)
        .addAttribute("uv2", 8, 2, NativeFloat32Array, false, uv);

    geometry.index = new NativeUint16Array([
        0, 1, 2, 3, 2, 1
    ]);

    this.geometry = geometry;
    this.spriteGeometry = null;

    this.__previous = null;
}
ComponentRenderer.extend(SpriteRenderer, "odin.SpriteRenderer", "odin.Sprite", 0);
SpriteRendererPrototype = SpriteRenderer.prototype;

SpriteRendererPrototype.init = function() {
    this.spriteGeometry = this.renderer.geometry(this.geometry);
};

SpriteRendererPrototype.beforeRender = function() {
    var context = this.renderer.context;

    this.__previous = context.__depthFunc;
    context.setDepthFunc(depth.None);
};

SpriteRendererPrototype.afterRender = function() {
    this.renderer.context.setDepthFunc(this.__previous);
};

var size = vec2.create(1, 1),
    clipping = vec4.create(0, 0, 1, 1),
    modelView = mat4.create(),
    normalMatrix = mat3.create();

SpriteRendererPrototype.render = function(sprite, camera) {
    var renderer = this.renderer,
        context = renderer.context,
        gl = context.gl,

        components = sprite.entity.components,
        transform = components["odin.Transform"] || components["odin.Transform2D"],

        spriteMaterial = sprite.material,
        spriteGeometry = this.geometry,

        geometry = renderer.geometry(spriteGeometry),
        program = renderer.material(spriteMaterial).getProgramFor(sprite),

        glUniforms = program.uniforms,
        glUniformHash = glUniforms.__hash,

        indexBuffer;

    transform.calculateModelView(camera.view, modelView);
    transform.calculateNormalMatrix(modelView, normalMatrix);

    context.setProgram(program);

    vec2.set(size, sprite.width, sprite.height);
    glUniformHash.size.set(size);

    if (glUniformHash.clipping) {
        vec4.set(clipping, sprite.x, sprite.y, sprite.w, sprite.h);
        glUniformHash.clipping.set(clipping);
    }

    renderer.bindMaterial(spriteMaterial);
    renderer.bindUniforms(camera.projection, modelView, normalMatrix, spriteMaterial.uniforms, glUniforms);
    renderer.bindAttributes(geometry.buffers.__hash, geometry.getVertexBuffer(), program.attributes);

    if (spriteMaterial.wireframe !== true) {
        indexBuffer = geometry.getIndexBuffer();
        context.setElementArrayBuffer(indexBuffer);
        gl.drawElements(gl.TRIANGLES, indexBuffer.length, gl.UNSIGNED_SHORT, 0);
    } else {
        indexBuffer = geometry.getLineBuffer();
        context.setElementArrayBuffer(indexBuffer);
        gl.drawElements(gl.LINES, indexBuffer.length, gl.UNSIGNED_SHORT, 0);
    }

    return this;
};


},
function(require, exports, module, global) {

var FastHash = require(60);


var NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array,
    NativeUint16Array = typeof(Uint16Array) !== "undefined" ? Uint16Array : Array,
    RendererGeometryPrototype;


module.exports = RendererGeometry;


function RendererGeometry() {

    this.context = null;
    this.geometry = null;

    this.buffers = new FastHash("name");

    this.glVertexBuffer = null;
    this.glIndexBuffer = null;
    this.glIndexLineBuffer = null;

    this.needsVertexCompile = null;
    this.needsIndexCompile = null;
    this.needsLineCompile = null;
}
RendererGeometryPrototype = RendererGeometry.prototype;

RendererGeometry.create = function(context, geometry) {
    return (new RendererGeometry()).construct(context, geometry);
};

RendererGeometryPrototype.construct = function(context, geometry) {

    this.context = context;
    this.geometry = geometry;

    this.needsVertexCompile = true;
    this.needsIndexCompile = true;
    this.needsLineCompile = true;

    return this;
};

RendererGeometryPrototype.destructor = function() {

    this.context = null;
    this.geometry = null;

    this.buffers.clear();

    this.glVertexBuffer = null;
    this.glIndexBuffer = null;
    this.glIndexLineBuffer = null;

    this.needsVertexCompile = false;
    this.needsIndexCompile = false;
    this.needsLineCompile = false;

    return this;
};

RendererGeometryPrototype.getVertexBuffer = function() {
    var glVertexBuffer = this.glVertexBuffer;

    if (glVertexBuffer) {
        if (this.needsVertexCompile === false) {
            return glVertexBuffer;
        } else {
            glVertexBuffer.needsCompile = true;
            return RendererGeometry_compileVertexBuffer(this);
        }
    } else {
        return RendererGeometry_compileVertexBuffer(this);
    }
};

RendererGeometryPrototype.getLineBuffer = function() {
    var glIndexLineBuffer = this.glIndexLineBuffer;

    if (glIndexLineBuffer) {
        if (this.needsLineCompile === false) {
            return glIndexLineBuffer;
        } else {
            glIndexLineBuffer.needsCompile = true;
            return RendererGeometry_compileLineIndexBuffer(this);
        }
    } else {
        return RendererGeometry_compileLineIndexBuffer(this);
    }
};

RendererGeometryPrototype.getIndexBuffer = function() {
    var glIndexBuffer = this.glIndexBuffer;

    if (glIndexBuffer) {
        if (this.needsIndexCompile === false) {
            return glIndexBuffer;
        } else {
            glIndexBuffer.needsCompile = true;
            return RendererGeometry_compileIndexBuffer(this);
        }
    } else {
        return RendererGeometry_compileIndexBuffer(this);
    }
};

function RendererGeometry_compileLineIndexBuffer(_this) {
    var context = _this.context,
        gl = context.gl,

        geometry = _this.geometry,
        indexArray = geometry.index,

        length = indexArray.length,
        i = 0,

        lineBuffer = new NativeUint16Array(length * 2),
        glIndexLineBuffer = _this.glIndexLineBuffer || (_this.glIndexLineBuffer = context.createBuffer()),

        triangleIndex = 0,
        index = 0;

    while (i < length) {
        lineBuffer[index] = indexArray[triangleIndex];
        lineBuffer[index + 1] = indexArray[triangleIndex + 1];

        lineBuffer[index + 2] = indexArray[triangleIndex + 1];
        lineBuffer[index + 3] = indexArray[triangleIndex + 2];

        lineBuffer[index + 4] = indexArray[triangleIndex + 2];
        lineBuffer[index + 5] = indexArray[triangleIndex];

        triangleIndex += 3;
        index += 6;
        i += 3;
    }

    _this.needsLineCompile = false;

    return glIndexLineBuffer.compile(gl.ELEMENT_ARRAY_BUFFER, lineBuffer, 0, gl.STATIC_DRAW);
}

function RendererGeometry_compileIndexBuffer(_this) {
    var context = _this.context,
        gl = context.gl,
        glIndexBuffer = _this.glIndexBuffer || (_this.glIndexBuffer = context.createBuffer());

    glIndexBuffer.compile(gl.ELEMENT_ARRAY_BUFFER, _this.geometry.index, 0, gl.STATIC_DRAW);
    _this.needsIndexCompile = false;

    return glIndexBuffer;
}

function RendererGeometry_compileVertexBuffer(_this) {
    var context = _this.context,
        gl = context.gl,

        geometry = _this.geometry,
        attributes = geometry.attributes.__array,

        glVertexBuffer = _this.glVertexBuffer || (_this.glVertexBuffer = context.createBuffer()),
        buffers = _this.buffers,

        vertexLength = 0,
        stride = 0,
        last = 0,
        offset = 0,

        i = -1,
        il = attributes.length - 1,

        vertexArray, attribute, attributeArray, itemSize, index, j, jl, k, kl;

    buffers.clear();

    while (i++ < il) {
        attribute = attributes[i];
        vertexLength += attribute.array.length;
        stride += attribute.itemSize;
    }

    vertexArray = new NativeFloat32Array(vertexLength);

    i = -1;
    while (i++ < il) {
        attribute = attributes[i];
        attributeArray = attribute.array;

        j = 0;
        jl = vertexLength;

        itemSize = attribute.itemSize;
        index = 0;

        offset += last;
        last = itemSize;

        while (j < jl) {
            k = -1;
            kl = itemSize - 1;

            while (k++ < kl) {
                vertexArray[offset + j + k] = attributeArray[index + k];
            }

            j += stride;
            index += itemSize;
        }

        buffers.add(new DataBuffer(attribute.name, offset * 4));
    }

    glVertexBuffer.compile(gl.ARRAY_BUFFER, vertexArray, stride * 4, gl.STATIC_DRAW);
    _this.needsVertexCompile = false;

    return glVertexBuffer;
}

function DataBuffer(name, offset) {
    this.name = name;
    this.offset = offset;
}


},
function(require, exports, module, global) {

var has = require(3);


var RendererMaterialPrototype;


module.exports = RendererMaterial;


function RendererMaterial() {

    this.renderer = null;
    this.context = null;
    this.material = null;

    this.programs = {};

    this.needsCompile = null;
}
RendererMaterialPrototype = RendererMaterial.prototype;

RendererMaterial.create = function(renderer, context, material) {
    return (new RendererMaterial()).construct(renderer, context, material);
};

RendererMaterialPrototype.construct = function(renderer, context, material) {

    this.renderer = renderer;
    this.context = context;
    this.material = material;

    return this;
};

RendererMaterialPrototype.destructor = function() {
    var programs = this.programs,
        id;

    this.renderer = null;
    this.context = null;
    this.material = null;

    for (id in programs) {
        if (has(programs, id)) {
            delete programs[id];
        }
    }

    this.programs = null;

    return this;
};

RendererMaterialPrototype.getProgramFor = function(data) {
    var programData = this.renderer.__programHash[data.__id],
        program;

    if (programData) {
        program = programData.program;

        if (program.needsCompile === false) {
            return program;
        } else {
            return RendererMaterial_compile(this, data);
        }
    } else {
        return RendererMaterial_compile(this, data);
    }
};

function ProgramData() {
    var _this = this;

    this.used = 1;
    this.program = null;
    this.vertex = null;
    this.fragment = null;

    this.onUpdate = function() {
        _this.program.needsUpdate = true;
    };
}

function RendererMaterial_compile(_this, data) {
    var id = data.__id,

        renderer = _this.renderer,

        programs = renderer.__programs,
        programHash = renderer.__programHash,

        programData = programHash[id],

        i = -1,
        il = programs.length - 1,
        program, shader, options, vertex, fragment;

    if (programData) {
        if (_this.programs[id] !== programData) {
            _this.programs[id] = programData;
            programData.used += 1;
            data.on("update", programData.onUpdate);
        }
        program = programData.program;
    } else {
        shader = _this.material.shader;
        options = getOptions(data);

        vertex = shader.vertex(options);
        fragment = shader.fragment(options);

        while (i++ < il) {
            program = programs[i];

            if (program.vertex === vertex && program.fragment === fragment) {
                programData = program;
                break;
            }
        }

        if (!programData) {
            programData = new ProgramData();
            program = programData.program = _this.context.createProgram();
        } else {
            programData.used += 1;
            program = programData.program;
        }

        programData.vertex = vertex;
        programData.fragment = fragment;

        program.compile(vertex, fragment);

        _this.programs[id] = programHash[id] = programs[programs.length] = programData;
        data.on("update", programData.onUpdate);
    }

    return program;
}

function getOptions(data) {
    var options = {},
        material;

    options.boneCount = data.bones ? data.bones.length : 0;
    options.boneWeightCount = data.boneWeightCount || 0;
    options.useBones = options.boneCount !== 0;
    options.isSprite = data.x != null && data.y != null && data.width != null && data.height != null;

    if (data.material) {
        material = data.material;

        options.receiveShadow = material.receiveShadow;
        options.castShadow = material.castShadow;
        options.side = material.side;
        options.wireframe = material.wireframe;
    }

    return options;
}


},
function(require, exports, module, global) {

var Class = require(2);


var PluginPrototype;


module.exports = Plugin;


function Plugin() {

    Class.call(this);

    this.scene = null;
}
Class.extend(Plugin, "odin.Plugin");
PluginPrototype = Plugin.prototype;

PluginPrototype.init = function init() {
    this.emit("init");
    return this;
};

PluginPrototype.awake = function awake() {
    this.emit("awake");
    return this;
};

PluginPrototype.clear = function clear(emitEvent) {
    if (emitEvent !== false) {
        this.emit("clear");
    }
    return this;
};

PluginPrototype.update = function update() {
    return this;
};

PluginPrototype.destroy = function(emitEvent) {
    var scene = this.scene;

    if (scene) {
        if (emitEvent !== false) {
            this.clear(emitEvent);
            this.emit("destroy");
        }
        scene.removePlugin(this);
    }

    return this;
};


},
function(require, exports, module, global) {

var indexOf = require(61),
    Class = require(2);


var ClassPrototype = Class.prototype,
    ComponentManagerPrototype;


module.exports = ComponentManager;


function ComponentManager() {

    Class.call(this);

    this.scene = null;
    this.__components = [];
}

ComponentManager.onExtend = function(child, className, order) {
    child.order = child.prototype.order = order != null ? order : 0;
};

Class.extend(ComponentManager, "odin.ComponentManager");
ComponentManagerPrototype = ComponentManager.prototype;

ComponentManager.order = ComponentManagerPrototype.order = 0;

ComponentManagerPrototype.construct = function() {

    ClassPrototype.construct.call(this);

    return this;
};

ComponentManagerPrototype.destructor = function() {

    ClassPrototype.destructor.call(this);

    this.scene = null;
    this.__components.length = 0;

    return this;
};

ComponentManagerPrototype.onAddToScene = function() {
    return this;
};

ComponentManagerPrototype.onRemoveFromScene = function() {
    return this;
};

ComponentManagerPrototype.isEmpty = function() {

    return this.__components.length === 0;
};

ComponentManagerPrototype.sort = function() {
    this.__components.sort(this.sortFunction);
    return this;
};

ComponentManagerPrototype.sortFunction = function() {
    return 0;
};

ComponentManagerPrototype.init = function() {
    var components = this.__components,
        i = -1,
        il = components.length - 1;

    while (i++ < il) {
        components[i].init();
    }

    return this;
};

ComponentManagerPrototype.awake = function() {
    var components = this.__components,
        i = -1,
        il = components.length - 1;

    while (i++ < il) {
        components[i].awake();
    }

    return this;
};

ComponentManagerPrototype.update = function() {
    var components = this.__components,
        i = -1,
        il = components.length - 1;

    while (i++ < il) {
        components[i].update();
    }

    return this;
};

ComponentManagerPrototype.clear = function(emitEvent) {
    if (emitEvent !== false) {
        this.emit("clear");
    }
    return this;
};

ComponentManagerPrototype.forEach = function(callback) {
    var components = this.__components,
        i = -1,
        il = components.length - 1;

    while (i++ < il) {
        if (callback(components[i], i) === false) {
            return false;
        }
    }

    return true;
};

ComponentManagerPrototype.has = function(component) {
    return indexOf(this.__components, component) !== -1;
};

ComponentManagerPrototype.addComponent = function(component) {
    var components = this.__components,
        index = indexOf(components, component);

    if (index === -1) {
        components[components.length] = component;
    }

    return this;
};

ComponentManagerPrototype.removeComponent = function(component) {
    var components = this.__components,
        index = indexOf(components, component);

    if (index !== -1) {
        components.splice(index, 1);
    }

    return this;
};


},
function(require, exports, module, global) {

var Class = require(2),
    ComponentManager = require(166);


var ClassPrototype = Class.prototype,
    ComponentPrototype;


module.exports = Component;


function Component() {

    Class.call(this);

    this.manager = null;
    this.entity = null;
}

Component.onExtend = function(child, className, manager) {
    manager = manager || ComponentManager;

    child.Manager = child.prototype.Manager = manager;
    manager.prototype.componentName = child.className;
};

Class.extend(Component, "odin.Component");
ComponentPrototype = Component.prototype;

Component.className = ComponentPrototype.className = "odin.Component";
Component.Manager = ComponentPrototype.Manager = ComponentManager;

ComponentPrototype.construct = function() {

    ClassPrototype.construct.call(this);

    return this;
};

ComponentPrototype.destructor = function() {

    ClassPrototype.destructor.call(this);

    this.manager = null;
    this.entity = null;

    return this;
};

ComponentPrototype.init = function() {
    this.emit("init");
    return this;
};

ComponentPrototype.awake = function() {
    this.emit("awake");
    return this;
};

ComponentPrototype.clear = function(emitEvent) {
    if (emitEvent !== false) {
        this.emit("clear");
    }
    return this;
};

ComponentPrototype.update = function() {
    return this;
};

ComponentPrototype.destroy = function(emitEvent) {
    var entity = this.entity;

    if (entity) {
        if (emitEvent !== false) {
            this.emit("destroy");
        }
        entity.removeComponent(this);

        return this;
    } else {
        return this;
    }
};


},
function(require, exports, module, global) {

var vec3 = require(38),
    quat = require(154),
    mat3 = require(77),
    mat4 = require(79),
    Component = require(167),
    TransformManager = require(169);


var ComponentPrototype = Component.prototype,
    TransformPrototype;


module.exports = Transform;


function Transform() {

    Component.call(this);

    this.position = vec3.create();
    this.rotation = quat.create();
    this.scale = vec3.create(1.0, 1.0, 1.0);

    this.matrix = mat4.create();
    this.matrixWorld = mat4.create();
}
Component.extend(Transform, "odin.Transform", TransformManager);
TransformPrototype = Transform.prototype;

TransformPrototype.construct = function() {

    ComponentPrototype.construct.call(this);

    return this;
};

TransformPrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    vec3.set(this.position, 0.0, 0.0, 0.0);
    quat.set(this.rotation, 0.0, 0.0, 0.0, 1.0);
    vec3.set(this.scale, 1.0, 1.0, 1.0);

    mat4.identity(this.matrix);
    mat4.identity(this.matrixWorld);

    return this;
};

TransformPrototype.init = function() {

    ComponentPrototype.init.call(this);

    return this;
};

TransformPrototype.setPosition = function(v) {
    vec3.copy(this.position, v);
    return this;
};

TransformPrototype.setRotation = function(v) {
    quat.copy(this.rotation, v);
    return this;
};

TransformPrototype.setScale = function(v) {
    vec3.copy(this.scale, v);
    return this;
};

var translate_vec3 = vec3.create();
TransformPrototype.translate = function(translation, relativeTo) {
    var thisPosition = this.position,
        v = vec3.copy(translate_vec3, translation);

    if (relativeTo && relativeTo.position) {
        vec3.transformQuat(v, v, relativeTo.position);
    } else if (relativeTo) {
        vec3.transformQuat(v, v, relativeTo);
    }

    vec3.add(thisPosition, thisPosition, v);

    return this;
};

var rotate_vec3 = vec3.create();
TransformPrototype.rotate = function(rotation, relativeTo) {
    var thisRotation = this.rotation,
        v = vec3.copy(rotate_vec3, rotation);

    if (relativeTo && relativeTo.rotation) {
        vec3.transformQuat(v, v, relativeTo.rotation);
    } else if (relativeTo) {
        vec3.transformQuat(v, v, relativeTo);
    }

    quat.rotate(thisRotation, thisRotation, v[0], v[1], v[2]);

    return this;
};

var lookAt_mat = mat4.create(),
    lookAt_vec = vec3.create(),
    lookAt_dup = vec3.create(0.0, 0.0, 1.0);
TransformPrototype.lookAt = function(target, up) {
    var mat = lookAt_mat,
        vec = lookAt_vec;

    up = up || lookAt_dup;

    if (target.matrixWorld) {
        vec3.transformMat4(vec, vec3.set(vec, 0.0, 0.0, 0.0), target.matrixWorld);
    } else {
        vec3.copy(vec, target);
    }

    mat4.lookAt(mat, this.position, vec, up);
    quat.fromMat4(this.rotation, mat);

    return this;
};

TransformPrototype.localToWorld = function(out, v) {
    return vec3.transformMat4(out, v, this.matrixWorld);
};

var worldToLocal_mat = mat4.create();
TransformPrototype.worldToLocal = function(out, v) {
    return vec3.transformMat4(out, v, mat4.inverse(worldToLocal_mat, this.matrixWorld));
};

TransformPrototype.update = function() {
    var matrix = this.matrix,
        entity = this.entity,
        parent = entity && entity.parent,
        parentTransform = parent && parent.components["odin.Transform"];

    mat4.compose(matrix, this.position, this.scale, this.rotation);

    if (parentTransform) {
        mat4.mul(this.matrixWorld, parentTransform.matrixWorld, matrix);
    } else {
        mat4.copy(this.matrixWorld, matrix);
    }

    return this;
};

TransformPrototype.getMatrixWorld = function() {
    return this.matrixWorld;
};

TransformPrototype.calculateModelView = function(viewMatrix, modelView) {
    return mat4.mul(modelView, viewMatrix, this.matrixWorld);
};

TransformPrototype.calculateNormalMatrix = function(modelView, normalMatrix) {
    return mat3.transpose(normalMatrix, mat3.inverseMat4(normalMatrix, modelView));
};

TransformPrototype.toJSON = function(json) {

    json = ComponentPrototype.toJSON.call(this, json);

    json.position = vec3.copy(json.position || [], this.position);
    json.rotation = quat.copy(json.rotation || [], this.rotation);
    json.scale = vec3.copy(json.scale || [], this.scale);

    return json;
};

TransformPrototype.fromJSON = function(json) {

    ComponentPrototype.fromJSON.call(this, json);

    vec3.copy(this.position, json.position);
    quat.copy(this.rotation, json.rotation);
    vec3.copy(this.scale, json.scale);

    return this;
};


},
function(require, exports, module, global) {

var ComponentManager = require(166);


var TransformManagerPrototype;


module.exports = TransformManager;


function TransformManager() {
    ComponentManager.call(this);
}
ComponentManager.extend(TransformManager, "odin.TransformManager", 9999);
TransformManagerPrototype = TransformManager.prototype;

TransformManagerPrototype.sortFunction = function(a, b) {
    return a.entity.depth - b.entity.depth;
};


},
function(require, exports, module, global) {

var vec2 = require(68),
    mat3 = require(77),
    mat32 = require(171),
    mat4 = require(79),
    Component = require(167),
    Transform2DManager = require(172);


var ComponentPrototype = Component.prototype,
    Transform2DPrototype;


module.exports = Transform2D;


function Transform2D() {

    Component.call(this);

    this.position = vec2.create();
    this.rotation = 0.0;
    this.scale = vec2.create(1.0, 1.0);

    this.matrix = mat32.create();
    this.matrixWorld = mat32.create();
}
Component.extend(Transform2D, "odin.Transform2D", Transform2DManager);
Transform2DPrototype = Transform2D.prototype;

Transform2DPrototype.construct = function() {

    ComponentPrototype.construct.call(this);

    return this;
};

Transform2DPrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    vec2.set(this.position, 0.0, 0.0);
    this.rotation = 0.0;
    vec2.set(this.scale, 1.0, 1.0);

    mat32.identity(this.matrix);
    mat32.identity(this.matrixWorld);

    return this;
};

Transform2DPrototype.init = function() {

    ComponentPrototype.init.call(this);

    return this;
};

Transform2DPrototype.setPosition = function(v) {
    vec2.copy(this.position, v);
    return this;
};

Transform2DPrototype.setRotation = function(value) {
    this.rotation = value;
    return this;
};

Transform2DPrototype.setScale = function(v) {
    vec2.copy(this.scale, v);
    return this;
};

var translate_vec2 = vec2.create();
Transform2DPrototype.translate = function(translation, relativeTo) {
    var thisPosition = this.position,
        v = vec2.copy(translate_vec2, translation);

    if (relativeTo && relativeTo.position) {
        vec2.transformQuat(v, v, relativeTo.position);
    } else if (relativeTo) {
        vec2.transformQuat(v, v, relativeTo);
    }

    vec2.add(thisPosition, thisPosition, v);

    return this;
};

Transform2DPrototype.rotate = function(rotation) {
    this.rotation = rotation;
    return this;
};

var lookAt_mat = mat32.create(),
    lookAt_vec = vec2.create();
Transform2DPrototype.lookAt = function(target) {
    var mat = lookAt_mat,
        vec = lookAt_vec;

    if (target.matrixWorld) {
        vec2.transformMat4(vec, vec2.set(vec, 0.0, 0.0), target.matrixWorld);
    } else {
        vec2.copy(vec, target);
    }

    mat32.lookAt(mat, this.position, vec);
    this.rotation = mat32.getRotation(mat);

    return this;
};

Transform2DPrototype.localToWorld = function(out, v) {
    return vec2.transformMat32(out, v, this.matrixWorld);
};

var worldToLocal_mat = mat32.create();
Transform2DPrototype.worldToLocal = function(out, v) {
    return vec2.transformMat32(out, v, mat32.inverse(worldToLocal_mat, this.matrixWorld));
};

Transform2DPrototype.update = function() {
    var matrix = this.matrix,
        entity = this.entity,
        parent = entity && entity.parent,
        parentTransform2D = parent && parent.components["odin.Transform2D"];

    mat32.compose(matrix, this.position, this.scale, this.rotation);

    if (parentTransform2D) {
        mat32.mul(this.matrixWorld, parentTransform2D.matrixWorld, matrix);
    } else {
        mat32.copy(this.matrixWorld, matrix);
    }

    return this;
};

var getMatrixWorld_mat4 = mat4.create();
Transform2DPrototype.getMatrixWorld = function() {
    var tmp = getMatrixWorld_mat4,
        mw = this.matrixWorld;

    tmp[0] = mw[0];
    tmp[4] = mw[2];
    tmp[1] = mw[1];
    tmp[5] = mw[3];
    tmp[12] = mw[4];
    tmp[13] = mw[5];

    return tmp;
};

Transform2DPrototype.calculateModelView = function(viewMatrix, modelView) {
    return mat4.mul(modelView, viewMatrix, this.getMatrixWorld());
};

Transform2DPrototype.calculateNormalMatrix = function(modelView, normalMatrix) {
    return mat3.transpose(normalMatrix, mat3.inverseMat4(normalMatrix, modelView));
};

Transform2DPrototype.toJSON = function(json) {

    json = ComponentPrototype.toJSON.call(this, json);

    json.position = vec2.copy(json.position || [], this.position);
    json.rotation = json.rotation;
    json.scale = vec2.copy(json.scale || [], this.scale);

    return json;
};

Transform2DPrototype.fromJSON = function(json) {

    ComponentPrototype.fromJSON.call(this, json);

    vec2.copy(this.position, json.position);
    this.rotation = json.rotation;
    vec2.copy(this.scale, json.scale);

    return this;
};


},
function(require, exports, module, global) {

var mathf = require(31),
    vec2 = require(68);


var mat32 = exports;


mat32.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


mat32.create = function(m11, m12, m13, m21, m22, m23) {
    var out = new mat32.ArrayType(6);

    out[0] = m11 !== undefined ? m11 : 1;
    out[2] = m12 !== undefined ? m12 : 0;
    out[1] = m21 !== undefined ? m21 : 0;
    out[3] = m22 !== undefined ? m22 : 1;
    out[4] = m13 !== undefined ? m13 : 0;
    out[5] = m23 !== undefined ? m23 : 0;

    return out;
};

mat32.copy = function(out, a) {

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];

    return out;
};

mat32.clone = function(a) {
    var out = new mat32.ArrayType(6);

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];

    return out;
};

mat32.set = function(out, m11, m12, m13, m21, m22, m23) {

    out[0] = m11 !== undefined ? m11 : 1;
    out[2] = m12 !== undefined ? m12 : 0;
    out[1] = m21 !== undefined ? m21 : 0;
    out[3] = m22 !== undefined ? m22 : 1;
    out[4] = m13 !== undefined ? m13 : 0;
    out[5] = m23 !== undefined ? m23 : 0;

    return out;
};

mat32.identity = function(out) {

    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;

    return out;
};

mat32.zero = function(out) {

    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 0;

    return out;
};

mat32.mul = function(out, a, b) {
    var a11 = a[0],
        a12 = a[2],
        a13 = a[4],
        a21 = a[1],
        a22 = a[3],
        a23 = a[5],

        b11 = b[0],
        b12 = b[2],
        b13 = b[4],
        b21 = b[1],
        b22 = b[3],
        b23 = b[5];

    out[0] = a11 * b11 + a21 * b12;
    out[2] = a12 * b11 + a22 * b12;

    out[1] = a11 * b21 + a21 * b22;
    out[3] = a12 * b21 + a22 * b22;

    out[4] = a11 * b13 + a12 * b23 + a13;
    out[5] = a21 * b13 + a22 * b23 + a23;

    return out;
};

mat32.smul = function(out, a, s) {

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;
    out[4] = a[4] * s;
    out[5] = a[5] * s;

    return out;
};

mat32.sdiv = function(out, a, s) {
    s = s !== 0 ? 1 / s : s;

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;
    out[4] = a[4] * s;
    out[5] = a[5] * s;

    return out;
};

mat32.determinant = function(a) {

    return a[0] * a[3] - a[2] * a[1];
};

mat32.inverse = function(out, a) {
    var m11 = a[0],
        m12 = a[2],
        m13 = a[4],
        m21 = a[1],
        m22 = a[3],
        m23 = a[5],

        det = m11 * m22 - m12 * m21;

    if (det === 0) {
        return mat32.identity(out);
    }
    det = 1 / det;

    out[0] = m22 * det;
    out[1] = -m12 * det;
    out[2] = -m21 * det;
    out[3] = m11 * det;

    out[4] = (m21 * m23 - m22 * m13) * det;
    out[5] = -(m11 * m23 - m12 * m13) * det;

    return out;
};

mat32.transpose = function(out, a) {
    var tmp;

    if (out === a) {
        tmp = a[1];
        out[1] = a[2];
        out[2] = tmp;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }

    return out;
};

mat32.lookAt = function(out, eye, target) {
    var x = target[0] - eye[0],
        y = target[1] - eye[1],
        a = mathf.atan2(y, x) - mathf.HALF_PI,
        c = mathf.cos(a),
        s = mathf.sin(a);

    out[0] = c;
    out[1] = s;
    out[2] = -s;
    out[3] = c;

    return out;
};

mat32.compose = function(out, position, scale, angle) {
    var sx = scale[0],
        sy = scale[1],
        c = mathf.cos(angle),
        s = mathf.sin(angle);

    out[0] = c * sx;
    out[1] = s * sx;
    out[2] = -s * sy;
    out[3] = c * sy;

    out[4] = position[0];
    out[5] = position[1];

    return out;
};

mat32.decompose = function(out, position, scale) {
    var m11 = out[0],
        m12 = out[1],
        sx = vec2.lengthValues(m11, m12),
        sy = vec2.lengthValues(out[2], out[3]);

    position[0] = out[4];
    position[1] = out[5];

    scale[0] = sx;
    scale[1] = sy;

    return mathf.atan2(m12, m11);
};

mat32.setRotation = function(out, angle) {
    var c = mathf.cos(angle),
        s = mathf.sin(angle);

    out[0] = c;
    out[1] = s;
    out[2] = -s;
    out[3] = c;

    return out;
};

mat32.getRotation = function(out) {

    return mathf.atan2(out[1], out[0]);
};

mat32.setPosition = function(out, v) {

    out[4] = v[0];
    out[5] = v[1];

    return out;
};

mat32.getPosition = function(out, v) {

    v[0] = out[4];
    v[1] = out[5];

    return out;
};

mat32.extractPosition = function(out, a) {

    out[4] = a[4];
    out[5] = a[5];

    return out;
};

mat32.extractRotation = function(out, a) {
    var m11 = a[0],
        m12 = a[2],
        m21 = a[1],
        m22 = a[3],

        x = m11 * m11 + m21 * m21,
        y = m12 * m12 + m22 * m22,

        sx = x !== 0 ? 1 / mathf.sqrt(x) : 0,
        sy = y !== 0 ? 1 / mathf.sqrt(y) : 0;

    out[0] = m11 * sx;
    out[1] = m21 * sx;

    out[2] = m12 * sy;
    out[3] = m22 * sy;

    return out;
};

mat32.translate = function(out, a, v) {
    var x = v[0],
        y = v[1];

    out[4] = a[0] * x + a[2] * y + a[4];
    out[5] = a[1] * x + a[3] * y + a[5];

    return out;
};

mat32.rotate = function(out, a, angle) {
    var m11 = a[0],
        m12 = a[2],
        m21 = a[1],
        m22 = a[3],

        s = mathf.sin(angle),
        c = mathf.cos(angle);

    out[0] = m11 * c + m12 * s;
    out[1] = m11 * -s + m12 * c;
    out[2] = m21 * c + m22 * s;
    out[3] = m21 * -s + m22 * c;

    return out;
};

mat32.scale = function(out, a, v) {
    var x = v[0],
        y = v[1];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[4] = a[4] * x;

    out[2] = a[2] * y;
    out[3] = a[3] * y;
    out[5] = a[5] * y;

    return out;
};

mat32.orthographic = function(out, left, right, top, bottom) {
    var w = right - left,
        h = top - bottom,

        x = (right + left) / w,
        y = (top + bottom) / h;

    out[0] = 2 / w;
    out[1] = 0;
    out[2] = 0;
    out[3] = 2 / h;
    out[4] = -x;
    out[5] = -y;

    return out;
};

mat32.equal = function(a, b) {
    return !(
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3] ||
        a[4] !== b[4] ||
        a[5] !== b[5]
    );
};

mat32.notEqual = function(a, b) {
    return (
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3] ||
        a[4] !== b[4] ||
        a[5] !== b[5]
    );
};


},
function(require, exports, module, global) {

var ComponentManager = require(166);


var Transform2DManagerPrototype;


module.exports = Transform2DManager;


function Transform2DManager() {
    ComponentManager.call(this);
}
ComponentManager.extend(Transform2DManager, "odin.Transform2DManager", 9999);
Transform2DManagerPrototype = Transform2DManager.prototype;

Transform2DManagerPrototype.sortFunction = function(a, b) {
    return a.entity.depth - b.entity.depth;
};


},
function(require, exports, module, global) {

var isNumber = require(33),
    Component = require(167),
    CameraManager = require(174),
    mathf = require(31),
    vec2 = require(68),
    vec3 = require(38),
    mat4 = require(79),
    color = require(37);


var ComponentPrototype = Component.prototype,
    CameraPrototype;


module.exports = Camera;


function Camera() {

    Component.call(this);

    this.width = 960;
    this.height = 640;
    this.invWidth = 1 / this.width;
    this.invHeight = 1 / this.height;

    this.autoResize = true;
    this.background = color.create(0.5, 0.5, 0.5);

    this.aspect = this.width / this.height;
    this.fov = 35;

    this.near = 0.0625;
    this.far = 16384;

    this.orthographic = false;
    this.orthographicSize = 2;

    this.minOrthographicSize = mathf.EPSILON;
    this.maxOrthographicSize = 1024;

    this.projection = mat4.create();
    this.view = mat4.create();

    this.needsUpdate = true;
    this.__active = false;
}
Component.extend(Camera, "odin.Camera", CameraManager);
CameraPrototype = Camera.prototype;

CameraPrototype.construct = function(options) {

    ComponentPrototype.construct.call(this);

    options = options || {};

    this.width = isNumber(options.width) ? options.width : 960;
    this.height = isNumber(options.height) ? options.height : 640;
    this.invWidth = 1 / this.width;
    this.invHeight = 1 / this.height;

    this.autoResize = options.autoResize != null ? !!options.autoResize : true;
    if (options.background) {
        color.copy(this.background, options.background);
    }

    this.aspect = this.width / this.height;
    this.fov = isNumber(options.fov) ? options.fov : 35;

    this.near = isNumber(options.near) ? options.near : 0.0625;
    this.far = isNumber(options.far) ? options.far : 16384;

    this.orthographic = options.orthographic != null ? !!options.orthographic : false;
    this.orthographicSize = isNumber(options.orthographicSize) ? options.orthographicSize : 2;

    this.needsUpdate = true;
    this.__active = false;

    return this;
};

CameraPrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    color.set(this.background, 0.5, 0.5, 0.5);

    mat4.identity(this.projection);
    mat4.identity(this.view);

    this.needsUpdate = true;
    this.__active = false;

    return this;
};

CameraPrototype.set = function(width, height) {

    this.width = width;
    this.height = height;

    this.invWidth = 1 / this.width;
    this.invHeight = 1 / this.height;

    this.aspect = width / height;
    this.needsUpdate = true;

    return this;
};

CameraPrototype.setActive = function() {
    var manager = this.manager;

    if (manager) {
        manager.setActive(this);
    } else {
        this.__active = true;
    }

    return this;
};

CameraPrototype.setWidth = function(width) {

    this.width = width;
    this.aspect = width / this.height;

    this.invWidth = 1 / this.width;

    this.needsUpdate = true;

    return this;
};

CameraPrototype.setHeight = function(height) {

    this.height = height;
    this.aspect = this.width / height;

    this.invHeight = 1 / this.height;

    this.needsUpdate = true;

    return this;
};

CameraPrototype.setFov = function(value) {

    this.fov = value;
    this.needsUpdate = true;

    return this;
};

CameraPrototype.setNear = function(value) {

    this.near = value;
    this.needsUpdate = true;

    return this;
};

CameraPrototype.setFar = function(value) {

    this.far = value;
    this.needsUpdate = true;

    return this;
};

CameraPrototype.setOrthographic = function(value) {

    this.orthographic = !!value;
    this.needsUpdate = true;

    return this;
};

CameraPrototype.toggleOrthographic = function() {

    this.orthographic = !this.orthographic;
    this.needsUpdate = true;

    return this;
};

CameraPrototype.setOrthographicSize = function(size) {

    this.orthographicSize = mathf.clamp(size, this.minOrthographicSize, this.maxOrthographicSize);
    this.needsUpdate = true;

    return this;
};

var MAT4 = mat4.create(),
    VEC3 = vec3.create();

CameraPrototype.toWorld = function(v, out) {
    out = out || vec3.create();

    out[0] = 2.0 * (v[0] * this.invWidth) - 1.0;
    out[1] = -2.0 * (v[1] * this.invHeight) + 1.0;


    mat4.mul(MAT4, this.projection, this.view);
    vec3.transformMat4(out, out, mat4.inverse(MAT4, MAT4));
    out[2] = this.near;

    return out;
};


CameraPrototype.toScreen = function(v, out) {
    out = out || vec2.create();

    vec3.copy(VEC3, v);

    mat4.mul(MAT4, this.projection, this.view);
    vec3.transformMat4(out, VEC3, MAT4);

    out[0] = ((VEC3[0] + 1.0) * 0.5) * this.width;
    out[1] = ((1.0 - VEC3[1]) * 0.5) * this.height;

    return out;
};

CameraPrototype.update = function(force) {
    var entity = this.entity,
        transform = entity && (entity.components["odin.Transform"] || entity.components["odin.Transform2D"]),
        orthographicSize, right, left, top, bottom;

    if (force || this.__active) {
        if (this.needsUpdate) {
            if (!this.orthographic) {
                mat4.perspective(this.projection, mathf.degsToRads(this.fov), this.aspect, this.near, this.far);
            } else {
                this.orthographicSize = mathf.clamp(this.orthographicSize, this.minOrthographicSize, this.maxOrthographicSize);

                orthographicSize = this.orthographicSize;
                right = orthographicSize * this.aspect;
                left = -right;
                top = orthographicSize;
                bottom = -top;

                mat4.orthographic(this.projection, left, right, top, bottom, this.near, this.far);
            }

            this.needsUpdate = false;
        }

        if (transform) {
            mat4.inverse(this.view, transform.getMatrixWorld());
        }
    }

    return this;
};

CameraPrototype.toJSON = function(json) {

    json = ComponentPrototype.toJSON.call(this, json);

    json.__active = this.__active;

    json.width = this.width;
    json.height = this.height;
    json.aspect = this.aspect;

    json.autoResize = this.autoResize;
    json.background = color.copy(json.background || [], this.background);

    json.far = this.far;
    json.near = this.near;
    json.fov = this.fov;

    json.orthographic = this.orthographic;
    json.orthographicSize = this.orthographicSize;
    json.minOrthographicSize = this.minOrthographicSize;
    json.maxOrthographicSize = this.maxOrthographicSize;

    return json;
};

CameraPrototype.fromJSON = function(json) {

    ComponentPrototype.fromJSON.call(this, json);

    this.__active = json.__active;

    this.width = json.width;
    this.height = json.height;
    this.aspect = json.aspect;

    this.autoResize = json.autoResize;
    color.copy(this.background, json.background);

    this.far = json.far;
    this.near = json.near;
    this.fov = json.fov;

    this.orthographic = json.orthographic;
    this.orthographicSize = json.orthographicSize;
    this.minOrthographicSize = json.minOrthographicSize;
    this.maxOrthographicSize = json.maxOrthographicSize;

    this.needsUpdate = true;

    return this;
};


},
function(require, exports, module, global) {

var ComponentManager = require(166);


var ComponentManagerPrototype = ComponentManager.prototype,
    CameraManagerPrototype;


module.exports = CameraManager;


function CameraManager() {

    ComponentManager.call(this);

    this.__active = null;
}
ComponentManager.extend(CameraManager, "odin.CameraManager");
CameraManagerPrototype = CameraManager.prototype;

CameraManagerPrototype.construct = function() {

    ComponentManagerPrototype.construct.call(this);

    return this;
};

CameraManagerPrototype.destructor = function() {

    ComponentManagerPrototype.destructor.call(this);

    this.__active = null;

    return this;
};

CameraManagerPrototype.sortFunction = function(a, b) {
    return a.__active ? 1 : (b.__active ? -1 : 0);
};

CameraManagerPrototype.setActive = function(camera) {
    if (this.__active) {
        this.__active.__active = false;
    }

    camera.__active = true;
    this.__active = camera;

    this.sort();

    return this;
};

CameraManagerPrototype.getActive = function() {
    return this.__active;
};

CameraManagerPrototype.add = function(component) {

    ComponentManagerPrototype.add.call(this, component);

    if (component.__active) {
        this.setActive(component);
    }

    return this;
};

CameraManagerPrototype.remove = function(component) {

    ComponentManagerPrototype.remove.call(this, component);

    if (component.__active) {
        this.__active = null;
    }

    return this;
};


},
function(require, exports, module, global) {

var isNumber = require(33),
    Component = require(167),
    SpriteManager = require(176);


var ComponentPrototype = Component.prototype,
    SpritePrototype;


module.exports = Sprite;


function Sprite() {

    Component.call(this);

    this.visible = true;

    this.layer = 0;
    this.z = 0;

    this.alpha = 1;

    this.material = null;

    this.width = 1;
    this.height = 1;

    this.x = 0;
    this.y = 0;

    this.w = 1;
    this.h = 1;
}
Component.extend(Sprite, "odin.Sprite", SpriteManager);
SpritePrototype = Sprite.prototype;

SpritePrototype.construct = function(options) {

    ComponentPrototype.construct.call(this);

    if (options) {
        this.visible = options.visible != null ? !!options.visible : true;

        this.layer = isNumber(options.layer) ? (options.layer < 0 ? 0 : options.layer) : 0;
        this.z = isNumber(options.z) ? options.z : 0;

        this.alpha = options.alpha != null ? options.alpha : 1;

        this.material = options.material != null ? options.material : null;

        this.width = isNumber(options.width) ? options.width : 1;
        this.height = isNumber(options.height) ? options.height : 1;

        this.x = isNumber(options.x) ? options.x : 0;
        this.y = isNumber(options.y) ? options.y : 0;
        this.w = isNumber(options.w) ? options.w : 1;
        this.h = isNumber(options.h) ? options.h : 1;
    }

    return this;
};

SpritePrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    this.visible = true;

    this.layer = 0;
    this.z = 0;

    this.alpha = 1;

    this.material = null;

    this.width = 1;
    this.height = 1;

    this.x = 0;
    this.y = 0;
    this.w = 1;
    this.h = 1;

    return this;
};

SpritePrototype.setLayer = function(layer) {
    var manager = this.manager;

    if (manager) {
        layer = isNumber(layer) ? (layer < 0 ? 0 : layer) : this.layer;

        if (layer !== this.layer) {
            manager.removeComponent(this);
            this.layer = layer;
            manager.addComponent(this);
            manager.setLayerAsDirty(layer);
        }
    } else {
        this.layer = isNumber(layer) ? (layer < 0 ? 0 : layer) : this.layer;
    }

    return this;
};

SpritePrototype.setZ = function(z) {
    var manager = this.manager;

    if (manager) {
        z = isNumber(z) ? z : this.z;

        if (z !== this.z) {
            this.z = z;
            manager.setLayerAsDirty(this.layer);
        }
    } else {
        this.z = isNumber(z) ? z : this.z;
    }

    return this;
};

SpritePrototype.setMaterial = function(material) {
    this.material = material;
    return this;
};

SpritePrototype.toJSON = function(json) {

    json = ComponentPrototype.toJSON.call(this, json);

    json.material = this.material.name;

    return json;
};

SpritePrototype.fromJSON = function(json) {

    ComponentPrototype.fromJSON.call(this, json);

    this.material = this.entity.scene.assets.get(json.material);

    return this;
};


},
function(require, exports, module, global) {

var indexOf = require(61),
    ComponentManager = require(166);


var SpriteManagerPrototype;


module.exports = SpriteManager;


function SpriteManager() {
    this.scene = null;
    this.__layers = [];
    this.__dirtyLayers = [];
}
ComponentManager.extend(SpriteManager, "odin.SpriteManager");
SpriteManagerPrototype = SpriteManager.prototype;

SpriteManagerPrototype.construct = function() {
    return this;
};

SpriteManagerPrototype.destructor = function() {

    this.scene = null;
    this.__layers.length = 0;
    this.__dirtyLayers.length = 0;

    return this;
};

SpriteManagerPrototype.isEmpty = function() {
    var layers = this.__layers,
        i = -1,
        il = layers.length - 1,
        layer;

    while (i++ < il) {
        layer = layers[i];

        if (layer && layer.length !== 0) {
            return false;
        }
    }

    return true;
};

SpriteManagerPrototype.sort = function() {
    var sortFunction = this.sortFunction,
        layers = this.__layers,
        i = -1,
        il = layers.length - 1,
        layer;

    while (i++ < il) {
        layer = layers[i];

        if (layer && layer.length !== 0) {
            layer.sort(sortFunction);
        }
    }

    return this;
};

SpriteManagerPrototype.sortLayer = function(index) {
    var layer = this.__layers[index];

    if (layer && layer.length !== 0) {
        layer.sort(this.sortFunction);
    }

    return this;
};

SpriteManagerPrototype.sortFunction = function(a, b) {
    return a.z - b.z;
};

SpriteManagerPrototype.setLayerAsDirty = function(layer) {
    this.__dirtyLayers[layer] = true;
    return this;
};

function init(component) {
    component.awake();
}
SpriteManagerPrototype.init = function() {
    this.forEach(init);
    return this;
};

function awake(component) {
    component.awake();
}
SpriteManagerPrototype.awake = function() {
    this.forEach(awake);
    return this;
};

SpriteManagerPrototype.update = function() {
    var layers = this.__layers,
        dirtyLayers = this.__dirtyLayers,
        i = -1,
        il = layers.length - 1,
        layer, j, jl;

    while (i++ < il) {
        layer = layers[i];

        if (layer && (jl = layer.length - 1) !== -1) {
            if (dirtyLayers[i]) {
                this.sortLayer(i);
                dirtyLayers[i] = false;
            }

            j = -1;
            while (j++ < jl) {
                layer[j].update();
            }
        }
    }

    return this;
};

SpriteManagerPrototype.forEach = function(callback) {
    var layers = this.__layers,
        i = -1,
        il = layers.length - 1,
        layer, j, jl;

    while (i++ < il) {
        layer = layers[i];

        if (layer && (jl = layer.length - 1) !== -1) {
            j = -1;
            while (j++ < jl) {
                if (callback(layer[j], j) === false) {
                    return false;
                }
            }
        }
    }

    return true;
};

SpriteManagerPrototype.has = function(component) {
    var layers = this.__layers,
        i = -1,
        il = layers.length - 1,
        layer, j, jl;

    while (i++ < il) {
        layer = layers[i];

        if (layer && (jl = layer.length - 1) !== -1) {
            j = -1;
            while (j++ < jl) {
                if (component === layer[j]) {
                    return true;
                }
            }
        }
    }

    return false;
};

SpriteManagerPrototype.addComponent = function(component) {
    var layers = this.__layers,
        componentLayer = component.layer,
        layer = layers[componentLayer] || (layers[componentLayer] = []),
        index = indexOf(layer, component);

    if (index === -1) {
        layer[layer.length] = component;
    }

    return this;
};

SpriteManagerPrototype.removeComponent = function(component) {
    var layers = this.__layers,
        componentLayer = component.layer,
        layer = layers[componentLayer],
        index = layer ? indexOf(layer, component) : -1;

    if (index !== -1) {
        layer.splice(index, 1);
    }

    return this;
};


},
function(require, exports, module, global) {

var Component = require(167),
    Bone = require(178),
    Transform = require(168),
    Entity = require(125),
    MeshManager = require(180);


var ComponentPrototype = Component.prototype,
    MeshPrototype;


module.exports = Mesh;


function Mesh() {

    Component.call(this);

    this.geometry = null;
    this.material = null;
    this.bones = [];
    this.bone = {};
}
Component.extend(Mesh, "odin.Mesh", MeshManager);
MeshPrototype = Mesh.prototype;

MeshPrototype.construct = function(geometry, material) {

    ComponentPrototype.construct.call(this);

    this.geometry = geometry;
    this.material = material;

    return this;
};

MeshPrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    this.geometry = null;
    this.material = null;
    this.bones.length = 0;
    this.bone = {};

    return this;
};

MeshPrototype.awake = function() {
    var geoBones = this.geometry.bones,
        i = -1,
        il = geoBones.length - 1,
        entity, bones, boneHash, geoBone, bone, transform, childEntity, parent;

    if (il !== -1) {
        entity = this.entity;
        bones = this.bones;
        boneHash = this.bone;

        while (i++ < il) {
            geoBone = geoBones[i];
            bone = Bone.create(geoBone);
            transform = Transform.create()
                .setPosition(geoBone.position)
                .setScale(geoBone.scale)
                .setRotation(geoBone.rotation);

            childEntity = Entity.create().addComponent(transform, bone);
            bones[bones.length] = childEntity;
            parent = bones[bone.parentIndex] || entity;
            parent.addChild(childEntity);
            boneHash[bone.name] = childEntity;
        }
    }

    ComponentPrototype.awake.call(this);

    return this;
};

MeshPrototype.toJSON = function(json) {

    json = ComponentPrototype.toJSON.call(this, json);

    json.geometry = this.geometry.name;
    json.material = this.material.name;

    return json;
};

MeshPrototype.fromJSON = function(json) {
    var assets = this.entity.scene.assets;

    ComponentPrototype.fromJSON.call(this, json);

    this.geometry = assets.get(json.geometry);
    this.material = assets.get(json.material);

    return this;
};


},
function(require, exports, module, global) {

var vec3 = require(38),
    quat = require(154),
    mat4 = require(79),
    Component = require(167),
    BoneManager = require(179);


var ComponentPrototype = Component.prototype,
    UNKNOWN_BONE_COUNT = 1,
    BonePrototype;


module.exports = Bone;


function Bone() {

    Component.call(this);

    this.parentIndex = -1;
    this.name = null;

    this.skinned = false;
    this.bindPose = mat4.create();
    this.uniform = mat4.create();

    this.inheritPosition = true;
    this.inheritRotation = true;
    this.inheritScale = true;
}
Component.extend(Bone, "odin.Bone", BoneManager);
BonePrototype = Bone.prototype;

BonePrototype.construct = function(options) {

    ComponentPrototype.construct.call(this);

    options = options || {};

    this.parentIndex = options.parentIndex != null ? options.parentIndex : -1;
    this.name = options.name != null ? options.name : "Bone" + UNKNOWN_BONE_COUNT++;

    this.skinned = options.skinned != null ? !!options.skinned : false;

    if (options.bindPose) {
        mat4.copy(this.bindPose, options.bindPose);
    }

    this.inheritPosition = options.inheritPosition != null ? !!options.inheritPosition : true;
    this.inheritRotation = options.inheritRotation != null ? !!options.inheritRotation : true;
    this.inheritScale = options.inheritScale != null ? !!options.inheritScale : true;

    return this;
};

BonePrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    this.parentIndex = null;
    this.name = null;

    this.skinned = null;
    mat4.identity(this.bindPose);
    mat4.identity(this.uniform);

    this.inheritPosition = true;
    this.inheritRotation = true;
    this.inheritScale = true;

    return this;
};

var MAT = mat4.create(),
    POSITION = vec3.create(),
    SCALE = vec3.create(),
    ROTATION = quat.create();

BonePrototype.update = function() {
    var entity = this.entity,
        transform = entity.components["odin.Transform"],
        uniform = this.uniform,
        inheritPosition, inheritScale, inheritRotation,
        mat, position, scale, rotation,
        parent;

    mat4.copy(uniform, transform.matrix);

    if (this.skinned === false) {
        return this;
    }

    parent = entity.parent;

    if (parent && this.parentIndex !== -1) {
        mat = MAT;
        mat4.copy(mat, parent.components["odin.Bone"].uniform);

        inheritPosition = this.inheritPosition;
        inheritScale = this.inheritScale;
        inheritRotation = this.inheritRotation;

        if (!inheritPosition || !inheritScale || !inheritRotation) {

            position = POSITION;
            scale = SCALE;
            rotation = ROTATION;

            mat4.decompose(mat, position, scale, rotation);

            if (!inheritPosition) {
                vec3.set(position, 0, 0, 0);
            }
            if (!inheritScale) {
                vec3.set(scale, 1, 1, 1);
            }
            if (!inheritRotation) {
                quat.set(rotation, 0, 0, 0, 1);
            }

            mat4.compose(mat, position, scale, rotation);
        }

        mat4.mul(uniform, mat, uniform);
    }

    return this;
};

BonePrototype.toJSON = function(json) {

    json = ComponentPrototype.toJSON.call(this, json);

    return json;
};

BonePrototype.fromJSON = function(json) {

    ComponentPrototype.fromJSON.call(this, json);

    return this;
};


},
function(require, exports, module, global) {

var ComponentManager = require(166);


var BoneManagerPrototype;


module.exports = BoneManager;


function BoneManager() {
    ComponentManager.call(this);
}
ComponentManager.extend(BoneManager, "odin.BoneManager", 10000);
BoneManagerPrototype = BoneManager.prototype;

BoneManagerPrototype.sortFunction = function(a, b) {
    return a.parentIndex - b.parentIndex;
};


},
function(require, exports, module, global) {

var ComponentManager = require(166);


var MeshManagerPrototype;


module.exports = MeshManager;


function MeshManager() {
    ComponentManager.call(this);
}
ComponentManager.extend(MeshManager, "odin.MeshManager");
MeshManagerPrototype = MeshManager.prototype;

MeshManagerPrototype.sortFunction = function(a, b) {
    return a.geometry !== b.geometry ? 1 : (a.material !== b.material ? 1 : 0);
};


},
function(require, exports, module, global) {

var vec3 = require(38),
    quat = require(154),
    mathf = require(31),
    Component = require(167),
    wrapMode = require(98);


var ComponentPrototype = Component.prototype,
    MeshAnimationPrototype;


module.exports = MeshAnimation;


function MeshAnimation() {

    Component.call(this);

    this.animations = null;

    this.current = "idle";
    this.mode = wrapMode.LOOP;

    this.rate = 1 / 24;
    this.playing = false;

    this.__time = 0;
    this.__frame = 0;
    this.__lastFrame = 0;
    this.__order = 1;
}
Component.extend(MeshAnimation, "odin.MeshAnimation");
MeshAnimationPrototype = MeshAnimation.prototype;

MeshAnimationPrototype.construct = function(animations, options) {

    ComponentPrototype.construct.call(this);

    options = options || {};

    this.animations = animations;

    this.current = options.current != null ? options.current : "idle";
    this.mode = options.mode != null ? options.mode : wrapMode.LOOP;

    this.rate = options.rate != null ? options.rate : 1 / 24;
    this.playing = false;

    return this;
};

MeshAnimationPrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    this.animations = null;

    this.current = "idle";
    this.mode = wrapMode.LOOP;

    this.rate = 1 / 24;
    this.playing = false;

    this.__time = 0;
    this.__frame = 0;
    this.__lastFrame = 0;
    this.__order = 1;

    return this;
};

var update_position = vec3.create(),
    update_lastPosition = vec3.create(),
    update_scale = vec3.create(),
    update_lastScale = vec3.create(),
    update_rotation = quat.create(),
    update_lastRotation = quat.create();

MeshAnimationPrototype.update = function() {
    var alpha = 0,
        position, rotation, scale,
        lastPosition, lastRotation, lastScale,
        currentPosition, currentRotation, currentScale,
        boneCurrent, boneTransform, parentIndex, boneFrame, lastBoneFrame,
        current, count, length, order, frame, lastFrame, mode, frameState, lastFrameState, entity, bones, i, il;

    entity = this.entity;
    current = this.animations.data[this.current];

    if (!current) {
        return this;
    }

    order = this.__order;
    frame = this.__frame;
    lastFrame = this.__lastFrame;
    mode = this.mode;

    if (!this.rate || this.rate === Infinity || this.rate < 0) {
        frame = mathf.abs(frame) % current.length;
    } else {
        this.__time += entity.scene.time.delta;
        count = this.__time / this.rate;
        alpha = count;

        if (count >= 1) {
            lastFrame = frame;
            alpha = 0;

            this.__time = 0;
            length = current.length;
            frame += (order * (count | 0));

            if (mode === wrapMode.LOOP) {
                frame = frame % length;
            } else if (mode === wrapMode.ONCE) {
                if (order > 0) {
                    if (frame >= length) {
                        frame = length - 1;
                        this.stop();
                    }
                } else {
                    if (frame < 0) {
                        frame = 0;
                        this.stop();
                    }
                }
            } else if (mode === wrapMode.PING_PONG) {
                if (order > 0) {
                    if (frame >= length) {
                        this.__order = -1;
                        frame = length - 1;
                    }
                } else {
                    if (frame < 0) {
                        this.__order = 1;
                        frame = 0;
                    }
                }
            } else if (mode === wrapMode.CLAMP) {
                if (order > 0) {
                    if (frame >= length) {
                        frame = length - 1;
                    }
                } else {
                    if (frame < 0) {
                        frame = 0;
                    }
                }
            }
        }
    }

    alpha = mathf.clamp01(alpha);
    frameState = current[frame];
    lastFrameState = current[lastFrame] || frameState;

    currentPosition = update_position;
    currentRotation = update_rotation;
    currentScale = update_scale;

    lastPosition = update_lastPosition;
    lastRotation = update_lastRotation;
    lastScale = update_lastScale;

    bones = entity.components["odin.Mesh"].bones;
    i = -1;
    il = bones.length - 1;

    while (i++ < il) {
        boneCurrent = bones[i];

        boneTransform = boneCurrent.components["odin.Transform"];
        parentIndex = boneCurrent.parentIndex;

        position = boneTransform.position;
        rotation = boneTransform.rotation;
        scale = boneTransform.scale;

        boneFrame = frameState[i];
        lastBoneFrame = lastFrameState[i];

        lastPosition[0] = lastBoneFrame[0];
        lastPosition[1] = lastBoneFrame[1];
        lastPosition[2] = lastBoneFrame[2];

        lastRotation[0] = lastBoneFrame[3];
        lastRotation[1] = lastBoneFrame[4];
        lastRotation[2] = lastBoneFrame[5];
        lastRotation[3] = lastBoneFrame[6];

        lastScale[0] = lastBoneFrame[7];
        lastScale[1] = lastBoneFrame[8];
        lastScale[2] = lastBoneFrame[9];

        currentPosition[0] = boneFrame[0];
        currentPosition[1] = boneFrame[1];
        currentPosition[2] = boneFrame[2];

        currentRotation[0] = boneFrame[3];
        currentRotation[1] = boneFrame[4];
        currentRotation[2] = boneFrame[5];
        currentRotation[3] = boneFrame[6];

        currentScale[0] = boneFrame[7];
        currentScale[1] = boneFrame[8];
        currentScale[2] = boneFrame[9];

        vec3.lerp(position, lastPosition, currentPosition, alpha);
        quat.lerp(rotation, lastRotation, currentRotation, alpha);
        vec3.lerp(scale, lastScale, currentScale, alpha);
    }

    this.__frame = frame;
    this.__lastFrame = lastFrame;

    return this;
};

MeshAnimationPrototype.play = function(name, mode, rate) {
    if ((this.playing && this.current === name) || !this.animations.data[name]) {
        return this;
    }

    this.playing = true;

    this.current = name;
    this.rate = rate != null ? rate : (rate = this.rate);
    this.mode = mode || (mode = this.mode);
    this.__frame = 0;
    this.__lastFrame = 0;
    this.__order = 1;
    this.__time = 0;

    this.emit("play", name, mode, rate);

    return this;
};

MeshAnimationPrototype.stop = function() {
    if (this.playing) {
        this.emit("stop");
    }

    this.playing = false;
    this.__frame = 0;
    this.__lastFrame = 0;
    this.__order = 1;
    this.__time = 0;

    return this;
};

MeshAnimationPrototype.toJSON = function(json) {

    json = ComponentPrototype.toJSON.call(this, json);

    json.animations = this.animations.name;

    return json;
};

MeshAnimationPrototype.fromJSON = function(json) {

    ComponentPrototype.fromJSON.call(this, json);

    this.animations = this.entity.scene.assets.get(json.animations);

    return this;
};


},
function(require, exports, module, global) {

var environment = require(25),
    mathf = require(31),
    vec3 = require(38),
    Component = require(167);


var ComponentPrototype = Component.prototype,

    MIN_POLOR = 0,
    MAX_POLOR = mathf.PI,

    NONE = 1,
    ROTATE = 2,
    PAN = 3,

    OrbitControlPrototype;


module.exports = OrbitControl;


function OrbitControl() {
    var _this = this;

    Component.call(this);

    this.speed = null;
    this.zoomSpeed = null;

    this.allowZoom = null;
    this.allowPan = null;
    this.allowRotate = null;

    this.target = vec3.create();

    this.__offset = vec3.create();
    this.__pan = vec3.create();
    this.__scale = null;
    this.__thetaDelta = null;
    this.__phiDelta = null;
    this.__state = null;

    this.onTouchStart = function(e, touch, touches) {
        OrbitControl_onTouchStart(_this, e, touch, touches);
    };
    this.onTouchEnd = function() {
        OrbitControl_onTouchEnd(_this);
    };
    this.onTouchMove = function(e, touch, touches) {
        OrbitControl_onTouchMove(_this, e, touch, touches);
    };

    this.onMouseUp = function() {
        OrbitControl_onMouseUp(_this);
    };
    this.onMouseDown = function(e, button, mouse) {
        OrbitControl_onMouseDown(_this, e, button, mouse);
    };
    this.onMouseMove = function(e, mouse) {
        OrbitControl_onMouseMove(_this, e, mouse);
    };
    this.onMouseWheel = function(e, wheel) {
        OrbitControl_onMouseWheel(_this, e, wheel);
    };
}
Component.extend(OrbitControl, "odin.OrbitControl");
OrbitControlPrototype = OrbitControl.prototype;

OrbitControlPrototype.construct = function(options) {

    ComponentPrototype.construct.call(this);

    options = options || {};

    this.speed = options.speed > mathf.EPSILON ? options.speed : 1;
    this.zoomSpeed = options.zoomSpeed > mathf.EPSILON ? options.zoomSpeed : 2;

    this.allowZoom = options.allowZoom != null ? !!options.allowZoom : true;
    this.allowPan = options.allowPan != null ? !!options.allowPan : true;
    this.allowRotate = options.allowRotate != null ? !!options.allowRotate : true;

    if (options.target) {
        vec3.copy(this.target, options.target);
    }

    this.__scale = 1;
    this.__thetaDelta = 0;
    this.__phiDelta = 0;
    this.__state = NONE;

    return this;
};

OrbitControlPrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    this.speed = null;
    this.zoomSpeed = null;

    this.allowZoom = null;
    this.allowPan = null;
    this.allowRotate = null;

    vec3.set(this.target, 0, 0, 0);

    vec3.set(this.__offset, 0, 0, 0);
    vec3.set(this.__pan, 0, 0, 0);

    this.__scale = null;
    this.__thetaDelta = null;
    this.__phiDelta = null;
    this.__state = null;

    return this;
};

OrbitControlPrototype.awake = function() {
    var entity = this.entity,
        scene = entity.scene,
        input = scene.input;

    ComponentPrototype.awake.call(this);

    if (environment.mobile) {
        input.on("touchstart", this.onTouchStart);
        input.on("touchend", this.onTouchEnd);
        input.on("touchmove", this.onTouchMove);
    } else {
        input.on("mouseup", this.onMouseUp);
        input.on("mousedown", this.onMouseDown);
        input.on("mousemove", this.onMouseMove);
        input.on("wheel", this.onMouseWheel);
    }

    OrbitControl_update(this);

    return this;
};

OrbitControlPrototype.clear = function(emitEvent) {
    var entity = this.entity,
        scene = entity.scene,
        input = scene.input;

    ComponentPrototype.clear.call(this, emitEvent);

    if (environment.mobile) {
        input.off("touchstart", this.onTouchStart);
        input.off("touchend", this.onTouchEnd);
        input.off("touchmove", this.onTouchMove);
    } else {
        input.off("mouseup", this.onMouseUp);
        input.off("mousedown", this.onMouseDown);
        input.off("mousemove", this.onMouseMove);
        input.off("wheel", this.onMouseWheel);
    }

    return this;
};

OrbitControlPrototype.setTarget = function(target) {
    vec3.copy(this.target, target);
    return this;
};

function OrbitControl_update(_this) {
    var components = _this.entity.components,
        camera = components["odin.Camera"],
        transform = components["odin.Transform"],
        position = transform.position,
        target = _this.target,
        offset = _this.__offset,
        pan = _this.__pan,
        theta, phi, radius;

    vec3.sub(offset, position, target);
    theta = mathf.atan2(offset[0], offset[1]);
    phi = mathf.atan2(mathf.sqrt(offset[0] * offset[0] + offset[1] * offset[1]), offset[2]);

    theta += _this.__thetaDelta;
    phi += _this.__phiDelta;

    phi = mathf.max(MIN_POLOR, mathf.min(MAX_POLOR, phi));
    phi = mathf.max(mathf.EPSILON, mathf.min(mathf.PI - mathf.EPSILON, phi));

    radius = vec3.length(offset) * _this.__scale;

    if (camera.orthographic) {
        camera.setOrthographicSize(camera.orthographicSize * _this.__scale);
    }

    vec3.add(target, target, pan);

    offset[0] = radius * mathf.sin(phi) * mathf.sin(theta);
    offset[1] = radius * mathf.sin(phi) * mathf.cos(theta);
    offset[2] = radius * mathf.cos(phi);

    vec3.add(position, target, offset);
    transform.lookAt(target);

    _this.__scale = 1;
    _this.__thetaDelta = 0;
    _this.__phiDelta = 0;
    vec3.set(pan, 0, 0, 0);
}

var OrbitControl_pan_panOffset = vec3.create();

function OrbitControl_pan(_this, delta) {
    var panOffset = OrbitControl_pan_panOffset,
        pan = _this.__pan,
        camera = _this.entity.components["odin.Camera"],
        transform = _this.entity.components["odin.Transform"],
        matrixWorld = transform.matrixWorld,
        position = transform.position,
        targetDistance;

    vec3.sub(panOffset, position, _this.target);
    targetDistance = vec3.length(panOffset);

    if (!camera.orthographic) {
        targetDistance *= mathf.tan(mathf.degsToRads(camera.fov * 0.5));

        vec3.set(panOffset, matrixWorld[0], matrixWorld[1], matrixWorld[2]);
        vec3.smul(panOffset, panOffset, -2 * delta[0] * targetDistance * camera.invWidth);
        vec3.add(pan, pan, panOffset);

        vec3.set(panOffset, matrixWorld[4], matrixWorld[5], matrixWorld[6]);
        vec3.smul(panOffset, panOffset, 2 * delta[1] * targetDistance * camera.invHeight);
        vec3.add(pan, pan, panOffset);
    } else {
        targetDistance *= camera.orthographicSize * 0.5;

        vec3.set(panOffset, matrixWorld[0], matrixWorld[1], matrixWorld[2]);
        vec3.smul(panOffset, panOffset, -2 * delta[0] * targetDistance * camera.invWidth);
        vec3.add(pan, pan, panOffset);

        vec3.set(panOffset, matrixWorld[4], matrixWorld[5], matrixWorld[6]);
        vec3.smul(panOffset, panOffset, 2 * delta[1] * targetDistance * camera.invHeight);
        vec3.add(pan, pan, panOffset);
    }
}

function OrbitControl_onTouchStart(_this, e, touch, touches) {
    var length = touches.__array.length;

    if (length === 1) {
        _this.__state = ROTATE;
    } else if (length === 2 && _this.allowPan) {
        _this.__state = PAN;
    } else {
        _this.__state = NONE;
    }
}

function OrbitControl_onTouchEnd(_this) {
    _this.__state = NONE;
}

function OrbitControl_onTouchMove(_this, e, touch) {
    var delta = touch.delta,
        camera = _this.entity.components["odin.Camera"];

    if (_this.__state === ROTATE) {
        _this.__thetaDelta += 2 * mathf.PI * delta[0] * camera.invWidth * _this.speed;
        _this.__phiDelta -= 2 * mathf.PI * delta[1] * camera.invHeight * _this.speed;
        OrbitControl_update(_this);
    } else if (_this.__state === PAN) {
        OrbitControl_pan(_this, delta);
        OrbitControl_update(_this);
    }
}

function OrbitControl_onMouseUp(_this) {
    _this.__state = NONE;
}

var LEFT_MOUSE = "mouse0",
    MIDDLE_MOUSE = "mouse1";

function OrbitControl_onMouseDown(_this, e, button) {
    if (button.name === LEFT_MOUSE && _this.allowRotate) {
        _this.__state = ROTATE;
    } else if (button.name === MIDDLE_MOUSE && _this.allowPan) {
        _this.__state = PAN;
    } else {
        _this.__state = NONE;
    }
}

function OrbitControl_onMouseMove(_this, e, mouse) {
    var delta = mouse.delta,
        camera = _this.entity.components["odin.Camera"];

    if (_this.__state === ROTATE) {
        _this.__thetaDelta += 2 * mathf.PI * delta[0] * camera.invWidth * _this.speed;
        _this.__phiDelta -= 2 * mathf.PI * delta[1] * camera.invHeight * _this.speed;
        OrbitControl_update(_this);
    } else if (_this.__state === PAN) {
        OrbitControl_pan(_this, delta);
        OrbitControl_update(_this);
    }
}

function OrbitControl_onMouseWheel(_this, e, wheel) {
    if (_this.allowZoom) {
        if (wheel < 0) {
            _this.__scale *= mathf.pow(0.95, _this.zoomSpeed);
            OrbitControl_update(_this);
        } else {
            _this.__scale /= mathf.pow(0.95, _this.zoomSpeed);
            OrbitControl_update(_this);
        }
    }
}


},
function(require, exports, module, global) {

var indexOf = require(61),
    particleState = require(184),
    Component = require(167);


var ComponentPrototype = Component.prototype,
    ParticleSystemPrototype;


module.exports = ParticleSystem;


function ParticleSystem() {

    Component.call(this);

    this.__playing = false;

    this.emitters = [];
    this.__emitterHash = {};
}
Component.extend(ParticleSystem, "odin.ParticleSystem");
ParticleSystemPrototype = ParticleSystem.prototype;

ParticleSystem.Emitter = require(185);

ParticleSystemPrototype.construct = function(options) {
    var emitters, i, il;

    ComponentPrototype.construct.call(this);

    options = options || {};

    if (options.emitters) {
        emitters = options.emitters;
        i = -1;
        il = emitters.length - 1;

        while (i++ < il) {
            this.addEmitter(emitters[i]);
        }
    }
    if (options.emitter) {
        this.addEmitter(options.emitter);
    }

    if (options.playing) {
        this.play();
    }

    return this;
};

ParticleSystemPrototype.destructor = function() {
    var emitters = this.emitters,
        i = -1,
        il = emitters.length - 1;

    ComponentPrototype.destructor.call(this);

    while (i++ < il) {
        this.removeEmitter(emitters[i]);
    }

    return this;
};

ParticleSystemPrototype.addEmitter = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        ParticleSystem_addEmitter(this, arguments[i]);
    }

    return this;
};

function ParticleSystem_addEmitter(_this, emitter) {
    var emitters = _this.emitters,
        index = indexOf(emitters, emitter);

    if (index === -1) {
        emitters[emitters.length] = emitter;
        _this.__emitterHash[emitter.__id] = emitter;
        emitter.particleSystem = _this;
    } else {
        throw new Error("ParticleSystem addEmitter(emitter): emitter already in particle system");
    }
}

ParticleSystemPrototype.removeEmitter = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        ParticleSystem_removeEmitter(this, arguments[i]);
    }

    return this;
};

function ParticleSystem_removeEmitter(_this, emitter) {
    var emitters = _this.emitters,
        index = indexOf(emitters, emitter);

    if (index !== -1) {
        emitter.particleSystem = null;
        emitters.splice(index, 1);
        delete _this.__emitterHash[emitter.__id];
    } else {
        throw new Error("ParticleSystem removeEmitter(emitter): emitter not in particle system");
    }
}

ParticleSystemPrototype.update = function() {
    if (this.__playing) {

        this.eachEmitter(ParticleSystem_update.set(this.entity.scene.time, true));

        if (ParticleSystem_update.playing === false) {
            this.__playing = false;
            this.emit("end");
        }
    }
};

function ParticleSystem_update(emitter) {
    emitter.update(ParticleSystem_update.time);
    if (emitter.__state === particleState.NONE) {
        ParticleSystem_update.playing = false;
    }
}
ParticleSystem_update.set = function(time, playing) {
    this.time = time;
    this.playing = playing;
    return this;
};

ParticleSystemPrototype.play = function() {
    if (!this.__playing) {
        this.__playing = true;
        this.eachEmitter(ParticleSystem_play);
        this.emit("play");
    }
};

function ParticleSystem_play(emitter) {
    emitter.play();
}

ParticleSystemPrototype.eachEmitter = function(fn) {
    var emitters = this.emitters,
        i = -1,
        il = emitters.length - 1;

    while (i++ < il) {
        if (fn(emitters[i], i) === false) {
            break;
        }
    }
};

ParticleSystemPrototype.toJSON = function(json) {
    var emitters = this.emitters,
        jsonEmitters = json.emitters || (json.emitters = []),
        i = -1,
        il = emitters.length - 1;

    json = ComponentPrototype.toJSON.call(this, json);

    json = this.playing;

    while (i++ < il) {
        jsonEmitters[i] = emitters[i].toJSON(jsonEmitters[i]);
    }

    return json;
};

ParticleSystemPrototype.fromJSON = function(json) {
    var jsonEmitters = json.emitters,
        i = -1,
        il = jsonEmitters.length - 1;

    ComponentPrototype.fromJSON.call(this, json);

    while (i++ < il) {
        this.addEmitter(jsonEmitters[i]);
    }

    return this;
};


},
function(require, exports, module, global) {

var enums = require(46);


var particleState = enums([
    "NONE",
    "START",
    "RUNNING",
    "END"
]);


module.exports = particleState;


},
function(require, exports, module, global) {

var indexOf = require(61),
    isNumber = require(33),
    mathf = require(31),
    vec2 = require(68),
    vec3 = require(38),
    quat = require(154),
    particleState = require(184),
    normalMode = require(94),
    emitterRenderMode = require(92),
    interpolation = require(93),
    screenAlignment = require(95),
    sortMode = require(97),
    createSeededRandom = require(186),
    randFloat = require(187),
    Class = require(2);


var MAX_SAFE_INTEGER = mathf.pow(2, 53) - 1,
    ClassPrototype = Class.prototype,
    EmitterPrototype;


module.exports = Emitter;


function Emitter() {
    var _this = this;

    Class.call(this);

    this.__state = particleState.NONE;
    this.__currentTime = 0.0;
    this.__random = createSeededRandom();

    this.seed = null;

    this.renderMode = null;

    this.particleSystem = null;
    this.particles = [];

    this.material = null;

    this.screenAlignment = null;
    this.useLocalSpace = null;

    this.killOnDeactivate = false;
    this.killOnCompleted = false;

    this.sortMode = null;

    this.__duration = 0.0;
    this.duration = 0.0;
    this.minDuration = 0.0;
    this.useDurationRange = false;
    this.recalcDurationRangeEachLoop = false;

    this.__delay = 0.0;
    this.__currentDelayTime = 0.0;
    this.delay = 0.0;
    this.minDelay = 0.0;
    this.useDelayRange = false;
    this.delayFirstLoopOnly = false;

    this.__currentLoop = 0;
    this.loopCount = 0;

    this.subUV = false;

    this.interpolation = null;

    this.subImagesX = 1;
    this.subImagesY = 1;

    this.scaleUV = vec2.create(1, 1);

    this.randomImageChanges = 1;

    this.useMaxDrawCount = false;
    this.maxDrawCount = 0;

    this.normalMode = null;

    this.rate = 60;
    this.rateScale = 1;

    this.burst = false;
    this.burstScale = 1;

    this.modules = {};
    this.__moduleArray = [];

    this.random = function random() {
        return _this.__random(_this.__currentTime);
    };
}
Class.extend(Emitter, "odin.ParticleSystem.Emitter");
EmitterPrototype = Emitter.prototype;

EmitterPrototype.construct = function(options) {
    var modules, i, il;

    ClassPrototype.construct.call(this);

    options = options || {};

    this.seed = mathf.floor(isNumber(options.seed) ? (
        options.seed > MAX_SAFE_INTEGER ? MAX_SAFE_INTEGER : options.seed
    ) : (mathf.random() * MAX_SAFE_INTEGER));

    this.__random.seed(this.seed);

    this.renderMode = options.renderMode || emitterRenderMode.NORMAL;

    this.material = options.material || null;

    this.screenAlignment = options.screenAlignment || screenAlignment.FACING_CAMERA_POSITION;
    this.useLocalSpace = options.useLocalSpace ? !!options.useLocalSpace : false;

    this.killOnDeactivate = options.killOnDeactivate ? !!options.killOnDeactivate : false;
    this.killOnCompleted = options.killOnCompleted ? !!options.killOnCompleted : false;

    this.sortMode = options.sortMode || sortMode.VIEW_PROJ_DEPTH;

    this.duration = options.duration ? options.duration : 0.0;
    this.minDuration = options.minDuration ? options.minDuration : 0.0;
    this.useDurationRange = options.useDurationRange ? !!options.useDurationRange : false;
    this.recalcDurationRangeEachLoop = options.recalcDurationRangeEachLoop ? !!options.recalcDurationRangeEachLoop : false;

    this.delay = options.delay ? options.delay : 0.0;
    this.minDelay = options.minDelay ? options.minDelay : 0.0;
    this.useDelayRange = options.useDelayRange ? !!options.useDelayRange : false;
    this.delayFirstLoopOnly = options.delayFirstLoopOnly ? !!options.delayFirstLoopOnly : false;

    this.__currentLoop = 0;
    this.loopCount = options.loopCount ? options.loopCount : 0;

    this.subUV = options.subUV ? !!options.subUV : false;

    this.interpolation = options.interpolation || interpolation.NONE;

    this.subImagesX = options.subImagesX ? options.subImagesX : 1;
    this.subImagesY = options.subImagesY ? options.subImagesY : 1;

    if (options.scaleUV) {
        vec2.copy(this.scaleUV, options.scaleUV);
    }

    this.randomImageChanges = options.randomImageChanges ? options.randomImageChanges : 1;

    this.useMaxDrawCount = options.useMaxDrawCount ? !!options.useMaxDrawCount : false;
    this.maxDrawCount = options.maxDrawCount ? options.maxDrawCount : 0;

    this.normalMode = options.normalMode || normalMode.CAMERA_FACING;

    this.rate = options.rate ? options.rate : 24;
    this.rateScale = options.rateScale ? options.rateScale : 1;

    this.burst = options.burst ? !!options.burst : false;
    this.burstScale = options.burstScale ? options.burstScale : 1;

    if (options.modules) {
        modules = options.modules;
        i = -1;
        il = modules.length - 1;

        while (i++ < il) {
            this.addModule(modules[i]);
        }
    }
    if (options.module) {
        this.addModule(options.module);
    }

    return this;
};

EmitterPrototype.destructor = function() {
    var moduleArray = this.__moduleArray,
        i = -1,
        il = moduleArray.length - 1;

    ClassPrototype.destructor.call(this);

    this.__state = particleState.NONE;

    this.seed = null;

    this.renderMode = null;

    this.particleSystem = null;
    this.particles.length = 0;

    this.material = null;

    this.screenAlignment = null;
    this.useLocalSpace = null;

    this.killOnDeactivate = false;
    this.killOnCompleted = false;

    this.sortMode = null;

    this.duration = 0.0;
    this.minDuration = 0.0;
    this.useDurationRange = false;
    this.recalcDurationRangeEachLoop = false;

    this.delay = 0.0;
    this.minDelay = 0.0;
    this.useDelayRange = false;
    this.delayFirstLoopOnly = false;

    this.__currentLoop = 0;
    this.loopCount = 0;

    this.subUV = false;

    this.interpolation = null;

    this.subImagesX = 1;
    this.subImagesY = 1;

    vec2.set(this.scaleUV, 1, 1);

    this.randomImageChanges = 1;

    this.useMaxDrawCount = false;
    this.maxDrawCount = 0;

    this.normalMode = null;

    this.rate = 60;
    this.rateScale = 1;

    this.burst = false;
    this.burstScale = 1;

    while (i++ < il) {
        this.removeModule(moduleArray[i]);
    }

    return this;
};

EmitterPrototype.addModule = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Emitter_addModule(this, arguments[i]);
    }

    return this;
};

function Emitter_addModule(_this, module) {
    var moduleArray = _this.__moduleArray,
        moduleHash = _this.modules,
        className = module.className;

    if (!moduleHash[className]) {
        moduleArray[moduleArray.length] = module;
        moduleHash[className] = module;
        module.emitter = _this;
    } else {
        throw new Error("Emitter addModule(module): module " + className + " already in emitter");
    }
}

EmitterPrototype.removeModule = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Emitter_removeModule(this, arguments[i]);
    }

    return this;
};

function Emitter_removeModule(_this, module) {
    var moduleArray = _this.__moduleArray,
        moduleHash = _this.modules,
        className = module.className;

    if (moduleHash[className]) {
        moduleArray.splice(indexOf(moduleArray, module), 1);
        delete moduleHash[className];
        module.emitter = _this;
    } else {
        throw new Error("Emitter removeModule(module): module " + className + " not in emitter");
    }
}

EmitterPrototype.update = function(time) {
    var state = this.__state;

    if (state !== particleState.NONE) {

        this.eachModule(EmitterPrototype_updateModule.set(time));

        switch (state) {
            case particleState.START:
                Emitter_start(this, time);
                break;

            case particleState.RUNNING:
                Emitter_running(this, time);
                break;

            case particleState.END:
                Emitter_end(this, time);
                break;
        }
    }
};

function EmitterPrototype_updateModule(module) {
    if (module.update) {
        module.update(EmitterPrototype_updateModule.time);
    }
}
EmitterPrototype_updateModule.set = function(time) {
    this.time = time;
    return this;
};

function Emitter_start(_this, time) {
    if (_this.useDelayRange && _this.__currentDelayTime < _this.__delay) {
        _this.__currentDelayTime += time.fixedDelta;
    } else {
        _this.emit("play");
        _this.__state = particleState.RUNNING;
    }
}

function Emitter_running(_this, time) {
    var currentTime;

    _this.__currentTime += time.fixedDelta;
    currentTime = _this.__currentTime;

    if (_this.__duration > 0.0) {
        if (currentTime >= _this.__duration) {
            _this.__state = particleState.END;
        }
    }
}

function Emitter_end(_this, time) {

    _this.emit("end");
    _this.__currentTime = 0.0;

    if (_this.duration > 0.0 && _this.useDurationRange && _this.recalcDurationRangeEachLoop) {
        _this.__duration = randFloat(_this.random, _this.minDuration, _this.duration);
    }

    if (_this.useDelayRange && !_this.delayFirstLoopOnly) {
        _this.__currentDelayTime = 0.0;
        _this.__delay = randFloat(_this.random, _this.minDelay, _this.delay);
    }

    if (_this.loopCount > 0) {
        if (_this.__currentLoop > _this.loopCount) {
            _this.__state = particleState.NONE;
        } else {
            _this.__currentLoop += 1;
        }
    } else {
        _this.__state = particleState.START;
    }
}

EmitterPrototype.eachModule = function(fn) {
    var moduleArray = this.__moduleArray,
        i = -1,
        il = moduleArray.length - 1;

    while (i++ < il) {
        if (fn(moduleArray[i], i) === false) {
            break;
        }
    }
};

EmitterPrototype.play = function() {
    if (this.__state === particleState.NONE) {

        this.__random.seed(this.seed);

        this.__curentTime = 0.0;
        this.__state = particleState.START;

        if (this.useDurationRange) {
            this.__duration = randFloat(this.random, this.minDuration, this.duration);
        }

        if (this.useDelayRange) {
            this.__currentDelayTime = 0.0;
            this.__delay = randFloat(this.random, this.minDelay, this.delay);
        }
    }
};

EmitterPrototype.toJSON = function(json) {
    var modules = this.modules,
        jsonModules = json.modules || (json.modules = []),
        i = -1,
        il = modules.length - 1;

    json = ClassPrototype.toJSON.call(this, json);

    while (i++ < il) {
        jsonModules[i] = modules[i].toJSON(jsonModules[i]);
    }

    return json;
};

EmitterPrototype.fromJSON = function(json) {
    var jsonModules = json.modules,
        i = -1,
        il = jsonModules.length - 1;

    ClassPrototype.fromJSON.call(this, json);

    while (i++ < il) {
        this.addModule(Class.createFromJSON(jsonModules[i]));
    }

    return this;
};


},
function(require, exports, module, global) {

var MULTIPLIER = 1664525,
    MODULO = 4294967295,
    OFFSET = 1013904223;


module.exports = createSeededRandom;


function createSeededRandom() {
    var seed = 0;

    function random(s) {
        seed = (MULTIPLIER * (seed + (s * 1000)) + OFFSET) % MODULO;
        return seed / MODULO;
    }

    random.seed = function(value) {
        seed = value;
    };

    return random;
}


},
function(require, exports, module, global) {

module.exports = randFloat;


function randFloat(random, min, max) {
    return min + (random() * (max - min));
}


},
function(require, exports, module, global) {

var odinP2 = exports;


odinP2.p2 = require(189);
odinP2.Plugin = require(243);
odinP2.RigidBody = require(244);


},
function(require, exports, module, global) {

// Export p2 classes
module.exports = {
    AABB :                          require(190),
    AngleLockEquation :             require(193),
    Body :                          require(195),
    Broadphase :                    require(205),
    Capsule :                       require(206),
    Circle :                        require(207),
    Constraint :                    require(208),
    ContactEquation :               require(209),
    ContactMaterial :               require(210),
    Convex :                        require(201),
    DistanceConstraint :            require(212),
    Equation :                      require(194),
    EventEmitter :                  require(204),
    FrictionEquation :              require(213),
    GearConstraint :                require(214),
    GridBroadphase :                require(215),
    GSSolver :                      require(218),
    Heightfield :                   require(220),
    Line :                          require(221),
    LockConstraint :                require(222),
    Material :                      require(211),
    Narrowphase :                   require(223),
    NaiveBroadphase :               require(226),
    Particle :                      require(217),
    Plane :                         require(216),
    RevoluteConstraint :            require(227),
    PrismaticConstraint :           require(230),
    Ray :                           require(231),
    RaycastResult :                 require(232),
    Rectangle :                     require(225),
    RotationalVelocityEquation :    require(228),
    SAPBroadphase :                 require(233),
    Shape :                         require(202),
    Solver :                        require(219),
    Spring :                        require(234),
    LinearSpring :                  require(235),
    RotationalSpring :              require(236),
    Utils :                         require(192),
    World :                         require(237),
    vec2 :                          require(191),
    version :                       require(238).version,
};


},
function(require, exports, module, global) {

var vec2 = require(191)
,   Utils = require(192);

module.exports = AABB;

/**
 * Axis aligned bounding box class.
 * @class AABB
 * @constructor
 * @param {Object}  [options]
 * @param {Array}   [options.upperBound]
 * @param {Array}   [options.lowerBound]
 */
function AABB(options){

    /**
     * The lower bound of the bounding box.
     * @property lowerBound
     * @type {Array}
     */
    this.lowerBound = vec2.create();
    if(options && options.lowerBound){
        vec2.copy(this.lowerBound, options.lowerBound);
    }

    /**
     * The upper bound of the bounding box.
     * @property upperBound
     * @type {Array}
     */
    this.upperBound = vec2.create();
    if(options && options.upperBound){
        vec2.copy(this.upperBound, options.upperBound);
    }
}

var tmp = vec2.create();

/**
 * Set the AABB bounds from a set of points.
 * @method setFromPoints
 * @param {Array} points An array of vec2's.
 */
AABB.prototype.setFromPoints = function(points, position, angle, skinSize){
    var l = this.lowerBound,
        u = this.upperBound;

    if(typeof(angle) !== "number"){
        angle = 0;
    }

    // Set to the first point
    if(angle !== 0){
        vec2.rotate(l, points[0], angle);
    } else {
        vec2.copy(l, points[0]);
    }
    vec2.copy(u, l);

    // Compute cosines and sines just once
    var cosAngle = Math.cos(angle),
        sinAngle = Math.sin(angle);
    for(var i = 1; i<points.length; i++){
        var p = points[i];

        if(angle !== 0){
            var x = p[0],
                y = p[1];
            tmp[0] = cosAngle * x -sinAngle * y;
            tmp[1] = sinAngle * x +cosAngle * y;
            p = tmp;
        }

        for(var j=0; j<2; j++){
            if(p[j] > u[j]){
                u[j] = p[j];
            }
            if(p[j] < l[j]){
                l[j] = p[j];
            }
        }
    }

    // Add offset
    if(position){
        vec2.add(this.lowerBound, this.lowerBound, position);
        vec2.add(this.upperBound, this.upperBound, position);
    }

    if(skinSize){
        this.lowerBound[0] -= skinSize;
        this.lowerBound[1] -= skinSize;
        this.upperBound[0] += skinSize;
        this.upperBound[1] += skinSize;
    }
};

/**
 * Copy bounds from an AABB to this AABB
 * @method copy
 * @param  {AABB} aabb
 */
AABB.prototype.copy = function(aabb){
    vec2.copy(this.lowerBound, aabb.lowerBound);
    vec2.copy(this.upperBound, aabb.upperBound);
};

/**
 * Extend this AABB so that it covers the given AABB too.
 * @method extend
 * @param  {AABB} aabb
 */
AABB.prototype.extend = function(aabb){
    // Loop over x and y
    var i = 2;
    while(i--){
        // Extend lower bound
        var l = aabb.lowerBound[i];
        if(this.lowerBound[i] > l){
            this.lowerBound[i] = l;
        }

        // Upper
        var u = aabb.upperBound[i];
        if(this.upperBound[i] < u){
            this.upperBound[i] = u;
        }
    }
};

/**
 * Returns true if the given AABB overlaps this AABB.
 * @method overlaps
 * @param  {AABB} aabb
 * @return {Boolean}
 */
AABB.prototype.overlaps = function(aabb){
    var l1 = this.lowerBound,
        u1 = this.upperBound,
        l2 = aabb.lowerBound,
        u2 = aabb.upperBound;

    //      l2        u2
    //      |---------|
    // |--------|
    // l1       u1

    return ((l2[0] <= u1[0] && u1[0] <= u2[0]) || (l1[0] <= u2[0] && u2[0] <= u1[0])) &&
           ((l2[1] <= u1[1] && u1[1] <= u2[1]) || (l1[1] <= u2[1] && u2[1] <= u1[1]));
};


},
function(require, exports, module, global) {

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * The vec2 object from glMatrix, with some extensions and some removed methods. See http://glmatrix.net.
 * @class vec2
 */

var vec2 = module.exports = {};

var Utils = require(192);

/**
 * Make a cross product and only return the z component
 * @method crossLength
 * @static
 * @param  {Array} a
 * @param  {Array} b
 * @return {Number}
 */
vec2.crossLength = function(a,b){
    return a[0] * b[1] - a[1] * b[0];
};

/**
 * Cross product between a vector and the Z component of a vector
 * @method crossVZ
 * @static
 * @param  {Array} out
 * @param  {Array} vec
 * @param  {Number} zcomp
 * @return {Number}
 */
vec2.crossVZ = function(out, vec, zcomp){
    vec2.rotate(out,vec,-Math.PI/2);// Rotate according to the right hand rule
    vec2.scale(out,out,zcomp);      // Scale with z
    return out;
};

/**
 * Cross product between a vector and the Z component of a vector
 * @method crossZV
 * @static
 * @param  {Array} out
 * @param  {Number} zcomp
 * @param  {Array} vec
 * @return {Number}
 */
vec2.crossZV = function(out, zcomp, vec){
    vec2.rotate(out,vec,Math.PI/2); // Rotate according to the right hand rule
    vec2.scale(out,out,zcomp);      // Scale with z
    return out;
};

/**
 * Rotate a vector by an angle
 * @method rotate
 * @static
 * @param  {Array} out
 * @param  {Array} a
 * @param  {Number} angle
 */
vec2.rotate = function(out,a,angle){
    if(angle !== 0){
        var c = Math.cos(angle),
            s = Math.sin(angle),
            x = a[0],
            y = a[1];
        out[0] = c*x -s*y;
        out[1] = s*x +c*y;
    } else {
        out[0] = a[0];
        out[1] = a[1];
    }
};

/**
 * Rotate a vector 90 degrees clockwise
 * @method rotate90cw
 * @static
 * @param  {Array} out
 * @param  {Array} a
 * @param  {Number} angle
 */
vec2.rotate90cw = function(out, a) {
    var x = a[0];
    var y = a[1];
    out[0] = y;
    out[1] = -x;
};

/**
 * Transform a point position to local frame.
 * @method toLocalFrame
 * @param  {Array} out
 * @param  {Array} worldPoint
 * @param  {Array} framePosition
 * @param  {Number} frameAngle
 */
vec2.toLocalFrame = function(out, worldPoint, framePosition, frameAngle){
    vec2.copy(out, worldPoint);
    vec2.sub(out, out, framePosition);
    vec2.rotate(out, out, -frameAngle);
};

/**
 * Transform a point position to global frame.
 * @method toGlobalFrame
 * @param  {Array} out
 * @param  {Array} localPoint
 * @param  {Array} framePosition
 * @param  {Number} frameAngle
 */
vec2.toGlobalFrame = function(out, localPoint, framePosition, frameAngle){
    vec2.copy(out, localPoint);
    vec2.rotate(out, out, frameAngle);
    vec2.add(out, out, framePosition);
};

/**
 * Compute centroid of a triangle spanned by vectors a,b,c. See http://easycalculation.com/analytical/learn-centroid.php
 * @method centroid
 * @static
 * @param  {Array} out
 * @param  {Array} a
 * @param  {Array} b
 * @param  {Array} c
 * @return  {Array} The out object
 */
vec2.centroid = function(out, a, b, c){
    vec2.add(out, a, b);
    vec2.add(out, out, c);
    vec2.scale(out, out, 1/3);
    return out;
};

/**
 * Creates a new, empty vec2
 * @static
 * @method create
 * @return {Array} a new 2D vector
 */
vec2.create = function() {
    var out = new Utils.ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 * @static
 * @method clone
 * @param {Array} a vector to clone
 * @return {Array} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new Utils.ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 * @static
 * @method fromValues
 * @param {Number} x X component
 * @param {Number} y Y component
 * @return {Array} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new Utils.ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 * @static
 * @method copy
 * @param {Array} out the receiving vector
 * @param {Array} a the source vector
 * @return {Array} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 * @static
 * @method set
 * @param {Array} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @return {Array} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 * @static
 * @method add
 * @param {Array} out the receiving vector
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Array} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts two vec2's
 * @static
 * @method subtract
 * @param {Array} out the receiving vector
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Array} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for vec2.subtract
 * @static
 * @method sub
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 * @static
 * @method multiply
 * @param {Array} out the receiving vector
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Array} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for vec2.multiply
 * @static
 * @method mul
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 * @static
 * @method divide
 * @param {Array} out the receiving vector
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Array} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for vec2.divide
 * @static
 * @method div
 */
vec2.div = vec2.divide;

/**
 * Scales a vec2 by a scalar number
 * @static
 * @method scale
 * @param {Array} out the receiving vector
 * @param {Array} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @return {Array} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 * @static
 * @method distance
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for vec2.distance
 * @static
 * @method dist
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 * @static
 * @method squaredDistance
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for vec2.squaredDistance
 * @static
 * @method sqrDist
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 * @static
 * @method length
 * @param {Array} a vector to calculate length of
 * @return {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for vec2.length
 * @method len
 * @static
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 * @static
 * @method squaredLength
 * @param {Array} a vector to calculate squared length of
 * @return {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for vec2.squaredLength
 * @static
 * @method sqrLen
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 * @static
 * @method negate
 * @param {Array} out the receiving vector
 * @param {Array} a vector to negate
 * @return {Array} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 * @static
 * @method normalize
 * @param {Array} out the receiving vector
 * @param {Array} a vector to normalize
 * @return {Array} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 * @static
 * @method dot
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Returns a string representation of a vector
 * @static
 * @method str
 * @param {Array} vec vector to represent as a string
 * @return {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};


},
function(require, exports, module, global) {

/* global P2_ARRAY_TYPE */

module.exports = Utils;

/**
 * Misc utility functions
 * @class Utils
 * @constructor
 */
function Utils(){}

/**
 * Append the values in array b to the array a. See <a href="http://stackoverflow.com/questions/1374126/how-to-append-an-array-to-an-existing-javascript-array/1374131#1374131">this</a> for an explanation.
 * @method appendArray
 * @static
 * @param  {Array} a
 * @param  {Array} b
 */
Utils.appendArray = function(a,b){
    if (b.length < 150000) {
        a.push.apply(a, b);
    } else {
        for (var i = 0, len = b.length; i !== len; ++i) {
            a.push(b[i]);
        }
    }
};

/**
 * Garbage free Array.splice(). Does not allocate a new array.
 * @method splice
 * @static
 * @param  {Array} array
 * @param  {Number} index
 * @param  {Number} howmany
 */
Utils.splice = function(array,index,howmany){
    howmany = howmany || 1;
    for (var i=index, len=array.length-howmany; i < len; i++){
        array[i] = array[i + howmany];
    }
    array.length = len;
};

/**
 * The array type to use for internal numeric computations throughout the library. Float32Array is used if it is available, but falls back on Array. If you want to set array type manually, inject it via the global variable P2_ARRAY_TYPE. See example below.
 * @static
 * @property {function} ARRAY_TYPE
 * @example
 *     <script>
 *         <!-- Inject your preferred array type before loading p2.js -->
 *         P2_ARRAY_TYPE = Array;
 *     </script>
 *     <script src="p2.js"></script>
 */
if(typeof P2_ARRAY_TYPE !== 'undefined') {
    Utils.ARRAY_TYPE = P2_ARRAY_TYPE;
} else if (typeof Float32Array !== 'undefined'){
    Utils.ARRAY_TYPE = Float32Array;
} else {
    Utils.ARRAY_TYPE = Array;
}

/**
 * Extend an object with the properties of another
 * @static
 * @method extend
 * @param  {object} a
 * @param  {object} b
 */
Utils.extend = function(a,b){
    for(var key in b){
        a[key] = b[key];
    }
};

/**
 * Extend an options object with default values.
 * @static
 * @method defaults
 * @param  {object} options The options object. May be falsy: in this case, a new object is created and returned.
 * @param  {object} defaults An object containing default values.
 * @return {object} The modified options object.
 */
Utils.defaults = function(options, defaults){
    options = options || {};
    for(var key in defaults){
        if(!(key in options)){
            options[key] = defaults[key];
        }
    }
    return options;
};


},
function(require, exports, module, global) {

var Equation = require(194),
    vec2 = require(191);

module.exports = AngleLockEquation;

/**
 * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
 *
 * @class AngleLockEquation
 * @constructor
 * @extends Equation
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {Number} [options.angle] Angle to add to the local vector in body A.
 * @param {Number} [options.ratio] Gear ratio
 */
function AngleLockEquation(bodyA, bodyB, options){
    options = options || {};
    Equation.call(this,bodyA,bodyB,-Number.MAX_VALUE,Number.MAX_VALUE);
    this.angle = options.angle || 0;

    /**
     * The gear ratio.
     * @property {Number} ratio
     * @private
     * @see setRatio
     */
    this.ratio = typeof(options.ratio)==="number" ? options.ratio : 1;

    this.setRatio(this.ratio);
}
AngleLockEquation.prototype = new Equation();
AngleLockEquation.prototype.constructor = AngleLockEquation;

AngleLockEquation.prototype.computeGq = function(){
    return this.ratio * this.bodyA.angle - this.bodyB.angle + this.angle;
};

/**
 * Set the gear ratio for this equation
 * @method setRatio
 * @param {Number} ratio
 */
AngleLockEquation.prototype.setRatio = function(ratio){
    var G = this.G;
    G[2] =  ratio;
    G[5] = -1;
    this.ratio = ratio;
};

/**
 * Set the max force for the equation.
 * @method setMaxTorque
 * @param {Number} torque
 */
AngleLockEquation.prototype.setMaxTorque = function(torque){
    this.maxForce =  torque;
    this.minForce = -torque;
};


},
function(require, exports, module, global) {

module.exports = Equation;

var vec2 = require(191),
    Utils = require(192),
    Body = require(195);

/**
 * Base class for constraint equations.
 * @class Equation
 * @constructor
 * @param {Body} bodyA First body participating in the equation
 * @param {Body} bodyB Second body participating in the equation
 * @param {number} minForce Minimum force to apply. Default: -Number.MAX_VALUE
 * @param {number} maxForce Maximum force to apply. Default: Number.MAX_VALUE
 */
function Equation(bodyA, bodyB, minForce, maxForce){

    /**
     * Minimum force to apply when solving.
     * @property minForce
     * @type {Number}
     */
    this.minForce = typeof(minForce)==="undefined" ? -Number.MAX_VALUE : minForce;

    /**
     * Max force to apply when solving.
     * @property maxForce
     * @type {Number}
     */
    this.maxForce = typeof(maxForce)==="undefined" ? Number.MAX_VALUE : maxForce;

    /**
     * First body participating in the constraint
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second body participating in the constraint
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;

    /**
     * The stiffness of this equation. Typically chosen to a large number (~1e7), but can be chosen somewhat freely to get a stable simulation.
     * @property stiffness
     * @type {Number}
     */
    this.stiffness = Equation.DEFAULT_STIFFNESS;

    /**
     * The number of time steps needed to stabilize the constraint equation. Typically between 3 and 5 time steps.
     * @property relaxation
     * @type {Number}
     */
    this.relaxation = Equation.DEFAULT_RELAXATION;

    /**
     * The Jacobian entry of this equation. 6 numbers, 3 per body (x,y,angle).
     * @property G
     * @type {Array}
     */
    this.G = new Utils.ARRAY_TYPE(6);
    for(var i=0; i<6; i++){
        this.G[i]=0;
    }

    this.offset = 0;

    this.a = 0;
    this.b = 0;
    this.epsilon = 0;
    this.timeStep = 1/60;

    /**
     * Indicates if stiffness or relaxation was changed.
     * @property {Boolean} needsUpdate
     */
    this.needsUpdate = true;

    /**
     * The resulting constraint multiplier from the last solve. This is mostly equivalent to the force produced by the constraint.
     * @property multiplier
     * @type {Number}
     */
    this.multiplier = 0;

    /**
     * Relative velocity.
     * @property {Number} relativeVelocity
     */
    this.relativeVelocity = 0;

    /**
     * Whether this equation is enabled or not. If true, it will be added to the solver.
     * @property {Boolean} enabled
     */
    this.enabled = true;
}
Equation.prototype.constructor = Equation;

/**
 * The default stiffness when creating a new Equation.
 * @static
 * @property {Number} DEFAULT_STIFFNESS
 * @default 1e6
 */
Equation.DEFAULT_STIFFNESS = 1e6;

/**
 * The default relaxation when creating a new Equation.
 * @static
 * @property {Number} DEFAULT_RELAXATION
 * @default 4
 */
Equation.DEFAULT_RELAXATION = 4;

/**
 * Compute SPOOK parameters .a, .b and .epsilon according to the current parameters. See equations 9, 10 and 11 in the <a href="http://www8.cs.umu.se/kurser/5DV058/VT09/lectures/spooknotes.pdf">SPOOK notes</a>.
 * @method update
 */
Equation.prototype.update = function(){
    var k = this.stiffness,
        d = this.relaxation,
        h = this.timeStep;

    this.a = 4.0 / (h * (1 + 4 * d));
    this.b = (4.0 * d) / (1 + 4 * d);
    this.epsilon = 4.0 / (h * h * k * (1 + 4 * d));

    this.needsUpdate = false;
};

/**
 * Multiply a jacobian entry with corresponding positions or velocities
 * @method gmult
 * @return {Number}
 */
Equation.prototype.gmult = function(G,vi,wi,vj,wj){
    return  G[0] * vi[0] +
            G[1] * vi[1] +
            G[2] * wi +
            G[3] * vj[0] +
            G[4] * vj[1] +
            G[5] * wj;
};

/**
 * Computes the RHS of the SPOOK equation
 * @method computeB
 * @return {Number}
 */
Equation.prototype.computeB = function(a,b,h){
    var GW = this.computeGW();
    var Gq = this.computeGq();
    var GiMf = this.computeGiMf();
    return - Gq * a - GW * b - GiMf*h;
};

/**
 * Computes G\*q, where q are the generalized body coordinates
 * @method computeGq
 * @return {Number}
 */
var qi = vec2.create(),
    qj = vec2.create();
Equation.prototype.computeGq = function(){
    var G = this.G,
        bi = this.bodyA,
        bj = this.bodyB,
        xi = bi.position,
        xj = bj.position,
        ai = bi.angle,
        aj = bj.angle;

    return this.gmult(G, qi, ai, qj, aj) + this.offset;
};

/**
 * Computes G\*W, where W are the body velocities
 * @method computeGW
 * @return {Number}
 */
Equation.prototype.computeGW = function(){
    var G = this.G,
        bi = this.bodyA,
        bj = this.bodyB,
        vi = bi.velocity,
        vj = bj.velocity,
        wi = bi.angularVelocity,
        wj = bj.angularVelocity;
    return this.gmult(G,vi,wi,vj,wj) + this.relativeVelocity;
};

/**
 * Computes G\*Wlambda, where W are the body velocities
 * @method computeGWlambda
 * @return {Number}
 */
Equation.prototype.computeGWlambda = function(){
    var G = this.G,
        bi = this.bodyA,
        bj = this.bodyB,
        vi = bi.vlambda,
        vj = bj.vlambda,
        wi = bi.wlambda,
        wj = bj.wlambda;
    return this.gmult(G,vi,wi,vj,wj);
};

/**
 * Computes G\*inv(M)\*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
 * @method computeGiMf
 * @return {Number}
 */
var iMfi = vec2.create(),
    iMfj = vec2.create();
Equation.prototype.computeGiMf = function(){
    var bi = this.bodyA,
        bj = this.bodyB,
        fi = bi.force,
        ti = bi.angularForce,
        fj = bj.force,
        tj = bj.angularForce,
        invMassi = bi.invMassSolve,
        invMassj = bj.invMassSolve,
        invIi = bi.invInertiaSolve,
        invIj = bj.invInertiaSolve,
        G = this.G;

    vec2.scale(iMfi, fi,invMassi);
    vec2.scale(iMfj, fj,invMassj);

    return this.gmult(G,iMfi,ti*invIi,iMfj,tj*invIj);
};

/**
 * Computes G\*inv(M)\*G'
 * @method computeGiMGt
 * @return {Number}
 */
Equation.prototype.computeGiMGt = function(){
    var bi = this.bodyA,
        bj = this.bodyB,
        invMassi = bi.invMassSolve,
        invMassj = bj.invMassSolve,
        invIi = bi.invInertiaSolve,
        invIj = bj.invInertiaSolve,
        G = this.G;

    return  G[0] * G[0] * invMassi +
            G[1] * G[1] * invMassi +
            G[2] * G[2] *    invIi +
            G[3] * G[3] * invMassj +
            G[4] * G[4] * invMassj +
            G[5] * G[5] *    invIj;
};

var addToWlambda_temp = vec2.create(),
    addToWlambda_Gi = vec2.create(),
    addToWlambda_Gj = vec2.create(),
    addToWlambda_ri = vec2.create(),
    addToWlambda_rj = vec2.create(),
    addToWlambda_Mdiag = vec2.create();

/**
 * Add constraint velocity to the bodies.
 * @method addToWlambda
 * @param {Number} deltalambda
 */
Equation.prototype.addToWlambda = function(deltalambda){
    var bi = this.bodyA,
        bj = this.bodyB,
        temp = addToWlambda_temp,
        Gi = addToWlambda_Gi,
        Gj = addToWlambda_Gj,
        ri = addToWlambda_ri,
        rj = addToWlambda_rj,
        invMassi = bi.invMassSolve,
        invMassj = bj.invMassSolve,
        invIi = bi.invInertiaSolve,
        invIj = bj.invInertiaSolve,
        Mdiag = addToWlambda_Mdiag,
        G = this.G;

    Gi[0] = G[0];
    Gi[1] = G[1];
    Gj[0] = G[3];
    Gj[1] = G[4];

    // Add to linear velocity
    // v_lambda += inv(M) * delta_lamba * G
    vec2.scale(temp, Gi, invMassi*deltalambda);
    vec2.add( bi.vlambda, bi.vlambda, temp);
    // This impulse is in the offset frame
    // Also add contribution to angular
    //bi.wlambda -= vec2.crossLength(temp,ri);
    bi.wlambda += invIi * G[2] * deltalambda;


    vec2.scale(temp, Gj, invMassj*deltalambda);
    vec2.add( bj.vlambda, bj.vlambda, temp);
    //bj.wlambda -= vec2.crossLength(temp,rj);
    bj.wlambda += invIj * G[5] * deltalambda;
};

/**
 * Compute the denominator part of the SPOOK equation: C = G\*inv(M)\*G' + eps
 * @method computeInvC
 * @param  {Number} eps
 * @return {Number}
 */
Equation.prototype.computeInvC = function(eps){
    return 1.0 / (this.computeGiMGt() + eps);
};


},
function(require, exports, module, global) {

var vec2 = require(191)
,   decomp = require(196)
,   Convex = require(201)
,   AABB = require(190)
,   EventEmitter = require(204);

module.exports = Body;

/**
 * A rigid body. Has got a center of mass, position, velocity and a number of
 * shapes that are used for collisions.
 *
 * @class Body
 * @constructor
 * @extends EventEmitter
 * @param {Object}              [options]
 * @param {Number}              [options.mass=0]    A number >= 0. If zero, the .type will be set to Body.STATIC.
 * @param {Array}               [options.position]
 * @param {Array}               [options.velocity]
 * @param {Number}              [options.angle=0]
 * @param {Number}              [options.angularVelocity=0]
 * @param {Array}               [options.force]
 * @param {Number}              [options.angularForce=0]
 * @param {Number}              [options.fixedRotation=false]
 * @param {Number}              [options.ccdSpeedThreshold=-1]
 * @param {Number}              [options.ccdIterations=10]
 *
 * @example
 *
 *     // Create a typical dynamic body
 *     var body = new Body({
 *         mass: 1,
 *         position: [0, 0],
 *         angle: 0,
 *         velocity: [0, 0],
 *         angularVelocity: 0
 *     });
 *
 *     // Add a circular shape to the body
 *     body.addShape(new Circle(1));
 *
 *     // Add the body to the world
 *     world.addBody(body);
 */
function Body(options){
    options = options || {};

    EventEmitter.call(this);

    /**
     * The body identifyer
     * @property id
     * @type {Number}
     */
    this.id = ++Body._idCounter;

    /**
     * The world that this body is added to. This property is set to NULL if the body is not added to any world.
     * @property world
     * @type {World}
     */
    this.world = null;

    /**
     * The shapes of the body. The local transform of the shape in .shapes[i] is
     * defined by .shapeOffsets[i] and .shapeAngles[i].
     *
     * @property shapes
     * @type {Array}
     */
    this.shapes = [];

    /**
     * The local shape offsets, relative to the body center of mass. This is an
     * array of Array.
     * @property shapeOffsets
     * @type {Array}
     */
    this.shapeOffsets = [];

    /**
     * The body-local shape angle transforms. This is an array of numbers (angles).
     * @property shapeAngles
     * @type {Array}
     */
    this.shapeAngles = [];

    /**
     * The mass of the body.
     * @property mass
     * @type {number}
     */
    this.mass = options.mass || 0;

    /**
     * The inverse mass of the body.
     * @property invMass
     * @type {number}
     */
    this.invMass = 0;

    /**
     * The inertia of the body around the Z axis.
     * @property inertia
     * @type {number}
     */
    this.inertia = 0;

    /**
     * The inverse inertia of the body.
     * @property invInertia
     * @type {number}
     */
    this.invInertia = 0;

    this.invMassSolve = 0;
    this.invInertiaSolve = 0;

    /**
     * Set to true if you want to fix the rotation of the body.
     * @property fixedRotation
     * @type {Boolean}
     */
    this.fixedRotation = !!options.fixedRotation;

    /**
     * The position of the body
     * @property position
     * @type {Array}
     */
    this.position = vec2.fromValues(0,0);
    if(options.position){
        vec2.copy(this.position, options.position);
    }

    /**
     * The interpolated position of the body.
     * @property interpolatedPosition
     * @type {Array}
     */
    this.interpolatedPosition = vec2.fromValues(0,0);

    /**
     * The interpolated angle of the body.
     * @property interpolatedAngle
     * @type {Number}
     */
    this.interpolatedAngle = 0;

    /**
     * The previous position of the body.
     * @property previousPosition
     * @type {Array}
     */
    this.previousPosition = vec2.fromValues(0,0);

    /**
     * The previous angle of the body.
     * @property previousAngle
     * @type {Number}
     */
    this.previousAngle = 0;

    /**
     * The velocity of the body
     * @property velocity
     * @type {Array}
     */
    this.velocity = vec2.fromValues(0,0);
    if(options.velocity){
        vec2.copy(this.velocity, options.velocity);
    }

    /**
     * Constraint velocity that was added to the body during the last step.
     * @property vlambda
     * @type {Array}
     */
    this.vlambda = vec2.fromValues(0,0);

    /**
     * Angular constraint velocity that was added to the body during last step.
     * @property wlambda
     * @type {Array}
     */
    this.wlambda = 0;

    /**
     * The angle of the body, in radians.
     * @property angle
     * @type {number}
     * @example
     *     // The angle property is not normalized to the interval 0 to 2*pi, it can be any value.
     *     // If you need a value between 0 and 2*pi, use the following function to normalize it.
     *     function normalizeAngle(angle){
     *         angle = angle % (2*Math.PI);
     *         if(angle < 0){
     *             angle += (2*Math.PI);
     *         }
     *         return angle;
     *     }
     */
    this.angle = options.angle || 0;

    /**
     * The angular velocity of the body, in radians per second.
     * @property angularVelocity
     * @type {number}
     */
    this.angularVelocity = options.angularVelocity || 0;

    /**
     * The force acting on the body. Since the body force (and {{#crossLink "Body/angularForce:property"}}{{/crossLink}}) will be zeroed after each step, so you need to set the force before each step.
     * @property force
     * @type {Array}
     *
     * @example
     *     // This produces a forcefield of 1 Newton in the positive x direction.
     *     for(var i=0; i<numSteps; i++){
     *         body.force[0] = 1;
     *         world.step(1/60);
     *     }
     *
     * @example
     *     // This will apply a rotational force on the body
     *     for(var i=0; i<numSteps; i++){
     *         body.angularForce = -3;
     *         world.step(1/60);
     *     }
     */
    this.force = vec2.create();
    if(options.force){
        vec2.copy(this.force, options.force);
    }

    /**
     * The angular force acting on the body. See {{#crossLink "Body/force:property"}}{{/crossLink}}.
     * @property angularForce
     * @type {number}
     */
    this.angularForce = options.angularForce || 0;

    /**
     * The linear damping acting on the body in the velocity direction. Should be a value between 0 and 1.
     * @property damping
     * @type {Number}
     * @default 0.1
     */
    this.damping = typeof(options.damping) === "number" ? options.damping : 0.1;

    /**
     * The angular force acting on the body. Should be a value between 0 and 1.
     * @property angularDamping
     * @type {Number}
     * @default 0.1
     */
    this.angularDamping = typeof(options.angularDamping) === "number" ? options.angularDamping : 0.1;

    /**
     * The type of motion this body has. Should be one of: {{#crossLink "Body/STATIC:property"}}Body.STATIC{{/crossLink}}, {{#crossLink "Body/DYNAMIC:property"}}Body.DYNAMIC{{/crossLink}} and {{#crossLink "Body/KINEMATIC:property"}}Body.KINEMATIC{{/crossLink}}.
     *
     * * Static bodies do not move, and they do not respond to forces or collision.
     * * Dynamic bodies body can move and respond to collisions and forces.
     * * Kinematic bodies only moves according to its .velocity, and does not respond to collisions or force.
     *
     * @property type
     * @type {number}
     *
     * @example
     *     // Bodies are static by default. Static bodies will never move.
     *     var body = new Body();
     *     console.log(body.type == Body.STATIC); // true
     *
     * @example
     *     // By setting the mass of a body to a nonzero number, the body
     *     // will become dynamic and will move and interact with other bodies.
     *     var dynamicBody = new Body({
     *         mass : 1
     *     });
     *     console.log(dynamicBody.type == Body.DYNAMIC); // true
     *
     * @example
     *     // Kinematic bodies will only move if you change their velocity.
     *     var kinematicBody = new Body({
     *         type: Body.KINEMATIC // Type can be set via the options object.
     *     });
     */
    this.type = Body.STATIC;

    if(typeof(options.type) !== 'undefined'){
        this.type = options.type;
    } else if(!options.mass){
        this.type = Body.STATIC;
    } else {
        this.type = Body.DYNAMIC;
    }

    /**
     * Bounding circle radius.
     * @property boundingRadius
     * @type {Number}
     */
    this.boundingRadius = 0;

    /**
     * Bounding box of this body.
     * @property aabb
     * @type {AABB}
     */
    this.aabb = new AABB();

    /**
     * Indicates if the AABB needs update. Update it with {{#crossLink "Body/updateAABB:method"}}.updateAABB(){{/crossLink}}.
     * @property aabbNeedsUpdate
     * @type {Boolean}
     * @see updateAABB
     *
     * @example
     *     // Force update the AABB
     *     body.aabbNeedsUpdate = true;
     *     body.updateAABB();
     *     console.log(body.aabbNeedsUpdate); // false
     */
    this.aabbNeedsUpdate = true;

    /**
     * If true, the body will automatically fall to sleep. Note that you need to enable sleeping in the {{#crossLink "World"}}{{/crossLink}} before anything will happen.
     * @property allowSleep
     * @type {Boolean}
     * @default true
     */
    this.allowSleep = true;

    this.wantsToSleep = false;

    /**
     * One of {{#crossLink "Body/AWAKE:property"}}Body.AWAKE{{/crossLink}}, {{#crossLink "Body/SLEEPY:property"}}Body.SLEEPY{{/crossLink}} and {{#crossLink "Body/SLEEPING:property"}}Body.SLEEPING{{/crossLink}}.
     *
     * The body is initially Body.AWAKE. If its velocity norm is below .sleepSpeedLimit, the sleepState will become Body.SLEEPY. If the body continues to be Body.SLEEPY for .sleepTimeLimit seconds, it will fall asleep (Body.SLEEPY).
     *
     * @property sleepState
     * @type {Number}
     * @default Body.AWAKE
     */
    this.sleepState = Body.AWAKE;

    /**
     * If the speed (the norm of the velocity) is smaller than this value, the body is considered sleepy.
     * @property sleepSpeedLimit
     * @type {Number}
     * @default 0.2
     */
    this.sleepSpeedLimit = 0.2;

    /**
     * If the body has been sleepy for this sleepTimeLimit seconds, it is considered sleeping.
     * @property sleepTimeLimit
     * @type {Number}
     * @default 1
     */
    this.sleepTimeLimit = 1;

    /**
     * Gravity scaling factor. If you want the body to ignore gravity, set this to zero. If you want to reverse gravity, set it to -1.
     * @property {Number} gravityScale
     * @default 1
     */
    this.gravityScale = 1;

    /**
     * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled. That means that this body will move through other bodies, but it will still trigger contact events, etc.
     * @property {Boolean} collisionResponse
     */
    this.collisionResponse = true;

    /**
     * How long the body has been sleeping.
     * @property {Number} idleTime
     */
    this.idleTime = 0;

    /**
     * The last time when the body went to SLEEPY state.
     * @property {Number} timeLastSleepy
     * @private
     */
    this.timeLastSleepy = 0;

    /**
     * If the body speed exceeds this threshold, CCD (continuous collision detection) will be enabled. Set it to a negative number to disable CCD completely for this body.
     * @property {number} ccdSpeedThreshold
     * @default -1
     */
    this.ccdSpeedThreshold = options.ccdSpeedThreshold !== undefined ? options.ccdSpeedThreshold : -1;

    /**
     * The number of iterations that should be used when searching for the time of impact during CCD. A larger number will assure that there's a small penetration on CCD collision, but a small number will give more performance.
     * @property {number} ccdIterations
     * @default 10
     */
    this.ccdIterations = options.ccdIterations !== undefined ? options.ccdIterations : 10;

    this.concavePath = null;

    this._wakeUpAfterNarrowphase = false;

    this.updateMassProperties();
}
Body.prototype = new EventEmitter();
Body.prototype.constructor = Body;

Body._idCounter = 0;

Body.prototype.updateSolveMassProperties = function(){
    if(this.sleepState === Body.SLEEPING || this.type === Body.KINEMATIC){
        this.invMassSolve = 0;
        this.invInertiaSolve = 0;
    } else {
        this.invMassSolve = this.invMass;
        this.invInertiaSolve = this.invInertia;
    }
};

/**
 * Set the total density of the body
 * @method setDensity
 */
Body.prototype.setDensity = function(density) {
    var totalArea = this.getArea();
    this.mass = totalArea * density;
    this.updateMassProperties();
};

/**
 * Get the total area of all shapes in the body
 * @method getArea
 * @return {Number}
 */
Body.prototype.getArea = function() {
    var totalArea = 0;
    for(var i=0; i<this.shapes.length; i++){
        totalArea += this.shapes[i].area;
    }
    return totalArea;
};

/**
 * Get the AABB from the body. The AABB is updated if necessary.
 * @method getAABB
 */
Body.prototype.getAABB = function(){
    if(this.aabbNeedsUpdate){
        this.updateAABB();
    }
    return this.aabb;
};

var shapeAABB = new AABB(),
    tmp = vec2.create();

/**
 * Updates the AABB of the Body
 * @method updateAABB
 */
Body.prototype.updateAABB = function() {
    var shapes = this.shapes,
        shapeOffsets = this.shapeOffsets,
        shapeAngles = this.shapeAngles,
        N = shapes.length,
        offset = tmp,
        bodyAngle = this.angle;

    for(var i=0; i!==N; i++){
        var shape = shapes[i],
            angle = shapeAngles[i] + bodyAngle;

        // Get shape world offset
        vec2.rotate(offset, shapeOffsets[i], bodyAngle);
        vec2.add(offset, offset, this.position);

        // Get shape AABB
        shape.computeAABB(shapeAABB, offset, angle);

        if(i===0){
            this.aabb.copy(shapeAABB);
        } else {
            this.aabb.extend(shapeAABB);
        }
    }

    this.aabbNeedsUpdate = false;
};

/**
 * Update the bounding radius of the body. Should be done if any of the shapes
 * are changed.
 * @method updateBoundingRadius
 */
Body.prototype.updateBoundingRadius = function(){
    var shapes = this.shapes,
        shapeOffsets = this.shapeOffsets,
        N = shapes.length,
        radius = 0;

    for(var i=0; i!==N; i++){
        var shape = shapes[i],
            offset = vec2.length(shapeOffsets[i]),
            r = shape.boundingRadius;
        if(offset + r > radius){
            radius = offset + r;
        }
    }

    this.boundingRadius = radius;
};

/**
 * Add a shape to the body. You can pass a local transform when adding a shape,
 * so that the shape gets an offset and angle relative to the body center of mass.
 * Will automatically update the mass properties and bounding radius.
 *
 * @method addShape
 * @param  {Shape}              shape
 * @param  {Array} [offset] Local body offset of the shape.
 * @param  {Number}             [angle]  Local body angle.
 *
 * @example
 *     var body = new Body(),
 *         shape = new Circle();
 *
 *     // Add the shape to the body, positioned in the center
 *     body.addShape(shape);
 *
 *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local x-axis.
 *     body.addShape(shape,[1,0]);
 *
 *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local y-axis, and rotated 90 degrees CCW.
 *     body.addShape(shape,[0,1],Math.PI/2);
 */
Body.prototype.addShape = function(shape,offset,angle){
    angle = angle || 0.0;

    // Copy the offset vector
    if(offset){
        offset = vec2.fromValues(offset[0],offset[1]);
    } else {
        offset = vec2.fromValues(0,0);
    }

    this.shapes      .push(shape);
    this.shapeOffsets.push(offset);
    this.shapeAngles .push(angle);
    this.updateMassProperties();
    this.updateBoundingRadius();

    this.aabbNeedsUpdate = true;
};

/**
 * Remove a shape
 * @method removeShape
 * @param  {Shape}  shape
 * @return {Boolean}       True if the shape was found and removed, else false.
 */
Body.prototype.removeShape = function(shape){
    var idx = this.shapes.indexOf(shape);

    if(idx !== -1){
        this.shapes.splice(idx,1);
        this.shapeOffsets.splice(idx,1);
        this.shapeAngles.splice(idx,1);
        this.aabbNeedsUpdate = true;
        return true;
    } else {
        return false;
    }
};

/**
 * Updates .inertia, .invMass, .invInertia for this Body. Should be called when
 * changing the structure or mass of the Body.
 *
 * @method updateMassProperties
 *
 * @example
 *     body.mass += 1;
 *     body.updateMassProperties();
 */
Body.prototype.updateMassProperties = function(){
    if(this.type === Body.STATIC || this.type === Body.KINEMATIC){

        this.mass = Number.MAX_VALUE;
        this.invMass = 0;
        this.inertia = Number.MAX_VALUE;
        this.invInertia = 0;

    } else {

        var shapes = this.shapes,
            N = shapes.length,
            m = this.mass / N,
            I = 0;

        if(!this.fixedRotation){
            for(var i=0; i<N; i++){
                var shape = shapes[i],
                    r2 = vec2.squaredLength(this.shapeOffsets[i]),
                    Icm = shape.computeMomentOfInertia(m);
                I += Icm + m*r2;
            }
            this.inertia = I;
            this.invInertia = I>0 ? 1/I : 0;

        } else {
            this.inertia = Number.MAX_VALUE;
            this.invInertia = 0;
        }

        // Inverse mass properties are easy
        this.invMass = 1/this.mass;// > 0 ? 1/this.mass : 0;
    }
};

var Body_applyForce_r = vec2.create();

/**
 * Apply force to a world point. This could for example be a point on the RigidBody surface. Applying force this way will add to Body.force and Body.angularForce.
 * @method applyForce
 * @param {Array} force The force to add.
 * @param {Array} worldPoint A world point to apply the force on.
 */
Body.prototype.applyForce = function(force,worldPoint){
    // Compute point position relative to the body center
    var r = Body_applyForce_r;
    vec2.sub(r,worldPoint,this.position);

    // Add linear force
    vec2.add(this.force,this.force,force);

    // Compute produced rotational force
    var rotForce = vec2.crossLength(r,force);

    // Add rotational force
    this.angularForce += rotForce;
};

/**
 * Transform a world point to local body frame.
 * @method toLocalFrame
 * @param  {Array} out          The vector to store the result in
 * @param  {Array} worldPoint   The input world vector
 */
Body.prototype.toLocalFrame = function(out, worldPoint){
    vec2.toLocalFrame(out, worldPoint, this.position, this.angle);
};

/**
 * Transform a local point to world frame.
 * @method toWorldFrame
 * @param  {Array} out          The vector to store the result in
 * @param  {Array} localPoint   The input local vector
 */
Body.prototype.toWorldFrame = function(out, localPoint){
    vec2.toGlobalFrame(out, localPoint, this.position, this.angle);
};

/**
 * Reads a polygon shape path, and assembles convex shapes from that and puts them at proper offset points.
 * @method fromPolygon
 * @param {Array} path An array of 2d vectors, e.g. [[0,0],[0,1],...] that resembles a concave or convex polygon. The shape must be simple and without holes.
 * @param {Object} [options]
 * @param {Boolean} [options.optimalDecomp=false]   Set to true if you need optimal decomposition. Warning: very slow for polygons with more than 10 vertices.
 * @param {Boolean} [options.skipSimpleCheck=false] Set to true if you already know that the path is not intersecting itself.
 * @param {Boolean|Number} [options.removeCollinearPoints=false] Set to a number (angle threshold value) to remove collinear points, or false to keep all points.
 * @return {Boolean} True on success, else false.
 */
Body.prototype.fromPolygon = function(path,options){
    options = options || {};

    // Remove all shapes
    for(var i=this.shapes.length; i>=0; --i){
        this.removeShape(this.shapes[i]);
    }

    var p = new decomp.Polygon();
    p.vertices = path;

    // Make it counter-clockwise
    p.makeCCW();

    if(typeof(options.removeCollinearPoints) === "number"){
        p.removeCollinearPoints(options.removeCollinearPoints);
    }

    // Check if any line segment intersects the path itself
    if(typeof(options.skipSimpleCheck) === "undefined"){
        if(!p.isSimple()){
            return false;
        }
    }

    // Save this path for later
    this.concavePath = p.vertices.slice(0);
    for(var i=0; i<this.concavePath.length; i++){
        var v = [0,0];
        vec2.copy(v,this.concavePath[i]);
        this.concavePath[i] = v;
    }

    // Slow or fast decomp?
    var convexes;
    if(options.optimalDecomp){
        convexes = p.decomp();
    } else {
        convexes = p.quickDecomp();
    }

    var cm = vec2.create();

    // Add convexes
    for(var i=0; i!==convexes.length; i++){
        // Create convex
        var c = new Convex(convexes[i].vertices);

        // Move all vertices so its center of mass is in the local center of the convex
        for(var j=0; j!==c.vertices.length; j++){
            var v = c.vertices[j];
            vec2.sub(v,v,c.centerOfMass);
        }

        vec2.scale(cm,c.centerOfMass,1);
        c.updateTriangles();
        c.updateCenterOfMass();
        c.updateBoundingRadius();

        // Add the shape
        this.addShape(c,cm);
    }

    this.adjustCenterOfMass();

    this.aabbNeedsUpdate = true;

    return true;
};

var adjustCenterOfMass_tmp1 = vec2.fromValues(0,0),
    adjustCenterOfMass_tmp2 = vec2.fromValues(0,0),
    adjustCenterOfMass_tmp3 = vec2.fromValues(0,0),
    adjustCenterOfMass_tmp4 = vec2.fromValues(0,0);

/**
 * Moves the shape offsets so their center of mass becomes the body center of mass.
 * @method adjustCenterOfMass
 */
Body.prototype.adjustCenterOfMass = function(){
    var offset_times_area = adjustCenterOfMass_tmp2,
        sum =               adjustCenterOfMass_tmp3,
        cm =                adjustCenterOfMass_tmp4,
        totalArea =         0;
    vec2.set(sum,0,0);

    for(var i=0; i!==this.shapes.length; i++){
        var s = this.shapes[i],
            offset = this.shapeOffsets[i];
        vec2.scale(offset_times_area,offset,s.area);
        vec2.add(sum,sum,offset_times_area);
        totalArea += s.area;
    }

    vec2.scale(cm,sum,1/totalArea);

    // Now move all shapes
    for(var i=0; i!==this.shapes.length; i++){
        var s = this.shapes[i],
            offset = this.shapeOffsets[i];

        // Offset may be undefined. Fix that.
        if(!offset){
            offset = this.shapeOffsets[i] = vec2.create();
        }

        vec2.sub(offset,offset,cm);
    }

    // Move the body position too
    vec2.add(this.position,this.position,cm);

    // And concave path
    for(var i=0; this.concavePath && i<this.concavePath.length; i++){
        vec2.sub(this.concavePath[i], this.concavePath[i], cm);
    }

    this.updateMassProperties();
    this.updateBoundingRadius();
};

/**
 * Sets the force on the body to zero.
 * @method setZeroForce
 */
Body.prototype.setZeroForce = function(){
    vec2.set(this.force,0.0,0.0);
    this.angularForce = 0.0;
};

Body.prototype.resetConstraintVelocity = function(){
    var b = this,
        vlambda = b.vlambda;
    vec2.set(vlambda,0,0);
    b.wlambda = 0;
};

Body.prototype.addConstraintVelocity = function(){
    var b = this,
        v = b.velocity;
    vec2.add( v, v, b.vlambda);
    b.angularVelocity += b.wlambda;
};

/**
 * Apply damping, see <a href="http://code.google.com/p/bullet/issues/detail?id=74">this</a> for details.
 * @method applyDamping
 * @param  {number} dt Current time step
 */
Body.prototype.applyDamping = function(dt){
    if(this.type === Body.DYNAMIC){ // Only for dynamic bodies
        var v = this.velocity;
        vec2.scale(v, v, Math.pow(1.0 - this.damping,dt));
        this.angularVelocity *= Math.pow(1.0 - this.angularDamping,dt);
    }
};

/**
 * Wake the body up. Normally you should not need this, as the body is automatically awoken at events such as collisions.
 * Sets the sleepState to {{#crossLink "Body/AWAKE:property"}}Body.AWAKE{{/crossLink}} and emits the wakeUp event if the body wasn't awake before.
 * @method wakeUp
 */
Body.prototype.wakeUp = function(){
    var s = this.sleepState;
    this.sleepState = Body.AWAKE;
    this.idleTime = 0;
    if(s !== Body.AWAKE){
        this.emit(Body.wakeUpEvent);
    }
};

/**
 * Force body sleep
 * @method sleep
 */
Body.prototype.sleep = function(){
    this.sleepState = Body.SLEEPING;
    this.angularVelocity = 0;
    this.angularForce = 0;
    vec2.set(this.velocity,0,0);
    vec2.set(this.force,0,0);
    this.emit(Body.sleepEvent);
};

/**
 * Called every timestep to update internal sleep timer and change sleep state if needed.
 * @method sleepTick
 * @param {number} time The world time in seconds
 * @param {boolean} dontSleep
 * @param {number} dt
 */
Body.prototype.sleepTick = function(time, dontSleep, dt){
    if(!this.allowSleep || this.type === Body.SLEEPING){
        return;
    }

    this.wantsToSleep = false;

    var sleepState = this.sleepState,
        speedSquared = vec2.squaredLength(this.velocity) + Math.pow(this.angularVelocity,2),
        speedLimitSquared = Math.pow(this.sleepSpeedLimit,2);

    // Add to idle time
    if(speedSquared >= speedLimitSquared){
        this.idleTime = 0;
        this.sleepState = Body.AWAKE;
    } else {
        this.idleTime += dt;
        this.sleepState = Body.SLEEPY;
    }
    if(this.idleTime > this.sleepTimeLimit){
        if(!dontSleep){
            this.sleep();
        } else {
            this.wantsToSleep = true;
        }
    }

    /*
    if(sleepState===Body.AWAKE && speedSquared < speedLimitSquared){
        this.sleepState = Body.SLEEPY; // Sleepy
        this.timeLastSleepy = time;
        this.emit(Body.sleepyEvent);
    } else if(sleepState===Body.SLEEPY && speedSquared >= speedLimitSquared){
        this.wakeUp(); // Wake up
    } else if(sleepState===Body.SLEEPY && (time - this.timeLastSleepy ) > this.sleepTimeLimit){
        this.wantsToSleep = true;
        if(!dontSleep){
            this.sleep();
        }
    }
    */
};

Body.prototype.getVelocityFromPosition = function(store, timeStep){
    store = store || vec2.create();
    vec2.sub(store, this.position, this.previousPosition);
    vec2.scale(store, store, 1/timeStep);
    return store;
};

Body.prototype.getAngularVelocityFromPosition = function(timeStep){
    return (this.angle - this.previousAngle) / timeStep;
};

/**
 * Check if the body is overlapping another body. Note that this method only works if the body was added to a World and if at least one step was taken.
 * @method overlaps
 * @param  {Body} body
 * @return {boolean}
 */
Body.prototype.overlaps = function(body){
    return this.world.overlapKeeper.bodiesAreOverlapping(this, body);
};

var integrate_fhMinv = vec2.create();
var integrate_velodt = vec2.create();

/**
 * Move the body forward in time given its current velocity.
 * @method integrate
 * @param  {Number} dt
 */
Body.prototype.integrate = function(dt){
    var minv = this.invMass,
        f = this.force,
        pos = this.position,
        velo = this.velocity;

    // Save old position
    vec2.copy(this.previousPosition, this.position);
    this.previousAngle = this.angle;

    // Velocity update
    if(!this.fixedRotation){
        this.angularVelocity += this.angularForce * this.invInertia * dt;
    }
    vec2.scale(integrate_fhMinv, f, dt * minv);
    vec2.add(velo, integrate_fhMinv, velo);

    // CCD
    if(!this.integrateToTimeOfImpact(dt)){

        // Regular position update
        vec2.scale(integrate_velodt, velo, dt);
        vec2.add(pos, pos, integrate_velodt);
        if(!this.fixedRotation){
            this.angle += this.angularVelocity * dt;
        }
    }

    this.aabbNeedsUpdate = true;
};

var direction = vec2.create();
var end = vec2.create();
var startToEnd = vec2.create();
var rememberPosition = vec2.create();
Body.prototype.integrateToTimeOfImpact = function(dt){

    if(this.ccdSpeedThreshold < 0 || vec2.squaredLength(this.velocity) < Math.pow(this.ccdSpeedThreshold, 2)){
        return false;
    }

    vec2.normalize(direction, this.velocity);

    vec2.scale(end, this.velocity, dt);
    vec2.add(end, end, this.position);

    vec2.sub(startToEnd, end, this.position);
    var startToEndAngle = this.angularVelocity * dt;
    var len = vec2.length(startToEnd);

    var timeOfImpact = 1;

    var hit;
    var that = this;
    this.world.raycastAll(this.position, end, {}, function (result) {
        if(result.body === that){
            return;
        }
        hit = result.body;
        vec2.copy(end, result.hitPointWorld);
        vec2.sub(startToEnd, result.hitPointWorld, that.position);
        timeOfImpact = vec2.length(startToEnd) / len;
        result.abort();
    });

    if(!hit){
        return false;
    }

    var rememberAngle = this.angle;
    vec2.copy(rememberPosition, this.position);

    // Got a start and end point. Approximate time of impact using binary search
    var iter = 0;
    var tmin = 0;
    var tmid = 0;
    var tmax = timeOfImpact;
    while (tmax >= tmin && iter < this.ccdIterations) {
        iter++;

        // calculate the midpoint
        tmid = (tmax - tmin) / 2;

        // Move the body to that point
        vec2.scale(integrate_velodt, startToEnd, timeOfImpact);
        vec2.add(this.position, rememberPosition, integrate_velodt);
        this.angle = rememberAngle + startToEndAngle * timeOfImpact;
        this.updateAABB();

        // check overlap
        var overlaps = this.aabb.overlaps(hit.aabb) && this.world.narrowphase.bodiesOverlap(this, hit);

        if (overlaps) {
            // change min to search upper interval
            tmin = tmid;
        } else {
            // change max to search lower interval
            tmax = tmid;
        }
    }

    timeOfImpact = tmid;

    vec2.copy(this.position, rememberPosition);
    this.angle = rememberAngle;

    // move to TOI
    vec2.scale(integrate_velodt, startToEnd, timeOfImpact);
    vec2.add(this.position, this.position, integrate_velodt);
    if(!this.fixedRotation){
        this.angle += startToEndAngle * timeOfImpact;
    }

    return true;
};

/**
 * @event sleepy
 */
Body.sleepyEvent = {
    type: "sleepy"
};

/**
 * @event sleep
 */
Body.sleepEvent = {
    type: "sleep"
};

/**
 * @event wakeup
 */
Body.wakeUpEvent = {
    type: "wakeup"
};

/**
 * Dynamic body.
 * @property DYNAMIC
 * @type {Number}
 * @static
 */
Body.DYNAMIC = 1;

/**
 * Static body.
 * @property STATIC
 * @type {Number}
 * @static
 */
Body.STATIC = 2;

/**
 * Kinematic body.
 * @property KINEMATIC
 * @type {Number}
 * @static
 */
Body.KINEMATIC = 4;

/**
 * @property AWAKE
 * @type {Number}
 * @static
 */
Body.AWAKE = 0;

/**
 * @property SLEEPY
 * @type {Number}
 * @static
 */
Body.SLEEPY = 1;

/**
 * @property SLEEPING
 * @type {Number}
 * @static
 */
Body.SLEEPING = 2;



},
function(require, exports, module, global) {

module.exports = {
    Polygon : require(197),
    Point : require(200),
};


},
function(require, exports, module, global) {

var Line = require(198)
,   Point = require(200)
,   Scalar = require(199)

module.exports = Polygon;

/**
 * Polygon class.
 * @class Polygon
 * @constructor
 */
function Polygon(){

    /**
     * Vertices that this polygon consists of. An array of array of numbers, example: [[0,0],[1,0],..]
     * @property vertices
     * @type {Array}
     */
    this.vertices = [];
}

/**
 * Get a vertex at position i. It does not matter if i is out of bounds, this function will just cycle.
 * @method at
 * @param  {Number} i
 * @return {Array}
 */
Polygon.prototype.at = function(i){
    var v = this.vertices,
        s = v.length;
    return v[i < 0 ? i % s + s : i % s];
};

/**
 * Get first vertex
 * @method first
 * @return {Array}
 */
Polygon.prototype.first = function(){
    return this.vertices[0];
};

/**
 * Get last vertex
 * @method last
 * @return {Array}
 */
Polygon.prototype.last = function(){
    return this.vertices[this.vertices.length-1];
};

/**
 * Clear the polygon data
 * @method clear
 * @return {Array}
 */
Polygon.prototype.clear = function(){
    this.vertices.length = 0;
};

/**
 * Append points "from" to "to"-1 from an other polygon "poly" onto this one.
 * @method append
 * @param {Polygon} poly The polygon to get points from.
 * @param {Number}  from The vertex index in "poly".
 * @param {Number}  to The end vertex index in "poly". Note that this vertex is NOT included when appending.
 * @return {Array}
 */
Polygon.prototype.append = function(poly,from,to){
    if(typeof(from) == "undefined") throw new Error("From is not given!");
    if(typeof(to) == "undefined")   throw new Error("To is not given!");

    if(to-1 < from)                 throw new Error("lol1");
    if(to > poly.vertices.length)   throw new Error("lol2");
    if(from < 0)                    throw new Error("lol3");

    for(var i=from; i<to; i++){
        this.vertices.push(poly.vertices[i]);
    }
};

/**
 * Make sure that the polygon vertices are ordered counter-clockwise.
 * @method makeCCW
 */
Polygon.prototype.makeCCW = function(){
    var br = 0,
        v = this.vertices;

    // find bottom right point
    for (var i = 1; i < this.vertices.length; ++i) {
        if (v[i][1] < v[br][1] || (v[i][1] == v[br][1] && v[i][0] > v[br][0])) {
            br = i;
        }
    }

    // reverse poly if clockwise
    if (!Point.left(this.at(br - 1), this.at(br), this.at(br + 1))) {
        this.reverse();
    }
};

/**
 * Reverse the vertices in the polygon
 * @method reverse
 */
Polygon.prototype.reverse = function(){
    var tmp = [];
    for(var i=0, N=this.vertices.length; i!==N; i++){
        tmp.push(this.vertices.pop());
    }
    this.vertices = tmp;
};

/**
 * Check if a point in the polygon is a reflex point
 * @method isReflex
 * @param  {Number}  i
 * @return {Boolean}
 */
Polygon.prototype.isReflex = function(i){
    return Point.right(this.at(i - 1), this.at(i), this.at(i + 1));
};

var tmpLine1=[],
    tmpLine2=[];

/**
 * Check if two vertices in the polygon can see each other
 * @method canSee
 * @param  {Number} a Vertex index 1
 * @param  {Number} b Vertex index 2
 * @return {Boolean}
 */
Polygon.prototype.canSee = function(a,b) {
    var p, dist, l1=tmpLine1, l2=tmpLine2;

    if (Point.leftOn(this.at(a + 1), this.at(a), this.at(b)) && Point.rightOn(this.at(a - 1), this.at(a), this.at(b))) {
        return false;
    }
    dist = Point.sqdist(this.at(a), this.at(b));
    for (var i = 0; i !== this.vertices.length; ++i) { // for each edge
        if ((i + 1) % this.vertices.length === a || i === a) // ignore incident edges
            continue;
        if (Point.leftOn(this.at(a), this.at(b), this.at(i + 1)) && Point.rightOn(this.at(a), this.at(b), this.at(i))) { // if diag intersects an edge
            l1[0] = this.at(a);
            l1[1] = this.at(b);
            l2[0] = this.at(i);
            l2[1] = this.at(i + 1);
            p = Line.lineInt(l1,l2);
            if (Point.sqdist(this.at(a), p) < dist) { // if edge is blocking visibility to b
                return false;
            }
        }
    }

    return true;
};

/**
 * Copy the polygon from vertex i to vertex j.
 * @method copy
 * @param  {Number} i
 * @param  {Number} j
 * @param  {Polygon} [targetPoly]   Optional target polygon to save in.
 * @return {Polygon}                The resulting copy.
 */
Polygon.prototype.copy = function(i,j,targetPoly){
    var p = targetPoly || new Polygon();
    p.clear();
    if (i < j) {
        // Insert all vertices from i to j
        for(var k=i; k<=j; k++)
            p.vertices.push(this.vertices[k]);

    } else {

        // Insert vertices 0 to j
        for(var k=0; k<=j; k++)
            p.vertices.push(this.vertices[k]);

        // Insert vertices i to end
        for(var k=i; k<this.vertices.length; k++)
            p.vertices.push(this.vertices[k]);
    }

    return p;
};

/**
 * Decomposes the polygon into convex pieces. Returns a list of edges [[p1,p2],[p2,p3],...] that cuts the polygon.
 * Note that this algorithm has complexity O(N^4) and will be very slow for polygons with many vertices.
 * @method getCutEdges
 * @return {Array}
 */
Polygon.prototype.getCutEdges = function() {
    var min=[], tmp1=[], tmp2=[], tmpPoly = new Polygon();
    var nDiags = Number.MAX_VALUE;

    for (var i = 0; i < this.vertices.length; ++i) {
        if (this.isReflex(i)) {
            for (var j = 0; j < this.vertices.length; ++j) {
                if (this.canSee(i, j)) {
                    tmp1 = this.copy(i, j, tmpPoly).getCutEdges();
                    tmp2 = this.copy(j, i, tmpPoly).getCutEdges();

                    for(var k=0; k<tmp2.length; k++)
                        tmp1.push(tmp2[k]);

                    if (tmp1.length < nDiags) {
                        min = tmp1;
                        nDiags = tmp1.length;
                        min.push([this.at(i), this.at(j)]);
                    }
                }
            }
        }
    }

    return min;
};

/**
 * Decomposes the polygon into one or more convex sub-Polygons.
 * @method decomp
 * @return {Array} An array or Polygon objects.
 */
Polygon.prototype.decomp = function(){
    var edges = this.getCutEdges();
    if(edges.length > 0)
        return this.slice(edges);
    else
        return [this];
};

/**
 * Slices the polygon given one or more cut edges. If given one, this function will return two polygons (false on failure). If many, an array of polygons.
 * @method slice
 * @param {Array} cutEdges A list of edges, as returned by .getCutEdges()
 * @return {Array}
 */
Polygon.prototype.slice = function(cutEdges){
    if(cutEdges.length == 0) return [this];
    if(cutEdges instanceof Array && cutEdges.length && cutEdges[0] instanceof Array && cutEdges[0].length==2 && cutEdges[0][0] instanceof Array){

        var polys = [this];

        for(var i=0; i<cutEdges.length; i++){
            var cutEdge = cutEdges[i];
            // Cut all polys
            for(var j=0; j<polys.length; j++){
                var poly = polys[j];
                var result = poly.slice(cutEdge);
                if(result){
                    // Found poly! Cut and quit
                    polys.splice(j,1);
                    polys.push(result[0],result[1]);
                    break;
                }
            }
        }

        return polys;
    } else {

        // Was given one edge
        var cutEdge = cutEdges;
        var i = this.vertices.indexOf(cutEdge[0]);
        var j = this.vertices.indexOf(cutEdge[1]);

        if(i != -1 && j != -1){
            return [this.copy(i,j),
                    this.copy(j,i)];
        } else {
            return false;
        }
    }
};

/**
 * Checks that the line segments of this polygon do not intersect each other.
 * @method isSimple
 * @param  {Array} path An array of vertices e.g. [[0,0],[0,1],...]
 * @return {Boolean}
 * @todo Should it check all segments with all others?
 */
Polygon.prototype.isSimple = function(){
    var path = this.vertices;
    // Check
    for(var i=0; i<path.length-1; i++){
        for(var j=0; j<i-1; j++){
            if(Line.segmentsIntersect(path[i], path[i+1], path[j], path[j+1] )){
                return false;
            }
        }
    }

    // Check the segment between the last and the first point to all others
    for(var i=1; i<path.length-2; i++){
        if(Line.segmentsIntersect(path[0], path[path.length-1], path[i], path[i+1] )){
            return false;
        }
    }

    return true;
};

function getIntersectionPoint(p1, p2, q1, q2, delta){
    delta = delta || 0;
   var a1 = p2[1] - p1[1];
   var b1 = p1[0] - p2[0];
   var c1 = (a1 * p1[0]) + (b1 * p1[1]);
   var a2 = q2[1] - q1[1];
   var b2 = q1[0] - q2[0];
   var c2 = (a2 * q1[0]) + (b2 * q1[1]);
   var det = (a1 * b2) - (a2 * b1);

   if(!Scalar.eq(det,0,delta))
      return [((b2 * c1) - (b1 * c2)) / det, ((a1 * c2) - (a2 * c1)) / det]
   else
      return [0,0]
}

/**
 * Quickly decompose the Polygon into convex sub-polygons.
 * @method quickDecomp
 * @param  {Array} result
 * @param  {Array} [reflexVertices]
 * @param  {Array} [steinerPoints]
 * @param  {Number} [delta]
 * @param  {Number} [maxlevel]
 * @param  {Number} [level]
 * @return {Array}
 */
Polygon.prototype.quickDecomp = function(result,reflexVertices,steinerPoints,delta,maxlevel,level){
    maxlevel = maxlevel || 100;
    level = level || 0;
    delta = delta || 25;
    result = typeof(result)!="undefined" ? result : [];
    reflexVertices = reflexVertices || [];
    steinerPoints = steinerPoints || [];

    var upperInt=[0,0], lowerInt=[0,0], p=[0,0]; // Points
    var upperDist=0, lowerDist=0, d=0, closestDist=0; // scalars
    var upperIndex=0, lowerIndex=0, closestIndex=0; // Integers
    var lowerPoly=new Polygon(), upperPoly=new Polygon(); // polygons
    var poly = this,
        v = this.vertices;

    if(v.length < 3) return result;

    level++;
    if(level > maxlevel){
        console.warn("quickDecomp: max level ("+maxlevel+") reached.");
        return result;
    }

    for (var i = 0; i < this.vertices.length; ++i) {
        if (poly.isReflex(i)) {
            reflexVertices.push(poly.vertices[i]);
            upperDist = lowerDist = Number.MAX_VALUE;


            for (var j = 0; j < this.vertices.length; ++j) {
                if (Point.left(poly.at(i - 1), poly.at(i), poly.at(j))
                        && Point.rightOn(poly.at(i - 1), poly.at(i), poly.at(j - 1))) { // if line intersects with an edge
                    p = getIntersectionPoint(poly.at(i - 1), poly.at(i), poly.at(j), poly.at(j - 1)); // find the point of intersection
                    if (Point.right(poly.at(i + 1), poly.at(i), p)) { // make sure it's inside the poly
                        d = Point.sqdist(poly.vertices[i], p);
                        if (d < lowerDist) { // keep only the closest intersection
                            lowerDist = d;
                            lowerInt = p;
                            lowerIndex = j;
                        }
                    }
                }
                if (Point.left(poly.at(i + 1), poly.at(i), poly.at(j + 1))
                        && Point.rightOn(poly.at(i + 1), poly.at(i), poly.at(j))) {
                    p = getIntersectionPoint(poly.at(i + 1), poly.at(i), poly.at(j), poly.at(j + 1));
                    if (Point.left(poly.at(i - 1), poly.at(i), p)) {
                        d = Point.sqdist(poly.vertices[i], p);
                        if (d < upperDist) {
                            upperDist = d;
                            upperInt = p;
                            upperIndex = j;
                        }
                    }
                }
            }

            // if there are no vertices to connect to, choose a point in the middle
            if (lowerIndex == (upperIndex + 1) % this.vertices.length) {
                //console.log("Case 1: Vertex("+i+"), lowerIndex("+lowerIndex+"), upperIndex("+upperIndex+"), poly.size("+this.vertices.length+")");
                p[0] = (lowerInt[0] + upperInt[0]) / 2;
                p[1] = (lowerInt[1] + upperInt[1]) / 2;
                steinerPoints.push(p);

                if (i < upperIndex) {
                    //lowerPoly.insert(lowerPoly.end(), poly.begin() + i, poly.begin() + upperIndex + 1);
                    lowerPoly.append(poly, i, upperIndex+1);
                    lowerPoly.vertices.push(p);
                    upperPoly.vertices.push(p);
                    if (lowerIndex != 0){
                        //upperPoly.insert(upperPoly.end(), poly.begin() + lowerIndex, poly.end());
                        upperPoly.append(poly,lowerIndex,poly.vertices.length);
                    }
                    //upperPoly.insert(upperPoly.end(), poly.begin(), poly.begin() + i + 1);
                    upperPoly.append(poly,0,i+1);
                } else {
                    if (i != 0){
                        //lowerPoly.insert(lowerPoly.end(), poly.begin() + i, poly.end());
                        lowerPoly.append(poly,i,poly.vertices.length);
                    }
                    //lowerPoly.insert(lowerPoly.end(), poly.begin(), poly.begin() + upperIndex + 1);
                    lowerPoly.append(poly,0,upperIndex+1);
                    lowerPoly.vertices.push(p);
                    upperPoly.vertices.push(p);
                    //upperPoly.insert(upperPoly.end(), poly.begin() + lowerIndex, poly.begin() + i + 1);
                    upperPoly.append(poly,lowerIndex,i+1);
                }
            } else {
                // connect to the closest point within the triangle
                //console.log("Case 2: Vertex("+i+"), closestIndex("+closestIndex+"), poly.size("+this.vertices.length+")\n");

                if (lowerIndex > upperIndex) {
                    upperIndex += this.vertices.length;
                }
                closestDist = Number.MAX_VALUE;

                if(upperIndex < lowerIndex){
                    return result;
                }

                for (var j = lowerIndex; j <= upperIndex; ++j) {
                    if (Point.leftOn(poly.at(i - 1), poly.at(i), poly.at(j))
                            && Point.rightOn(poly.at(i + 1), poly.at(i), poly.at(j))) {
                        d = Point.sqdist(poly.at(i), poly.at(j));
                        if (d < closestDist) {
                            closestDist = d;
                            closestIndex = j % this.vertices.length;
                        }
                    }
                }

                if (i < closestIndex) {
                    lowerPoly.append(poly,i,closestIndex+1);
                    if (closestIndex != 0){
                        upperPoly.append(poly,closestIndex,v.length);
                    }
                    upperPoly.append(poly,0,i+1);
                } else {
                    if (i != 0){
                        lowerPoly.append(poly,i,v.length);
                    }
                    lowerPoly.append(poly,0,closestIndex+1);
                    upperPoly.append(poly,closestIndex,i+1);
                }
            }

            // solve smallest poly first
            if (lowerPoly.vertices.length < upperPoly.vertices.length) {
                lowerPoly.quickDecomp(result,reflexVertices,steinerPoints,delta,maxlevel,level);
                upperPoly.quickDecomp(result,reflexVertices,steinerPoints,delta,maxlevel,level);
            } else {
                upperPoly.quickDecomp(result,reflexVertices,steinerPoints,delta,maxlevel,level);
                lowerPoly.quickDecomp(result,reflexVertices,steinerPoints,delta,maxlevel,level);
            }

            return result;
        }
    }
    result.push(this);

    return result;
};

/**
 * Remove collinear points in the polygon.
 * @method removeCollinearPoints
 * @param  {Number} [precision] The threshold angle to use when determining whether two edges are collinear. Use zero for finest precision.
 * @return {Number}           The number of points removed
 */
Polygon.prototype.removeCollinearPoints = function(precision){
    var num = 0;
    for(var i=this.vertices.length-1; this.vertices.length>3 && i>=0; --i){
        if(Point.collinear(this.at(i-1),this.at(i),this.at(i+1),precision)){
            // Remove the middle point
            this.vertices.splice(i%this.vertices.length,1);
            i--; // Jump one point forward. Otherwise we may get a chain removal
            num++;
        }
    }
    return num;
};


},
function(require, exports, module, global) {

var Scalar = require(199);

module.exports = Line;

/**
 * Container for line-related functions
 * @class Line
 */
function Line(){};

/**
 * Compute the intersection between two lines.
 * @static
 * @method lineInt
 * @param  {Array}  l1          Line vector 1
 * @param  {Array}  l2          Line vector 2
 * @param  {Number} precision   Precision to use when checking if the lines are parallel
 * @return {Array}              The intersection point.
 */
Line.lineInt = function(l1,l2,precision){
    precision = precision || 0;
    var i = [0,0]; // point
    var a1, b1, c1, a2, b2, c2, det; // scalars
    a1 = l1[1][1] - l1[0][1];
    b1 = l1[0][0] - l1[1][0];
    c1 = a1 * l1[0][0] + b1 * l1[0][1];
    a2 = l2[1][1] - l2[0][1];
    b2 = l2[0][0] - l2[1][0];
    c2 = a2 * l2[0][0] + b2 * l2[0][1];
    det = a1 * b2 - a2*b1;
    if (!Scalar.eq(det, 0, precision)) { // lines are not parallel
        i[0] = (b2 * c1 - b1 * c2) / det;
        i[1] = (a1 * c2 - a2 * c1) / det;
    }
    return i;
};

/**
 * Checks if two line segments intersects.
 * @method segmentsIntersect
 * @param {Array} p1 The start vertex of the first line segment.
 * @param {Array} p2 The end vertex of the first line segment.
 * @param {Array} q1 The start vertex of the second line segment.
 * @param {Array} q2 The end vertex of the second line segment.
 * @return {Boolean} True if the two line segments intersect
 */
Line.segmentsIntersect = function(p1, p2, q1, q2){
   var dx = p2[0] - p1[0];
   var dy = p2[1] - p1[1];
   var da = q2[0] - q1[0];
   var db = q2[1] - q1[1];

   // segments are parallel
   if(da*dy - db*dx == 0)
      return false;

   var s = (dx * (q1[1] - p1[1]) + dy * (p1[0] - q1[0])) / (da * dy - db * dx)
   var t = (da * (p1[1] - q1[1]) + db * (q1[0] - p1[0])) / (db * dx - da * dy)

   return (s>=0 && s<=1 && t>=0 && t<=1);
};



},
function(require, exports, module, global) {

module.exports = Scalar;

/**
 * Scalar functions
 * @class Scalar
 */
function Scalar(){}

/**
 * Check if two scalars are equal
 * @static
 * @method eq
 * @param  {Number} a
 * @param  {Number} b
 * @param  {Number} [precision]
 * @return {Boolean}
 */
Scalar.eq = function(a,b,precision){
    precision = precision || 0;
    return Math.abs(a-b) < precision;
};


},
function(require, exports, module, global) {

module.exports = Point;

/**
 * Point related functions
 * @class Point
 */
function Point(){};

/**
 * Get the area of a triangle spanned by the three given points. Note that the area will be negative if the points are not given in counter-clockwise order.
 * @static
 * @method area
 * @param  {Array} a
 * @param  {Array} b
 * @param  {Array} c
 * @return {Number}
 */
Point.area = function(a,b,c){
    return (((b[0] - a[0])*(c[1] - a[1]))-((c[0] - a[0])*(b[1] - a[1])));
};

Point.left = function(a,b,c){
    return Point.area(a,b,c) > 0;
};

Point.leftOn = function(a,b,c) {
    return Point.area(a, b, c) >= 0;
};

Point.right = function(a,b,c) {
    return Point.area(a, b, c) < 0;
};

Point.rightOn = function(a,b,c) {
    return Point.area(a, b, c) <= 0;
};

var tmpPoint1 = [],
    tmpPoint2 = [];

/**
 * Check if three points are collinear
 * @method collinear
 * @param  {Array} a
 * @param  {Array} b
 * @param  {Array} c
 * @param  {Number} [thresholdAngle=0] Threshold angle to use when comparing the vectors. The function will return true if the angle between the resulting vectors is less than this value. Use zero for max precision.
 * @return {Boolean}
 */
Point.collinear = function(a,b,c,thresholdAngle) {
    if(!thresholdAngle)
        return Point.area(a, b, c) == 0;
    else {
        var ab = tmpPoint1,
            bc = tmpPoint2;

        ab[0] = b[0]-a[0];
        ab[1] = b[1]-a[1];
        bc[0] = c[0]-b[0];
        bc[1] = c[1]-b[1];

        var dot = ab[0]*bc[0] + ab[1]*bc[1],
            magA = Math.sqrt(ab[0]*ab[0] + ab[1]*ab[1]),
            magB = Math.sqrt(bc[0]*bc[0] + bc[1]*bc[1]),
            angle = Math.acos(dot/(magA*magB));
        return angle < thresholdAngle;
    }
};

Point.sqdist = function(a,b){
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    return dx * dx + dy * dy;
};


},
function(require, exports, module, global) {

var Shape = require(202)
,   vec2 = require(191)
,   polyk = require(203)
,   decomp = require(196);

module.exports = Convex;

/**
 * Convex shape class.
 * @class Convex
 * @constructor
 * @extends Shape
 * @param {Array} vertices An array of vertices that span this shape. Vertices are given in counter-clockwise (CCW) direction.
 * @param {Array} [axes] An array of unit length vectors, representing the symmetry axes in the convex.
 * @example
 *     // Create a box
 *     var vertices = [[-1,-1], [1,-1], [1,1], [-1,1]];
 *     var convexShape = new Convex(vertices);
 *     body.addShape(convexShape);
 */
function Convex(vertices, axes){

    /**
     * Vertices defined in the local frame.
     * @property vertices
     * @type {Array}
     */
    this.vertices = [];

    /**
     * Axes defined in the local frame.
     * @property axes
     * @type {Array}
     */
    this.axes = [];

    // Copy the verts
    for(var i=0; i<vertices.length; i++){
        var v = vec2.create();
        vec2.copy(v,vertices[i]);
        this.vertices.push(v);
    }

    if(axes){
        // Copy the axes
        for(var i=0; i < axes.length; i++){
            var axis = vec2.create();
            vec2.copy(axis, axes[i]);
            this.axes.push(axis);
        }
    } else {
        // Construct axes from the vertex data
        for(var i = 0; i < vertices.length; i++){
            // Get the world edge
            var worldPoint0 = vertices[i];
            var worldPoint1 = vertices[(i+1) % vertices.length];

            var normal = vec2.create();
            vec2.sub(normal, worldPoint1, worldPoint0);

            // Get normal - just rotate 90 degrees since vertices are given in CCW
            vec2.rotate90cw(normal, normal);
            vec2.normalize(normal, normal);

            this.axes.push(normal);
        }
    }

    /**
     * The center of mass of the Convex
     * @property centerOfMass
     * @type {Array}
     */
    this.centerOfMass = vec2.fromValues(0,0);

    /**
     * Triangulated version of this convex. The structure is Array of 3-Arrays, and each subarray contains 3 integers, referencing the vertices.
     * @property triangles
     * @type {Array}
     */
    this.triangles = [];

    if(this.vertices.length){
        this.updateTriangles();
        this.updateCenterOfMass();
    }

    /**
     * The bounding radius of the convex
     * @property boundingRadius
     * @type {Number}
     */
    this.boundingRadius = 0;

    Shape.call(this, Shape.CONVEX);

    this.updateBoundingRadius();
    this.updateArea();
    if(this.area < 0){
        throw new Error("Convex vertices must be given in conter-clockwise winding.");
    }
}
Convex.prototype = new Shape();
Convex.prototype.constructor = Convex;

var tmpVec1 = vec2.create();
var tmpVec2 = vec2.create();

/**
 * Project a Convex onto a world-oriented axis
 * @method projectOntoAxis
 * @static
 * @param  {Array} offset
 * @param  {Array} localAxis
 * @param  {Array} result
 */
Convex.prototype.projectOntoLocalAxis = function(localAxis, result){
    var max=null,
        min=null,
        v,
        value,
        localAxis = tmpVec1;

    // Get projected position of all vertices
    for(var i=0; i<this.vertices.length; i++){
        v = this.vertices[i];
        value = vec2.dot(v, localAxis);
        if(max === null || value > max){
            max = value;
        }
        if(min === null || value < min){
            min = value;
        }
    }

    if(min > max){
        var t = min;
        min = max;
        max = t;
    }

    vec2.set(result, min, max);
};

Convex.prototype.projectOntoWorldAxis = function(localAxis, shapeOffset, shapeAngle, result){
    var worldAxis = tmpVec2;

    this.projectOntoLocalAxis(localAxis, result);

    // Project the position of the body onto the axis - need to add this to the result
    if(shapeAngle !== 0){
        vec2.rotate(worldAxis, localAxis, shapeAngle);
    } else {
        worldAxis = localAxis;
    }
    var offset = vec2.dot(shapeOffset, worldAxis);

    vec2.set(result, result[0] + offset, result[1] + offset);
};


/**
 * Update the .triangles property
 * @method updateTriangles
 */
Convex.prototype.updateTriangles = function(){

    this.triangles.length = 0;

    // Rewrite on polyk notation, array of numbers
    var polykVerts = [];
    for(var i=0; i<this.vertices.length; i++){
        var v = this.vertices[i];
        polykVerts.push(v[0],v[1]);
    }

    // Triangulate
    var triangles = polyk.Triangulate(polykVerts);

    // Loop over all triangles, add their inertia contributions to I
    for(var i=0; i<triangles.length; i+=3){
        var id1 = triangles[i],
            id2 = triangles[i+1],
            id3 = triangles[i+2];

        // Add to triangles
        this.triangles.push([id1,id2,id3]);
    }
};

var updateCenterOfMass_centroid = vec2.create(),
    updateCenterOfMass_centroid_times_mass = vec2.create(),
    updateCenterOfMass_a = vec2.create(),
    updateCenterOfMass_b = vec2.create(),
    updateCenterOfMass_c = vec2.create(),
    updateCenterOfMass_ac = vec2.create(),
    updateCenterOfMass_ca = vec2.create(),
    updateCenterOfMass_cb = vec2.create(),
    updateCenterOfMass_n = vec2.create();

/**
 * Update the .centerOfMass property.
 * @method updateCenterOfMass
 */
Convex.prototype.updateCenterOfMass = function(){
    var triangles = this.triangles,
        verts = this.vertices,
        cm = this.centerOfMass,
        centroid = updateCenterOfMass_centroid,
        n = updateCenterOfMass_n,
        a = updateCenterOfMass_a,
        b = updateCenterOfMass_b,
        c = updateCenterOfMass_c,
        ac = updateCenterOfMass_ac,
        ca = updateCenterOfMass_ca,
        cb = updateCenterOfMass_cb,
        centroid_times_mass = updateCenterOfMass_centroid_times_mass;

    vec2.set(cm,0,0);
    var totalArea = 0;

    for(var i=0; i!==triangles.length; i++){
        var t = triangles[i],
            a = verts[t[0]],
            b = verts[t[1]],
            c = verts[t[2]];

        vec2.centroid(centroid,a,b,c);

        // Get mass for the triangle (density=1 in this case)
        // http://math.stackexchange.com/questions/80198/area-of-triangle-via-vectors
        var m = Convex.triangleArea(a,b,c);
        totalArea += m;

        // Add to center of mass
        vec2.scale(centroid_times_mass, centroid, m);
        vec2.add(cm, cm, centroid_times_mass);
    }

    vec2.scale(cm,cm,1/totalArea);
};

/**
 * Compute the mass moment of inertia of the Convex.
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 * @see http://www.gamedev.net/topic/342822-moment-of-inertia-of-a-polygon-2d/
 */
Convex.prototype.computeMomentOfInertia = function(mass){
    var denom = 0.0,
        numer = 0.0,
        N = this.vertices.length;
    for(var j = N-1, i = 0; i < N; j = i, i ++){
        var p0 = this.vertices[j];
        var p1 = this.vertices[i];
        var a = Math.abs(vec2.crossLength(p0,p1));
        var b = vec2.dot(p1,p1) + vec2.dot(p1,p0) + vec2.dot(p0,p0);
        denom += a * b;
        numer += a;
    }
    return (mass / 6.0) * (denom / numer);
};

/**
 * Updates the .boundingRadius property
 * @method updateBoundingRadius
 */
Convex.prototype.updateBoundingRadius = function(){
    var verts = this.vertices,
        r2 = 0;

    for(var i=0; i!==verts.length; i++){
        var l2 = vec2.squaredLength(verts[i]);
        if(l2 > r2){
            r2 = l2;
        }
    }

    this.boundingRadius = Math.sqrt(r2);
};

/**
 * Get the area of the triangle spanned by the three points a, b, c. The area is positive if the points are given in counter-clockwise order, otherwise negative.
 * @static
 * @method triangleArea
 * @param {Array} a
 * @param {Array} b
 * @param {Array} c
 * @return {Number}
 */
Convex.triangleArea = function(a,b,c){
    return (((b[0] - a[0])*(c[1] - a[1]))-((c[0] - a[0])*(b[1] - a[1]))) * 0.5;
};

/**
 * Update the .area
 * @method updateArea
 */
Convex.prototype.updateArea = function(){
    this.updateTriangles();
    this.area = 0;

    var triangles = this.triangles,
        verts = this.vertices;
    for(var i=0; i!==triangles.length; i++){
        var t = triangles[i],
            a = verts[t[0]],
            b = verts[t[1]],
            c = verts[t[2]];

        // Get mass for the triangle (density=1 in this case)
        var m = Convex.triangleArea(a,b,c);
        this.area += m;
    }
};

/**
 * @method computeAABB
 * @param  {AABB}   out
 * @param  {Array}  position
 * @param  {Number} angle
 */
Convex.prototype.computeAABB = function(out, position, angle){
    out.setFromPoints(this.vertices, position, angle, 0);
};


},
function(require, exports, module, global) {

module.exports = Shape;

/**
 * Base class for shapes.
 * @class Shape
 * @constructor
 * @param {Number} type
 */
function Shape(type){

    /**
     * The type of the shape. One of:
     *
     * * {{#crossLink "Shape/CIRCLE:property"}}Shape.CIRCLE{{/crossLink}}
     * * {{#crossLink "Shape/PARTICLE:property"}}Shape.PARTICLE{{/crossLink}}
     * * {{#crossLink "Shape/PLANE:property"}}Shape.PLANE{{/crossLink}}
     * * {{#crossLink "Shape/CONVEX:property"}}Shape.CONVEX{{/crossLink}}
     * * {{#crossLink "Shape/LINE:property"}}Shape.LINE{{/crossLink}}
     * * {{#crossLink "Shape/RECTANGLE:property"}}Shape.RECTANGLE{{/crossLink}}
     * * {{#crossLink "Shape/CAPSULE:property"}}Shape.CAPSULE{{/crossLink}}
     * * {{#crossLink "Shape/HEIGHTFIELD:property"}}Shape.HEIGHTFIELD{{/crossLink}}
     *
     * @property {number} type
     */
    this.type = type;

    /**
     * Shape object identifier.
     * @type {Number}
     * @property id
     */
    this.id = Shape.idCounter++;

    /**
     * Bounding circle radius of this shape
     * @property boundingRadius
     * @type {Number}
     */
    this.boundingRadius = 0;

    /**
     * Collision group that this shape belongs to (bit mask). See <a href="http://www.aurelienribon.com/blog/2011/07/box2d-tutorial-collision-filtering/">this tutorial</a>.
     * @property collisionGroup
     * @type {Number}
     * @example
     *     // Setup bits for each available group
     *     var PLAYER = Math.pow(2,0),
     *         ENEMY =  Math.pow(2,1),
     *         GROUND = Math.pow(2,2)
     *
     *     // Put shapes into their groups
     *     player1Shape.collisionGroup = PLAYER;
     *     player2Shape.collisionGroup = PLAYER;
     *     enemyShape  .collisionGroup = ENEMY;
     *     groundShape .collisionGroup = GROUND;
     *
     *     // Assign groups that each shape collide with.
     *     // Note that the players can collide with ground and enemies, but not with other players.
     *     player1Shape.collisionMask = ENEMY | GROUND;
     *     player2Shape.collisionMask = ENEMY | GROUND;
     *     enemyShape  .collisionMask = PLAYER | GROUND;
     *     groundShape .collisionMask = PLAYER | ENEMY;
     *
     * @example
     *     // How collision check is done
     *     if(shapeA.collisionGroup & shapeB.collisionMask)!=0 && (shapeB.collisionGroup & shapeA.collisionMask)!=0){
     *         // The shapes will collide
     *     }
     */
    this.collisionGroup = 1;

    /**
     * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled. That means that this shape will move through other body shapes, but it will still trigger contact events, etc.
     * @property {Boolean} collisionResponse
     */
    this.collisionResponse = true;

    /**
     * Collision mask of this shape. See .collisionGroup.
     * @property collisionMask
     * @type {Number}
     */
    this.collisionMask =  1;
    if(type){
        this.updateBoundingRadius();
    }

    /**
     * Material to use in collisions for this Shape. If this is set to null, the world will use default material properties instead.
     * @property material
     * @type {Material}
     */
    this.material = null;

    /**
     * Area of this shape.
     * @property area
     * @type {Number}
     */
    this.area = 0;

    /**
     * Set to true if you want this shape to be a sensor. A sensor does not generate contacts, but it still reports contact events. This is good if you want to know if a shape is overlapping another shape, without them generating contacts.
     * @property {Boolean} sensor
     */
    this.sensor = false;

    this.updateArea();
}

Shape.idCounter = 0;

/**
 * @static
 * @property {Number} CIRCLE
 */
Shape.CIRCLE =      1;

/**
 * @static
 * @property {Number} PARTICLE
 */
Shape.PARTICLE =    2;

/**
 * @static
 * @property {Number} PLANE
 */
Shape.PLANE =       4;

/**
 * @static
 * @property {Number} CONVEX
 */
Shape.CONVEX =      8;

/**
 * @static
 * @property {Number} LINE
 */
Shape.LINE =        16;

/**
 * @static
 * @property {Number} RECTANGLE
 */
Shape.RECTANGLE =   32;

/**
 * @static
 * @property {Number} CAPSULE
 */
Shape.CAPSULE =     64;

/**
 * @static
 * @property {Number} HEIGHTFIELD
 */
Shape.HEIGHTFIELD = 128;

/**
 * Should return the moment of inertia around the Z axis of the body given the total mass. See <a href="http://en.wikipedia.org/wiki/List_of_moments_of_inertia">Wikipedia's list of moments of inertia</a>.
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number} If the inertia is infinity or if the object simply isn't possible to rotate, return 0.
 */
Shape.prototype.computeMomentOfInertia = function(mass){
    throw new Error("Shape.computeMomentOfInertia is not implemented in this Shape...");
};

/**
 * Returns the bounding circle radius of this shape.
 * @method updateBoundingRadius
 * @return {Number}
 */
Shape.prototype.updateBoundingRadius = function(){
    throw new Error("Shape.updateBoundingRadius is not implemented in this Shape...");
};

/**
 * Update the .area property of the shape.
 * @method updateArea
 */
Shape.prototype.updateArea = function(){
    // To be implemented in all subclasses
};

/**
 * Compute the world axis-aligned bounding box (AABB) of this shape.
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Shape.prototype.computeAABB = function(out, position, angle){
    // To be implemented in each subclass
};


},
function(require, exports, module, global) {


    /*
        PolyK library
        url: http://polyk.ivank.net
        Released under MIT licence.

        Copyright (c) 2012 Ivan Kuckir

        Permission is hereby granted, free of charge, to any person
        obtaining a copy of this software and associated documentation
        files (the "Software"), to deal in the Software without
        restriction, including without limitation the rights to use,
        copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the
        Software is furnished to do so, subject to the following
        conditions:

        The above copyright notice and this permission notice shall be
        included in all copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
        EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
        NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
        HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
        WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
        OTHER DEALINGS IN THE SOFTWARE.
    */

    var PolyK = {};

    /*
        Is Polygon self-intersecting?

        O(n^2)
    */
    /*
    PolyK.IsSimple = function(p)
    {
        var n = p.length>>1;
        if(n<4) return true;
        var a1 = new PolyK._P(), a2 = new PolyK._P();
        var b1 = new PolyK._P(), b2 = new PolyK._P();
        var c = new PolyK._P();

        for(var i=0; i<n; i++)
        {
            a1.x = p[2*i  ];
            a1.y = p[2*i+1];
            if(i==n-1)  { a2.x = p[0    ];  a2.y = p[1    ]; }
            else        { a2.x = p[2*i+2];  a2.y = p[2*i+3]; }

            for(var j=0; j<n; j++)
            {
                if(Math.abs(i-j) < 2) continue;
                if(j==n-1 && i==0) continue;
                if(i==n-1 && j==0) continue;

                b1.x = p[2*j  ];
                b1.y = p[2*j+1];
                if(j==n-1)  { b2.x = p[0    ];  b2.y = p[1    ]; }
                else        { b2.x = p[2*j+2];  b2.y = p[2*j+3]; }

                if(PolyK._GetLineIntersection(a1,a2,b1,b2,c) != null) return false;
            }
        }
        return true;
    }

    PolyK.IsConvex = function(p)
    {
        if(p.length<6) return true;
        var l = p.length - 4;
        for(var i=0; i<l; i+=2)
            if(!PolyK._convex(p[i], p[i+1], p[i+2], p[i+3], p[i+4], p[i+5])) return false;
        if(!PolyK._convex(p[l  ], p[l+1], p[l+2], p[l+3], p[0], p[1])) return false;
        if(!PolyK._convex(p[l+2], p[l+3], p[0  ], p[1  ], p[2], p[3])) return false;
        return true;
    }
    */
    PolyK.GetArea = function(p)
    {
        if(p.length <6) return 0;
        var l = p.length - 2;
        var sum = 0;
        for(var i=0; i<l; i+=2)
            sum += (p[i+2]-p[i]) * (p[i+1]+p[i+3]);
        sum += (p[0]-p[l]) * (p[l+1]+p[1]);
        return - sum * 0.5;
    }
    /*
    PolyK.GetAABB = function(p)
    {
        var minx = Infinity;
        var miny = Infinity;
        var maxx = -minx;
        var maxy = -miny;
        for(var i=0; i<p.length; i+=2)
        {
            minx = Math.min(minx, p[i  ]);
            maxx = Math.max(maxx, p[i  ]);
            miny = Math.min(miny, p[i+1]);
            maxy = Math.max(maxy, p[i+1]);
        }
        return {x:minx, y:miny, width:maxx-minx, height:maxy-miny};
    }
    */

    PolyK.Triangulate = function(p)
    {
        var n = p.length>>1;
        if(n<3) return [];
        var tgs = [];
        var avl = [];
        for(var i=0; i<n; i++) avl.push(i);

        var i = 0;
        var al = n;
        while(al > 3)
        {
            var i0 = avl[(i+0)%al];
            var i1 = avl[(i+1)%al];
            var i2 = avl[(i+2)%al];

            var ax = p[2*i0],  ay = p[2*i0+1];
            var bx = p[2*i1],  by = p[2*i1+1];
            var cx = p[2*i2],  cy = p[2*i2+1];

            var earFound = false;
            if(PolyK._convex(ax, ay, bx, by, cx, cy))
            {
                earFound = true;
                for(var j=0; j<al; j++)
                {
                    var vi = avl[j];
                    if(vi==i0 || vi==i1 || vi==i2) continue;
                    if(PolyK._PointInTriangle(p[2*vi], p[2*vi+1], ax, ay, bx, by, cx, cy)) {earFound = false; break;}
                }
            }
            if(earFound)
            {
                tgs.push(i0, i1, i2);
                avl.splice((i+1)%al, 1);
                al--;
                i= 0;
            }
            else if(i++ > 3*al) break;      // no convex angles :(
        }
        tgs.push(avl[0], avl[1], avl[2]);
        return tgs;
    }
    /*
    PolyK.ContainsPoint = function(p, px, py)
    {
        var n = p.length>>1;
        var ax, ay, bx = p[2*n-2]-px, by = p[2*n-1]-py;
        var depth = 0;
        for(var i=0; i<n; i++)
        {
            ax = bx;  ay = by;
            bx = p[2*i  ] - px;
            by = p[2*i+1] - py;
            if(ay< 0 && by< 0) continue;    // both "up" or both "donw"
            if(ay>=0 && by>=0) continue;    // both "up" or both "donw"
            if(ax< 0 && bx< 0) continue;

            var lx = ax + (bx-ax)*(-ay)/(by-ay);
            if(lx>0) depth++;
        }
        return (depth & 1) == 1;
    }

    PolyK.Slice = function(p, ax, ay, bx, by)
    {
        if(PolyK.ContainsPoint(p, ax, ay) || PolyK.ContainsPoint(p, bx, by)) return [p.slice(0)];

        var a = new PolyK._P(ax, ay);
        var b = new PolyK._P(bx, by);
        var iscs = [];  // intersections
        var ps = [];    // points
        for(var i=0; i<p.length; i+=2) ps.push(new PolyK._P(p[i], p[i+1]));

        for(var i=0; i<ps.length; i++)
        {
            var isc = new PolyK._P(0,0);
            isc = PolyK._GetLineIntersection(a, b, ps[i], ps[(i+1)%ps.length], isc);

            if(isc)
            {
                isc.flag = true;
                iscs.push(isc);
                ps.splice(i+1,0,isc);
                i++;
            }
        }
        if(iscs.length == 0) return [p.slice(0)];
        var comp = function(u,v) {return PolyK._P.dist(a,u) - PolyK._P.dist(a,v); }
        iscs.sort(comp);

        var pgs = [];
        var dir = 0;
        while(iscs.length > 0)
        {
            var n = ps.length;
            var i0 = iscs[0];
            var i1 = iscs[1];
            var ind0 = ps.indexOf(i0);
            var ind1 = ps.indexOf(i1);
            var solved = false;

            if(PolyK._firstWithFlag(ps, ind0) == ind1) solved = true;
            else
            {
                i0 = iscs[1];
                i1 = iscs[0];
                ind0 = ps.indexOf(i0);
                ind1 = ps.indexOf(i1);
                if(PolyK._firstWithFlag(ps, ind0) == ind1) solved = true;
            }
            if(solved)
            {
                dir--;
                var pgn = PolyK._getPoints(ps, ind0, ind1);
                pgs.push(pgn);
                ps = PolyK._getPoints(ps, ind1, ind0);
                i0.flag = i1.flag = false;
                iscs.splice(0,2);
                if(iscs.length == 0) pgs.push(ps);
            }
            else { dir++; iscs.reverse(); }
            if(dir>1) break;
        }
        var result = [];
        for(var i=0; i<pgs.length; i++)
        {
            var pg = pgs[i];
            var npg = [];
            for(var j=0; j<pg.length; j++) npg.push(pg[j].x, pg[j].y);
            result.push(npg);
        }
        return result;
    }

    PolyK.Raycast = function(p, x, y, dx, dy, isc)
    {
        var l = p.length - 2;
        var tp = PolyK._tp;
        var a1 = tp[0], a2 = tp[1],
        b1 = tp[2], b2 = tp[3], c = tp[4];
        a1.x = x; a1.y = y;
        a2.x = x+dx; a2.y = y+dy;

        if(isc==null) isc = {dist:0, edge:0, norm:{x:0, y:0}, refl:{x:0, y:0}};
        isc.dist = Infinity;

        for(var i=0; i<l; i+=2)
        {
            b1.x = p[i  ];  b1.y = p[i+1];
            b2.x = p[i+2];  b2.y = p[i+3];
            var nisc = PolyK._RayLineIntersection(a1, a2, b1, b2, c);
            if(nisc) PolyK._updateISC(dx, dy, a1, b1, b2, c, i/2, isc);
        }
        b1.x = b2.x;  b1.y = b2.y;
        b2.x = p[0];  b2.y = p[1];
        var nisc = PolyK._RayLineIntersection(a1, a2, b1, b2, c);
        if(nisc) PolyK._updateISC(dx, dy, a1, b1, b2, c, p.length/2, isc);

        return (isc.dist != Infinity) ? isc : null;
    }

    PolyK.ClosestEdge = function(p, x, y, isc)
    {
        var l = p.length - 2;
        var tp = PolyK._tp;
        var a1 = tp[0],
        b1 = tp[2], b2 = tp[3], c = tp[4];
        a1.x = x; a1.y = y;

        if(isc==null) isc = {dist:0, edge:0, point:{x:0, y:0}, norm:{x:0, y:0}};
        isc.dist = Infinity;

        for(var i=0; i<l; i+=2)
        {
            b1.x = p[i  ];  b1.y = p[i+1];
            b2.x = p[i+2];  b2.y = p[i+3];
            PolyK._pointLineDist(a1, b1, b2, i>>1, isc);
        }
        b1.x = b2.x;  b1.y = b2.y;
        b2.x = p[0];  b2.y = p[1];
        PolyK._pointLineDist(a1, b1, b2, l>>1, isc);

        var idst = 1/isc.dist;
        isc.norm.x = (x-isc.point.x)*idst;
        isc.norm.y = (y-isc.point.y)*idst;
        return isc;
    }

    PolyK._pointLineDist = function(p, a, b, edge, isc)
    {
        var x = p.x, y = p.y, x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;

        var A = x - x1;
        var B = y - y1;
        var C = x2 - x1;
        var D = y2 - y1;

        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = dot / len_sq;

        var xx, yy;

        if (param < 0 || (x1 == x2 && y1 == y2)) {
            xx = x1;
            yy = y1;
        }
        else if (param > 1) {
            xx = x2;
            yy = y2;
        }
        else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        var dx = x - xx;
        var dy = y - yy;
        var dst = Math.sqrt(dx * dx + dy * dy);
        if(dst<isc.dist)
        {
            isc.dist = dst;
            isc.edge = edge;
            isc.point.x = xx;
            isc.point.y = yy;
        }
    }

    PolyK._updateISC = function(dx, dy, a1, b1, b2, c, edge, isc)
    {
        var nrl = PolyK._P.dist(a1, c);
        if(nrl<isc.dist)
        {
            var ibl = 1/PolyK._P.dist(b1, b2);
            var nx = -(b2.y-b1.y)*ibl;
            var ny =  (b2.x-b1.x)*ibl;
            var ddot = 2*(dx*nx+dy*ny);
            isc.dist = nrl;
            isc.norm.x = nx;
            isc.norm.y = ny;
            isc.refl.x = -ddot*nx+dx;
            isc.refl.y = -ddot*ny+dy;
            isc.edge = edge;
        }
    }

    PolyK._getPoints = function(ps, ind0, ind1)
    {
        var n = ps.length;
        var nps = [];
        if(ind1<ind0) ind1 += n;
        for(var i=ind0; i<= ind1; i++) nps.push(ps[i%n]);
        return nps;
    }

    PolyK._firstWithFlag = function(ps, ind)
    {
        var n = ps.length;
        while(true)
        {
            ind = (ind+1)%n;
            if(ps[ind].flag) return ind;
        }
    }
    */
    PolyK._PointInTriangle = function(px, py, ax, ay, bx, by, cx, cy)
    {
        var v0x = cx-ax;
        var v0y = cy-ay;
        var v1x = bx-ax;
        var v1y = by-ay;
        var v2x = px-ax;
        var v2y = py-ay;

        var dot00 = v0x*v0x+v0y*v0y;
        var dot01 = v0x*v1x+v0y*v1y;
        var dot02 = v0x*v2x+v0y*v2y;
        var dot11 = v1x*v1x+v1y*v1y;
        var dot12 = v1x*v2x+v1y*v2y;

        var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

        // Check if point is in triangle
        return (u >= 0) && (v >= 0) && (u + v < 1);
    }
    /*
    PolyK._RayLineIntersection = function(a1, a2, b1, b2, c)
    {
        var dax = (a1.x-a2.x), dbx = (b1.x-b2.x);
        var day = (a1.y-a2.y), dby = (b1.y-b2.y);

        var Den = dax*dby - day*dbx;
        if (Den == 0) return null;  // parallel

        var A = (a1.x * a2.y - a1.y * a2.x);
        var B = (b1.x * b2.y - b1.y * b2.x);

        var I = c;
        var iDen = 1/Den;
        I.x = ( A*dbx - dax*B ) * iDen;
        I.y = ( A*dby - day*B ) * iDen;

        if(!PolyK._InRect(I, b1, b2)) return null;
        if((day>0 && I.y>a1.y) || (day<0 && I.y<a1.y)) return null;
        if((dax>0 && I.x>a1.x) || (dax<0 && I.x<a1.x)) return null;
        return I;
    }

    PolyK._GetLineIntersection = function(a1, a2, b1, b2, c)
    {
        var dax = (a1.x-a2.x), dbx = (b1.x-b2.x);
        var day = (a1.y-a2.y), dby = (b1.y-b2.y);

        var Den = dax*dby - day*dbx;
        if (Den == 0) return null;  // parallel

        var A = (a1.x * a2.y - a1.y * a2.x);
        var B = (b1.x * b2.y - b1.y * b2.x);

        var I = c;
        I.x = ( A*dbx - dax*B ) / Den;
        I.y = ( A*dby - day*B ) / Den;

        if(PolyK._InRect(I, a1, a2) && PolyK._InRect(I, b1, b2)) return I;
        return null;
    }

    PolyK._InRect = function(a, b, c)
    {
        if  (b.x == c.x) return (a.y>=Math.min(b.y, c.y) && a.y<=Math.max(b.y, c.y));
        if  (b.y == c.y) return (a.x>=Math.min(b.x, c.x) && a.x<=Math.max(b.x, c.x));

        if(a.x >= Math.min(b.x, c.x) && a.x <= Math.max(b.x, c.x)
        && a.y >= Math.min(b.y, c.y) && a.y <= Math.max(b.y, c.y))
        return true;
        return false;
    }
    */
    PolyK._convex = function(ax, ay, bx, by, cx, cy)
    {
        return (ay-by)*(cx-bx) + (bx-ax)*(cy-by) >= 0;
    }
    /*
    PolyK._P = function(x,y)
    {
        this.x = x;
        this.y = y;
        this.flag = false;
    }
    PolyK._P.prototype.toString = function()
    {
        return "Point ["+this.x+", "+this.y+"]";
    }
    PolyK._P.dist = function(a,b)
    {
        var dx = b.x-a.x;
        var dy = b.y-a.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    PolyK._tp = [];
    for(var i=0; i<10; i++) PolyK._tp.push(new PolyK._P(0,0));
        */

module.exports = PolyK;


},
function(require, exports, module, global) {

/**
 * Base class for objects that dispatches events.
 * @class EventEmitter
 * @constructor
 */
var EventEmitter = function () {};

module.exports = EventEmitter;

EventEmitter.prototype = {
    constructor: EventEmitter,

    /**
     * Add an event listener
     * @method on
     * @param  {String} type
     * @param  {Function} listener
     * @return {EventEmitter} The self object, for chainability.
     */
    on: function ( type, listener, context ) {
        listener.context = context || this;
        if ( this._listeners === undefined ){
            this._listeners = {};
        }
        var listeners = this._listeners;
        if ( listeners[ type ] === undefined ) {
            listeners[ type ] = [];
        }
        if ( listeners[ type ].indexOf( listener ) === - 1 ) {
            listeners[ type ].push( listener );
        }
        return this;
    },

    /**
     * Check if an event listener is added
     * @method has
     * @param  {String} type
     * @param  {Function} listener
     * @return {Boolean}
     */
    has: function ( type, listener ) {
        if ( this._listeners === undefined ){
            return false;
        }
        var listeners = this._listeners;
        if(listener){
            if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {
                return true;
            }
        } else {
            if ( listeners[ type ] !== undefined ) {
                return true;
            }
        }

        return false;
    },

    /**
     * Remove an event listener
     * @method off
     * @param  {String} type
     * @param  {Function} listener
     * @return {EventEmitter} The self object, for chainability.
     */
    off: function ( type, listener ) {
        if ( this._listeners === undefined ){
            return this;
        }
        var listeners = this._listeners;
        var index = listeners[ type ].indexOf( listener );
        if ( index !== - 1 ) {
            listeners[ type ].splice( index, 1 );
        }
        return this;
    },

    /**
     * Emit an event.
     * @method emit
     * @param  {Object} event
     * @param  {String} event.type
     * @return {EventEmitter} The self object, for chainability.
     */
    emit: function ( event ) {
        if ( this._listeners === undefined ){
            return this;
        }
        var listeners = this._listeners;
        var listenerArray = listeners[ event.type ];
        if ( listenerArray !== undefined ) {
            event.target = this;
            for ( var i = 0, l = listenerArray.length; i < l; i ++ ) {
                var listener = listenerArray[ i ];
                listener.call( listener.context, event );
            }
        }
        return this;
    }
};


},
function(require, exports, module, global) {

var vec2 = require(191);
var Body = require(195);

module.exports = Broadphase;

/**
 * Base class for broadphase implementations.
 * @class Broadphase
 * @constructor
 */
function Broadphase(type){

    this.type = type;

    /**
     * The resulting overlapping pairs. Will be filled with results during .getCollisionPairs().
     * @property result
     * @type {Array}
     */
    this.result = [];

    /**
     * The world to search for collision pairs in. To change it, use .setWorld()
     * @property world
     * @type {World}
     * @readOnly
     */
    this.world = null;

    /**
     * The bounding volume type to use in the broadphase algorithms.
     * @property {Number} boundingVolumeType
     */
    this.boundingVolumeType = Broadphase.AABB;
}

/**
 * Axis aligned bounding box type.
 * @static
 * @property {Number} AABB
 */
Broadphase.AABB = 1;

/**
 * Bounding circle type.
 * @static
 * @property {Number} BOUNDING_CIRCLE
 */
Broadphase.BOUNDING_CIRCLE = 2;

/**
 * Set the world that we are searching for collision pairs in
 * @method setWorld
 * @param  {World} world
 */
Broadphase.prototype.setWorld = function(world){
    this.world = world;
};

/**
 * Get all potential intersecting body pairs.
 * @method getCollisionPairs
 * @param  {World} world The world to search in.
 * @return {Array} An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
 */
Broadphase.prototype.getCollisionPairs = function(world){
    throw new Error("getCollisionPairs must be implemented in a subclass!");
};

var dist = vec2.create();

/**
 * Check whether the bounding radius of two bodies overlap.
 * @method  boundingRadiusCheck
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.boundingRadiusCheck = function(bodyA, bodyB){
    vec2.sub(dist, bodyA.position, bodyB.position);
    var d2 = vec2.squaredLength(dist),
        r = bodyA.boundingRadius + bodyB.boundingRadius;
    return d2 <= r*r;
};

/**
 * Check whether the bounding radius of two bodies overlap.
 * @method  boundingRadiusCheck
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.aabbCheck = function(bodyA, bodyB){
    return bodyA.getAABB().overlaps(bodyB.getAABB());
};

/**
 * Check whether the bounding radius of two bodies overlap.
 * @method  boundingRadiusCheck
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.prototype.boundingVolumeCheck = function(bodyA, bodyB){
    var result;

    switch(this.boundingVolumeType){
    case Broadphase.BOUNDING_CIRCLE:
        result =  Broadphase.boundingRadiusCheck(bodyA,bodyB);
        break;
    case Broadphase.AABB:
        result = Broadphase.aabbCheck(bodyA,bodyB);
        break;
    default:
        throw new Error('Bounding volume type not recognized: '+this.boundingVolumeType);
    }
    return result;
};

/**
 * Check whether two bodies are allowed to collide at all.
 * @method  canCollide
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.canCollide = function(bodyA, bodyB){

    // Cannot collide static bodies
    if(bodyA.type === Body.STATIC && bodyB.type === Body.STATIC){
        return false;
    }

    // Cannot collide static vs kinematic bodies
    if( (bodyA.type === Body.KINEMATIC && bodyB.type === Body.STATIC) ||
        (bodyA.type === Body.STATIC    && bodyB.type === Body.KINEMATIC)){
        return false;
    }

    // Cannot collide kinematic vs kinematic
    if(bodyA.type === Body.KINEMATIC && bodyB.type === Body.KINEMATIC){
        return false;
    }

    // Cannot collide both sleeping bodies
    if(bodyA.sleepState === Body.SLEEPING && bodyB.sleepState === Body.SLEEPING){
        return false;
    }

    // Cannot collide if one is static and the other is sleeping
    if( (bodyA.sleepState === Body.SLEEPING && bodyB.type === Body.STATIC) ||
        (bodyB.sleepState === Body.SLEEPING && bodyA.type === Body.STATIC)){
        return false;
    }

    return true;
};

Broadphase.NAIVE = 1;
Broadphase.SAP = 2;


},
function(require, exports, module, global) {

var Shape = require(202)
,   vec2 = require(191);

module.exports = Capsule;

/**
 * Capsule shape class.
 * @class Capsule
 * @constructor
 * @extends Shape
 * @param {Number} [length=1] The distance between the end points
 * @param {Number} [radius=1] Radius of the capsule
 * @example
 *     var radius = 1;
 *     var length = 2;
 *     var capsuleShape = new Capsule(length, radius);
 *     body.addShape(capsuleShape);
 */
function Capsule(length, radius){

    /**
     * The distance between the end points.
     * @property {Number} length
     */
    this.length = length || 1;

    /**
     * The radius of the capsule.
     * @property {Number} radius
     */
    this.radius = radius || 1;

    Shape.call(this,Shape.CAPSULE);
}
Capsule.prototype = new Shape();
Capsule.prototype.constructor = Capsule;

/**
 * Compute the mass moment of inertia of the Capsule.
 * @method conputeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 * @todo
 */
Capsule.prototype.computeMomentOfInertia = function(mass){
    // Approximate with rectangle
    var r = this.radius,
        w = this.length + r, // 2*r is too much, 0 is too little
        h = r*2;
    return mass * (h*h + w*w) / 12;
};

/**
 * @method updateBoundingRadius
 */
Capsule.prototype.updateBoundingRadius = function(){
    this.boundingRadius = this.radius + this.length/2;
};

/**
 * @method updateArea
 */
Capsule.prototype.updateArea = function(){
    this.area = Math.PI * this.radius * this.radius + this.radius * 2 * this.length;
};

var r = vec2.create();

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Capsule.prototype.computeAABB = function(out, position, angle){
    var radius = this.radius;

    // Compute center position of one of the the circles, world oriented, but with local offset
    vec2.set(r,this.length / 2,0);
    if(angle !== 0){
        vec2.rotate(r,r,angle);
    }

    // Get bounds
    vec2.set(out.upperBound,  Math.max(r[0]+radius, -r[0]+radius),
                              Math.max(r[1]+radius, -r[1]+radius));
    vec2.set(out.lowerBound,  Math.min(r[0]-radius, -r[0]-radius),
                              Math.min(r[1]-radius, -r[1]-radius));

    // Add offset
    vec2.add(out.lowerBound, out.lowerBound, position);
    vec2.add(out.upperBound, out.upperBound, position);
};


},
function(require, exports, module, global) {

var Shape = require(202)
,    vec2 = require(191);

module.exports = Circle;

/**
 * Circle shape class.
 * @class Circle
 * @extends Shape
 * @constructor
 * @param {number} [radius=1] The radius of this circle
 *
 * @example
 *     var radius = 1;
 *     var circleShape = new Circle(radius);
 *     body.addShape(circleShape);
 */
function Circle(radius){

    /**
     * The radius of the circle.
     * @property radius
     * @type {number}
     */
    this.radius = radius || 1;

    Shape.call(this,Shape.CIRCLE);
}
Circle.prototype = new Shape();
Circle.prototype.constructor = Circle;

/**
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 */
Circle.prototype.computeMomentOfInertia = function(mass){
    var r = this.radius;
    return mass * r * r / 2;
};

/**
 * @method updateBoundingRadius
 * @return {Number}
 */
Circle.prototype.updateBoundingRadius = function(){
    this.boundingRadius = this.radius;
};

/**
 * @method updateArea
 * @return {Number}
 */
Circle.prototype.updateArea = function(){
    this.area = Math.PI * this.radius * this.radius;
};

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Circle.prototype.computeAABB = function(out, position, angle){
    var r = this.radius;
    vec2.set(out.upperBound,  r,  r);
    vec2.set(out.lowerBound, -r, -r);
    if(position){
        vec2.add(out.lowerBound, out.lowerBound, position);
        vec2.add(out.upperBound, out.upperBound, position);
    }
};


},
function(require, exports, module, global) {

module.exports = Constraint;

var Utils = require(192);

/**
 * Base constraint class.
 *
 * @class Constraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Number} type
 * @param {Object} [options]
 * @param {Object} [options.collideConnected=true]
 */
function Constraint(bodyA, bodyB, type, options){

    /**
     * The type of constraint. May be one of Constraint.DISTANCE, Constraint.GEAR, Constraint.LOCK, Constraint.PRISMATIC or Constraint.REVOLUTE.
     * @property {number} type
     */
    this.type = type;

    options = Utils.defaults(options,{
        collideConnected : true,
        wakeUpBodies : true,
    });

    /**
     * Equations to be solved in this constraint
     *
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * First body participating in the constraint.
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second body participating in the constraint.
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;

    /**
     * Set to true if you want the connected bodies to collide.
     * @property collideConnected
     * @type {Boolean}
     * @default true
     */
    this.collideConnected = options.collideConnected;

    // Wake up bodies when connected
    if(options.wakeUpBodies){
        if(bodyA){
            bodyA.wakeUp();
        }
        if(bodyB){
            bodyB.wakeUp();
        }
    }
}

/**
 * Updates the internal constraint parameters before solve.
 * @method update
 */
Constraint.prototype.update = function(){
    throw new Error("method update() not implmemented in this Constraint subclass!");
};

/**
 * @static
 * @property {number} DISTANCE
 */
Constraint.DISTANCE = 1;

/**
 * @static
 * @property {number} GEAR
 */
Constraint.GEAR = 2;

/**
 * @static
 * @property {number} LOCK
 */
Constraint.LOCK = 3;

/**
 * @static
 * @property {number} PRISMATIC
 */
Constraint.PRISMATIC = 4;

/**
 * @static
 * @property {number} REVOLUTE
 */
Constraint.REVOLUTE = 5;

/**
 * Set stiffness for this constraint.
 * @method setStiffness
 * @param {Number} stiffness
 */
Constraint.prototype.setStiffness = function(stiffness){
    var eqs = this.equations;
    for(var i=0; i !== eqs.length; i++){
        var eq = eqs[i];
        eq.stiffness = stiffness;
        eq.needsUpdate = true;
    }
};

/**
 * Set relaxation for this constraint.
 * @method setRelaxation
 * @param {Number} relaxation
 */
Constraint.prototype.setRelaxation = function(relaxation){
    var eqs = this.equations;
    for(var i=0; i !== eqs.length; i++){
        var eq = eqs[i];
        eq.relaxation = relaxation;
        eq.needsUpdate = true;
    }
};


},
function(require, exports, module, global) {

var Equation = require(194),
    vec2 = require(191);

module.exports = ContactEquation;

/**
 * Non-penetration constraint equation. Tries to make the contactPointA and contactPointB vectors coincide, while keeping the applied force repulsive.
 *
 * @class ContactEquation
 * @constructor
 * @extends Equation
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
function ContactEquation(bodyA, bodyB){
    Equation.call(this, bodyA, bodyB, 0, Number.MAX_VALUE);

    /**
     * Vector from body i center of mass to the contact point.
     * @property contactPointA
     * @type {Array}
     */
    this.contactPointA = vec2.create();
    this.penetrationVec = vec2.create();

    /**
     * World-oriented vector from body A center of mass to the contact point.
     * @property contactPointB
     * @type {Array}
     */
    this.contactPointB = vec2.create();

    /**
     * The normal vector, pointing out of body i
     * @property normalA
     * @type {Array}
     */
    this.normalA = vec2.create();

    /**
     * The restitution to use (0=no bounciness, 1=max bounciness).
     * @property restitution
     * @type {Number}
     */
    this.restitution = 0;

    /**
     * This property is set to true if this is the first impact between the bodies (not persistant contact).
     * @property firstImpact
     * @type {Boolean}
     * @readOnly
     */
    this.firstImpact = false;

    /**
     * The shape in body i that triggered this contact.
     * @property shapeA
     * @type {Shape}
     */
    this.shapeA = null;

    /**
     * The shape in body j that triggered this contact.
     * @property shapeB
     * @type {Shape}
     */
    this.shapeB = null;
}
ContactEquation.prototype = new Equation();
ContactEquation.prototype.constructor = ContactEquation;
ContactEquation.prototype.computeB = function(a,b,h){
    var bi = this.bodyA,
        bj = this.bodyB,
        ri = this.contactPointA,
        rj = this.contactPointB,
        xi = bi.position,
        xj = bj.position;

    var penetrationVec = this.penetrationVec,
        n = this.normalA,
        G = this.G;

    // Caluclate cross products
    var rixn = vec2.crossLength(ri,n),
        rjxn = vec2.crossLength(rj,n);

    // G = [-n -rixn n rjxn]
    G[0] = -n[0];
    G[1] = -n[1];
    G[2] = -rixn;
    G[3] = n[0];
    G[4] = n[1];
    G[5] = rjxn;

    // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
    vec2.add(penetrationVec,xj,rj);
    vec2.sub(penetrationVec,penetrationVec,xi);
    vec2.sub(penetrationVec,penetrationVec,ri);

    // Compute iteration
    var GW, Gq;
    if(this.firstImpact && this.restitution !== 0){
        Gq = 0;
        GW = (1/b)*(1+this.restitution) * this.computeGW();
    } else {
        Gq = vec2.dot(n,penetrationVec) + this.offset;
        GW = this.computeGW();
    }

    var GiMf = this.computeGiMf();
    var B = - Gq * a - GW * b - h*GiMf;

    return B;
};


},
function(require, exports, module, global) {

var Material = require(211);
var Equation = require(194);

module.exports = ContactMaterial;

/**
 * Defines what happens when two materials meet, such as what friction coefficient to use. You can also set other things such as restitution, surface velocity and constraint parameters.
 * @class ContactMaterial
 * @constructor
 * @param {Material} materialA
 * @param {Material} materialB
 * @param {Object}   [options]
 * @param {Number}   [options.friction=0.3]       Friction coefficient.
 * @param {Number}   [options.restitution=0]      Restitution coefficient aka "bounciness".
 * @param {Number}   [options.stiffness]          ContactEquation stiffness.
 * @param {Number}   [options.relaxation]         ContactEquation relaxation.
 * @param {Number}   [options.frictionStiffness]  FrictionEquation stiffness.
 * @param {Number}   [options.frictionRelaxation] FrictionEquation relaxation.
 * @param {Number}   [options.surfaceVelocity=0]  Surface velocity.
 * @author schteppe
 */
function ContactMaterial(materialA, materialB, options){
    options = options || {};

    if(!(materialA instanceof Material) || !(materialB instanceof Material)){
        throw new Error("First two arguments must be Material instances.");
    }

    /**
     * The contact material identifier
     * @property id
     * @type {Number}
     */
    this.id = ContactMaterial.idCounter++;

    /**
     * First material participating in the contact material
     * @property materialA
     * @type {Material}
     */
    this.materialA = materialA;

    /**
     * Second material participating in the contact material
     * @property materialB
     * @type {Material}
     */
    this.materialB = materialB;

    /**
     * Friction to use in the contact of these two materials
     * @property friction
     * @type {Number}
     */
    this.friction    =  typeof(options.friction)    !== "undefined" ?   Number(options.friction)    : 0.3;

    /**
     * Restitution to use in the contact of these two materials
     * @property restitution
     * @type {Number}
     */
    this.restitution =  typeof(options.restitution) !== "undefined" ?   Number(options.restitution) : 0.0;

    /**
     * Stiffness of the resulting ContactEquation that this ContactMaterial generate
     * @property stiffness
     * @type {Number}
     */
    this.stiffness =            typeof(options.stiffness)           !== "undefined" ?   Number(options.stiffness)   : Equation.DEFAULT_STIFFNESS;

    /**
     * Relaxation of the resulting ContactEquation that this ContactMaterial generate
     * @property relaxation
     * @type {Number}
     */
    this.relaxation =           typeof(options.relaxation)          !== "undefined" ?   Number(options.relaxation)  : Equation.DEFAULT_RELAXATION;

    /**
     * Stiffness of the resulting FrictionEquation that this ContactMaterial generate
     * @property frictionStiffness
     * @type {Number}
     */
    this.frictionStiffness =    typeof(options.frictionStiffness)   !== "undefined" ?   Number(options.frictionStiffness)   : Equation.DEFAULT_STIFFNESS;

    /**
     * Relaxation of the resulting FrictionEquation that this ContactMaterial generate
     * @property frictionRelaxation
     * @type {Number}
     */
    this.frictionRelaxation =   typeof(options.frictionRelaxation)  !== "undefined" ?   Number(options.frictionRelaxation)  : Equation.DEFAULT_RELAXATION;

    /**
     * Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.
     * @property {Number} surfaceVelocity
     */
    this.surfaceVelocity = typeof(options.surfaceVelocity)    !== "undefined" ?   Number(options.surfaceVelocity)    : 0;

    /**
     * Offset to be set on ContactEquations. A positive value will make the bodies penetrate more into each other. Can be useful in scenes where contacts need to be more persistent, for example when stacking. Aka "cure for nervous contacts".
     * @property contactSkinSize
     * @type {Number}
     */
    this.contactSkinSize = 0.005;
}

ContactMaterial.idCounter = 0;


},
function(require, exports, module, global) {

module.exports = Material;

/**
 * Defines a physics material.
 * @class Material
 * @constructor
 * @param {number} id Material identifier
 * @author schteppe
 */
function Material(id){
    /**
     * The material identifier
     * @property id
     * @type {Number}
     */
    this.id = id || Material.idCounter++;
}

Material.idCounter = 0;


},
function(require, exports, module, global) {

var Constraint = require(208)
,   Equation = require(194)
,   vec2 = require(191)
,   Utils = require(192);

module.exports = DistanceConstraint;

/**
 * Constraint that tries to keep the distance between two bodies constant.
 *
 * @class DistanceConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {object} [options]
 * @param {number} [options.distance] The distance to keep between the anchor points. Defaults to the current distance between the bodies.
 * @param {Array} [options.localAnchorA] The anchor point for bodyA, defined locally in bodyA frame. Defaults to [0,0].
 * @param {Array} [options.localAnchorB] The anchor point for bodyB, defined locally in bodyB frame. Defaults to [0,0].
 * @param {object} [options.maxForce=Number.MAX_VALUE] Maximum force to apply.
 * @extends Constraint
 *
 * @example
 *     // If distance is not given as an option, then the current distance between the bodies is used.
 *     // In this example, the bodies will be constrained to have a distance of 2 between their centers.
 *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
 *     var bodyB = new Body({ mass: 1, position: [1, 0] });
 *     var constraint = new DistanceConstraint(bodyA, bodyB);
 *
 * @example
 *     var constraint = new DistanceConstraint(bodyA, bodyB, {
 *         distance: 1,          // Distance to keep between the points
 *         localAnchorA: [1, 0], // Point on bodyA
 *         localAnchorB: [-1, 0] // Point on bodyB
 *     });
 */
function DistanceConstraint(bodyA,bodyB,options){
    options = Utils.defaults(options,{
        localAnchorA:[0,0],
        localAnchorB:[0,0]
    });

    Constraint.call(this,bodyA,bodyB,Constraint.DISTANCE,options);

    /**
     * Local anchor in body A.
     * @property localAnchorA
     * @type {Array}
     */
    this.localAnchorA = vec2.fromValues(options.localAnchorA[0], options.localAnchorA[1]);

    /**
     * Local anchor in body B.
     * @property localAnchorB
     * @type {Array}
     */
    this.localAnchorB = vec2.fromValues(options.localAnchorB[0], options.localAnchorB[1]);

    var localAnchorA = this.localAnchorA;
    var localAnchorB = this.localAnchorB;

    /**
     * The distance to keep.
     * @property distance
     * @type {Number}
     */
    this.distance = 0;

    if(typeof(options.distance) === 'number'){
        this.distance = options.distance;
    } else {
        // Use the current world distance between the world anchor points.
        var worldAnchorA = vec2.create(),
            worldAnchorB = vec2.create(),
            r = vec2.create();

        // Transform local anchors to world
        vec2.rotate(worldAnchorA, localAnchorA, bodyA.angle);
        vec2.rotate(worldAnchorB, localAnchorB, bodyB.angle);

        vec2.add(r, bodyB.position, worldAnchorB);
        vec2.sub(r, r, worldAnchorA);
        vec2.sub(r, r, bodyA.position);

        this.distance = vec2.length(r);
    }

    var maxForce;
    if(typeof(options.maxForce)==="undefined" ){
        maxForce = Number.MAX_VALUE;
    } else {
        maxForce = options.maxForce;
    }

    var normal = new Equation(bodyA,bodyB,-maxForce,maxForce); // Just in the normal direction
    this.equations = [ normal ];

    /**
     * Max force to apply.
     * @property {number} maxForce
     */
    this.maxForce = maxForce;

    // g = (xi - xj).dot(n)
    // dg/dt = (vi - vj).dot(n) = G*W = [n 0 -n 0] * [vi wi vj wj]'

    // ...and if we were to include offset points (TODO for now):
    // g =
    //      (xj + rj - xi - ri).dot(n) - distance
    //
    // dg/dt =
    //      (vj + wj x rj - vi - wi x ri).dot(n) =
    //      { term 2 is near zero } =
    //      [-n   -ri x n   n   rj x n] * [vi wi vj wj]' =
    //      G * W
    //
    // => G = [-n -rixn n rjxn]

    var r = vec2.create();
    var ri = vec2.create(); // worldAnchorA
    var rj = vec2.create(); // worldAnchorB
    var that = this;
    normal.computeGq = function(){
        var bodyA = this.bodyA,
            bodyB = this.bodyB,
            xi = bodyA.position,
            xj = bodyB.position;

        // Transform local anchors to world
        vec2.rotate(ri, localAnchorA, bodyA.angle);
        vec2.rotate(rj, localAnchorB, bodyB.angle);

        vec2.add(r, xj, rj);
        vec2.sub(r, r, ri);
        vec2.sub(r, r, xi);

        //vec2.sub(r, bodyB.position, bodyA.position);
        return vec2.length(r) - that.distance;
    };

    // Make the contact constraint bilateral
    this.setMaxForce(maxForce);

    /**
     * If the upper limit is enabled or not.
     * @property {Boolean} upperLimitEnabled
     */
    this.upperLimitEnabled = false;

    /**
     * The upper constraint limit.
     * @property {number} upperLimit
     */
    this.upperLimit = 1;

    /**
     * If the lower limit is enabled or not.
     * @property {Boolean} lowerLimitEnabled
     */
    this.lowerLimitEnabled = false;

    /**
     * The lower constraint limit.
     * @property {number} lowerLimit
     */
    this.lowerLimit = 0;

    /**
     * Current constraint position. This is equal to the current distance between the world anchor points.
     * @property {number} position
     */
    this.position = 0;
}
DistanceConstraint.prototype = new Constraint();
DistanceConstraint.prototype.constructor = DistanceConstraint;

/**
 * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
 * @method update
 */
var n = vec2.create();
var ri = vec2.create(); // worldAnchorA
var rj = vec2.create(); // worldAnchorB
DistanceConstraint.prototype.update = function(){
    var normal = this.equations[0],
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        distance = this.distance,
        xi = bodyA.position,
        xj = bodyB.position,
        normalEquation = this.equations[0],
        G = normal.G;

    // Transform local anchors to world
    vec2.rotate(ri, this.localAnchorA, bodyA.angle);
    vec2.rotate(rj, this.localAnchorB, bodyB.angle);

    // Get world anchor points and normal
    vec2.add(n, xj, rj);
    vec2.sub(n, n, ri);
    vec2.sub(n, n, xi);
    this.position = vec2.length(n);

    var violating = false;
    if(this.upperLimitEnabled){
        if(this.position > this.upperLimit){
            normalEquation.maxForce = 0;
            normalEquation.minForce = -this.maxForce;
            this.distance = this.upperLimit;
            violating = true;
        }
    }

    if(this.lowerLimitEnabled){
        if(this.position < this.lowerLimit){
            normalEquation.maxForce = this.maxForce;
            normalEquation.minForce = 0;
            this.distance = this.lowerLimit;
            violating = true;
        }
    }

    if((this.lowerLimitEnabled || this.upperLimitEnabled) && !violating){
        // No constraint needed.
        normalEquation.enabled = false;
        return;
    }

    normalEquation.enabled = true;

    vec2.normalize(n,n);

    // Caluclate cross products
    var rixn = vec2.crossLength(ri, n),
        rjxn = vec2.crossLength(rj, n);

    // G = [-n -rixn n rjxn]
    G[0] = -n[0];
    G[1] = -n[1];
    G[2] = -rixn;
    G[3] = n[0];
    G[4] = n[1];
    G[5] = rjxn;
};

/**
 * Set the max force to be used
 * @method setMaxForce
 * @param {Number} f
 */
DistanceConstraint.prototype.setMaxForce = function(f){
    var normal = this.equations[0];
    normal.minForce = -f;
    normal.maxForce =  f;
};

/**
 * Get the max force
 * @method getMaxForce
 * @return {Number}
 */
DistanceConstraint.prototype.getMaxForce = function(f){
    var normal = this.equations[0];
    return normal.maxForce;
};


},
function(require, exports, module, global) {

var vec2 = require(191)
,   Equation = require(194)
,   Utils = require(192);

module.exports = FrictionEquation;

/**
 * Constrains the slipping in a contact along a tangent
 *
 * @class FrictionEquation
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Number} slipForce
 * @extends Equation
 */
function FrictionEquation(bodyA, bodyB, slipForce){
    Equation.call(this, bodyA, bodyB, -slipForce, slipForce);

    /**
     * Relative vector from center of body A to the contact point, world oriented.
     * @property contactPointA
     * @type {Array}
     */
    this.contactPointA = vec2.create();

    /**
     * Relative vector from center of body B to the contact point, world oriented.
     * @property contactPointB
     * @type {Array}
     */
    this.contactPointB = vec2.create();

    /**
     * Tangent vector that the friction force will act along. World oriented.
     * @property t
     * @type {Array}
     */
    this.t = vec2.create();

    /**
     * A ContactEquation connected to this friction. The contact equations can be used to rescale the max force for the friction. If more than one contact equation is given, then the max force can be set to the average.
     * @property contactEquations
     * @type {ContactEquation}
     */
    this.contactEquations = [];

    /**
     * The shape in body i that triggered this friction.
     * @property shapeA
     * @type {Shape}
     * @todo Needed? The shape can be looked up via contactEquation.shapeA...
     */
    this.shapeA = null;

    /**
     * The shape in body j that triggered this friction.
     * @property shapeB
     * @type {Shape}
     * @todo Needed? The shape can be looked up via contactEquation.shapeB...
     */
    this.shapeB = null;

    /**
     * The friction coefficient to use.
     * @property frictionCoefficient
     * @type {Number}
     */
    this.frictionCoefficient = 0.3;
}
FrictionEquation.prototype = new Equation();
FrictionEquation.prototype.constructor = FrictionEquation;

/**
 * Set the slipping condition for the constraint. The friction force cannot be
 * larger than this value.
 * @method setSlipForce
 * @param  {Number} slipForce
 */
FrictionEquation.prototype.setSlipForce = function(slipForce){
    this.maxForce = slipForce;
    this.minForce = -slipForce;
};

/**
 * Get the max force for the constraint.
 * @method getSlipForce
 * @return {Number}
 */
FrictionEquation.prototype.getSlipForce = function(){
    return this.maxForce;
};

FrictionEquation.prototype.computeB = function(a,b,h){
    var bi = this.bodyA,
        bj = this.bodyB,
        ri = this.contactPointA,
        rj = this.contactPointB,
        t = this.t,
        G = this.G;

    // G = [-t -rixt t rjxt]
    // And remember, this is a pure velocity constraint, g is always zero!
    G[0] = -t[0];
    G[1] = -t[1];
    G[2] = -vec2.crossLength(ri,t);
    G[3] = t[0];
    G[4] = t[1];
    G[5] = vec2.crossLength(rj,t);

    var GW = this.computeGW(),
        GiMf = this.computeGiMf();

    var B = /* - g * a  */ - GW * b - h*GiMf;

    return B;
};


},
function(require, exports, module, global) {

var Constraint = require(208)
,   Equation = require(194)
,   AngleLockEquation = require(193)
,   vec2 = require(191);

module.exports = GearConstraint;

/**
 * Connects two bodies at given offset points, letting them rotate relative to each other around this point.
 * @class GearConstraint
 * @constructor
 * @author schteppe
 * @param {Body}            bodyA
 * @param {Body}            bodyB
 * @param {Object}          [options]
 * @param {Number}          [options.angle=0] Relative angle between the bodies. Will be set to the current angle between the bodies (the gear ratio is accounted for).
 * @param {Number}          [options.ratio=1] Gear ratio.
 * @param {Number}          [options.maxTorque] Maximum torque to apply.
 * @extends Constraint
 * @todo Ability to specify world points
 */
function GearConstraint(bodyA, bodyB, options){
    options = options || {};

    Constraint.call(this, bodyA, bodyB, Constraint.GEAR, options);

    /**
     * The gear ratio.
     * @property ratio
     * @type {Number}
     */
    this.ratio = typeof(options.ratio) === "number" ? options.ratio : 1;

    /**
     * The relative angle
     * @property angle
     * @type {Number}
     */
    this.angle = typeof(options.angle) === "number" ? options.angle : bodyB.angle - this.ratio * bodyA.angle;

    // Send same parameters to the equation
    options.angle = this.angle;
    options.ratio = this.ratio;

    this.equations = [
        new AngleLockEquation(bodyA,bodyB,options),
    ];

    // Set max torque
    if(typeof(options.maxTorque) === "number"){
        this.setMaxTorque(options.maxTorque);
    }
}
GearConstraint.prototype = new Constraint();
GearConstraint.prototype.constructor = GearConstraint;

GearConstraint.prototype.update = function(){
    var eq = this.equations[0];
    if(eq.ratio !== this.ratio){
        eq.setRatio(this.ratio);
    }
    eq.angle = this.angle;
};

/**
 * Set the max torque for the constraint.
 * @method setMaxTorque
 * @param {Number} torque
 */
GearConstraint.prototype.setMaxTorque = function(torque){
    this.equations[0].setMaxTorque(torque);
};

/**
 * Get the max torque for the constraint.
 * @method getMaxTorque
 * @return {Number}
 */
GearConstraint.prototype.getMaxTorque = function(torque){
    return this.equations[0].maxForce;
};

},
function(require, exports, module, global) {

var Circle = require(207)
,   Plane = require(216)
,   Particle = require(217)
,   Broadphase = require(205)
,   vec2 = require(191)
,   Utils = require(192);

module.exports = GridBroadphase;

/**
 * Broadphase that uses axis-aligned bins.
 * @class GridBroadphase
 * @constructor
 * @extends Broadphase
 * @param {object} [options]
 * @param {number} [options.xmin]   Lower x bound of the grid
 * @param {number} [options.xmax]   Upper x bound
 * @param {number} [options.ymin]   Lower y bound
 * @param {number} [options.ymax]   Upper y bound
 * @param {number} [options.nx]     Number of bins along x axis
 * @param {number} [options.ny]     Number of bins along y axis
 * @todo Should have an option for dynamic scene size
 */
function GridBroadphase(options){
    Broadphase.apply(this);

    options = Utils.defaults(options,{
        xmin:   -100,
        xmax:   100,
        ymin:   -100,
        ymax:   100,
        nx:     10,
        ny:     10
    });

    this.xmin = options.xmin;
    this.ymin = options.ymin;
    this.xmax = options.xmax;
    this.ymax = options.ymax;
    this.nx = options.nx;
    this.ny = options.ny;

    this.binsizeX = (this.xmax-this.xmin) / this.nx;
    this.binsizeY = (this.ymax-this.ymin) / this.ny;
}
GridBroadphase.prototype = new Broadphase();
GridBroadphase.prototype.constructor = GridBroadphase;

/**
 * Get collision pairs.
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
GridBroadphase.prototype.getCollisionPairs = function(world){
    var result = [],
        bodies = world.bodies,
        Ncolliding = bodies.length,
        binsizeX = this.binsizeX,
        binsizeY = this.binsizeY,
        nx = this.nx,
        ny = this.ny,
        xmin = this.xmin,
        ymin = this.ymin,
        xmax = this.xmax,
        ymax = this.ymax;

    // Todo: make garbage free
    var bins=[], Nbins=nx*ny;
    for(var i=0; i<Nbins; i++){
        bins.push([]);
    }

    var xmult = nx / (xmax-xmin);
    var ymult = ny / (ymax-ymin);

    // Put all bodies into bins
    for(var i=0; i!==Ncolliding; i++){
        var bi = bodies[i];
        var aabb = bi.aabb;
        var lowerX = Math.max(aabb.lowerBound[0], xmin);
        var lowerY = Math.max(aabb.lowerBound[1], ymin);
        var upperX = Math.min(aabb.upperBound[0], xmax);
        var upperY = Math.min(aabb.upperBound[1], ymax);
        var xi1 = Math.floor(xmult * (lowerX - xmin));
        var yi1 = Math.floor(ymult * (lowerY - ymin));
        var xi2 = Math.floor(xmult * (upperX - xmin));
        var yi2 = Math.floor(ymult * (upperY - ymin));

        // Put in bin
        for(var j=xi1; j<=xi2; j++){
            for(var k=yi1; k<=yi2; k++){
                var xi = j;
                var yi = k;
                var idx = xi*(ny-1) + yi;
                if(idx >= 0 && idx < Nbins){
                    bins[ idx ].push(bi);
                }
            }
        }
    }

    // Check each bin
    for(var i=0; i!==Nbins; i++){
        var bin = bins[i];

        for(var j=0, NbodiesInBin=bin.length; j!==NbodiesInBin; j++){
            var bi = bin[j];
            for(var k=0; k!==j; k++){
                var bj = bin[k];
                if(Broadphase.canCollide(bi,bj) && this.boundingVolumeCheck(bi,bj)){
                    result.push(bi,bj);
                }
            }
        }
    }
    return result;
};


},
function(require, exports, module, global) {

var Shape =  require(202)
,    vec2 =  require(191)
,    Utils = require(192);

module.exports = Plane;

/**
 * Plane shape class. The plane is facing in the Y direction.
 * @class Plane
 * @extends Shape
 * @constructor
 */
function Plane(){
    Shape.call(this,Shape.PLANE);
}
Plane.prototype = new Shape();
Plane.prototype.constructor = Plane;

/**
 * Compute moment of inertia
 * @method computeMomentOfInertia
 */
Plane.prototype.computeMomentOfInertia = function(mass){
    return 0; // Plane is infinite. The inertia should therefore be infinty but by convention we set 0 here
};

/**
 * Update the bounding radius
 * @method updateBoundingRadius
 */
Plane.prototype.updateBoundingRadius = function(){
    this.boundingRadius = Number.MAX_VALUE;
};

/**
 * @method computeAABB
 * @param  {AABB}   out
 * @param  {Array}  position
 * @param  {Number} angle
 */
Plane.prototype.computeAABB = function(out, position, angle){
    var a = 0,
        set = vec2.set;
    if(typeof(angle) === "number"){
        a = angle % (2*Math.PI);
    }

    if(a === 0){
        // y goes from -inf to 0
        set(out.lowerBound, -Number.MAX_VALUE, -Number.MAX_VALUE);
        set(out.upperBound,  Number.MAX_VALUE,  0);
    } else if(a === Math.PI / 2){
        // x goes from 0 to inf
        set(out.lowerBound, 0, -Number.MAX_VALUE);
        set(out.upperBound,      Number.MAX_VALUE,  Number.MAX_VALUE);
    } else if(a === Math.PI){
        // y goes from 0 to inf
        set(out.lowerBound, -Number.MAX_VALUE, 0);
        set(out.upperBound,  Number.MAX_VALUE, Number.MAX_VALUE);
    } else if(a === 3*Math.PI/2){
        // x goes from -inf to 0
        set(out.lowerBound, -Number.MAX_VALUE,     -Number.MAX_VALUE);
        set(out.upperBound,  0,  Number.MAX_VALUE);
    } else {
        // Set max bounds
        set(out.lowerBound, -Number.MAX_VALUE, -Number.MAX_VALUE);
        set(out.upperBound,  Number.MAX_VALUE,  Number.MAX_VALUE);
    }

    vec2.add(out.lowerBound, out.lowerBound, position);
    vec2.add(out.upperBound, out.upperBound, position);
};

Plane.prototype.updateArea = function(){
    this.area = Number.MAX_VALUE;
};



},
function(require, exports, module, global) {

var Shape = require(202)
,   vec2 = require(191);

module.exports = Particle;

/**
 * Particle shape class.
 * @class Particle
 * @constructor
 * @extends Shape
 */
function Particle(){
    Shape.call(this,Shape.PARTICLE);
}
Particle.prototype = new Shape();
Particle.prototype.constructor = Particle;

Particle.prototype.computeMomentOfInertia = function(mass){
    return 0; // Can't rotate a particle
};

Particle.prototype.updateBoundingRadius = function(){
    this.boundingRadius = 0;
};

/**
 * @method computeAABB
 * @param  {AABB}   out
 * @param  {Array}  position
 * @param  {Number} angle
 */
Particle.prototype.computeAABB = function(out, position, angle){
    vec2.copy(out.lowerBound, position);
    vec2.copy(out.upperBound, position);
};


},
function(require, exports, module, global) {

var vec2 = require(191)
,   Solver = require(219)
,   Utils = require(192)
,   FrictionEquation = require(213);

module.exports = GSSolver;

/**
 * Iterative Gauss-Seidel constraint equation solver.
 *
 * @class GSSolver
 * @constructor
 * @extends Solver
 * @param {Object} [options]
 * @param {Number} [options.iterations=10]
 * @param {Number} [options.tolerance=0]
 */
function GSSolver(options){
    Solver.call(this,options,Solver.GS);
    options = options || {};

    /**
     * The number of iterations to do when solving. More gives better results, but is more expensive.
     * @property iterations
     * @type {Number}
     */
    this.iterations = options.iterations || 10;

    /**
     * The error tolerance, per constraint. If the total error is below this limit, the solver will stop iterating. Set to zero for as good solution as possible, but to something larger than zero to make computations faster.
     * @property tolerance
     * @type {Number}
     */
    this.tolerance = options.tolerance || 1e-10;

    this.arrayStep = 30;
    this.lambda = new Utils.ARRAY_TYPE(this.arrayStep);
    this.Bs =     new Utils.ARRAY_TYPE(this.arrayStep);
    this.invCs =  new Utils.ARRAY_TYPE(this.arrayStep);

    /**
     * Set to true to set all right hand side terms to zero when solving. Can be handy for a few applications.
     * @property useZeroRHS
     * @type {Boolean}
     */
    this.useZeroRHS = false;

    /**
     * Number of solver iterations that are done to approximate normal forces. When these iterations are done, friction force will be computed from the contact normal forces. These friction forces will override any other friction forces set from the World for example.
     * The solver will use less iterations if the solution is below the .tolerance.
     * @property frictionIterations
     * @type {Number}
     */
    this.frictionIterations = 0;

    /**
     * The number of iterations that were made during the last solve. If .tolerance is zero, this value will always be equal to .iterations, but if .tolerance is larger than zero, and the solver can quit early, then this number will be somewhere between 1 and .iterations.
     * @property {Number} usedIterations
     */
    this.usedIterations = 0;
}
GSSolver.prototype = new Solver();
GSSolver.prototype.constructor = GSSolver;

function setArrayZero(array){
    var l = array.length;
    while(l--){
        array[l] = +0.0;
    }
}

/**
 * Solve the system of equations
 * @method solve
 * @param  {Number}  h       Time step
 * @param  {World}   world    World to solve
 */
GSSolver.prototype.solve = function(h, world){

    this.sortEquations();

    var iter = 0,
        maxIter = this.iterations,
        maxFrictionIter = this.frictionIterations,
        equations = this.equations,
        Neq = equations.length,
        tolSquared = Math.pow(this.tolerance*Neq, 2),
        bodies = world.bodies,
        Nbodies = world.bodies.length,
        add = vec2.add,
        set = vec2.set,
        useZeroRHS = this.useZeroRHS,
        lambda = this.lambda;

    this.usedIterations = 0;

    if(Neq){
        for(var i=0; i!==Nbodies; i++){
            var b = bodies[i];

            // Update solve mass
            b.updateSolveMassProperties();
        }
    }

    // Things that does not change during iteration can be computed once
    if(lambda.length < Neq){
        lambda = this.lambda =  new Utils.ARRAY_TYPE(Neq + this.arrayStep);
        this.Bs =               new Utils.ARRAY_TYPE(Neq + this.arrayStep);
        this.invCs =            new Utils.ARRAY_TYPE(Neq + this.arrayStep);
    }
    setArrayZero(lambda);
    var invCs = this.invCs,
        Bs = this.Bs,
        lambda = this.lambda;

    for(var i=0; i!==equations.length; i++){
        var c = equations[i];
        if(c.timeStep !== h || c.needsUpdate){
            c.timeStep = h;
            c.update();
        }
        Bs[i] =     c.computeB(c.a,c.b,h);
        invCs[i] =  c.computeInvC(c.epsilon);
    }

    var q, B, c, deltalambdaTot,i,j;

    if(Neq !== 0){

        for(i=0; i!==Nbodies; i++){
            var b = bodies[i];

            // Reset vlambda
            b.resetConstraintVelocity();
        }

        if(maxFrictionIter){
            // Iterate over contact equations to get normal forces
            for(iter=0; iter!==maxFrictionIter; iter++){

                // Accumulate the total error for each iteration.
                deltalambdaTot = 0.0;

                for(j=0; j!==Neq; j++){
                    c = equations[j];

                    var deltalambda = GSSolver.iterateEquation(j,c,c.epsilon,Bs,invCs,lambda,useZeroRHS,h,iter);
                    deltalambdaTot += Math.abs(deltalambda);
                }

                this.usedIterations++;

                // If the total error is small enough - stop iterate
                if(deltalambdaTot*deltalambdaTot <= tolSquared){
                    break;
                }
            }

            GSSolver.updateMultipliers(equations, lambda, 1/h);

            // Set computed friction force
            for(j=0; j!==Neq; j++){
                var eq = equations[j];
                if(eq instanceof FrictionEquation){
                    var f = 0.0;
                    for(var k=0; k!==eq.contactEquations.length; k++){
                        f += eq.contactEquations[k].multiplier;
                    }
                    f *= eq.frictionCoefficient / eq.contactEquations.length;
                    eq.maxForce =  f;
                    eq.minForce = -f;
                }
            }
        }

        // Iterate over all equations
        for(iter=0; iter!==maxIter; iter++){

            // Accumulate the total error for each iteration.
            deltalambdaTot = 0.0;

            for(j=0; j!==Neq; j++){
                c = equations[j];

                var deltalambda = GSSolver.iterateEquation(j,c,c.epsilon,Bs,invCs,lambda,useZeroRHS,h,iter);
                deltalambdaTot += Math.abs(deltalambda);
            }

            this.usedIterations++;

            // If the total error is small enough - stop iterate
            if(deltalambdaTot*deltalambdaTot <= tolSquared){
                break;
            }
        }

        // Add result to velocity
        for(i=0; i!==Nbodies; i++){
            bodies[i].addConstraintVelocity();
        }

        GSSolver.updateMultipliers(equations, lambda, 1/h);
    }
};

// Sets the .multiplier property of each equation
GSSolver.updateMultipliers = function(equations, lambda, invDt){
    // Set the .multiplier property of each equation
    var l = equations.length;
    while(l--){
        equations[l].multiplier = lambda[l] * invDt;
    }
};

GSSolver.iterateEquation = function(j,eq,eps,Bs,invCs,lambda,useZeroRHS,dt,iter){
    // Compute iteration
    var B = Bs[j],
        invC = invCs[j],
        lambdaj = lambda[j],
        GWlambda = eq.computeGWlambda();

    var maxForce = eq.maxForce,
        minForce = eq.minForce;

    if(useZeroRHS){
        B = 0;
    }

    var deltalambda = invC * ( B - GWlambda - eps * lambdaj );

    // Clamp if we are not within the min/max interval
    var lambdaj_plus_deltalambda = lambdaj + deltalambda;
    if(lambdaj_plus_deltalambda < minForce*dt){
        deltalambda = minForce*dt - lambdaj;
    } else if(lambdaj_plus_deltalambda > maxForce*dt){
        deltalambda = maxForce*dt - lambdaj;
    }
    lambda[j] += deltalambda;
    eq.addToWlambda(deltalambda);

    return deltalambda;
};


},
function(require, exports, module, global) {

var Utils = require(192)
,   EventEmitter = require(204);

module.exports = Solver;

/**
 * Base class for constraint solvers.
 * @class Solver
 * @constructor
 * @extends EventEmitter
 */
function Solver(options,type){
    options = options || {};

    EventEmitter.call(this);

    this.type = type;

    /**
     * Current equations in the solver.
     *
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * Function that is used to sort all equations before each solve.
     * @property equationSortFunction
     * @type {function|boolean}
     */
    this.equationSortFunction = options.equationSortFunction || false;
}
Solver.prototype = new EventEmitter();
Solver.prototype.constructor = Solver;

/**
 * Method to be implemented in each subclass
 * @method solve
 * @param  {Number} dt
 * @param  {World} world
 */
Solver.prototype.solve = function(dt,world){
    throw new Error("Solver.solve should be implemented by subclasses!");
};

var mockWorld = {bodies:[]};

/**
 * Solves all constraints in an island.
 * @method solveIsland
 * @param  {Number} dt
 * @param  {Island} island
 */
Solver.prototype.solveIsland = function(dt,island){

    this.removeAllEquations();

    if(island.equations.length){
        // Add equations to solver
        this.addEquations(island.equations);
        mockWorld.bodies.length = 0;
        island.getBodies(mockWorld.bodies);

        // Solve
        if(mockWorld.bodies.length){
            this.solve(dt,mockWorld);
        }
    }
};

/**
 * Sort all equations using the .equationSortFunction. Should be called by subclasses before solving.
 * @method sortEquations
 */
Solver.prototype.sortEquations = function(){
    if(this.equationSortFunction){
        this.equations.sort(this.equationSortFunction);
    }
};

/**
 * Add an equation to be solved.
 *
 * @method addEquation
 * @param {Equation} eq
 */
Solver.prototype.addEquation = function(eq){
    if(eq.enabled){
        this.equations.push(eq);
    }
};

/**
 * Add equations. Same as .addEquation, but this time the argument is an array of Equations
 *
 * @method addEquations
 * @param {Array} eqs
 */
Solver.prototype.addEquations = function(eqs){
    //Utils.appendArray(this.equations,eqs);
    for(var i=0, N=eqs.length; i!==N; i++){
        var eq = eqs[i];
        if(eq.enabled){
            this.equations.push(eq);
        }
    }
};

/**
 * Remove an equation.
 *
 * @method removeEquation
 * @param {Equation} eq
 */
Solver.prototype.removeEquation = function(eq){
    var i = this.equations.indexOf(eq);
    if(i !== -1){
        this.equations.splice(i,1);
    }
};

/**
 * Remove all currently added equations.
 *
 * @method removeAllEquations
 */
Solver.prototype.removeAllEquations = function(){
    this.equations.length=0;
};

Solver.GS = 1;
Solver.ISLAND = 2;


},
function(require, exports, module, global) {

var Shape = require(202)
,    vec2 = require(191)
,    Utils = require(192);

module.exports = Heightfield;

/**
 * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a distance "elementWidth".
 * @class Heightfield
 * @extends Shape
 * @constructor
 * @param {Array} data An array of Y values that will be used to construct the terrain.
 * @param {object} options
 * @param {Number} [options.minValue] Minimum value of the data points in the data array. Will be computed automatically if not given.
 * @param {Number} [options.maxValue] Maximum value.
 * @param {Number} [options.elementWidth=0.1] World spacing between the data points in X direction.
 * @todo Should be possible to use along all axes, not just y
 *
 * @example
 *     // Generate some height data (y-values).
 *     var data = [];
 *     for(var i = 0; i < 1000; i++){
 *         var y = 0.5 * Math.cos(0.2 * i);
 *         data.push(y);
 *     }
 *
 *     // Create the heightfield shape
 *     var heightfieldShape = new Heightfield(data, {
 *         elementWidth: 1 // Distance between the data points in X direction
 *     });
 *     var heightfieldBody = new Body();
 *     heightfieldBody.addShape(heightfieldShape);
 *     world.addBody(heightfieldBody);
 */
function Heightfield(data, options){
    options = Utils.defaults(options, {
        maxValue : null,
        minValue : null,
        elementWidth : 0.1
    });

    if(options.minValue === null || options.maxValue === null){
        options.maxValue = data[0];
        options.minValue = data[0];
        for(var i=0; i !== data.length; i++){
            var v = data[i];
            if(v > options.maxValue){
                options.maxValue = v;
            }
            if(v < options.minValue){
                options.minValue = v;
            }
        }
    }

    /**
     * An array of numbers, or height values, that are spread out along the x axis.
     * @property {array} data
     */
    this.data = data;

    /**
     * Max value of the data
     * @property {number} maxValue
     */
    this.maxValue = options.maxValue;

    /**
     * Max value of the data
     * @property {number} minValue
     */
    this.minValue = options.minValue;

    /**
     * The width of each element
     * @property {number} elementWidth
     */
    this.elementWidth = options.elementWidth;

    Shape.call(this,Shape.HEIGHTFIELD);
}
Heightfield.prototype = new Shape();
Heightfield.prototype.constructor = Heightfield;

/**
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 */
Heightfield.prototype.computeMomentOfInertia = function(mass){
    return Number.MAX_VALUE;
};

Heightfield.prototype.updateBoundingRadius = function(){
    this.boundingRadius = Number.MAX_VALUE;
};

Heightfield.prototype.updateArea = function(){
    var data = this.data,
        area = 0;
    for(var i=0; i<data.length-1; i++){
        area += (data[i]+data[i+1]) / 2 * this.elementWidth;
    }
    this.area = area;
};

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Heightfield.prototype.computeAABB = function(out, position, angle){
    // Use the max data rectangle
    out.upperBound[0] = this.elementWidth * this.data.length + position[0];
    out.upperBound[1] = this.maxValue + position[1];
    out.lowerBound[0] = position[0];
    out.lowerBound[1] = -Number.MAX_VALUE; // Infinity
};


},
function(require, exports, module, global) {

var Shape = require(202)
,   vec2 = require(191);

module.exports = Line;

/**
 * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
 * @class Line
 * @param {Number} [length=1] The total length of the line
 * @extends Shape
 * @constructor
 */
function Line(length){

    /**
     * Length of this line
     * @property length
     * @type {Number}
     */
    this.length = length || 1;

    Shape.call(this,Shape.LINE);
}
Line.prototype = new Shape();
Line.prototype.constructor = Line;

Line.prototype.computeMomentOfInertia = function(mass){
    return mass * Math.pow(this.length,2) / 12;
};

Line.prototype.updateBoundingRadius = function(){
    this.boundingRadius = this.length/2;
};

var points = [vec2.create(),vec2.create()];

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Line.prototype.computeAABB = function(out, position, angle){
    var l2 = this.length / 2;
    vec2.set(points[0], -l2,  0);
    vec2.set(points[1],  l2,  0);
    out.setFromPoints(points,position,angle,0);
};



},
function(require, exports, module, global) {

var Constraint = require(208)
,   vec2 = require(191)
,   Equation = require(194);

module.exports = LockConstraint;

/**
 * Locks the relative position between two bodies.
 *
 * @class LockConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {Array}  [options.localOffsetB] The offset of bodyB in bodyA's frame. If not given the offset is computed from current positions.
 * @param {number} [options.localAngleB] The angle of bodyB in bodyA's frame. If not given, the angle is computed from current angles.
 * @param {number} [options.maxForce]
 * @extends Constraint
 */
function LockConstraint(bodyA, bodyB, options){
    options = options || {};

    Constraint.call(this,bodyA,bodyB,Constraint.LOCK,options);

    var maxForce = ( typeof(options.maxForce)==="undefined" ? Number.MAX_VALUE : options.maxForce );

    var localAngleB = options.localAngleB || 0;

    // Use 3 equations:
    // gx =   (xj - xi - l) * xhat = 0
    // gy =   (xj - xi - l) * yhat = 0
    // gr =   (xi - xj + r) * that = 0
    //
    // ...where:
    //   l is the localOffsetB vector rotated to world in bodyA frame
    //   r is the same vector but reversed and rotated from bodyB frame
    //   xhat, yhat are world axis vectors
    //   that is the tangent of r
    //
    // For the first two constraints, we get
    // G*W = (vj - vi - ldot  ) * xhat
    //     = (vj - vi - wi x l) * xhat
    //
    // Since (wi x l) * xhat = (l x xhat) * wi, we get
    // G*W = [ -1   0   (-l x xhat)  1   0   0] * [vi wi vj wj]
    //
    // The last constraint gives
    // GW = (vi - vj + wj x r) * that
    //    = [  that   0  -that  (r x t) ]

    var x =     new Equation(bodyA,bodyB,-maxForce,maxForce),
        y =     new Equation(bodyA,bodyB,-maxForce,maxForce),
        rot =   new Equation(bodyA,bodyB,-maxForce,maxForce);

    var l = vec2.create(),
        g = vec2.create(),
        that = this;
    x.computeGq = function(){
        vec2.rotate(l, that.localOffsetB, bodyA.angle);
        vec2.sub(g, bodyB.position, bodyA.position);
        vec2.sub(g, g, l);
        return g[0];
    };
    y.computeGq = function(){
        vec2.rotate(l, that.localOffsetB, bodyA.angle);
        vec2.sub(g, bodyB.position, bodyA.position);
        vec2.sub(g, g, l);
        return g[1];
    };
    var r = vec2.create(),
        t = vec2.create();
    rot.computeGq = function(){
        vec2.rotate(r, that.localOffsetB, bodyB.angle - that.localAngleB);
        vec2.scale(r,r,-1);
        vec2.sub(g,bodyA.position,bodyB.position);
        vec2.add(g,g,r);
        vec2.rotate(t,r,-Math.PI/2);
        vec2.normalize(t,t);
        return vec2.dot(g,t);
    };

    /**
     * The offset of bodyB in bodyA's frame.
     * @property {Array} localOffsetB
     */
    this.localOffsetB = vec2.create();
    if(options.localOffsetB){
        vec2.copy(this.localOffsetB, options.localOffsetB);
    } else {
        // Construct from current positions
        vec2.sub(this.localOffsetB, bodyB.position, bodyA.position);
        vec2.rotate(this.localOffsetB, this.localOffsetB, -bodyA.angle);
    }

    /**
     * The offset angle of bodyB in bodyA's frame.
     * @property {Number} localAngleB
     */
    this.localAngleB = 0;
    if(typeof(options.localAngleB) === 'number'){
        this.localAngleB = options.localAngleB;
    } else {
        // Construct
        this.localAngleB = bodyB.angle - bodyA.angle;
    }

    this.equations.push(x, y, rot);
    this.setMaxForce(maxForce);
}
LockConstraint.prototype = new Constraint();
LockConstraint.prototype.constructor = LockConstraint;

/**
 * Set the maximum force to be applied.
 * @method setMaxForce
 * @param {Number} force
 */
LockConstraint.prototype.setMaxForce = function(force){
    var eqs = this.equations;
    for(var i=0; i<this.equations.length; i++){
        eqs[i].maxForce =  force;
        eqs[i].minForce = -force;
    }
};

/**
 * Get the max force.
 * @method getMaxForce
 * @return {Number}
 */
LockConstraint.prototype.getMaxForce = function(){
    return this.equations[0].maxForce;
};

var l = vec2.create();
var r = vec2.create();
var t = vec2.create();
var xAxis = vec2.fromValues(1,0);
var yAxis = vec2.fromValues(0,1);
LockConstraint.prototype.update = function(){
    var x =   this.equations[0],
        y =   this.equations[1],
        rot = this.equations[2],
        bodyA = this.bodyA,
        bodyB = this.bodyB;

    vec2.rotate(l,this.localOffsetB,bodyA.angle);
    vec2.rotate(r,this.localOffsetB,bodyB.angle - this.localAngleB);
    vec2.scale(r,r,-1);

    vec2.rotate(t,r,Math.PI/2);
    vec2.normalize(t,t);

    x.G[0] = -1;
    x.G[1] =  0;
    x.G[2] = -vec2.crossLength(l,xAxis);
    x.G[3] =  1;

    y.G[0] =  0;
    y.G[1] = -1;
    y.G[2] = -vec2.crossLength(l,yAxis);
    y.G[4] =  1;

    rot.G[0] =  -t[0];
    rot.G[1] =  -t[1];
    rot.G[3] =  t[0];
    rot.G[4] =  t[1];
    rot.G[5] =  vec2.crossLength(r,t);
};


},
function(require, exports, module, global) {

var vec2 = require(191)
,   sub = vec2.sub
,   add = vec2.add
,   dot = vec2.dot
,   Utils = require(192)
,   TupleDictionary = require(224)
,   Equation = require(194)
,   ContactEquation = require(209)
,   FrictionEquation = require(213)
,   Circle = require(207)
,   Convex = require(201)
,   Shape = require(202)
,   Body = require(195)
,   Rectangle = require(225);

module.exports = Narrowphase;

// Temp things
var yAxis = vec2.fromValues(0,1);

var tmp1 = vec2.fromValues(0,0)
,   tmp2 = vec2.fromValues(0,0)
,   tmp3 = vec2.fromValues(0,0)
,   tmp4 = vec2.fromValues(0,0)
,   tmp5 = vec2.fromValues(0,0)
,   tmp6 = vec2.fromValues(0,0)
,   tmp7 = vec2.fromValues(0,0)
,   tmp8 = vec2.fromValues(0,0)
,   tmp9 = vec2.fromValues(0,0)
,   tmp10 = vec2.fromValues(0,0)
,   tmp11 = vec2.fromValues(0,0)
,   tmp12 = vec2.fromValues(0,0)
,   tmp13 = vec2.fromValues(0,0)
,   tmp14 = vec2.fromValues(0,0)
,   tmp15 = vec2.fromValues(0,0)
,   tmp16 = vec2.fromValues(0,0)
,   tmp17 = vec2.fromValues(0,0)
,   tmp18 = vec2.fromValues(0,0)
,   tmpArray = [];

/**
 * Narrowphase. Creates contacts and friction given shapes and transforms.
 * @class Narrowphase
 * @constructor
 */
function Narrowphase(){

    /**
     * @property contactEquations
     * @type {Array}
     */
    this.contactEquations = [];

    /**
     * @property frictionEquations
     * @type {Array}
     */
    this.frictionEquations = [];

    /**
     * Whether to make friction equations in the upcoming contacts.
     * @property enableFriction
     * @type {Boolean}
     */
    this.enableFriction = true;

    /**
     * Whether to make equations enabled in upcoming contacts.
     * @property enabledEquations
     * @type {Boolean}
     */
    this.enabledEquations = true;

    /**
     * The friction slip force to use when creating friction equations.
     * @property slipForce
     * @type {Number}
     */
    this.slipForce = 10.0;

    /**
     * The friction value to use in the upcoming friction equations.
     * @property frictionCoefficient
     * @type {Number}
     */
    this.frictionCoefficient = 0.3;

    /**
     * Will be the .relativeVelocity in each produced FrictionEquation.
     * @property {Number} surfaceVelocity
     */
    this.surfaceVelocity = 0;

    this.reuseObjects = true;
    this.reusableContactEquations = [];
    this.reusableFrictionEquations = [];

    /**
     * The restitution value to use in the next contact equations.
     * @property restitution
     * @type {Number}
     */
    this.restitution = 0;

    /**
     * The stiffness value to use in the next contact equations.
     * @property {Number} stiffness
     */
    this.stiffness = Equation.DEFAULT_STIFFNESS;

    /**
     * The stiffness value to use in the next contact equations.
     * @property {Number} stiffness
     */
    this.relaxation = Equation.DEFAULT_RELAXATION;

    /**
     * The stiffness value to use in the next friction equations.
     * @property frictionStiffness
     * @type {Number}
     */
    this.frictionStiffness = Equation.DEFAULT_STIFFNESS;

    /**
     * The relaxation value to use in the next friction equations.
     * @property frictionRelaxation
     * @type {Number}
     */
    this.frictionRelaxation = Equation.DEFAULT_RELAXATION;

    /**
     * Enable reduction of friction equations. If disabled, a box on a plane will generate 2 contact equations and 2 friction equations. If enabled, there will be only one friction equation. Same kind of simplifications are made  for all collision types.
     * @property enableFrictionReduction
     * @type {Boolean}
     * @deprecated This flag will be removed when the feature is stable enough.
     * @default true
     */
    this.enableFrictionReduction = true;

    /**
     * Keeps track of the colliding bodies last step.
     * @private
     * @property collidingBodiesLastStep
     * @type {TupleDictionary}
     */
    this.collidingBodiesLastStep = new TupleDictionary();

    /**
     * Contact skin size value to use in the next contact equations.
     * @property {Number} contactSkinSize
     * @default 0.01
     */
    this.contactSkinSize = 0.01;
}

var bodiesOverlap_shapePositionA = vec2.create();
var bodiesOverlap_shapePositionB = vec2.create();

/**
 * @method bodiesOverlap
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Narrowphase.prototype.bodiesOverlap = function(bodyA, bodyB){
    var shapePositionA = bodiesOverlap_shapePositionA;
    var shapePositionB = bodiesOverlap_shapePositionB;

    // Loop over all shapes of bodyA
    for(var k=0, Nshapesi=bodyA.shapes.length; k!==Nshapesi; k++){
        var shapeA = bodyA.shapes[k],
            positionA = bodyA.shapeOffsets[k],
            angleA = bodyA.shapeAngles[k];

        bodyA.toWorldFrame(shapePositionA, positionA);

        // All shapes of body j
        for(var l=0, Nshapesj=bodyB.shapes.length; l!==Nshapesj; l++){
            var shapeB = bodyB.shapes[l],
                positionB = bodyB.shapeOffsets[l],
                angleB = bodyB.shapeAngles[l];

            bodyB.toWorldFrame(shapePositionB, positionB);

            if(this[shapeA.type | shapeB.type](
                bodyA,
                shapeA,
                shapePositionA,
                shapeA.angle + bodyA.angle,
                bodyB,
                shapeB,
                shapePositionB,
                shapeB.angle + bodyB.angle,
                true
            )){
                return true;
            }
        }
    }

    return false;
};

/**
 * Check if the bodies were in contact since the last reset().
 * @method collidedLastStep
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Narrowphase.prototype.collidedLastStep = function(bodyA, bodyB){
    var id1 = bodyA.id|0,
        id2 = bodyB.id|0;
    return !!this.collidingBodiesLastStep.get(id1, id2);
};

/**
 * Throws away the old equations and gets ready to create new
 * @method reset
 */
Narrowphase.prototype.reset = function(){
    this.collidingBodiesLastStep.reset();

    var eqs = this.contactEquations;
    var l = eqs.length;
    while(l--){
        var eq = eqs[l],
            id1 = eq.bodyA.id,
            id2 = eq.bodyB.id;
        this.collidingBodiesLastStep.set(id1, id2, true);
    }

    if(this.reuseObjects){
        var ce = this.contactEquations,
            fe = this.frictionEquations,
            rfe = this.reusableFrictionEquations,
            rce = this.reusableContactEquations;
        Utils.appendArray(rce,ce);
        Utils.appendArray(rfe,fe);
    }

    // Reset
    this.contactEquations.length = this.frictionEquations.length = 0;
};

/**
 * Creates a ContactEquation, either by reusing an existing object or creating a new one.
 * @method createContactEquation
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {ContactEquation}
 */
Narrowphase.prototype.createContactEquation = function(bodyA, bodyB, shapeA, shapeB){
    var c = this.reusableContactEquations.length ? this.reusableContactEquations.pop() : new ContactEquation(bodyA,bodyB);
    c.bodyA = bodyA;
    c.bodyB = bodyB;
    c.shapeA = shapeA;
    c.shapeB = shapeB;
    c.restitution = this.restitution;
    c.firstImpact = !this.collidedLastStep(bodyA,bodyB);
    c.stiffness = this.stiffness;
    c.relaxation = this.relaxation;
    c.needsUpdate = true;
    c.enabled = this.enabledEquations;
    c.offset = this.contactSkinSize;

    return c;
};

/**
 * Creates a FrictionEquation, either by reusing an existing object or creating a new one.
 * @method createFrictionEquation
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {FrictionEquation}
 */
Narrowphase.prototype.createFrictionEquation = function(bodyA, bodyB, shapeA, shapeB){
    var c = this.reusableFrictionEquations.length ? this.reusableFrictionEquations.pop() : new FrictionEquation(bodyA,bodyB);
    c.bodyA = bodyA;
    c.bodyB = bodyB;
    c.shapeA = shapeA;
    c.shapeB = shapeB;
    c.setSlipForce(this.slipForce);
    c.frictionCoefficient = this.frictionCoefficient;
    c.relativeVelocity = this.surfaceVelocity;
    c.enabled = this.enabledEquations;
    c.needsUpdate = true;
    c.stiffness = this.frictionStiffness;
    c.relaxation = this.frictionRelaxation;
    c.contactEquations.length = 0;
    return c;
};

/**
 * Creates a FrictionEquation given the data in the ContactEquation. Uses same offset vectors ri and rj, but the tangent vector will be constructed from the collision normal.
 * @method createFrictionFromContact
 * @param  {ContactEquation} contactEquation
 * @return {FrictionEquation}
 */
Narrowphase.prototype.createFrictionFromContact = function(c){
    var eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA, c.shapeB);
    vec2.copy(eq.contactPointA, c.contactPointA);
    vec2.copy(eq.contactPointB, c.contactPointB);
    vec2.rotate90cw(eq.t, c.normalA);
    eq.contactEquations.push(c);
    return eq;
};

// Take the average N latest contact point on the plane.
Narrowphase.prototype.createFrictionFromAverage = function(numContacts){
    var c = this.contactEquations[this.contactEquations.length - 1];
    var eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA, c.shapeB);
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    vec2.set(eq.contactPointA, 0, 0);
    vec2.set(eq.contactPointB, 0, 0);
    vec2.set(eq.t, 0, 0);
    for(var i=0; i!==numContacts; i++){
        c = this.contactEquations[this.contactEquations.length - 1 - i];
        if(c.bodyA === bodyA){
            vec2.add(eq.t, eq.t, c.normalA);
            vec2.add(eq.contactPointA, eq.contactPointA, c.contactPointA);
            vec2.add(eq.contactPointB, eq.contactPointB, c.contactPointB);
        } else {
            vec2.sub(eq.t, eq.t, c.normalA);
            vec2.add(eq.contactPointA, eq.contactPointA, c.contactPointB);
            vec2.add(eq.contactPointB, eq.contactPointB, c.contactPointA);
        }
        eq.contactEquations.push(c);
    }

    var invNumContacts = 1/numContacts;
    vec2.scale(eq.contactPointA, eq.contactPointA, invNumContacts);
    vec2.scale(eq.contactPointB, eq.contactPointB, invNumContacts);
    vec2.normalize(eq.t, eq.t);
    vec2.rotate90cw(eq.t, eq.t);
    return eq;
};

/**
 * Convex/line narrowphase
 * @method convexLine
 * @param  {Body}       convexBody
 * @param  {Convex}     convexShape
 * @param  {Array}      convexOffset
 * @param  {Number}     convexAngle
 * @param  {Body}       lineBody
 * @param  {Line}       lineShape
 * @param  {Array}      lineOffset
 * @param  {Number}     lineAngle
 * @param {boolean}     justTest
 * @todo Implement me!
 */
Narrowphase.prototype[Shape.LINE | Shape.CONVEX] =
Narrowphase.prototype.convexLine = function(
    convexBody,
    convexShape,
    convexOffset,
    convexAngle,
    lineBody,
    lineShape,
    lineOffset,
    lineAngle,
    justTest
){
    // TODO
    if(justTest){
        return false;
    } else {
        return 0;
    }
};

/**
 * Line/rectangle narrowphase
 * @method lineRectangle
 * @param  {Body}       lineBody
 * @param  {Line}       lineShape
 * @param  {Array}      lineOffset
 * @param  {Number}     lineAngle
 * @param  {Body}       rectangleBody
 * @param  {Rectangle}  rectangleShape
 * @param  {Array}      rectangleOffset
 * @param  {Number}     rectangleAngle
 * @param  {Boolean}    justTest
 * @todo Implement me!
 */
Narrowphase.prototype[Shape.LINE | Shape.RECTANGLE] =
Narrowphase.prototype.lineRectangle = function(
    lineBody,
    lineShape,
    lineOffset,
    lineAngle,
    rectangleBody,
    rectangleShape,
    rectangleOffset,
    rectangleAngle,
    justTest
){
    // TODO
    if(justTest){
        return false;
    } else {
        return 0;
    }
};

function setConvexToCapsuleShapeMiddle(convexShape, capsuleShape){
    vec2.set(convexShape.vertices[0], -capsuleShape.length * 0.5, -capsuleShape.radius);
    vec2.set(convexShape.vertices[1],  capsuleShape.length * 0.5, -capsuleShape.radius);
    vec2.set(convexShape.vertices[2],  capsuleShape.length * 0.5,  capsuleShape.radius);
    vec2.set(convexShape.vertices[3], -capsuleShape.length * 0.5,  capsuleShape.radius);
}

var convexCapsule_tempRect = new Rectangle(1,1),
    convexCapsule_tempVec = vec2.create();

/**
 * Convex/capsule narrowphase
 * @method convexCapsule
 * @param  {Body}       convexBody
 * @param  {Convex}     convexShape
 * @param  {Array}      convexPosition
 * @param  {Number}     convexAngle
 * @param  {Body}       capsuleBody
 * @param  {Capsule}    capsuleShape
 * @param  {Array}      capsulePosition
 * @param  {Number}     capsuleAngle
 */
Narrowphase.prototype[Shape.CAPSULE | Shape.CONVEX] =
Narrowphase.prototype[Shape.CAPSULE | Shape.RECTANGLE] =
Narrowphase.prototype.convexCapsule = function(
    convexBody,
    convexShape,
    convexPosition,
    convexAngle,
    capsuleBody,
    capsuleShape,
    capsulePosition,
    capsuleAngle,
    justTest
){

    // Check the circles
    // Add offsets!
    var circlePos = convexCapsule_tempVec;
    vec2.set(circlePos, capsuleShape.length/2,0);
    vec2.rotate(circlePos,circlePos,capsuleAngle);
    vec2.add(circlePos,circlePos,capsulePosition);
    var result1 = this.circleConvex(capsuleBody,capsuleShape,circlePos,capsuleAngle, convexBody,convexShape,convexPosition,convexAngle, justTest, capsuleShape.radius);

    vec2.set(circlePos,-capsuleShape.length/2, 0);
    vec2.rotate(circlePos,circlePos,capsuleAngle);
    vec2.add(circlePos,circlePos,capsulePosition);
    var result2 = this.circleConvex(capsuleBody,capsuleShape,circlePos,capsuleAngle, convexBody,convexShape,convexPosition,convexAngle, justTest, capsuleShape.radius);

    if(justTest && (result1 || result2)){
        return true;
    }

    // Check center rect
    var r = convexCapsule_tempRect;
    setConvexToCapsuleShapeMiddle(r,capsuleShape);
    var result = this.convexConvex(convexBody,convexShape,convexPosition,convexAngle, capsuleBody,r,capsulePosition,capsuleAngle, justTest);

    return result + result1 + result2;
};

/**
 * Capsule/line narrowphase
 * @method lineCapsule
 * @param  {Body}       lineBody
 * @param  {Line}       lineShape
 * @param  {Array}      linePosition
 * @param  {Number}     lineAngle
 * @param  {Body}       capsuleBody
 * @param  {Capsule}    capsuleShape
 * @param  {Array}      capsulePosition
 * @param  {Number}     capsuleAngle
 * @todo Implement me!
 */
Narrowphase.prototype[Shape.CAPSULE | Shape.LINE] =
Narrowphase.prototype.lineCapsule = function(
    lineBody,
    lineShape,
    linePosition,
    lineAngle,
    capsuleBody,
    capsuleShape,
    capsulePosition,
    capsuleAngle,
    justTest
){
    // TODO
    if(justTest){
        return false;
    } else {
        return 0;
    }
};

var capsuleCapsule_tempVec1 = vec2.create();
var capsuleCapsule_tempVec2 = vec2.create();
var capsuleCapsule_tempRect1 = new Rectangle(1,1);

/**
 * Capsule/capsule narrowphase
 * @method capsuleCapsule
 * @param  {Body}       bi
 * @param  {Capsule}    si
 * @param  {Array}      xi
 * @param  {Number}     ai
 * @param  {Body}       bj
 * @param  {Capsule}    sj
 * @param  {Array}      xj
 * @param  {Number}     aj
 */
Narrowphase.prototype[Shape.CAPSULE | Shape.CAPSULE] =
Narrowphase.prototype.capsuleCapsule = function(bi,si,xi,ai, bj,sj,xj,aj, justTest){

    var enableFrictionBefore;

    // Check the circles
    // Add offsets!
    var circlePosi = capsuleCapsule_tempVec1,
        circlePosj = capsuleCapsule_tempVec2;

    var numContacts = 0;


    // Need 4 circle checks, between all
    for(var i=0; i<2; i++){

        vec2.set(circlePosi,(i===0?-1:1)*si.length/2,0);
        vec2.rotate(circlePosi,circlePosi,ai);
        vec2.add(circlePosi,circlePosi,xi);

        for(var j=0; j<2; j++){

            vec2.set(circlePosj,(j===0?-1:1)*sj.length/2, 0);
            vec2.rotate(circlePosj,circlePosj,aj);
            vec2.add(circlePosj,circlePosj,xj);

            // Temporarily turn off friction
            if(this.enableFrictionReduction){
                enableFrictionBefore = this.enableFriction;
                this.enableFriction = false;
            }

            var result = this.circleCircle(bi,si,circlePosi,ai, bj,sj,circlePosj,aj, justTest, si.radius, sj.radius);

            if(this.enableFrictionReduction){
                this.enableFriction = enableFrictionBefore;
            }

            if(justTest && result){
                return true;
            }

            numContacts += result;
        }
    }

    if(this.enableFrictionReduction){
        // Temporarily turn off friction
        enableFrictionBefore = this.enableFriction;
        this.enableFriction = false;
    }

    // Check circles against the center rectangles
    var rect = capsuleCapsule_tempRect1;
    setConvexToCapsuleShapeMiddle(rect,si);
    var result1 = this.convexCapsule(bi,rect,xi,ai, bj,sj,xj,aj, justTest);

    if(this.enableFrictionReduction){
        this.enableFriction = enableFrictionBefore;
    }

    if(justTest && result1){
        return true;
    }
    numContacts += result1;

    if(this.enableFrictionReduction){
        // Temporarily turn off friction
        var enableFrictionBefore = this.enableFriction;
        this.enableFriction = false;
    }

    setConvexToCapsuleShapeMiddle(rect,sj);
    var result2 = this.convexCapsule(bj,rect,xj,aj, bi,si,xi,ai, justTest);

    if(this.enableFrictionReduction){
        this.enableFriction = enableFrictionBefore;
    }

    if(justTest && result2){
        return true;
    }
    numContacts += result2;

    if(this.enableFrictionReduction){
        if(numContacts && this.enableFriction){
            this.frictionEquations.push(this.createFrictionFromAverage(numContacts));
        }
    }

    return numContacts;
};

/**
 * Line/line narrowphase
 * @method lineLine
 * @param  {Body}       bodyA
 * @param  {Line}       shapeA
 * @param  {Array}      positionA
 * @param  {Number}     angleA
 * @param  {Body}       bodyB
 * @param  {Line}       shapeB
 * @param  {Array}      positionB
 * @param  {Number}     angleB
 * @todo Implement me!
 */
Narrowphase.prototype[Shape.LINE | Shape.LINE] =
Narrowphase.prototype.lineLine = function(
    bodyA,
    shapeA,
    positionA,
    angleA,
    bodyB,
    shapeB,
    positionB,
    angleB,
    justTest
){
    // TODO
    if(justTest){
        return false;
    } else {
        return 0;
    }
};

/**
 * Plane/line Narrowphase
 * @method planeLine
 * @param  {Body}   planeBody
 * @param  {Plane}  planeShape
 * @param  {Array}  planeOffset
 * @param  {Number} planeAngle
 * @param  {Body}   lineBody
 * @param  {Line}   lineShape
 * @param  {Array}  lineOffset
 * @param  {Number} lineAngle
 */
Narrowphase.prototype[Shape.PLANE | Shape.LINE] =
Narrowphase.prototype.planeLine = function(planeBody, planeShape, planeOffset, planeAngle,
                                           lineBody,  lineShape,  lineOffset,  lineAngle, justTest){
    var worldVertex0 = tmp1,
        worldVertex1 = tmp2,
        worldVertex01 = tmp3,
        worldVertex11 = tmp4,
        worldEdge = tmp5,
        worldEdgeUnit = tmp6,
        dist = tmp7,
        worldNormal = tmp8,
        worldTangent = tmp9,
        verts = tmpArray,
        numContacts = 0;

    // Get start and end points
    vec2.set(worldVertex0, -lineShape.length/2, 0);
    vec2.set(worldVertex1,  lineShape.length/2, 0);

    // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
    vec2.rotate(worldVertex01, worldVertex0, lineAngle);
    vec2.rotate(worldVertex11, worldVertex1, lineAngle);

    add(worldVertex01, worldVertex01, lineOffset);
    add(worldVertex11, worldVertex11, lineOffset);

    vec2.copy(worldVertex0,worldVertex01);
    vec2.copy(worldVertex1,worldVertex11);

    // Get vector along the line
    sub(worldEdge, worldVertex1, worldVertex0);
    vec2.normalize(worldEdgeUnit, worldEdge);

    // Get tangent to the edge.
    vec2.rotate90cw(worldTangent, worldEdgeUnit);

    vec2.rotate(worldNormal, yAxis, planeAngle);

    // Check line ends
    verts[0] = worldVertex0;
    verts[1] = worldVertex1;
    for(var i=0; i<verts.length; i++){
        var v = verts[i];

        sub(dist, v, planeOffset);

        var d = dot(dist,worldNormal);

        if(d < 0){

            if(justTest){
                return true;
            }

            var c = this.createContactEquation(planeBody,lineBody,planeShape,lineShape);
            numContacts++;

            vec2.copy(c.normalA, worldNormal);
            vec2.normalize(c.normalA,c.normalA);

            // distance vector along plane normal
            vec2.scale(dist, worldNormal, d);

            // Vector from plane center to contact
            sub(c.contactPointA, v, dist);
            sub(c.contactPointA, c.contactPointA, planeBody.position);

            // From line center to contact
            sub(c.contactPointB, v,    lineOffset);
            add(c.contactPointB, c.contactPointB, lineOffset);
            sub(c.contactPointB, c.contactPointB, lineBody.position);

            this.contactEquations.push(c);

            if(!this.enableFrictionReduction){
                if(this.enableFriction){
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }
            }
        }
    }

    if(justTest){
        return false;
    }

    if(!this.enableFrictionReduction){
        if(numContacts && this.enableFriction){
            this.frictionEquations.push(this.createFrictionFromAverage(numContacts));
        }
    }

    return numContacts;
};

Narrowphase.prototype[Shape.PARTICLE | Shape.CAPSULE] =
Narrowphase.prototype.particleCapsule = function(
    particleBody,
    particleShape,
    particlePosition,
    particleAngle,
    capsuleBody,
    capsuleShape,
    capsulePosition,
    capsuleAngle,
    justTest
){
    return this.circleLine(particleBody,particleShape,particlePosition,particleAngle, capsuleBody,capsuleShape,capsulePosition,capsuleAngle, justTest, capsuleShape.radius, 0);
};

/**
 * Circle/line Narrowphase
 * @method circleLine
 * @param  {Body} circleBody
 * @param  {Circle} circleShape
 * @param  {Array} circleOffset
 * @param  {Number} circleAngle
 * @param  {Body} lineBody
 * @param  {Line} lineShape
 * @param  {Array} lineOffset
 * @param  {Number} lineAngle
 * @param {Boolean} justTest If set to true, this function will return the result (intersection or not) without adding equations.
 * @param {Number} lineRadius Radius to add to the line. Can be used to test Capsules.
 * @param {Number} circleRadius If set, this value overrides the circle shape radius.
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.LINE] =
Narrowphase.prototype.circleLine = function(
    circleBody,
    circleShape,
    circleOffset,
    circleAngle,
    lineBody,
    lineShape,
    lineOffset,
    lineAngle,
    justTest,
    lineRadius,
    circleRadius
){
    var lineRadius = lineRadius || 0,
        circleRadius = typeof(circleRadius)!=="undefined" ? circleRadius : circleShape.radius,

        orthoDist = tmp1,
        lineToCircleOrthoUnit = tmp2,
        projectedPoint = tmp3,
        centerDist = tmp4,
        worldTangent = tmp5,
        worldEdge = tmp6,
        worldEdgeUnit = tmp7,
        worldVertex0 = tmp8,
        worldVertex1 = tmp9,
        worldVertex01 = tmp10,
        worldVertex11 = tmp11,
        dist = tmp12,
        lineToCircle = tmp13,
        lineEndToLineRadius = tmp14,

        verts = tmpArray;

    // Get start and end points
    vec2.set(worldVertex0, -lineShape.length/2, 0);
    vec2.set(worldVertex1,  lineShape.length/2, 0);

    // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
    vec2.rotate(worldVertex01, worldVertex0, lineAngle);
    vec2.rotate(worldVertex11, worldVertex1, lineAngle);

    add(worldVertex01, worldVertex01, lineOffset);
    add(worldVertex11, worldVertex11, lineOffset);

    vec2.copy(worldVertex0,worldVertex01);
    vec2.copy(worldVertex1,worldVertex11);

    // Get vector along the line
    sub(worldEdge, worldVertex1, worldVertex0);
    vec2.normalize(worldEdgeUnit, worldEdge);

    // Get tangent to the edge.
    vec2.rotate90cw(worldTangent, worldEdgeUnit);

    // Check distance from the plane spanned by the edge vs the circle
    sub(dist, circleOffset, worldVertex0);
    var d = dot(dist, worldTangent); // Distance from center of line to circle center
    sub(centerDist, worldVertex0, lineOffset);

    sub(lineToCircle, circleOffset, lineOffset);

    var radiusSum = circleRadius + lineRadius;

    if(Math.abs(d) < radiusSum){

        // Now project the circle onto the edge
        vec2.scale(orthoDist, worldTangent, d);
        sub(projectedPoint, circleOffset, orthoDist);

        // Add the missing line radius
        vec2.scale(lineToCircleOrthoUnit, worldTangent, dot(worldTangent, lineToCircle));
        vec2.normalize(lineToCircleOrthoUnit,lineToCircleOrthoUnit);
        vec2.scale(lineToCircleOrthoUnit, lineToCircleOrthoUnit, lineRadius);
        add(projectedPoint,projectedPoint,lineToCircleOrthoUnit);

        // Check if the point is within the edge span
        var pos =  dot(worldEdgeUnit, projectedPoint);
        var pos0 = dot(worldEdgeUnit, worldVertex0);
        var pos1 = dot(worldEdgeUnit, worldVertex1);

        if(pos > pos0 && pos < pos1){
            // We got contact!

            if(justTest){
                return true;
            }

            var c = this.createContactEquation(circleBody,lineBody,circleShape,lineShape);

            vec2.scale(c.normalA, orthoDist, -1);
            vec2.normalize(c.normalA, c.normalA);

            vec2.scale( c.contactPointA, c.normalA,  circleRadius);
            add(c.contactPointA, c.contactPointA, circleOffset);
            sub(c.contactPointA, c.contactPointA, circleBody.position);

            sub(c.contactPointB, projectedPoint, lineOffset);
            add(c.contactPointB, c.contactPointB, lineOffset);
            sub(c.contactPointB, c.contactPointB, lineBody.position);

            this.contactEquations.push(c);

            if(this.enableFriction){
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }

            return 1;
        }
    }

    // Add corner
    verts[0] = worldVertex0;
    verts[1] = worldVertex1;

    for(var i=0; i<verts.length; i++){
        var v = verts[i];

        sub(dist, v, circleOffset);

        if(vec2.squaredLength(dist) < Math.pow(radiusSum, 2)){

            if(justTest){
                return true;
            }

            var c = this.createContactEquation(circleBody,lineBody,circleShape,lineShape);

            vec2.copy(c.normalA, dist);
            vec2.normalize(c.normalA,c.normalA);

            // Vector from circle to contact point is the normal times the circle radius
            vec2.scale(c.contactPointA, c.normalA, circleRadius);
            add(c.contactPointA, c.contactPointA, circleOffset);
            sub(c.contactPointA, c.contactPointA, circleBody.position);

            sub(c.contactPointB, v, lineOffset);
            vec2.scale(lineEndToLineRadius, c.normalA, -lineRadius);
            add(c.contactPointB, c.contactPointB, lineEndToLineRadius);
            add(c.contactPointB, c.contactPointB, lineOffset);
            sub(c.contactPointB, c.contactPointB, lineBody.position);

            this.contactEquations.push(c);

            if(this.enableFriction){
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }

            return 1;
        }
    }

    return 0;
};

/**
 * Circle/capsule Narrowphase
 * @method circleCapsule
 * @param  {Body}   bi
 * @param  {Circle} si
 * @param  {Array}  xi
 * @param  {Number} ai
 * @param  {Body}   bj
 * @param  {Line}   sj
 * @param  {Array}  xj
 * @param  {Number} aj
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.CAPSULE] =
Narrowphase.prototype.circleCapsule = function(bi,si,xi,ai, bj,sj,xj,aj, justTest){
    return this.circleLine(bi,si,xi,ai, bj,sj,xj,aj, justTest, sj.radius);
};

/**
 * Circle/convex Narrowphase.
 * @method circleConvex
 * @param  {Body} circleBody
 * @param  {Circle} circleShape
 * @param  {Array} circleOffset
 * @param  {Number} circleAngle
 * @param  {Body} convexBody
 * @param  {Convex} convexShape
 * @param  {Array} convexOffset
 * @param  {Number} convexAngle
 * @param  {Boolean} justTest
 * @param  {Number} circleRadius
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.CONVEX] =
Narrowphase.prototype[Shape.CIRCLE | Shape.RECTANGLE] =
Narrowphase.prototype.circleConvex = function(
    circleBody,
    circleShape,
    circleOffset,
    circleAngle,
    convexBody,
    convexShape,
    convexOffset,
    convexAngle,
    justTest,
    circleRadius
){
    var circleRadius = typeof(circleRadius)==="number" ? circleRadius : circleShape.radius;

    var worldVertex0 = tmp1,
        worldVertex1 = tmp2,
        worldEdge = tmp3,
        worldEdgeUnit = tmp4,
        worldNormal = tmp5,
        centerDist = tmp6,
        convexToCircle = tmp7,
        orthoDist = tmp8,
        projectedPoint = tmp9,
        dist = tmp10,
        worldVertex = tmp11,

        closestEdge = -1,
        closestEdgeDistance = null,
        closestEdgeOrthoDist = tmp12,
        closestEdgeProjectedPoint = tmp13,
        candidate = tmp14,
        candidateDist = tmp15,
        minCandidate = tmp16,

        found = false,
        minCandidateDistance = Number.MAX_VALUE;

    var numReported = 0;

    // New algorithm:
    // 1. Check so center of circle is not inside the polygon. If it is, this wont work...
    // 2. For each edge
    // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
    // 2. 2. Check if point is inside.

    var verts = convexShape.vertices;

    // Check all edges first
    for(var i=0; i!==verts.length+1; i++){
        var v0 = verts[i%verts.length],
            v1 = verts[(i+1)%verts.length];

        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        add(worldVertex0, worldVertex0, convexOffset);
        add(worldVertex1, worldVertex1, convexOffset);
        sub(worldEdge, worldVertex1, worldVertex0);

        vec2.normalize(worldEdgeUnit, worldEdge);

        // Get tangent to the edge. Points out of the Convex
        vec2.rotate90cw(worldNormal, worldEdgeUnit);

        // Get point on circle, closest to the polygon
        vec2.scale(candidate,worldNormal,-circleShape.radius);
        add(candidate,candidate,circleOffset);

        if(pointInConvex(candidate,convexShape,convexOffset,convexAngle)){

            vec2.sub(candidateDist,worldVertex0,candidate);
            var candidateDistance = Math.abs(vec2.dot(candidateDist,worldNormal));

            if(candidateDistance < minCandidateDistance){
                vec2.copy(minCandidate,candidate);
                minCandidateDistance = candidateDistance;
                vec2.scale(closestEdgeProjectedPoint,worldNormal,candidateDistance);
                vec2.add(closestEdgeProjectedPoint,closestEdgeProjectedPoint,candidate);
                found = true;
            }
        }
    }

    if(found){

        if(justTest){
            return true;
        }

        var c = this.createContactEquation(circleBody,convexBody,circleShape,convexShape);
        vec2.sub(c.normalA, minCandidate, circleOffset);
        vec2.normalize(c.normalA, c.normalA);

        vec2.scale(c.contactPointA,  c.normalA, circleRadius);
        add(c.contactPointA, c.contactPointA, circleOffset);
        sub(c.contactPointA, c.contactPointA, circleBody.position);

        sub(c.contactPointB, closestEdgeProjectedPoint, convexOffset);
        add(c.contactPointB, c.contactPointB, convexOffset);
        sub(c.contactPointB, c.contactPointB, convexBody.position);

        this.contactEquations.push(c);

        if(this.enableFriction){
            this.frictionEquations.push( this.createFrictionFromContact(c) );
        }

        return 1;
    }

    // Check all vertices
    if(circleRadius > 0){
        for(var i=0; i<verts.length; i++){
            var localVertex = verts[i];
            vec2.rotate(worldVertex, localVertex, convexAngle);
            add(worldVertex, worldVertex, convexOffset);

            sub(dist, worldVertex, circleOffset);
            if(vec2.squaredLength(dist) < Math.pow(circleRadius, 2)){

                if(justTest){
                    return true;
                }

                var c = this.createContactEquation(circleBody,convexBody,circleShape,convexShape);

                vec2.copy(c.normalA, dist);
                vec2.normalize(c.normalA,c.normalA);

                // Vector from circle to contact point is the normal times the circle radius
                vec2.scale(c.contactPointA, c.normalA, circleRadius);
                add(c.contactPointA, c.contactPointA, circleOffset);
                sub(c.contactPointA, c.contactPointA, circleBody.position);

                sub(c.contactPointB, worldVertex, convexOffset);
                add(c.contactPointB, c.contactPointB, convexOffset);
                sub(c.contactPointB, c.contactPointB, convexBody.position);

                this.contactEquations.push(c);

                if(this.enableFriction){
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }

                return 1;
            }
        }
    }

    return 0;
};

var pic_worldVertex0 = vec2.create(),
    pic_worldVertex1 = vec2.create(),
    pic_r0 = vec2.create(),
    pic_r1 = vec2.create();

/*
 * Check if a point is in a polygon
 */
function pointInConvex(worldPoint,convexShape,convexOffset,convexAngle){
    var worldVertex0 = pic_worldVertex0,
        worldVertex1 = pic_worldVertex1,
        r0 = pic_r0,
        r1 = pic_r1,
        point = worldPoint,
        verts = convexShape.vertices,
        lastCross = null;
    for(var i=0; i!==verts.length+1; i++){
        var v0 = verts[i%verts.length],
            v1 = verts[(i+1)%verts.length];

        // Transform vertices to world
        // @todo The point should be transformed to local coordinates in the convex, no need to transform each vertex
        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        add(worldVertex0, worldVertex0, convexOffset);
        add(worldVertex1, worldVertex1, convexOffset);

        sub(r0, worldVertex0, point);
        sub(r1, worldVertex1, point);
        var cross = vec2.crossLength(r0,r1);

        if(lastCross===null){
            lastCross = cross;
        }

        // If we got a different sign of the distance vector, the point is out of the polygon
        if(cross*lastCross <= 0){
            return false;
        }
        lastCross = cross;
    }
    return true;
}

/**
 * Particle/convex Narrowphase
 * @method particleConvex
 * @param  {Body} particleBody
 * @param  {Particle} particleShape
 * @param  {Array} particleOffset
 * @param  {Number} particleAngle
 * @param  {Body} convexBody
 * @param  {Convex} convexShape
 * @param  {Array} convexOffset
 * @param  {Number} convexAngle
 * @param {Boolean} justTest
 * @todo use pointInConvex and code more similar to circleConvex
 * @todo don't transform each vertex, but transform the particle position to convex-local instead
 */
Narrowphase.prototype[Shape.PARTICLE | Shape.CONVEX] =
Narrowphase.prototype[Shape.PARTICLE | Shape.RECTANGLE] =
Narrowphase.prototype.particleConvex = function(
    particleBody,
    particleShape,
    particleOffset,
    particleAngle,
    convexBody,
    convexShape,
    convexOffset,
    convexAngle,
    justTest
){
    var worldVertex0 = tmp1,
        worldVertex1 = tmp2,
        worldEdge = tmp3,
        worldEdgeUnit = tmp4,
        worldTangent = tmp5,
        centerDist = tmp6,
        convexToparticle = tmp7,
        orthoDist = tmp8,
        projectedPoint = tmp9,
        dist = tmp10,
        worldVertex = tmp11,
        closestEdge = -1,
        closestEdgeDistance = null,
        closestEdgeOrthoDist = tmp12,
        closestEdgeProjectedPoint = tmp13,
        r0 = tmp14, // vector from particle to vertex0
        r1 = tmp15,
        localPoint = tmp16,
        candidateDist = tmp17,
        minEdgeNormal = tmp18,
        minCandidateDistance = Number.MAX_VALUE;

    var numReported = 0,
        found = false,
        verts = convexShape.vertices;

    // Check if the particle is in the polygon at all
    if(!pointInConvex(particleOffset,convexShape,convexOffset,convexAngle)){
        return 0;
    }

    if(justTest){
        return true;
    }

    // Check edges first
    var lastCross = null;
    for(var i=0; i!==verts.length+1; i++){
        var v0 = verts[i%verts.length],
            v1 = verts[(i+1)%verts.length];

        // Transform vertices to world
        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        add(worldVertex0, worldVertex0, convexOffset);
        add(worldVertex1, worldVertex1, convexOffset);

        // Get world edge
        sub(worldEdge, worldVertex1, worldVertex0);
        vec2.normalize(worldEdgeUnit, worldEdge);

        // Get tangent to the edge. Points out of the Convex
        vec2.rotate90cw(worldTangent, worldEdgeUnit);

        // Check distance from the infinite line (spanned by the edge) to the particle
        sub(dist, particleOffset, worldVertex0);
        var d = dot(dist, worldTangent);
        sub(centerDist, worldVertex0, convexOffset);

        sub(convexToparticle, particleOffset, convexOffset);

        vec2.sub(candidateDist,worldVertex0,particleOffset);
        var candidateDistance = Math.abs(vec2.dot(candidateDist,worldTangent));

        if(candidateDistance < minCandidateDistance){
            minCandidateDistance = candidateDistance;
            vec2.scale(closestEdgeProjectedPoint,worldTangent,candidateDistance);
            vec2.add(closestEdgeProjectedPoint,closestEdgeProjectedPoint,particleOffset);
            vec2.copy(minEdgeNormal,worldTangent);
            found = true;
        }
    }

    if(found){
        var c = this.createContactEquation(particleBody,convexBody,particleShape,convexShape);

        vec2.scale(c.normalA, minEdgeNormal, -1);
        vec2.normalize(c.normalA, c.normalA);

        // Particle has no extent to the contact point
        vec2.set(c.contactPointA,  0, 0);
        add(c.contactPointA, c.contactPointA, particleOffset);
        sub(c.contactPointA, c.contactPointA, particleBody.position);

        // From convex center to point
        sub(c.contactPointB, closestEdgeProjectedPoint, convexOffset);
        add(c.contactPointB, c.contactPointB, convexOffset);
        sub(c.contactPointB, c.contactPointB, convexBody.position);

        this.contactEquations.push(c);

        if(this.enableFriction){
            this.frictionEquations.push( this.createFrictionFromContact(c) );
        }

        return 1;
    }


    return 0;
};

/**
 * Circle/circle Narrowphase
 * @method circleCircle
 * @param  {Body} bodyA
 * @param  {Circle} shapeA
 * @param  {Array} offsetA
 * @param  {Number} angleA
 * @param  {Body} bodyB
 * @param  {Circle} shapeB
 * @param  {Array} offsetB
 * @param  {Number} angleB
 * @param {Boolean} justTest
 * @param {Number} [radiusA] Optional radius to use for shapeA
 * @param {Number} [radiusB] Optional radius to use for shapeB
 */
Narrowphase.prototype[Shape.CIRCLE] =
Narrowphase.prototype.circleCircle = function(
    bodyA,
    shapeA,
    offsetA,
    angleA,
    bodyB,
    shapeB,
    offsetB,
    angleB,
    justTest,
    radiusA,
    radiusB
){

    var dist = tmp1,
        radiusA = radiusA || shapeA.radius,
        radiusB = radiusB || shapeB.radius;

    sub(dist,offsetA,offsetB);
    var r = radiusA + radiusB;
    if(vec2.squaredLength(dist) > Math.pow(r,2)){
        return 0;
    }

    if(justTest){
        return true;
    }

    var c = this.createContactEquation(bodyA,bodyB,shapeA,shapeB);
    sub(c.normalA, offsetB, offsetA);
    vec2.normalize(c.normalA,c.normalA);

    vec2.scale( c.contactPointA, c.normalA,  radiusA);
    vec2.scale( c.contactPointB, c.normalA, -radiusB);

    add(c.contactPointA, c.contactPointA, offsetA);
    sub(c.contactPointA, c.contactPointA, bodyA.position);

    add(c.contactPointB, c.contactPointB, offsetB);
    sub(c.contactPointB, c.contactPointB, bodyB.position);

    this.contactEquations.push(c);

    if(this.enableFriction){
        this.frictionEquations.push(this.createFrictionFromContact(c));
    }
    return 1;
};

/**
 * Plane/Convex Narrowphase
 * @method planeConvex
 * @param  {Body} planeBody
 * @param  {Plane} planeShape
 * @param  {Array} planeOffset
 * @param  {Number} planeAngle
 * @param  {Body} convexBody
 * @param  {Convex} convexShape
 * @param  {Array} convexOffset
 * @param  {Number} convexAngle
 * @param {Boolean} justTest
 */
Narrowphase.prototype[Shape.PLANE | Shape.CONVEX] =
Narrowphase.prototype[Shape.PLANE | Shape.RECTANGLE] =
Narrowphase.prototype.planeConvex = function(
    planeBody,
    planeShape,
    planeOffset,
    planeAngle,
    convexBody,
    convexShape,
    convexOffset,
    convexAngle,
    justTest
){
    var worldVertex = tmp1,
        worldNormal = tmp2,
        dist = tmp3;

    var numReported = 0;
    vec2.rotate(worldNormal, yAxis, planeAngle);

    for(var i=0; i!==convexShape.vertices.length; i++){
        var v = convexShape.vertices[i];
        vec2.rotate(worldVertex, v, convexAngle);
        add(worldVertex, worldVertex, convexOffset);

        sub(dist, worldVertex, planeOffset);

        if(dot(dist,worldNormal) <= 0){

            if(justTest){
                return true;
            }

            // Found vertex
            numReported++;

            var c = this.createContactEquation(planeBody,convexBody,planeShape,convexShape);

            sub(dist, worldVertex, planeOffset);

            vec2.copy(c.normalA, worldNormal);

            var d = dot(dist, c.normalA);
            vec2.scale(dist, c.normalA, d);

            // rj is from convex center to contact
            sub(c.contactPointB, worldVertex, convexBody.position);


            // ri is from plane center to contact
            sub( c.contactPointA, worldVertex, dist);
            sub( c.contactPointA, c.contactPointA, planeBody.position);

            this.contactEquations.push(c);

            if(!this.enableFrictionReduction){
                if(this.enableFriction){
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }
            }
        }
    }

    if(this.enableFrictionReduction){
        if(this.enableFriction && numReported){
            this.frictionEquations.push(this.createFrictionFromAverage(numReported));
        }
    }

    return numReported;
};

/**
 * Narrowphase for particle vs plane
 * @method particlePlane
 * @param  {Body}       particleBody
 * @param  {Particle}   particleShape
 * @param  {Array}      particleOffset
 * @param  {Number}     particleAngle
 * @param  {Body}       planeBody
 * @param  {Plane}      planeShape
 * @param  {Array}      planeOffset
 * @param  {Number}     planeAngle
 * @param {Boolean}     justTest
 */
Narrowphase.prototype[Shape.PARTICLE | Shape.PLANE] =
Narrowphase.prototype.particlePlane = function(
    particleBody,
    particleShape,
    particleOffset,
    particleAngle,
    planeBody,
    planeShape,
    planeOffset,
    planeAngle,
    justTest
){
    var dist = tmp1,
        worldNormal = tmp2;

    planeAngle = planeAngle || 0;

    sub(dist, particleOffset, planeOffset);
    vec2.rotate(worldNormal, yAxis, planeAngle);

    var d = dot(dist, worldNormal);

    if(d > 0){
        return 0;
    }
    if(justTest){
        return true;
    }

    var c = this.createContactEquation(planeBody,particleBody,planeShape,particleShape);

    vec2.copy(c.normalA, worldNormal);
    vec2.scale( dist, c.normalA, d );
    // dist is now the distance vector in the normal direction

    // ri is the particle position projected down onto the plane, from the plane center
    sub( c.contactPointA, particleOffset, dist);
    sub( c.contactPointA, c.contactPointA, planeBody.position);

    // rj is from the body center to the particle center
    sub( c.contactPointB, particleOffset, particleBody.position );

    this.contactEquations.push(c);

    if(this.enableFriction){
        this.frictionEquations.push(this.createFrictionFromContact(c));
    }
    return 1;
};

/**
 * Circle/Particle Narrowphase
 * @method circleParticle
 * @param  {Body} circleBody
 * @param  {Circle} circleShape
 * @param  {Array} circleOffset
 * @param  {Number} circleAngle
 * @param  {Body} particleBody
 * @param  {Particle} particleShape
 * @param  {Array} particleOffset
 * @param  {Number} particleAngle
 * @param  {Boolean} justTest
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.PARTICLE] =
Narrowphase.prototype.circleParticle = function(
    circleBody,
    circleShape,
    circleOffset,
    circleAngle,
    particleBody,
    particleShape,
    particleOffset,
    particleAngle,
    justTest
){
    var dist = tmp1;

    sub(dist, particleOffset, circleOffset);
    if(vec2.squaredLength(dist) > Math.pow(circleShape.radius, 2)){
        return 0;
    }
    if(justTest){
        return true;
    }

    var c = this.createContactEquation(circleBody,particleBody,circleShape,particleShape);
    vec2.copy(c.normalA, dist);
    vec2.normalize(c.normalA,c.normalA);

    // Vector from circle to contact point is the normal times the circle radius
    vec2.scale(c.contactPointA, c.normalA, circleShape.radius);
    add(c.contactPointA, c.contactPointA, circleOffset);
    sub(c.contactPointA, c.contactPointA, circleBody.position);

    // Vector from particle center to contact point is zero
    sub(c.contactPointB, particleOffset, particleBody.position);

    this.contactEquations.push(c);

    if(this.enableFriction){
        this.frictionEquations.push(this.createFrictionFromContact(c));
    }

    return 1;
};

var planeCapsule_tmpCircle = new Circle(1),
    planeCapsule_tmp1 = vec2.create(),
    planeCapsule_tmp2 = vec2.create(),
    planeCapsule_tmp3 = vec2.create();

/**
 * @method planeCapsule
 * @param  {Body} planeBody
 * @param  {Circle} planeShape
 * @param  {Array} planeOffset
 * @param  {Number} planeAngle
 * @param  {Body} capsuleBody
 * @param  {Particle} capsuleShape
 * @param  {Array} capsuleOffset
 * @param  {Number} capsuleAngle
 * @param {Boolean} justTest
 */
Narrowphase.prototype[Shape.PLANE | Shape.CAPSULE] =
Narrowphase.prototype.planeCapsule = function(
    planeBody,
    planeShape,
    planeOffset,
    planeAngle,
    capsuleBody,
    capsuleShape,
    capsuleOffset,
    capsuleAngle,
    justTest
){
    var end1 = planeCapsule_tmp1,
        end2 = planeCapsule_tmp2,
        circle = planeCapsule_tmpCircle,
        dst = planeCapsule_tmp3;

    // Compute world end positions
    vec2.set(end1, -capsuleShape.length/2, 0);
    vec2.rotate(end1,end1,capsuleAngle);
    add(end1,end1,capsuleOffset);

    vec2.set(end2,  capsuleShape.length/2, 0);
    vec2.rotate(end2,end2,capsuleAngle);
    add(end2,end2,capsuleOffset);

    circle.radius = capsuleShape.radius;

    var enableFrictionBefore;

    // Temporarily turn off friction
    if(this.enableFrictionReduction){
        enableFrictionBefore = this.enableFriction;
        this.enableFriction = false;
    }

    // Do Narrowphase as two circles
    var numContacts1 = this.circlePlane(capsuleBody,circle,end1,0, planeBody,planeShape,planeOffset,planeAngle, justTest),
        numContacts2 = this.circlePlane(capsuleBody,circle,end2,0, planeBody,planeShape,planeOffset,planeAngle, justTest);

    // Restore friction
    if(this.enableFrictionReduction){
        this.enableFriction = enableFrictionBefore;
    }

    if(justTest){
        return numContacts1 || numContacts2;
    } else {
        var numTotal = numContacts1 + numContacts2;
        if(this.enableFrictionReduction){
            if(numTotal){
                this.frictionEquations.push(this.createFrictionFromAverage(numTotal));
            }
        }
        return numTotal;
    }
};

/**
 * Creates ContactEquations and FrictionEquations for a collision.
 * @method circlePlane
 * @param  {Body}    bi     The first body that should be connected to the equations.
 * @param  {Circle}  si     The circle shape participating in the collision.
 * @param  {Array}   xi     Extra offset to take into account for the Shape, in addition to the one in circleBody.position. Will *not* be rotated by circleBody.angle (maybe it should, for sake of homogenity?). Set to null if none.
 * @param  {Body}    bj     The second body that should be connected to the equations.
 * @param  {Plane}   sj     The Plane shape that is participating
 * @param  {Array}   xj     Extra offset for the plane shape.
 * @param  {Number}  aj     Extra angle to apply to the plane
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.PLANE] =
Narrowphase.prototype.circlePlane = function(   bi,si,xi,ai, bj,sj,xj,aj, justTest ){
    var circleBody = bi,
        circleShape = si,
        circleOffset = xi, // Offset from body center, rotated!
        planeBody = bj,
        shapeB = sj,
        planeOffset = xj,
        planeAngle = aj;

    planeAngle = planeAngle || 0;

    // Vector from plane to circle
    var planeToCircle = tmp1,
        worldNormal = tmp2,
        temp = tmp3;

    sub(planeToCircle, circleOffset, planeOffset);

    // World plane normal
    vec2.rotate(worldNormal, yAxis, planeAngle);

    // Normal direction distance
    var d = dot(worldNormal, planeToCircle);

    if(d > circleShape.radius){
        return 0; // No overlap. Abort.
    }

    if(justTest){
        return true;
    }

    // Create contact
    var contact = this.createContactEquation(planeBody,circleBody,sj,si);

    // ni is the plane world normal
    vec2.copy(contact.normalA, worldNormal);

    // rj is the vector from circle center to the contact point
    vec2.scale(contact.contactPointB, contact.normalA, -circleShape.radius);
    add(contact.contactPointB, contact.contactPointB, circleOffset);
    sub(contact.contactPointB, contact.contactPointB, circleBody.position);

    // ri is the distance from plane center to contact.
    vec2.scale(temp, contact.normalA, d);
    sub(contact.contactPointA, planeToCircle, temp ); // Subtract normal distance vector from the distance vector
    add(contact.contactPointA, contact.contactPointA, planeOffset);
    sub(contact.contactPointA, contact.contactPointA, planeBody.position);

    this.contactEquations.push(contact);

    if(this.enableFriction){
        this.frictionEquations.push( this.createFrictionFromContact(contact) );
    }

    return 1;
};

/**
 * Convex/convex Narrowphase.See <a href="http://www.altdevblogaday.com/2011/05/13/contact-generation-between-3d-convex-meshes/">this article</a> for more info.
 * @method convexConvex
 * @param  {Body} bi
 * @param  {Convex} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Convex} sj
 * @param  {Array} xj
 * @param  {Number} aj
 */
Narrowphase.prototype[Shape.CONVEX] =
Narrowphase.prototype[Shape.CONVEX | Shape.RECTANGLE] =
Narrowphase.prototype[Shape.RECTANGLE] =
Narrowphase.prototype.convexConvex = function(  bi,si,xi,ai, bj,sj,xj,aj, justTest, precision ){
    var sepAxis = tmp1,
        worldPoint = tmp2,
        worldPoint0 = tmp3,
        worldPoint1 = tmp4,
        worldEdge = tmp5,
        projected = tmp6,
        penetrationVec = tmp7,
        dist = tmp8,
        worldNormal = tmp9,
        numContacts = 0,
        precision = typeof(precision) === 'number' ? precision : 0;

    var found = Narrowphase.findSeparatingAxis(si,xi,ai,sj,xj,aj,sepAxis);
    if(!found){
        return 0;
    }

    // Make sure the separating axis is directed from shape i to shape j
    sub(dist,xj,xi);
    if(dot(sepAxis,dist) > 0){
        vec2.scale(sepAxis,sepAxis,-1);
    }

    // Find edges with normals closest to the separating axis
    var closestEdge1 = Narrowphase.getClosestEdge(si,ai,sepAxis,true), // Flipped axis
        closestEdge2 = Narrowphase.getClosestEdge(sj,aj,sepAxis);

    if(closestEdge1 === -1 || closestEdge2 === -1){
        return 0;
    }

    // Loop over the shapes
    for(var k=0; k<2; k++){

        var closestEdgeA = closestEdge1,
            closestEdgeB = closestEdge2,
            shapeA =  si, shapeB =  sj,
            offsetA = xi, offsetB = xj,
            angleA = ai, angleB = aj,
            bodyA = bi, bodyB = bj;

        if(k === 0){
            // Swap!
            var tmp;
            tmp = closestEdgeA;
            closestEdgeA = closestEdgeB;
            closestEdgeB = tmp;

            tmp = shapeA;
            shapeA = shapeB;
            shapeB = tmp;

            tmp = offsetA;
            offsetA = offsetB;
            offsetB = tmp;

            tmp = angleA;
            angleA = angleB;
            angleB = tmp;

            tmp = bodyA;
            bodyA = bodyB;
            bodyB = tmp;
        }

        // Loop over 2 points in convex B
        for(var j=closestEdgeB; j<closestEdgeB+2; j++){

            // Get world point
            var v = shapeB.vertices[(j+shapeB.vertices.length)%shapeB.vertices.length];
            vec2.rotate(worldPoint, v, angleB);
            add(worldPoint, worldPoint, offsetB);

            var insideNumEdges = 0;

            // Loop over the 3 closest edges in convex A
            for(var i=closestEdgeA-1; i<closestEdgeA+2; i++){

                var v0 = shapeA.vertices[(i  +shapeA.vertices.length)%shapeA.vertices.length],
                    v1 = shapeA.vertices[(i+1+shapeA.vertices.length)%shapeA.vertices.length];

                // Construct the edge
                vec2.rotate(worldPoint0, v0, angleA);
                vec2.rotate(worldPoint1, v1, angleA);
                add(worldPoint0, worldPoint0, offsetA);
                add(worldPoint1, worldPoint1, offsetA);

                sub(worldEdge, worldPoint1, worldPoint0);

                vec2.rotate90cw(worldNormal, worldEdge); // Normal points out of convex 1
                vec2.normalize(worldNormal,worldNormal);

                sub(dist, worldPoint, worldPoint0);

                var d = dot(worldNormal,dist);

                if((i === closestEdgeA && d <= precision) || (i !== closestEdgeA && d <= 0)){
                    insideNumEdges++;
                }
            }

            if(insideNumEdges >= 3){

                if(justTest){
                    return true;
                }

                // worldPoint was on the "inside" side of each of the 3 checked edges.
                // Project it to the center edge and use the projection direction as normal

                // Create contact
                var c = this.createContactEquation(bodyA,bodyB,shapeA,shapeB);
                numContacts++;

                // Get center edge from body A
                var v0 = shapeA.vertices[(closestEdgeA)   % shapeA.vertices.length],
                    v1 = shapeA.vertices[(closestEdgeA+1) % shapeA.vertices.length];

                // Construct the edge
                vec2.rotate(worldPoint0, v0, angleA);
                vec2.rotate(worldPoint1, v1, angleA);
                add(worldPoint0, worldPoint0, offsetA);
                add(worldPoint1, worldPoint1, offsetA);

                sub(worldEdge, worldPoint1, worldPoint0);

                vec2.rotate90cw(c.normalA, worldEdge); // Normal points out of convex A
                vec2.normalize(c.normalA,c.normalA);

                sub(dist, worldPoint, worldPoint0); // From edge point to the penetrating point
                var d = dot(c.normalA,dist);             // Penetration
                vec2.scale(penetrationVec, c.normalA, d);     // Vector penetration

                sub(c.contactPointA, worldPoint, offsetA);
                sub(c.contactPointA, c.contactPointA, penetrationVec);
                add(c.contactPointA, c.contactPointA, offsetA);
                sub(c.contactPointA, c.contactPointA, bodyA.position);

                sub(c.contactPointB, worldPoint, offsetB);
                add(c.contactPointB, c.contactPointB, offsetB);
                sub(c.contactPointB, c.contactPointB, bodyB.position);

                this.contactEquations.push(c);

                // Todo reduce to 1 friction equation if we have 2 contact points
                if(!this.enableFrictionReduction){
                    if(this.enableFriction){
                        this.frictionEquations.push(this.createFrictionFromContact(c));
                    }
                }
            }
        }
    }

    if(this.enableFrictionReduction){
        if(this.enableFriction && numContacts){
            this.frictionEquations.push(this.createFrictionFromAverage(numContacts));
        }
    }

    return numContacts;
};

// .projectConvex is called by other functions, need local tmp vectors
var pcoa_tmp1 = vec2.fromValues(0,0);

/**
 * Project a Convex onto a world-oriented axis
 * @method projectConvexOntoAxis
 * @static
 * @param  {Convex} convexShape
 * @param  {Array} convexOffset
 * @param  {Number} convexAngle
 * @param  {Array} worldAxis
 * @param  {Array} result
 */
Narrowphase.projectConvexOntoAxis = function(convexShape, convexOffset, convexAngle, worldAxis, result){
    var max=null,
        min=null,
        v,
        value,
        localAxis = pcoa_tmp1;

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, worldAxis, -convexAngle);

    // Get projected position of all vertices
    for(var i=0; i<convexShape.vertices.length; i++){
        v = convexShape.vertices[i];
        value = dot(v,localAxis);
        if(max === null || value > max){
            max = value;
        }
        if(min === null || value < min){
            min = value;
        }
    }

    if(min > max){
        var t = min;
        min = max;
        max = t;
    }

    // Project the position of the body onto the axis - need to add this to the result
    var offset = dot(convexOffset, worldAxis);

    vec2.set( result, min + offset, max + offset);
};

// .findSeparatingAxis is called by other functions, need local tmp vectors
var fsa_tmp1 = vec2.fromValues(0,0)
,   fsa_tmp2 = vec2.fromValues(0,0)
,   fsa_tmp3 = vec2.fromValues(0,0)
,   fsa_tmp4 = vec2.fromValues(0,0)
,   fsa_tmp5 = vec2.fromValues(0,0)
,   fsa_tmp6 = vec2.fromValues(0,0);

/**
 * Find a separating axis between the shapes, that maximizes the separating distance between them.
 * @method findSeparatingAxis
 * @static
 * @param  {Convex}     c1
 * @param  {Array}      offset1
 * @param  {Number}     angle1
 * @param  {Convex}     c2
 * @param  {Array}      offset2
 * @param  {Number}     angle2
 * @param  {Array}      sepAxis     The resulting axis
 * @return {Boolean}                Whether the axis could be found.
 */
Narrowphase.findSeparatingAxis = function(c1,offset1,angle1,c2,offset2,angle2,sepAxis){
    var maxDist = null,
        overlap = false,
        found = false,
        edge = fsa_tmp1,
        worldPoint0 = fsa_tmp2,
        worldPoint1 = fsa_tmp3,
        normal = fsa_tmp4,
        span1 = fsa_tmp5,
        span2 = fsa_tmp6;

    if(c1 instanceof Rectangle && c2 instanceof Rectangle){

        for(var j=0; j!==2; j++){
            var c = c1,
                angle = angle1;
            if(j===1){
                c = c2;
                angle = angle2;
            }

            for(var i=0; i!==2; i++){

                // Get the world edge
                if(i === 0){
                    vec2.set(normal, 0, 1);
                } else if(i === 1) {
                    vec2.set(normal, 1, 0);
                }
                if(angle !== 0){
                    vec2.rotate(normal, normal, angle);
                }

                // Project hulls onto that normal
                Narrowphase.projectConvexOntoAxis(c1,offset1,angle1,normal,span1);
                Narrowphase.projectConvexOntoAxis(c2,offset2,angle2,normal,span2);

                // Order by span position
                var a=span1,
                    b=span2,
                    swapped = false;
                if(span1[0] > span2[0]){
                    b=span1;
                    a=span2;
                    swapped = true;
                }

                // Get separating distance
                var dist = b[0] - a[1];
                overlap = (dist <= 0);

                if(maxDist===null || dist > maxDist){
                    vec2.copy(sepAxis, normal);
                    maxDist = dist;
                    found = overlap;
                }
            }
        }

    } else {

        for(var j=0; j!==2; j++){
            var c = c1,
                angle = angle1;
            if(j===1){
                c = c2;
                angle = angle2;
            }

            for(var i=0; i!==c.vertices.length; i++){
                // Get the world edge
                vec2.rotate(worldPoint0, c.vertices[i], angle);
                vec2.rotate(worldPoint1, c.vertices[(i+1)%c.vertices.length], angle);

                sub(edge, worldPoint1, worldPoint0);

                // Get normal - just rotate 90 degrees since vertices are given in CCW
                vec2.rotate90cw(normal, edge);
                vec2.normalize(normal,normal);

                // Project hulls onto that normal
                Narrowphase.projectConvexOntoAxis(c1,offset1,angle1,normal,span1);
                Narrowphase.projectConvexOntoAxis(c2,offset2,angle2,normal,span2);

                // Order by span position
                var a=span1,
                    b=span2,
                    swapped = false;
                if(span1[0] > span2[0]){
                    b=span1;
                    a=span2;
                    swapped = true;
                }

                // Get separating distance
                var dist = b[0] - a[1];
                overlap = (dist <= 0);

                if(maxDist===null || dist > maxDist){
                    vec2.copy(sepAxis, normal);
                    maxDist = dist;
                    found = overlap;
                }
            }
        }
    }


    /*
    // Needs to be tested some more
    for(var j=0; j!==2; j++){
        var c = c1,
            angle = angle1;
        if(j===1){
            c = c2;
            angle = angle2;
        }

        for(var i=0; i!==c.axes.length; i++){

            var normal = c.axes[i];

            // Project hulls onto that normal
            Narrowphase.projectConvexOntoAxis(c1, offset1, angle1, normal, span1);
            Narrowphase.projectConvexOntoAxis(c2, offset2, angle2, normal, span2);

            // Order by span position
            var a=span1,
                b=span2,
                swapped = false;
            if(span1[0] > span2[0]){
                b=span1;
                a=span2;
                swapped = true;
            }

            // Get separating distance
            var dist = b[0] - a[1];
            overlap = (dist <= Narrowphase.convexPrecision);

            if(maxDist===null || dist > maxDist){
                vec2.copy(sepAxis, normal);
                maxDist = dist;
                found = overlap;
            }
        }
    }
    */

    return found;
};

// .getClosestEdge is called by other functions, need local tmp vectors
var gce_tmp1 = vec2.fromValues(0,0)
,   gce_tmp2 = vec2.fromValues(0,0)
,   gce_tmp3 = vec2.fromValues(0,0);

/**
 * Get the edge that has a normal closest to an axis.
 * @method getClosestEdge
 * @static
 * @param  {Convex}     c
 * @param  {Number}     angle
 * @param  {Array}      axis
 * @param  {Boolean}    flip
 * @return {Number}             Index of the edge that is closest. This index and the next spans the resulting edge. Returns -1 if failed.
 */
Narrowphase.getClosestEdge = function(c,angle,axis,flip){
    var localAxis = gce_tmp1,
        edge = gce_tmp2,
        normal = gce_tmp3;

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, axis, -angle);
    if(flip){
        vec2.scale(localAxis,localAxis,-1);
    }

    var closestEdge = -1,
        N = c.vertices.length,
        maxDot = -1;
    for(var i=0; i!==N; i++){
        // Get the edge
        sub(edge, c.vertices[(i+1)%N], c.vertices[i%N]);

        // Get normal - just rotate 90 degrees since vertices are given in CCW
        vec2.rotate90cw(normal, edge);
        vec2.normalize(normal,normal);

        var d = dot(normal,localAxis);
        if(closestEdge === -1 || d > maxDot){
            closestEdge = i % N;
            maxDot = d;
        }
    }

    return closestEdge;
};

var circleHeightfield_candidate = vec2.create(),
    circleHeightfield_dist = vec2.create(),
    circleHeightfield_v0 = vec2.create(),
    circleHeightfield_v1 = vec2.create(),
    circleHeightfield_minCandidate = vec2.create(),
    circleHeightfield_worldNormal = vec2.create(),
    circleHeightfield_minCandidateNormal = vec2.create();

/**
 * @method circleHeightfield
 * @param  {Body}           bi
 * @param  {Circle}         si
 * @param  {Array}          xi
 * @param  {Body}           bj
 * @param  {Heightfield}    sj
 * @param  {Array}          xj
 * @param  {Number}         aj
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.HEIGHTFIELD] =
Narrowphase.prototype.circleHeightfield = function( circleBody,circleShape,circlePos,circleAngle,
                                                    hfBody,hfShape,hfPos,hfAngle, justTest, radius ){
    var data = hfShape.data,
        radius = radius || circleShape.radius,
        w = hfShape.elementWidth,
        dist = circleHeightfield_dist,
        candidate = circleHeightfield_candidate,
        minCandidate = circleHeightfield_minCandidate,
        minCandidateNormal = circleHeightfield_minCandidateNormal,
        worldNormal = circleHeightfield_worldNormal,
        v0 = circleHeightfield_v0,
        v1 = circleHeightfield_v1;

    // Get the index of the points to test against
    var idxA = Math.floor( (circlePos[0] - radius - hfPos[0]) / w ),
        idxB = Math.ceil(  (circlePos[0] + radius - hfPos[0]) / w );

    /*if(idxB < 0 || idxA >= data.length)
        return justTest ? false : 0;*/

    if(idxA < 0){
        idxA = 0;
    }
    if(idxB >= data.length){
        idxB = data.length-1;
    }

    // Get max and min
    var max = data[idxA],
        min = data[idxB];
    for(var i=idxA; i<idxB; i++){
        if(data[i] < min){
            min = data[i];
        }
        if(data[i] > max){
            max = data[i];
        }
    }

    if(circlePos[1]-radius > max){
        return justTest ? false : 0;
    }

    /*
    if(circlePos[1]+radius < min){
        // Below the minimum point... We can just guess.
        // TODO
    }
    */

    // 1. Check so center of circle is not inside the field. If it is, this wont work...
    // 2. For each edge
    // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
    // 2. 2. Check if point is inside.

    var found = false;

    // Check all edges first
    for(var i=idxA; i<idxB; i++){

        // Get points
        vec2.set(v0,     i*w, data[i]  );
        vec2.set(v1, (i+1)*w, data[i+1]);
        vec2.add(v0,v0,hfPos);
        vec2.add(v1,v1,hfPos);

        // Get normal
        vec2.sub(worldNormal, v1, v0);
        vec2.rotate(worldNormal, worldNormal, Math.PI/2);
        vec2.normalize(worldNormal,worldNormal);

        // Get point on circle, closest to the edge
        vec2.scale(candidate,worldNormal,-radius);
        vec2.add(candidate,candidate,circlePos);

        // Distance from v0 to the candidate point
        vec2.sub(dist,candidate,v0);

        // Check if it is in the element "stick"
        var d = vec2.dot(dist,worldNormal);
        if(candidate[0] >= v0[0] && candidate[0] < v1[0] && d <= 0){

            if(justTest){
                return true;
            }

            found = true;

            // Store the candidate point, projected to the edge
            vec2.scale(dist,worldNormal,-d);
            vec2.add(minCandidate,candidate,dist);
            vec2.copy(minCandidateNormal,worldNormal);

            var c = this.createContactEquation(hfBody,circleBody,hfShape,circleShape);

            // Normal is out of the heightfield
            vec2.copy(c.normalA, minCandidateNormal);

            // Vector from circle to heightfield
            vec2.scale(c.contactPointB,  c.normalA, -radius);
            add(c.contactPointB, c.contactPointB, circlePos);
            sub(c.contactPointB, c.contactPointB, circleBody.position);

            vec2.copy(c.contactPointA, minCandidate);
            vec2.sub(c.contactPointA, c.contactPointA, hfBody.position);

            this.contactEquations.push(c);

            if(this.enableFriction){
                this.frictionEquations.push( this.createFrictionFromContact(c) );
            }
        }
    }

    // Check all vertices
    found = false;
    if(radius > 0){
        for(var i=idxA; i<=idxB; i++){

            // Get point
            vec2.set(v0, i*w, data[i]);
            vec2.add(v0,v0,hfPos);

            vec2.sub(dist, circlePos, v0);

            if(vec2.squaredLength(dist) < Math.pow(radius, 2)){

                if(justTest){
                    return true;
                }

                found = true;

                var c = this.createContactEquation(hfBody,circleBody,hfShape,circleShape);

                // Construct normal - out of heightfield
                vec2.copy(c.normalA, dist);
                vec2.normalize(c.normalA,c.normalA);

                vec2.scale(c.contactPointB, c.normalA, -radius);
                add(c.contactPointB, c.contactPointB, circlePos);
                sub(c.contactPointB, c.contactPointB, circleBody.position);

                sub(c.contactPointA, v0, hfPos);
                add(c.contactPointA, c.contactPointA, hfPos);
                sub(c.contactPointA, c.contactPointA, hfBody.position);

                this.contactEquations.push(c);

                if(this.enableFriction){
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }
            }
        }
    }

    if(found){
        return 1;
    }

    return 0;

};

var convexHeightfield_v0 = vec2.create(),
    convexHeightfield_v1 = vec2.create(),
    convexHeightfield_tilePos = vec2.create(),
    convexHeightfield_tempConvexShape = new Convex([vec2.create(),vec2.create(),vec2.create(),vec2.create()]);
/**
 * @method circleHeightfield
 * @param  {Body}           bi
 * @param  {Circle}         si
 * @param  {Array}          xi
 * @param  {Body}           bj
 * @param  {Heightfield}    sj
 * @param  {Array}          xj
 * @param  {Number}         aj
 */
Narrowphase.prototype[Shape.RECTANGLE | Shape.HEIGHTFIELD] =
Narrowphase.prototype[Shape.CONVEX | Shape.HEIGHTFIELD] =
Narrowphase.prototype.convexHeightfield = function( convexBody,convexShape,convexPos,convexAngle,
                                                    hfBody,hfShape,hfPos,hfAngle, justTest ){
    var data = hfShape.data,
        w = hfShape.elementWidth,
        v0 = convexHeightfield_v0,
        v1 = convexHeightfield_v1,
        tilePos = convexHeightfield_tilePos,
        tileConvex = convexHeightfield_tempConvexShape;

    // Get the index of the points to test against
    var idxA = Math.floor( (convexBody.aabb.lowerBound[0] - hfPos[0]) / w ),
        idxB = Math.ceil(  (convexBody.aabb.upperBound[0] - hfPos[0]) / w );

    if(idxA < 0){
        idxA = 0;
    }
    if(idxB >= data.length){
        idxB = data.length-1;
    }

    // Get max and min
    var max = data[idxA],
        min = data[idxB];
    for(var i=idxA; i<idxB; i++){
        if(data[i] < min){
            min = data[i];
        }
        if(data[i] > max){
            max = data[i];
        }
    }

    if(convexBody.aabb.lowerBound[1] > max){
        return justTest ? false : 0;
    }

    var found = false;
    var numContacts = 0;

    // Loop over all edges
    // TODO: If possible, construct a convex from several data points (need o check if the points make a convex shape)
    for(var i=idxA; i<idxB; i++){

        // Get points
        vec2.set(v0,     i*w, data[i]  );
        vec2.set(v1, (i+1)*w, data[i+1]);
        vec2.add(v0,v0,hfPos);
        vec2.add(v1,v1,hfPos);

        // Construct a convex
        var tileHeight = 100; // todo
        vec2.set(tilePos, (v1[0] + v0[0])*0.5, (v1[1] + v0[1] - tileHeight)*0.5);

        vec2.sub(tileConvex.vertices[0], v1, tilePos);
        vec2.sub(tileConvex.vertices[1], v0, tilePos);
        vec2.copy(tileConvex.vertices[2], tileConvex.vertices[1]);
        vec2.copy(tileConvex.vertices[3], tileConvex.vertices[0]);
        tileConvex.vertices[2][1] -= tileHeight;
        tileConvex.vertices[3][1] -= tileHeight;

        // Do convex collision
        numContacts += this.convexConvex(   convexBody, convexShape, convexPos, convexAngle,
                                            hfBody, tileConvex, tilePos, 0, justTest);
    }

    return numContacts;
};

},
function(require, exports, module, global) {

var Utils = require(192);

module.exports = TupleDictionary;

/**
 * @class TupleDictionary
 * @constructor
 */
function TupleDictionary() {

    /**
     * The data storage
     * @property data
     * @type {Object}
     */
    this.data = {};

    /**
     * Keys that are currently used.
     * @property {Array} keys
     */
    this.keys = [];
}

/**
 * Generate a key given two integers
 * @method getKey
 * @param  {number} i
 * @param  {number} j
 * @return {string}
 */
TupleDictionary.prototype.getKey = function(id1, id2) {
    id1 = id1|0;
    id2 = id2|0;

    if ( (id1|0) === (id2|0) ){
        return -1;
    }

    // valid for values < 2^16
    return ((id1|0) > (id2|0) ?
        (id1 << 16) | (id2 & 0xFFFF) :
        (id2 << 16) | (id1 & 0xFFFF))|0
        ;
};

/**
 * @method getByKey
 * @param  {Number} key
 * @return {Object}
 */
TupleDictionary.prototype.getByKey = function(key) {
    key = key|0;
    return this.data[key];
};

/**
 * @method get
 * @param  {Number} i
 * @param  {Number} j
 * @return {Number}
 */
TupleDictionary.prototype.get = function(i, j) {
    return this.data[this.getKey(i, j)];
};

/**
 * Set a value.
 * @method set
 * @param  {Number} i
 * @param  {Number} j
 * @param {Number} value
 */
TupleDictionary.prototype.set = function(i, j, value) {
    if(!value){
        throw new Error("No data!");
    }

    var key = this.getKey(i, j);

    // Check if key already exists
    if(!this.data[key]){
        this.keys.push(key);
    }

    this.data[key] = value;

    return key;
};

/**
 * Remove all data.
 * @method reset
 */
TupleDictionary.prototype.reset = function() {
    var data = this.data,
        keys = this.keys;

    var l = keys.length;
    while(l--) {
        delete data[keys[l]];
    }

    keys.length = 0;
};

/**
 * Copy another TupleDictionary. Note that all data in this dictionary will be removed.
 * @method copy
 * @param {TupleDictionary} dict The TupleDictionary to copy into this one.
 */
TupleDictionary.prototype.copy = function(dict) {
    this.reset();
    Utils.appendArray(this.keys, dict.keys);
    var l = dict.keys.length;
    while(l--){
        var key = dict.keys[l];
        this.data[key] = dict.data[key];
    }
};


},
function(require, exports, module, global) {

var vec2 = require(191)
,   Shape = require(202)
,   Convex = require(201);

module.exports = Rectangle;

/**
 * Rectangle shape class.
 * @class Rectangle
 * @constructor
 * @param {Number} [width=1] Width
 * @param {Number} [height=1] Height
 * @extends Convex
 */
function Rectangle(width, height){

    /**
     * Total width of the rectangle
     * @property width
     * @type {Number}
     */
    this.width = width || 1;

    /**
     * Total height of the rectangle
     * @property height
     * @type {Number}
     */
    this.height = height || 1;

    var verts = [   vec2.fromValues(-width/2, -height/2),
                    vec2.fromValues( width/2, -height/2),
                    vec2.fromValues( width/2,  height/2),
                    vec2.fromValues(-width/2,  height/2)];
    var axes = [vec2.fromValues(1, 0), vec2.fromValues(0, 1)];

    Convex.call(this, verts, axes);

    this.type = Shape.RECTANGLE;
}
Rectangle.prototype = new Convex([]);
Rectangle.prototype.constructor = Rectangle;

/**
 * Compute moment of inertia
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 */
Rectangle.prototype.computeMomentOfInertia = function(mass){
    var w = this.width,
        h = this.height;
    return mass * (h*h + w*w) / 12;
};

/**
 * Update the bounding radius
 * @method updateBoundingRadius
 */
Rectangle.prototype.updateBoundingRadius = function(){
    var w = this.width,
        h = this.height;
    this.boundingRadius = Math.sqrt(w*w + h*h) / 2;
};

var corner1 = vec2.create(),
    corner2 = vec2.create(),
    corner3 = vec2.create(),
    corner4 = vec2.create();

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Rectangle.prototype.computeAABB = function(out, position, angle){
    out.setFromPoints(this.vertices,position,angle,0);
};

Rectangle.prototype.updateArea = function(){
    this.area = this.width * this.height;
};



},
function(require, exports, module, global) {

var Circle = require(207),
    Plane = require(216),
    Shape = require(202),
    Particle = require(217),
    Broadphase = require(205),
    vec2 = require(191);

module.exports = NaiveBroadphase;

/**
 * Naive broadphase implementation. Does N^2 tests.
 *
 * @class NaiveBroadphase
 * @constructor
 * @extends Broadphase
 */
function NaiveBroadphase(){
    Broadphase.call(this, Broadphase.NAIVE);
}
NaiveBroadphase.prototype = new Broadphase();
NaiveBroadphase.prototype.constructor = NaiveBroadphase;

/**
 * Get the colliding pairs
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
NaiveBroadphase.prototype.getCollisionPairs = function(world){
    var bodies = world.bodies,
        result = this.result;

    result.length = 0;

    for(var i=0, Ncolliding=bodies.length; i!==Ncolliding; i++){
        var bi = bodies[i];

        for(var j=0; j<i; j++){
            var bj = bodies[j];

            if(Broadphase.canCollide(bi,bj) && this.boundingVolumeCheck(bi,bj)){
                result.push(bi,bj);
            }
        }
    }

    return result;
};

/**
 * Returns all the bodies within an AABB.
 * @method aabbQuery
 * @param  {World} world
 * @param  {AABB} aabb
 * @param {array} result An array to store resulting bodies in.
 * @return {array}
 */
NaiveBroadphase.prototype.aabbQuery = function(world, aabb, result){
    result = result || [];

    var bodies = world.bodies;
    for(var i = 0; i < bodies.length; i++){
        var b = bodies[i];

        if(b.aabbNeedsUpdate){
            b.updateAABB();
        }

        if(b.aabb.overlaps(aabb)){
            result.push(b);
        }
    }

    return result;
};

},
function(require, exports, module, global) {

var Constraint = require(208)
,   Equation = require(194)
,   RotationalVelocityEquation = require(228)
,   RotationalLockEquation = require(229)
,   vec2 = require(191);

module.exports = RevoluteConstraint;

var worldPivotA = vec2.create(),
    worldPivotB = vec2.create(),
    xAxis = vec2.fromValues(1,0),
    yAxis = vec2.fromValues(0,1),
    g = vec2.create();

/**
 * Connects two bodies at given offset points, letting them rotate relative to each other around this point.
 * @class RevoluteConstraint
 * @constructor
 * @author schteppe
 * @param {Body}    bodyA
 * @param {Body}    bodyB
 * @param {Object}  [options]
 * @param {Array}   [options.worldPivot] A pivot point given in world coordinates. If specified, localPivotA and localPivotB are automatically computed from this value.
 * @param {Array}   [options.localPivotA] The point relative to the center of mass of bodyA which bodyA is constrained to.
 * @param {Array}   [options.localPivotB] See localPivotA.
 * @param {Number}  [options.maxForce] The maximum force that should be applied to constrain the bodies.
 * @extends Constraint
 *
 * @example
 *     // This will create a revolute constraint between two bodies with pivot point in between them.
 *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
 *     var bodyB = new Body({ mass: 1, position: [1, 0] });
 *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         worldPivot: [0, 0]
 *     });
 *     world.addConstraint(constraint);
 *
 *     // Using body-local pivot points, the constraint could have been constructed like this:
 *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         localPivotA: [1, 0],
 *         localPivotB: [-1, 0]
 *     });
 */
function RevoluteConstraint(bodyA, bodyB, options){
    options = options || {};
    Constraint.call(this,bodyA,bodyB,Constraint.REVOLUTE,options);

    var maxForce = this.maxForce = typeof(options.maxForce) !== "undefined" ? options.maxForce : Number.MAX_VALUE;

    /**
     * @property {Array} pivotA
     */
    this.pivotA = vec2.create();

    /**
     * @property {Array} pivotB
     */
    this.pivotB = vec2.create();

    if(options.worldPivot){
        // Compute pivotA and pivotB
        vec2.sub(this.pivotA, options.worldPivot, bodyA.position);
        vec2.sub(this.pivotB, options.worldPivot, bodyB.position);
        // Rotate to local coordinate system
        vec2.rotate(this.pivotA, this.pivotA, -bodyA.angle);
        vec2.rotate(this.pivotB, this.pivotB, -bodyB.angle);
    } else {
        // Get pivotA and pivotB
        vec2.copy(this.pivotA, options.localPivotA);
        vec2.copy(this.pivotB, options.localPivotB);
    }

    // Equations to be fed to the solver
    var eqs = this.equations = [
        new Equation(bodyA,bodyB,-maxForce,maxForce),
        new Equation(bodyA,bodyB,-maxForce,maxForce),
    ];

    var x = eqs[0];
    var y = eqs[1];
    var that = this;

    x.computeGq = function(){
        vec2.rotate(worldPivotA, that.pivotA, bodyA.angle);
        vec2.rotate(worldPivotB, that.pivotB, bodyB.angle);
        vec2.add(g, bodyB.position, worldPivotB);
        vec2.sub(g, g, bodyA.position);
        vec2.sub(g, g, worldPivotA);
        return vec2.dot(g,xAxis);
    };

    y.computeGq = function(){
        vec2.rotate(worldPivotA, that.pivotA, bodyA.angle);
        vec2.rotate(worldPivotB, that.pivotB, bodyB.angle);
        vec2.add(g, bodyB.position, worldPivotB);
        vec2.sub(g, g, bodyA.position);
        vec2.sub(g, g, worldPivotA);
        return vec2.dot(g,yAxis);
    };

    y.minForce = x.minForce = -maxForce;
    y.maxForce = x.maxForce =  maxForce;

    this.motorEquation = new RotationalVelocityEquation(bodyA,bodyB);

    /**
     * Indicates whether the motor is enabled. Use .enableMotor() to enable the constraint motor.
     * @property {Boolean} motorEnabled
     * @readOnly
     */
    this.motorEnabled = false;

    /**
     * The constraint position.
     * @property angle
     * @type {Number}
     * @readOnly
     */
    this.angle = 0;

    /**
     * Set to true to enable lower limit
     * @property lowerLimitEnabled
     * @type {Boolean}
     */
    this.lowerLimitEnabled = false;

    /**
     * Set to true to enable upper limit
     * @property upperLimitEnabled
     * @type {Boolean}
     */
    this.upperLimitEnabled = false;

    /**
     * The lower limit on the constraint angle.
     * @property lowerLimit
     * @type {Boolean}
     */
    this.lowerLimit = 0;

    /**
     * The upper limit on the constraint angle.
     * @property upperLimit
     * @type {Boolean}
     */
    this.upperLimit = 0;

    this.upperLimitEquation = new RotationalLockEquation(bodyA,bodyB);
    this.lowerLimitEquation = new RotationalLockEquation(bodyA,bodyB);
    this.upperLimitEquation.minForce = 0;
    this.lowerLimitEquation.maxForce = 0;
}
RevoluteConstraint.prototype = new Constraint();
RevoluteConstraint.prototype.constructor = RevoluteConstraint;

/**
 * Set the constraint angle limits.
 * @method setLimits
 * @param {number} lower Lower angle limit.
 * @param {number} upper Upper angle limit.
 */
RevoluteConstraint.prototype.setLimits = function (lower, upper) {
    if(typeof(lower) === 'number'){
        this.lowerLimit = lower;
        this.lowerLimitEnabled = true;
    } else {
        this.lowerLimit = lower;
        this.lowerLimitEnabled = false;
    }

    if(typeof(upper) === 'number'){
        this.upperLimit = upper;
        this.upperLimitEnabled = true;
    } else {
        this.upperLimit = upper;
        this.upperLimitEnabled = false;
    }
};

RevoluteConstraint.prototype.update = function(){
    var bodyA =  this.bodyA,
        bodyB =  this.bodyB,
        pivotA = this.pivotA,
        pivotB = this.pivotB,
        eqs =    this.equations,
        normal = eqs[0],
        tangent= eqs[1],
        x = eqs[0],
        y = eqs[1],
        upperLimit = this.upperLimit,
        lowerLimit = this.lowerLimit,
        upperLimitEquation = this.upperLimitEquation,
        lowerLimitEquation = this.lowerLimitEquation;

    var relAngle = this.angle = bodyB.angle - bodyA.angle;

    if(this.upperLimitEnabled && relAngle > upperLimit){
        upperLimitEquation.angle = upperLimit;
        if(eqs.indexOf(upperLimitEquation) === -1){
            eqs.push(upperLimitEquation);
        }
    } else {
        var idx = eqs.indexOf(upperLimitEquation);
        if(idx !== -1){
            eqs.splice(idx,1);
        }
    }

    if(this.lowerLimitEnabled && relAngle < lowerLimit){
        lowerLimitEquation.angle = lowerLimit;
        if(eqs.indexOf(lowerLimitEquation) === -1){
            eqs.push(lowerLimitEquation);
        }
    } else {
        var idx = eqs.indexOf(lowerLimitEquation);
        if(idx !== -1){
            eqs.splice(idx,1);
        }
    }

    /*

    The constraint violation is

        g = xj + rj - xi - ri

    ...where xi and xj are the body positions and ri and rj world-oriented offset vectors. Differentiate:

        gdot = vj + wj x rj - vi - wi x ri

    We split this into x and y directions. (let x and y be unit vectors along the respective axes)

        gdot * x = ( vj + wj x rj - vi - wi x ri ) * x
                 = ( vj*x + (wj x rj)*x -vi*x -(wi x ri)*x
                 = ( vj*x + (rj x x)*wj -vi*x -(ri x x)*wi
                 = [ -x   -(ri x x)   x   (rj x x)] * [vi wi vj wj]
                 = G*W

    ...and similar for y. We have then identified the jacobian entries for x and y directions:

        Gx = [ x   (rj x x)   -x   -(ri x x)]
        Gy = [ y   (rj x y)   -y   -(ri x y)]

     */

    vec2.rotate(worldPivotA, pivotA, bodyA.angle);
    vec2.rotate(worldPivotB, pivotB, bodyB.angle);

    // todo: these are a bit sparse. We could save some computations on making custom eq.computeGW functions, etc

    x.G[0] = -1;
    x.G[1] =  0;
    x.G[2] = -vec2.crossLength(worldPivotA,xAxis);
    x.G[3] =  1;
    x.G[4] =  0;
    x.G[5] =  vec2.crossLength(worldPivotB,xAxis);

    y.G[0] =  0;
    y.G[1] = -1;
    y.G[2] = -vec2.crossLength(worldPivotA,yAxis);
    y.G[3] =  0;
    y.G[4] =  1;
    y.G[5] =  vec2.crossLength(worldPivotB,yAxis);
};

/**
 * Enable the rotational motor
 * @method enableMotor
 */
RevoluteConstraint.prototype.enableMotor = function(){
    if(this.motorEnabled){
        return;
    }
    this.equations.push(this.motorEquation);
    this.motorEnabled = true;
};

/**
 * Disable the rotational motor
 * @method disableMotor
 */
RevoluteConstraint.prototype.disableMotor = function(){
    if(!this.motorEnabled){
        return;
    }
    var i = this.equations.indexOf(this.motorEquation);
    this.equations.splice(i,1);
    this.motorEnabled = false;
};

/**
 * Check if the motor is enabled.
 * @method motorIsEnabled
 * @deprecated use property motorEnabled instead.
 * @return {Boolean}
 */
RevoluteConstraint.prototype.motorIsEnabled = function(){
    return !!this.motorEnabled;
};

/**
 * Set the speed of the rotational constraint motor
 * @method setMotorSpeed
 * @param  {Number} speed
 */
RevoluteConstraint.prototype.setMotorSpeed = function(speed){
    if(!this.motorEnabled){
        return;
    }
    var i = this.equations.indexOf(this.motorEquation);
    this.equations[i].relativeVelocity = speed;
};

/**
 * Get the speed of the rotational constraint motor
 * @method getMotorSpeed
 * @return {Number} The current speed, or false if the motor is not enabled.
 */
RevoluteConstraint.prototype.getMotorSpeed = function(){
    if(!this.motorEnabled){
        return false;
    }
    return this.motorEquation.relativeVelocity;
};


},
function(require, exports, module, global) {

var Equation = require(194),
    vec2 = require(191);

module.exports = RotationalVelocityEquation;

/**
 * Syncs rotational velocity of two bodies, or sets a relative velocity (motor).
 *
 * @class RotationalVelocityEquation
 * @constructor
 * @extends Equation
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
function RotationalVelocityEquation(bodyA, bodyB){
    Equation.call(this, bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE);
    this.relativeVelocity = 1;
    this.ratio = 1;
}
RotationalVelocityEquation.prototype = new Equation();
RotationalVelocityEquation.prototype.constructor = RotationalVelocityEquation;
RotationalVelocityEquation.prototype.computeB = function(a,b,h){
    var G = this.G;
    G[2] = -1;
    G[5] = this.ratio;

    var GiMf = this.computeGiMf();
    var GW = this.computeGW();
    var B = - GW * b - h*GiMf;

    return B;
};


},
function(require, exports, module, global) {

var Equation = require(194),
    vec2 = require(191);

module.exports = RotationalLockEquation;

/**
 * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
 *
 * @class RotationalLockEquation
 * @constructor
 * @extends Equation
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {Number} [options.angle] Angle to add to the local vector in bodyA.
 */
function RotationalLockEquation(bodyA, bodyB, options){
    options = options || {};
    Equation.call(this, bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE);

    /**
     * @property {number} angle
     */
    this.angle = options.angle || 0;

    var G = this.G;
    G[2] =  1;
    G[5] = -1;
}
RotationalLockEquation.prototype = new Equation();
RotationalLockEquation.prototype.constructor = RotationalLockEquation;

var worldVectorA = vec2.create(),
    worldVectorB = vec2.create(),
    xAxis = vec2.fromValues(1,0),
    yAxis = vec2.fromValues(0,1);
RotationalLockEquation.prototype.computeGq = function(){
    vec2.rotate(worldVectorA,xAxis,this.bodyA.angle+this.angle);
    vec2.rotate(worldVectorB,yAxis,this.bodyB.angle);
    return vec2.dot(worldVectorA,worldVectorB);
};


},
function(require, exports, module, global) {

var Constraint = require(208)
,   ContactEquation = require(209)
,   Equation = require(194)
,   vec2 = require(191)
,   RotationalLockEquation = require(229);

module.exports = PrismaticConstraint;

/**
 * Constraint that only allows bodies to move along a line, relative to each other. See <a href="http://www.iforce2d.net/b2dtut/joints-prismatic">this tutorial</a>.
 *
 * @class PrismaticConstraint
 * @constructor
 * @extends Constraint
 * @author schteppe
 * @param {Body}    bodyA
 * @param {Body}    bodyB
 * @param {Object}  [options]
 * @param {Number}  [options.maxForce]                Max force to be applied by the constraint
 * @param {Array}   [options.localAnchorA]            Body A's anchor point, defined in its own local frame.
 * @param {Array}   [options.localAnchorB]            Body B's anchor point, defined in its own local frame.
 * @param {Array}   [options.localAxisA]              An axis, defined in body A frame, that body B's anchor point may slide along.
 * @param {Boolean} [options.disableRotationalLock]   If set to true, bodyB will be free to rotate around its anchor point.
 * @param {Number}  [options.upperLimit]
 * @param {Number}  [options.lowerLimit]
 * @todo Ability to create using only a point and a worldAxis
 */
function PrismaticConstraint(bodyA, bodyB, options){
    options = options || {};
    Constraint.call(this,bodyA,bodyB,Constraint.PRISMATIC,options);

    // Get anchors
    var localAnchorA = vec2.fromValues(0,0),
        localAxisA = vec2.fromValues(1,0),
        localAnchorB = vec2.fromValues(0,0);
    if(options.localAnchorA){ vec2.copy(localAnchorA, options.localAnchorA); }
    if(options.localAxisA){ vec2.copy(localAxisA,   options.localAxisA); }
    if(options.localAnchorB){ vec2.copy(localAnchorB, options.localAnchorB); }

    /**
     * @property localAnchorA
     * @type {Array}
     */
    this.localAnchorA = localAnchorA;

    /**
     * @property localAnchorB
     * @type {Array}
     */
    this.localAnchorB = localAnchorB;

    /**
     * @property localAxisA
     * @type {Array}
     */
    this.localAxisA = localAxisA;

    /*

    The constraint violation for the common axis point is

        g = ( xj + rj - xi - ri ) * t   :=  gg*t

    where r are body-local anchor points, and t is a tangent to the constraint axis defined in body i frame.

        gdot =  ( vj + wj x rj - vi - wi x ri ) * t + ( xj + rj - xi - ri ) * ( wi x t )

    Note the use of the chain rule. Now we identify the jacobian

        G*W = [ -t      -ri x t + t x gg     t    rj x t ] * [vi wi vj wj]

    The rotational part is just a rotation lock.

     */

    var maxForce = this.maxForce = typeof(options.maxForce)!=="undefined" ? options.maxForce : Number.MAX_VALUE;

    // Translational part
    var trans = new Equation(bodyA,bodyB,-maxForce,maxForce);
    var ri = new vec2.create(),
        rj = new vec2.create(),
        gg = new vec2.create(),
        t =  new vec2.create();
    trans.computeGq = function(){
        // g = ( xj + rj - xi - ri ) * t
        return vec2.dot(gg,t);
    };
    trans.updateJacobian = function(){
        var G = this.G,
            xi = bodyA.position,
            xj = bodyB.position;
        vec2.rotate(ri,localAnchorA,bodyA.angle);
        vec2.rotate(rj,localAnchorB,bodyB.angle);
        vec2.add(gg,xj,rj);
        vec2.sub(gg,gg,xi);
        vec2.sub(gg,gg,ri);
        vec2.rotate(t,localAxisA,bodyA.angle+Math.PI/2);

        G[0] = -t[0];
        G[1] = -t[1];
        G[2] = -vec2.crossLength(ri,t) + vec2.crossLength(t,gg);
        G[3] = t[0];
        G[4] = t[1];
        G[5] = vec2.crossLength(rj,t);
    };
    this.equations.push(trans);

    // Rotational part
    if(!options.disableRotationalLock){
        var rot = new RotationalLockEquation(bodyA,bodyB,-maxForce,maxForce);
        this.equations.push(rot);
    }

    /**
     * The position of anchor A relative to anchor B, along the constraint axis.
     * @property position
     * @type {Number}
     */
    this.position = 0;

    // Is this one used at all?
    this.velocity = 0;

    /**
     * Set to true to enable lower limit.
     * @property lowerLimitEnabled
     * @type {Boolean}
     */
    this.lowerLimitEnabled = typeof(options.lowerLimit)!=="undefined" ? true : false;

    /**
     * Set to true to enable upper limit.
     * @property upperLimitEnabled
     * @type {Boolean}
     */
    this.upperLimitEnabled = typeof(options.upperLimit)!=="undefined" ? true : false;

    /**
     * Lower constraint limit. The constraint position is forced to be larger than this value.
     * @property lowerLimit
     * @type {Number}
     */
    this.lowerLimit = typeof(options.lowerLimit)!=="undefined" ? options.lowerLimit : 0;

    /**
     * Upper constraint limit. The constraint position is forced to be smaller than this value.
     * @property upperLimit
     * @type {Number}
     */
    this.upperLimit = typeof(options.upperLimit)!=="undefined" ? options.upperLimit : 1;

    // Equations used for limits
    this.upperLimitEquation = new ContactEquation(bodyA,bodyB);
    this.lowerLimitEquation = new ContactEquation(bodyA,bodyB);

    // Set max/min forces
    this.upperLimitEquation.minForce = this.lowerLimitEquation.minForce = 0;
    this.upperLimitEquation.maxForce = this.lowerLimitEquation.maxForce = maxForce;

    /**
     * Equation used for the motor.
     * @property motorEquation
     * @type {Equation}
     */
    this.motorEquation = new Equation(bodyA,bodyB);

    /**
     * The current motor state. Enable or disable the motor using .enableMotor
     * @property motorEnabled
     * @type {Boolean}
     */
    this.motorEnabled = false;

    /**
     * Set the target speed for the motor.
     * @property motorSpeed
     * @type {Number}
     */
    this.motorSpeed = 0;

    var that = this;
    var motorEquation = this.motorEquation;
    var old = motorEquation.computeGW;
    motorEquation.computeGq = function(){ return 0; };
    motorEquation.computeGW = function(){
        var G = this.G,
            bi = this.bodyA,
            bj = this.bodyB,
            vi = bi.velocity,
            vj = bj.velocity,
            wi = bi.angularVelocity,
            wj = bj.angularVelocity;
        return this.gmult(G,vi,wi,vj,wj) + that.motorSpeed;
    };
}

PrismaticConstraint.prototype = new Constraint();
PrismaticConstraint.prototype.constructor = PrismaticConstraint;

var worldAxisA = vec2.create(),
    worldAnchorA = vec2.create(),
    worldAnchorB = vec2.create(),
    orientedAnchorA = vec2.create(),
    orientedAnchorB = vec2.create(),
    tmp = vec2.create();

/**
 * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
 * @method update
 */
PrismaticConstraint.prototype.update = function(){
    var eqs = this.equations,
        trans = eqs[0],
        upperLimit = this.upperLimit,
        lowerLimit = this.lowerLimit,
        upperLimitEquation = this.upperLimitEquation,
        lowerLimitEquation = this.lowerLimitEquation,
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        localAxisA = this.localAxisA,
        localAnchorA = this.localAnchorA,
        localAnchorB = this.localAnchorB;

    trans.updateJacobian();

    // Transform local things to world
    vec2.rotate(worldAxisA,      localAxisA,      bodyA.angle);
    vec2.rotate(orientedAnchorA, localAnchorA,    bodyA.angle);
    vec2.add(worldAnchorA,       orientedAnchorA, bodyA.position);
    vec2.rotate(orientedAnchorB, localAnchorB,    bodyB.angle);
    vec2.add(worldAnchorB,       orientedAnchorB, bodyB.position);

    var relPosition = this.position = vec2.dot(worldAnchorB,worldAxisA) - vec2.dot(worldAnchorA,worldAxisA);

    // Motor
    if(this.motorEnabled){
        // G = [ a     a x ri   -a   -a x rj ]
        var G = this.motorEquation.G;
        G[0] = worldAxisA[0];
        G[1] = worldAxisA[1];
        G[2] = vec2.crossLength(worldAxisA,orientedAnchorB);
        G[3] = -worldAxisA[0];
        G[4] = -worldAxisA[1];
        G[5] = -vec2.crossLength(worldAxisA,orientedAnchorA);
    }

    /*
        Limits strategy:
        Add contact equation, with normal along the constraint axis.
        min/maxForce is set so the constraint is repulsive in the correct direction.
        Some offset is added to either equation.contactPointA or .contactPointB to get the correct upper/lower limit.

                 ^
                 |
      upperLimit x
                 |    ------
         anchorB x<---|  B |
                 |    |    |
        ------   |    ------
        |    |   |
        |  A |-->x anchorA
        ------   |
                 x lowerLimit
                 |
                axis
     */


    if(this.upperLimitEnabled && relPosition > upperLimit){
        // Update contact constraint normal, etc
        vec2.scale(upperLimitEquation.normalA, worldAxisA, -1);
        vec2.sub(upperLimitEquation.contactPointA, worldAnchorA, bodyA.position);
        vec2.sub(upperLimitEquation.contactPointB, worldAnchorB, bodyB.position);
        vec2.scale(tmp,worldAxisA,upperLimit);
        vec2.add(upperLimitEquation.contactPointA,upperLimitEquation.contactPointA,tmp);
        if(eqs.indexOf(upperLimitEquation) === -1){
            eqs.push(upperLimitEquation);
        }
    } else {
        var idx = eqs.indexOf(upperLimitEquation);
        if(idx !== -1){
            eqs.splice(idx,1);
        }
    }

    if(this.lowerLimitEnabled && relPosition < lowerLimit){
        // Update contact constraint normal, etc
        vec2.scale(lowerLimitEquation.normalA, worldAxisA, 1);
        vec2.sub(lowerLimitEquation.contactPointA, worldAnchorA, bodyA.position);
        vec2.sub(lowerLimitEquation.contactPointB, worldAnchorB, bodyB.position);
        vec2.scale(tmp,worldAxisA,lowerLimit);
        vec2.sub(lowerLimitEquation.contactPointB,lowerLimitEquation.contactPointB,tmp);
        if(eqs.indexOf(lowerLimitEquation) === -1){
            eqs.push(lowerLimitEquation);
        }
    } else {
        var idx = eqs.indexOf(lowerLimitEquation);
        if(idx !== -1){
            eqs.splice(idx,1);
        }
    }
};

/**
 * Enable the motor
 * @method enableMotor
 */
PrismaticConstraint.prototype.enableMotor = function(){
    if(this.motorEnabled){
        return;
    }
    this.equations.push(this.motorEquation);
    this.motorEnabled = true;
};

/**
 * Disable the rotational motor
 * @method disableMotor
 */
PrismaticConstraint.prototype.disableMotor = function(){
    if(!this.motorEnabled){
        return;
    }
    var i = this.equations.indexOf(this.motorEquation);
    this.equations.splice(i,1);
    this.motorEnabled = false;
};

/**
 * Set the constraint limits.
 * @method setLimits
 * @param {number} lower Lower limit.
 * @param {number} upper Upper limit.
 */
PrismaticConstraint.prototype.setLimits = function (lower, upper) {
    if(typeof(lower) === 'number'){
        this.lowerLimit = lower;
        this.lowerLimitEnabled = true;
    } else {
        this.lowerLimit = lower;
        this.lowerLimitEnabled = false;
    }

    if(typeof(upper) === 'number'){
        this.upperLimit = upper;
        this.upperLimitEnabled = true;
    } else {
        this.upperLimit = upper;
        this.upperLimitEnabled = false;
    }
};



},
function(require, exports, module, global) {

module.exports = Ray;

var vec2 = require(191);
var RaycastResult = require(232);
var Shape = require(202);
var AABB = require(190);

/**
 * A line with a start and end point that is used to intersect shapes.
 * @class Ray
 * @constructor
 */
function Ray(options){
    options = options || {};

    /**
     * @property {array} from
     */
    this.from = options.from ? vec2.fromValues(options.from[0], options.from[1]) : vec2.create();

    /**
     * @property {array} to
     */
    this.to = options.to ? vec2.fromValues(options.to[0], options.to[1]) : vec2.create();

    /**
     * @private
     * @property {array} _direction
     */
    this._direction = vec2.create();

    /**
     * The precision of the ray. Used when checking parallelity etc.
     * @property {Number} precision
     */
    this.precision = 0.0001;

    /**
     * Set to true if you want the Ray to take .collisionResponse flags into account on bodies and shapes.
     * @property {Boolean} checkCollisionResponse
     */
    this.checkCollisionResponse = true;

    /**
     * If set to true, the ray skips any hits with normal.dot(rayDirection) < 0.
     * @property {Boolean} skipBackfaces
     */
    this.skipBackfaces = false;

    /**
     * @property {number} collisionMask
     * @default -1
     */
    this.collisionMask = -1;

    /**
     * @property {number} collisionGroup
     * @default -1
     */
    this.collisionGroup = -1;

    /**
     * The intersection mode. Should be Ray.ANY, Ray.ALL or Ray.CLOSEST.
     * @property {number} mode
     */
    this.mode = Ray.ANY;

    /**
     * Current result object.
     * @property {RaycastResult} result
     */
    this.result = new RaycastResult();

    /**
     * Will be set to true during intersectWorld() if the ray hit anything.
     * @property {Boolean} hasHit
     */
    this.hasHit = false;

    /**
     * Current, user-provided result callback. Will be used if mode is Ray.ALL.
     * @property {Function} callback
     */
    this.callback = function(result){};
}
Ray.prototype.constructor = Ray;

Ray.CLOSEST = 1;
Ray.ANY = 2;
Ray.ALL = 4;

var tmpAABB = new AABB();
var tmpArray = [];

/**
 * Do itersection against all bodies in the given World.
 * @method intersectWorld
 * @param  {World} world
 * @param  {object} options
 * @return {Boolean} True if the ray hit anything, otherwise false.
 */
Ray.prototype.intersectWorld = function (world, options) {
    this.mode = options.mode || Ray.ANY;
    this.result = options.result || new RaycastResult();
    this.skipBackfaces = !!options.skipBackfaces;
    this.collisionMask = typeof(options.collisionMask) !== 'undefined' ? options.collisionMask : -1;
    this.collisionGroup = typeof(options.collisionGroup) !== 'undefined' ? options.collisionGroup : -1;
    if(options.from){
        vec2.copy(this.from, options.from);
    }
    if(options.to){
        vec2.copy(this.to, options.to);
    }
    this.callback = options.callback || function(){};
    this.hasHit = false;

    this.result.reset();
    this._updateDirection();

    this.getAABB(tmpAABB);
    tmpArray.length = 0;
    world.broadphase.aabbQuery(world, tmpAABB, tmpArray);
    this.intersectBodies(tmpArray);

    return this.hasHit;
};

var v1 = vec2.create(),
    v2 = vec2.create();

var intersectBody_worldPosition = vec2.create();

/**
 * Shoot a ray at a body, get back information about the hit.
 * @method intersectBody
 * @private
 * @param {Body} body
 * @param {RaycastResult} [result] Deprecated - set the result property of the Ray instead.
 */
Ray.prototype.intersectBody = function (body, result) {

    if(result){
        this.result = result;
        this._updateDirection();
    }
    var checkCollisionResponse = this.checkCollisionResponse;

    if(checkCollisionResponse && !body.collisionResponse){
        return;
    }

    // if((this.collisionGroup & body.collisionMask)===0 || (body.collisionGroup & this.collisionMask)===0){
    //     return;
    // }

    var worldPosition = intersectBody_worldPosition;

    for (var i = 0, N = body.shapes.length; i < N; i++) {
        var shape = body.shapes[i];

        if(checkCollisionResponse && !shape.collisionResponse){
            continue; // Skip
        }

        // Get world angle and position of the shape
        vec2.copy(worldPosition, body.shapeOffsets[i]);
        vec2.rotate(worldPosition, worldPosition, body.angle);
        vec2.add(worldPosition, worldPosition, body.position);
        var worldAngle = body.shapeAngles[i] + body.angle;

        this.intersectShape(
            shape,
            worldAngle,
            worldPosition,
            body
        );

        if(this.result._shouldStop){
            break;
        }
    }
};

/**
 * @method intersectBodies
 * @param {Array} bodies An array of Body objects.
 * @param {RaycastResult} [result] Deprecated
 */
Ray.prototype.intersectBodies = function (bodies, result) {
    if(result){
        this.result = result;
        this._updateDirection();
    }

    for ( var i = 0, l = bodies.length; !this.result._shouldStop && i < l; i ++ ) {
        this.intersectBody(bodies[i]);
    }
};

/**
 * Updates the _direction vector.
 * @private
 * @method _updateDirection
 */
Ray.prototype._updateDirection = function(){
    var d = this._direction;
    vec2.sub(d, this.to, this.from); // this.to.vsub(this.from, this._direction);
    vec2.normalize(d, d); // this._direction.normalize();
};

/**
 * @method intersectShape
 * @private
 * @param {Shape} shape
 * @param {number} angle
 * @param {array} position
 * @param {Body} body
 */
Ray.prototype.intersectShape = function(shape, angle, position, body){
    var from = this.from;


    // Checking boundingSphere
    var distance = distanceFromIntersection(from, this._direction, position);
    if ( distance > shape.boundingSphereRadius ) {
        return;
    }

    var method = this[shape.type];
    if(method){
        method.call(this, shape, angle, position, body);
    }
};

var vector = vec2.create();
var normal = vec2.create();
var intersectPoint = vec2.create();

var a = vec2.create();
var b = vec2.create();
var c = vec2.create();
var d = vec2.create();

var tmpRaycastResult = new RaycastResult();
var intersectRectangle_direction = vec2.create();
var intersectRectangle_rayStart = vec2.create();
var intersectRectangle_worldNormalMin = vec2.create();
var intersectRectangle_worldNormalMax = vec2.create();
var intersectRectangle_hitPointWorld = vec2.create();
var intersectRectangle_boxMin = vec2.create();
var intersectRectangle_boxMax = vec2.create();

/**
 * @method intersectRectangle
 * @private
 * @param  {Shape} shape
 * @param  {number} angle
 * @param  {array} position
 * @param  {Body} body
 */
Ray.prototype.intersectRectangle = function(shape, angle, position, body){
    var tmin = -Number.MAX_VALUE;
    var tmax = Number.MAX_VALUE;

    var direction = intersectRectangle_direction;
    var rayStart = intersectRectangle_rayStart;
    var worldNormalMin = intersectRectangle_worldNormalMin;
    var worldNormalMax = intersectRectangle_worldNormalMax;
    var hitPointWorld = intersectRectangle_hitPointWorld;
    var boxMin = intersectRectangle_boxMin;
    var boxMax = intersectRectangle_boxMax;

    vec2.set(boxMin, -shape.width * 0.5, -shape.height * 0.5);
    vec2.set(boxMax, shape.width * 0.5, shape.height * 0.5);

    // Transform the ray direction and start to local space
    vec2.rotate(direction, this._direction, -angle);
    body.toLocalFrame(rayStart, this.from);

    if (direction[0] !== 0) {
        var tx1 = (boxMin[0] - rayStart[0]) / direction[0];
        var tx2 = (boxMax[0] - rayStart[0]) / direction[0];

        var tminOld = tmin;
        tmin = Math.max(tmin, Math.min(tx1, tx2));
        if(tmin !== tminOld){
            vec2.set(worldNormalMin, tx1 > tx2 ? 1 : -1, 0);
        }

        var tmaxOld = tmax;
        tmax = Math.min(tmax, Math.max(tx1, tx2));
        if(tmax !== tmaxOld){
            vec2.set(worldNormalMax, tx1 < tx2 ? 1 : -1, 0);
        }
    }

    if (direction[1] !== 0) {
        var ty1 = (boxMin[1] - rayStart[1]) / direction[1];
        var ty2 = (boxMax[1] - rayStart[1]) / direction[1];

        var tminOld = tmin;
        tmin = Math.max(tmin, Math.min(ty1, ty2));
        if(tmin !== tminOld){
            vec2.set(worldNormalMin, 0, ty1 > ty2 ? 1 : -1);
        }

        var tmaxOld = tmax;
        tmax = Math.min(tmax, Math.max(ty1, ty2));
        if(tmax !== tmaxOld){
            vec2.set(worldNormalMax, 0, ty1 < ty2 ? 1 : -1);
        }
    }

    if(tmax >= tmin){
        // Hit point
        vec2.set(
            hitPointWorld,
            rayStart[0] + direction[0] * tmin,
            rayStart[1] + direction[1] * tmin
        );

        vec2.rotate(worldNormalMin, worldNormalMin, angle);

        body.toWorldFrame(hitPointWorld, hitPointWorld);

        this.reportIntersection(worldNormalMin, hitPointWorld, shape, body, -1);
        if(this._shouldStop){
            return;
        }

        vec2.rotate(worldNormalMax, worldNormalMax, angle);

        // Hit point
        vec2.set(
            hitPointWorld,
            rayStart[0] + direction[0] * tmax,
            rayStart[1] + direction[1] * tmax
        );
        body.toWorldFrame(hitPointWorld, hitPointWorld);

        this.reportIntersection(worldNormalMax, hitPointWorld, shape, body, -1);
    }
};
Ray.prototype[Shape.RECTANGLE] = Ray.prototype.intersectRectangle;

var intersectPlane_planePointToFrom = vec2.create();
var intersectPlane_dir_scaled_with_t = vec2.create();
var intersectPlane_hitPointWorld = vec2.create();
var intersectPlane_worldNormal = vec2.create();
var intersectPlane_len = vec2.create();

/**
 * @method intersectPlane
 * @private
 * @param  {Shape} shape
 * @param  {number} angle
 * @param  {array} position
 * @param  {Body} body
 */
Ray.prototype.intersectPlane = function(shape, angle, position, body){
    var from = this.from;
    var to = this.to;
    var direction = this._direction;

    var planePointToFrom = intersectPlane_planePointToFrom;
    var dir_scaled_with_t = intersectPlane_dir_scaled_with_t;
    var hitPointWorld = intersectPlane_hitPointWorld;
    var worldNormal = intersectPlane_worldNormal;
    var len = intersectPlane_len;

    // Get plane normal
    vec2.set(worldNormal, 0, 1);
    vec2.rotate(worldNormal, worldNormal, angle);

    vec2.sub(len, from, position); //from.vsub(position, len);
    var planeToFrom = vec2.dot(len, worldNormal); // len.dot(worldNormal);
    vec2.sub(len, to, position); // to.vsub(position, len);
    var planeToTo = vec2.dot(len, worldNormal); // len.dot(worldNormal);

    if(planeToFrom * planeToTo > 0){
        // "from" and "to" are on the same side of the plane... bail out
        return;
    }

    if(vec2.distance(from, to) /* from.distanceTo(to) */ < planeToFrom){
        return;
    }

    var n_dot_dir = vec2.dot(worldNormal, direction); // worldNormal.dot(direction);

    // if (Math.abs(n_dot_dir) < this.precision) {
    //     // No intersection
    //     return;
    // }

    vec2.sub(planePointToFrom, from, position); // from.vsub(position, planePointToFrom);
    var t = -vec2.dot(worldNormal, planePointToFrom) / n_dot_dir; // - worldNormal.dot(planePointToFrom) / n_dot_dir;
    vec2.scale(dir_scaled_with_t, direction, t); // direction.scale(t, dir_scaled_with_t);
    vec2.add(hitPointWorld, from, dir_scaled_with_t); // from.vadd(dir_scaled_with_t, hitPointWorld);

    this.reportIntersection(worldNormal, hitPointWorld, shape, body, -1);
};
Ray.prototype[Shape.PLANE] = Ray.prototype.intersectPlane;

var Ray_intersectSphere_intersectionPoint = vec2.create();
var Ray_intersectSphere_normal = vec2.create();
Ray.prototype.intersectCircle = function(shape, angle, position, body){
    var from = this.from,
        to = this.to,
        r = shape.radius;

    var a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
    var b = 2 * ((to[0] - from[0]) * (from[0] - position[0]) + (to[1] - from[1]) * (from[1] - position[1]));
    var c = Math.pow(from[0] - position[0], 2) + Math.pow(from[1] - position[1], 2) - Math.pow(r, 2);

    var delta = Math.pow(b, 2) - 4 * a * c;

    var intersectionPoint = Ray_intersectSphere_intersectionPoint;
    var normal = Ray_intersectSphere_normal;

    if(delta < 0){
        // No intersection
        return;

    } else if(delta === 0){
        // single intersection point
        vec2.lerp(intersectionPoint, from, to, delta); // from.lerp(to, delta, intersectionPoint);

        vec2.sub(normal, intersectionPoint, position); // intersectionPoint.vsub(position, normal);
        vec2.normalize(normal,normal); //normal.normalize();

        this.reportIntersection(normal, intersectionPoint, shape, body, -1);

    } else {
        var d1 = (- b - Math.sqrt(delta)) / (2 * a);
        var d2 = (- b + Math.sqrt(delta)) / (2 * a);

        vec2.lerp(intersectionPoint, from, to, d1); // from.lerp(to, d1, intersectionPoint);

        vec2.sub(normal, intersectionPoint, position); // intersectionPoint.vsub(position, normal);
        vec2.normalize(normal,normal); //normal.normalize();

        this.reportIntersection(normal, intersectionPoint, shape, body, -1);

        if(this.result._shouldStop){
            return;
        }

        vec2.lerp(intersectionPoint, from, to, d2); // from.lerp(to, d2, intersectionPoint);

        vec2.sub(normal, intersectionPoint, position); // intersectionPoint.vsub(position, normal);
        vec2.normalize(normal,normal); //normal.normalize();

        this.reportIntersection(normal, intersectionPoint, shape, body, -1);
    }
};
Ray.prototype[Shape.CIRCLE] = Ray.prototype.intersectCircle;

/**
 * Get the AABB of the ray.
 * @method getAABB
 * @param  {AABB} aabb
 */
Ray.prototype.getAABB = function(result){
    var to = this.to;
    var from = this.from;
    result.lowerBound[0] = Math.min(to[0], from[0]);
    result.lowerBound[1] = Math.min(to[1], from[1]);
    result.upperBound[0] = Math.max(to[0], from[0]);
    result.upperBound[1] = Math.max(to[1], from[1]);
};

/**
 * @method reportIntersection
 * @private
 * @param  {array} normal
 * @param  {array} hitPointWorld
 * @param  {Shape} shape
 * @param  {Body} body
 * @return {boolean} True if the intersections should continue
 */
Ray.prototype.reportIntersection = function(normal, hitPointWorld, shape, body, hitFaceIndex){
    var from = this.from;
    var to = this.to;
    var distance = vec2.distance(from, hitPointWorld); // from.distanceTo(hitPointWorld);
    var result = this.result;

    // Skip back faces?
    if(this.skipBackfaces && /* normal.dot(this._direction) */ vec2.dot(normal, this._direction) > 0){
        return;
    }

    result.hitFaceIndex = typeof(hitFaceIndex) !== 'undefined' ? hitFaceIndex : -1;

    switch(this.mode){
    case Ray.ALL:
        this.hasHit = true;
        result.set(
            from,
            to,
            normal,
            hitPointWorld,
            shape,
            body,
            distance
        );
        result.hasHit = true;
        this.callback(result);
        break;

    case Ray.CLOSEST:

        // Store if closer than current closest
        if(distance < result.distance || !result.hasHit){
            this.hasHit = true;
            result.hasHit = true;
            result.set(
                from,
                to,
                normal,
                hitPointWorld,
                shape,
                body,
                distance
            );
        }
        break;

    case Ray.ANY:

        // Report and stop.
        this.hasHit = true;
        result.hasHit = true;
        result.set(
            from,
            to,
            normal,
            hitPointWorld,
            shape,
            body,
            distance
        );
        result._shouldStop = true;
        break;
    }
};

var v0 = vec2.create(),
    intersect = vec2.create();
function distanceFromIntersection(from, direction, position) {

    // v0 is vector from from to position
    vec2.sub(v0, position, from); // position.vsub(from,v0);
    var dot = vec2.dot(v0, direction); // v0.dot(direction);

    // intersect = direction*dot + from
    vec2.scale(intersect, direction, dot); //direction.mult(dot,intersect);
    vec2.add(intersect, intersect, from); // intersect.vadd(from, intersect);

    var distance = vec2.distance(position, intersect); // position.distanceTo(intersect);

    return distance;
}



},
function(require, exports, module, global) {

var vec2 = require(191);

module.exports = RaycastResult;

/**
 * Storage for Ray casting data.
 * @class RaycastResult
 * @constructor
 */
function RaycastResult(){

	/**
	 * @property {array} rayFromWorld
	 */
	this.rayFromWorld = vec2.create();

	/**
	 * @property {array} rayToWorld
	 */
	this.rayToWorld = vec2.create();

	/**
	 * @property {array} hitNormalWorld
	 */
	this.hitNormalWorld = vec2.create();

	/**
	 * @property {array} hitPointWorld
	 */
	this.hitPointWorld = vec2.create();

	/**
	 * @property {boolean} hasHit
	 */
	this.hasHit = false;

	/**
	 * The hit shape, or null.
	 * @property {Shape} shape
	 */
	this.shape = null;

	/**
	 * The hit body, or null.
	 * @property {Body} body
	 */
	this.body = null;

	/**
	 * The index of the hit triangle, if the hit shape was a trimesh.
	 * @property {number} hitFaceIndex
	 * @default -1
	 */
	this.hitFaceIndex = -1;

	/**
	 * Distance to the hit. Will be set to -1 if there was no hit.
	 * @property {number} distance
	 * @default -1
	 */
	this.distance = -1;

	/**
	 * If the ray should stop traversing the bodies.
	 * @private
	 * @property {Boolean} _shouldStop
	 * @default false
	 */
	this._shouldStop = false;
}

/**
 * Reset all result data.
 * @method reset
 */
RaycastResult.prototype.reset = function () {
	vec2.set(this.rayFromWorld, 0, 0);
	vec2.set(this.rayToWorld, 0, 0);
	vec2.set(this.hitNormalWorld, 0, 0);
	vec2.set(this.hitPointWorld, 0, 0);
	this.hasHit = false;
	this.shape = null;
	this.body = null;
	this.hitFaceIndex = -1;
	this.distance = -1;
	this._shouldStop = false;
};

/**
 * @method abort
 */
RaycastResult.prototype.abort = function(){
	this._shouldStop = true;
};

/**
 * @method set
 * @param {array} rayFromWorld
 * @param {array} rayToWorld
 * @param {array} hitNormalWorld
 * @param {array} hitPointWorld
 * @param {Shape} shape
 * @param {Body} body
 * @param {number} distance
 */
RaycastResult.prototype.set = function(
	rayFromWorld,
	rayToWorld,
	hitNormalWorld,
	hitPointWorld,
	shape,
	body,
	distance
){
	vec2.copy(this.rayFromWorld, rayFromWorld);
	vec2.copy(this.rayToWorld, rayToWorld);
	vec2.copy(this.hitNormalWorld, hitNormalWorld);
	vec2.copy(this.hitPointWorld, hitPointWorld);
	this.shape = shape;
	this.body = body;
	this.distance = distance;
};

},
function(require, exports, module, global) {

var Utils = require(192)
,   Broadphase = require(205);

module.exports = SAPBroadphase;

/**
 * Sweep and prune broadphase along one axis.
 *
 * @class SAPBroadphase
 * @constructor
 * @extends Broadphase
 */
function SAPBroadphase(){
    Broadphase.call(this,Broadphase.SAP);

    /**
     * List of bodies currently in the broadphase.
     * @property axisList
     * @type {Array}
     */
    this.axisList = [];

    /**
     * The axis to sort along. 0 means x-axis and 1 y-axis. If your bodies are more spread out over the X axis, set axisIndex to 0, and you will gain some performance.
     * @property axisIndex
     * @type {Number}
     */
    this.axisIndex = 0;

    var that = this;
    this._addBodyHandler = function(e){
        that.axisList.push(e.body);
    };

    this._removeBodyHandler = function(e){
        // Remove from list
        var idx = that.axisList.indexOf(e.body);
        if(idx !== -1){
            that.axisList.splice(idx,1);
        }
    };
}
SAPBroadphase.prototype = new Broadphase();
SAPBroadphase.prototype.constructor = SAPBroadphase;

/**
 * Change the world
 * @method setWorld
 * @param {World} world
 */
SAPBroadphase.prototype.setWorld = function(world){
    // Clear the old axis array
    this.axisList.length = 0;

    // Add all bodies from the new world
    Utils.appendArray(this.axisList, world.bodies);

    // Remove old handlers, if any
    world
        .off("addBody",this._addBodyHandler)
        .off("removeBody",this._removeBodyHandler);

    // Add handlers to update the list of bodies.
    world.on("addBody",this._addBodyHandler).on("removeBody",this._removeBodyHandler);

    this.world = world;
};

/**
 * Sorts bodies along an axis.
 * @method sortAxisList
 * @param {Array} a
 * @param {number} axisIndex
 * @return {Array}
 */
SAPBroadphase.sortAxisList = function(a, axisIndex){
    axisIndex = axisIndex|0;
    for(var i=1,l=a.length; i<l; i++) {
        var v = a[i];
        for(var j=i - 1;j>=0;j--) {
            if(a[j].aabb.lowerBound[axisIndex] <= v.aabb.lowerBound[axisIndex]){
                break;
            }
            a[j+1] = a[j];
        }
        a[j+1] = v;
    }
    return a;
};

SAPBroadphase.prototype.sortList = function(){
    var bodies = this.axisList,
    axisIndex = this.axisIndex;

    // Sort the lists
    SAPBroadphase.sortAxisList(bodies, axisIndex);
};

/**
 * Get the colliding pairs
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
SAPBroadphase.prototype.getCollisionPairs = function(world){
    var bodies = this.axisList,
        result = this.result,
        axisIndex = this.axisIndex;

    result.length = 0;

    // Update all AABBs if needed
    var l = bodies.length;
    while(l--){
        var b = bodies[l];
        if(b.aabbNeedsUpdate){
            b.updateAABB();
        }
    }

    // Sort the lists
    this.sortList();

    // Look through the X list
    for(var i=0, N=bodies.length|0; i!==N; i++){
        var bi = bodies[i];

        for(var j=i+1; j<N; j++){
            var bj = bodies[j];

            // Bounds overlap?
            var overlaps = (bj.aabb.lowerBound[axisIndex] <= bi.aabb.upperBound[axisIndex]);
            if(!overlaps){
                break;
            }

            if(Broadphase.canCollide(bi,bj) && this.boundingVolumeCheck(bi,bj)){
                result.push(bi,bj);
            }
        }
    }

    return result;
};

/**
 * Returns all the bodies within an AABB.
 * @method aabbQuery
 * @param  {World} world
 * @param  {AABB} aabb
 * @param {array} result An array to store resulting bodies in.
 * @return {array}
 */
SAPBroadphase.prototype.aabbQuery = function(world, aabb, result){
    result = result || [];

    this.sortList();

    var axisIndex = this.axisIndex;
    var axis = 'x';
    if(axisIndex === 1){ axis = 'y'; }
    if(axisIndex === 2){ axis = 'z'; }

    var axisList = this.axisList;
    var lower = aabb.lowerBound[axis];
    var upper = aabb.upperBound[axis];
    for(var i = 0; i < axisList.length; i++){
        var b = axisList[i];

        if(b.aabbNeedsUpdate){
            b.updateAABB();
        }

        if(b.aabb.overlaps(aabb)){
            result.push(b);
        }
    }

    return result;
};

},
function(require, exports, module, global) {

var vec2 = require(191);
var Utils = require(192);

module.exports = Spring;

/**
 * A spring, connecting two bodies. The Spring explicitly adds force and angularForce to the bodies and does therefore not put load on the constraint solver.
 *
 * @class Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} [options.stiffness=100]  Spring constant (see Hookes Law). A number >= 0.
 * @param {number} [options.damping=1]      A number >= 0. Default: 1
 * @param {Array}  [options.localAnchorA]   Where to hook the spring to body A, in local body coordinates. Defaults to the body center.
 * @param {Array}  [options.localAnchorB]
 * @param {Array}  [options.worldAnchorA]   Where to hook the spring to body A, in world coordinates. Overrides the option "localAnchorA" if given.
 * @param {Array}  [options.worldAnchorB]
 */
function Spring(bodyA, bodyB, options){
    options = Utils.defaults(options,{
        stiffness: 100,
        damping: 1,
    });

    /**
     * Stiffness of the spring.
     * @property stiffness
     * @type {number}
     */
    this.stiffness = options.stiffness;

    /**
     * Damping of the spring.
     * @property damping
     * @type {number}
     */
    this.damping = options.damping;

    /**
     * First connected body.
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second connected body.
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;
}

/**
 * Apply the spring force to the connected bodies.
 * @method applyForce
 */
Spring.prototype.applyForce = function(){
    // To be implemented by subclasses
};


},
function(require, exports, module, global) {

var vec2 = require(191);
var Spring = require(234);
var Utils = require(192);

module.exports = LinearSpring;

/**
 * A spring, connecting two bodies.
 *
 * The Spring explicitly adds force and angularForce to the bodies.
 *
 * @class LinearSpring
 * @extends Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} [options.restLength]   A number > 0. Default is the current distance between the world anchor points.
 * @param {number} [options.stiffness=100]  Spring constant (see Hookes Law). A number >= 0.
 * @param {number} [options.damping=1]      A number >= 0. Default: 1
 * @param {Array}  [options.worldAnchorA]   Where to hook the spring to body A, in world coordinates. Overrides the option "localAnchorA" if given.
 * @param {Array}  [options.worldAnchorB]
 * @param {Array}  [options.localAnchorA]   Where to hook the spring to body A, in local body coordinates. Defaults to the body center.
 * @param {Array}  [options.localAnchorB]
 */
function LinearSpring(bodyA,bodyB,options){
    options = options || {};

    Spring.call(this, bodyA, bodyB, options);

    /**
     * Anchor for bodyA in local bodyA coordinates.
     * @property localAnchorA
     * @type {Array}
     */
    this.localAnchorA = vec2.fromValues(0,0);

    /**
     * Anchor for bodyB in local bodyB coordinates.
     * @property localAnchorB
     * @type {Array}
     */
    this.localAnchorB = vec2.fromValues(0,0);

    if(options.localAnchorA){ vec2.copy(this.localAnchorA, options.localAnchorA); }
    if(options.localAnchorB){ vec2.copy(this.localAnchorB, options.localAnchorB); }
    if(options.worldAnchorA){ this.setWorldAnchorA(options.worldAnchorA); }
    if(options.worldAnchorB){ this.setWorldAnchorB(options.worldAnchorB); }

    var worldAnchorA = vec2.create();
    var worldAnchorB = vec2.create();
    this.getWorldAnchorA(worldAnchorA);
    this.getWorldAnchorB(worldAnchorB);
    var worldDistance = vec2.distance(worldAnchorA, worldAnchorB);

    /**
     * Rest length of the spring.
     * @property restLength
     * @type {number}
     */
    this.restLength = typeof(options.restLength) === "number" ? options.restLength : worldDistance;
}
LinearSpring.prototype = new Spring();
LinearSpring.prototype.constructor = LinearSpring;

/**
 * Set the anchor point on body A, using world coordinates.
 * @method setWorldAnchorA
 * @param {Array} worldAnchorA
 */
LinearSpring.prototype.setWorldAnchorA = function(worldAnchorA){
    this.bodyA.toLocalFrame(this.localAnchorA, worldAnchorA);
};

/**
 * Set the anchor point on body B, using world coordinates.
 * @method setWorldAnchorB
 * @param {Array} worldAnchorB
 */
LinearSpring.prototype.setWorldAnchorB = function(worldAnchorB){
    this.bodyB.toLocalFrame(this.localAnchorB, worldAnchorB);
};

/**
 * Get the anchor point on body A, in world coordinates.
 * @method getWorldAnchorA
 * @param {Array} result The vector to store the result in.
 */
LinearSpring.prototype.getWorldAnchorA = function(result){
    this.bodyA.toWorldFrame(result, this.localAnchorA);
};

/**
 * Get the anchor point on body B, in world coordinates.
 * @method getWorldAnchorB
 * @param {Array} result The vector to store the result in.
 */
LinearSpring.prototype.getWorldAnchorB = function(result){
    this.bodyB.toWorldFrame(result, this.localAnchorB);
};

var applyForce_r =              vec2.create(),
    applyForce_r_unit =         vec2.create(),
    applyForce_u =              vec2.create(),
    applyForce_f =              vec2.create(),
    applyForce_worldAnchorA =   vec2.create(),
    applyForce_worldAnchorB =   vec2.create(),
    applyForce_ri =             vec2.create(),
    applyForce_rj =             vec2.create(),
    applyForce_tmp =            vec2.create();

/**
 * Apply the spring force to the connected bodies.
 * @method applyForce
 */
LinearSpring.prototype.applyForce = function(){
    var k = this.stiffness,
        d = this.damping,
        l = this.restLength,
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        r = applyForce_r,
        r_unit = applyForce_r_unit,
        u = applyForce_u,
        f = applyForce_f,
        tmp = applyForce_tmp;

    var worldAnchorA = applyForce_worldAnchorA,
        worldAnchorB = applyForce_worldAnchorB,
        ri = applyForce_ri,
        rj = applyForce_rj;

    // Get world anchors
    this.getWorldAnchorA(worldAnchorA);
    this.getWorldAnchorB(worldAnchorB);

    // Get offset points
    vec2.sub(ri, worldAnchorA, bodyA.position);
    vec2.sub(rj, worldAnchorB, bodyB.position);

    // Compute distance vector between world anchor points
    vec2.sub(r, worldAnchorB, worldAnchorA);
    var rlen = vec2.len(r);
    vec2.normalize(r_unit,r);

    //console.log(rlen)
    //console.log("A",vec2.str(worldAnchorA),"B",vec2.str(worldAnchorB))

    // Compute relative velocity of the anchor points, u
    vec2.sub(u, bodyB.velocity, bodyA.velocity);
    vec2.crossZV(tmp, bodyB.angularVelocity, rj);
    vec2.add(u, u, tmp);
    vec2.crossZV(tmp, bodyA.angularVelocity, ri);
    vec2.sub(u, u, tmp);

    // F = - k * ( x - L ) - D * ( u )
    vec2.scale(f, r_unit, -k*(rlen-l) - d*vec2.dot(u,r_unit));

    // Add forces to bodies
    vec2.sub( bodyA.force, bodyA.force, f);
    vec2.add( bodyB.force, bodyB.force, f);

    // Angular force
    var ri_x_f = vec2.crossLength(ri, f);
    var rj_x_f = vec2.crossLength(rj, f);
    bodyA.angularForce -= ri_x_f;
    bodyB.angularForce += rj_x_f;
};


},
function(require, exports, module, global) {

var vec2 = require(191);
var Spring = require(234);

module.exports = RotationalSpring;

/**
 * A rotational spring, connecting two bodies rotation. This spring explicitly adds angularForce (torque) to the bodies.
 *
 * The spring can be combined with a {{#crossLink "RevoluteConstraint"}}{{/crossLink}} to make, for example, a mouse trap.
 *
 * @class RotationalSpring
 * @extends Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} [options.restAngle] The relative angle of bodies at which the spring is at rest. If not given, it's set to the current relative angle between the bodies.
 * @param {number} [options.stiffness=100] Spring constant (see Hookes Law). A number >= 0.
 * @param {number} [options.damping=1] A number >= 0.
 */
function RotationalSpring(bodyA, bodyB, options){
    options = options || {};

    Spring.call(this, bodyA, bodyB, options);

    /**
     * Rest angle of the spring.
     * @property restAngle
     * @type {number}
     */
    this.restAngle = typeof(options.restAngle) === "number" ? options.restAngle : bodyB.angle - bodyA.angle;
}
RotationalSpring.prototype = new Spring();
RotationalSpring.prototype.constructor = RotationalSpring;

/**
 * Apply the spring force to the connected bodies.
 * @method applyForce
 */
RotationalSpring.prototype.applyForce = function(){
    var k = this.stiffness,
        d = this.damping,
        l = this.restAngle,
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        x = bodyB.angle - bodyA.angle,
        u = bodyB.angularVelocity - bodyA.angularVelocity;

    var torque = - k * (x - l) - d * u * 0;

    bodyA.angularForce -= torque;
    bodyB.angularForce += torque;
};


},
function(require, exports, module, global) {

/* global performance */
/*jshint -W020 */

var  GSSolver = require(218)
,    Solver = require(219)
,    NaiveBroadphase = require(226)
,    Ray = require(231)
,    vec2 = require(191)
,    Circle = require(207)
,    Rectangle = require(225)
,    Convex = require(201)
,    Line = require(221)
,    Plane = require(216)
,    Capsule = require(206)
,    Particle = require(217)
,    EventEmitter = require(204)
,    Body = require(195)
,    Shape = require(202)
,    LinearSpring = require(235)
,    Material = require(211)
,    ContactMaterial = require(210)
,    DistanceConstraint = require(212)
,    Constraint = require(208)
,    LockConstraint = require(222)
,    RevoluteConstraint = require(227)
,    PrismaticConstraint = require(230)
,    GearConstraint = require(214)
,    pkg = require(238)
,    Broadphase = require(205)
,    SAPBroadphase = require(233)
,    Narrowphase = require(223)
,    Utils = require(192)
,    OverlapKeeper = require(239)
,    IslandManager = require(240)
,    RotationalSpring = require(236);

module.exports = World;

if(typeof performance === 'undefined'){
    performance = {};
}
if(!performance.now){
    var nowOffset = Date.now();
    if (performance.timing && performance.timing.navigationStart){
        nowOffset = performance.timing.navigationStart;
    }
    performance.now = function(){
        return Date.now() - nowOffset;
    };
}

/**
 * The dynamics world, where all bodies and constraints lives.
 *
 * @class World
 * @constructor
 * @param {Object}          [options]
 * @param {Solver}          [options.solver]            Defaults to GSSolver.
 * @param {Array}           [options.gravity]           Defaults to [0,-9.78]
 * @param {Broadphase}      [options.broadphase]        Defaults to NaiveBroadphase
 * @param {Boolean}         [options.islandSplit=false]
 * @param {Boolean}         [options.doProfiling=false]
 * @extends EventEmitter
 *
 * @example
 *     var world = new World({
 *         gravity: [0, -9.81],
 *         broadphase: new SAPBroadphase()
 *     });
 */
function World(options){
    EventEmitter.apply(this);

    options = options || {};

    /**
     * All springs in the world. To add a spring to the world, use {{#crossLink "World/addSpring:method"}}{{/crossLink}}.
     *
     * @property springs
     * @type {Array}
     */
    this.springs = [];

    /**
     * All bodies in the world. To add a body to the world, use {{#crossLink "World/addBody:method"}}{{/crossLink}}.
     * @property {Array} bodies
     */
    this.bodies = [];

    /**
     * Disabled body collision pairs. See {{#crossLink "World/disableBodyCollision:method"}}.
     * @private
     * @property {Array} disabledBodyCollisionPairs
     */
    this.disabledBodyCollisionPairs = [];

    /**
     * The solver used to satisfy constraints and contacts. Default is {{#crossLink "GSSolver"}}{{/crossLink}}.
     * @property {Solver} solver
     */
    this.solver = options.solver || new GSSolver();

    /**
     * The narrowphase to use to generate contacts.
     *
     * @property narrowphase
     * @type {Narrowphase}
     */
    this.narrowphase = new Narrowphase(this);

    /**
     * The island manager of this world.
     * @property {IslandManager} islandManager
     */
    this.islandManager = new IslandManager();

    /**
     * Gravity in the world. This is applied on all bodies in the beginning of each step().
     *
     * @property gravity
     * @type {Array}
     */
    this.gravity = vec2.fromValues(0, -9.78);
    if(options.gravity){
        vec2.copy(this.gravity, options.gravity);
    }

    /**
     * Gravity to use when approximating the friction max force (mu*mass*gravity).
     * @property {Number} frictionGravity
     */
    this.frictionGravity = vec2.length(this.gravity) || 10;

    /**
     * Set to true if you want .frictionGravity to be automatically set to the length of .gravity.
     * @property {Boolean} useWorldGravityAsFrictionGravity
     */
    this.useWorldGravityAsFrictionGravity = true;

    /**
     * If the length of .gravity is zero, and .useWorldGravityAsFrictionGravity=true, then switch to using .frictionGravity for friction instead. This fallback is useful for gravityless games.
     * @property {Boolean} useFrictionGravityOnZeroGravity
     */
    this.useFrictionGravityOnZeroGravity = true;

    /**
     * Whether to do timing measurements during the step() or not.
     *
     * @property doPofiling
     * @type {Boolean}
     */
    this.doProfiling = options.doProfiling || false;

    /**
     * How many millisecconds the last step() took. This is updated each step if .doProfiling is set to true.
     *
     * @property lastStepTime
     * @type {Number}
     */
    this.lastStepTime = 0.0;

    /**
     * The broadphase algorithm to use.
     *
     * @property broadphase
     * @type {Broadphase}
     */
    this.broadphase = options.broadphase || new SAPBroadphase();
    this.broadphase.setWorld(this);

    /**
     * User-added constraints.
     *
     * @property constraints
     * @type {Array}
     */
    this.constraints = [];

    /**
     * Dummy default material in the world, used in .defaultContactMaterial
     * @property {Material} defaultMaterial
     */
    this.defaultMaterial = new Material();

    /**
     * The default contact material to use, if no contact material was set for the colliding materials.
     * @property {ContactMaterial} defaultContactMaterial
     */
    this.defaultContactMaterial = new ContactMaterial(this.defaultMaterial,this.defaultMaterial);

    /**
     * For keeping track of what time step size we used last step
     * @property lastTimeStep
     * @type {Number}
     */
    this.lastTimeStep = 1/60;

    /**
     * Enable to automatically apply spring forces each step.
     * @property applySpringForces
     * @type {Boolean}
     */
    this.applySpringForces = true;

    /**
     * Enable to automatically apply body damping each step.
     * @property applyDamping
     * @type {Boolean}
     */
    this.applyDamping = true;

    /**
     * Enable to automatically apply gravity each step.
     * @property applyGravity
     * @type {Boolean}
     */
    this.applyGravity = true;

    /**
     * Enable/disable constraint solving in each step.
     * @property solveConstraints
     * @type {Boolean}
     */
    this.solveConstraints = true;

    /**
     * The ContactMaterials added to the World.
     * @property contactMaterials
     * @type {Array}
     */
    this.contactMaterials = [];

    /**
     * World time.
     * @property time
     * @type {Number}
     */
    this.time = 0.0;

    /**
     * Is true during the step().
     * @property {Boolean} stepping
     */
    this.stepping = false;

    /**
     * Bodies that are scheduled to be removed at the end of the step.
     * @property {Array} bodiesToBeRemoved
     * @private
     */
    this.bodiesToBeRemoved = [];

    this.fixedStepTime = 0.0;

    /**
     * Whether to enable island splitting. Island splitting can be an advantage for many things, including solver performance. See {{#crossLink "IslandManager"}}{{/crossLink}}.
     * @property {Boolean} islandSplit
     */
    this.islandSplit = typeof(options.islandSplit)!=="undefined" ? !!options.islandSplit : false;

    /**
     * Set to true if you want to the world to emit the "impact" event. Turning this off could improve performance.
     * @property emitImpactEvent
     * @type {Boolean}
     */
    this.emitImpactEvent = true;

    // Id counters
    this._constraintIdCounter = 0;
    this._bodyIdCounter = 0;

    /**
     * Fired after the step().
     * @event postStep
     */
    this.postStepEvent = {
        type : "postStep",
    };

    /**
     * Fired when a body is added to the world.
     * @event addBody
     * @param {Body} body
     */
    this.addBodyEvent = {
        type : "addBody",
        body : null
    };

    /**
     * Fired when a body is removed from the world.
     * @event removeBody
     * @param {Body} body
     */
    this.removeBodyEvent = {
        type : "removeBody",
        body : null
    };

    /**
     * Fired when a spring is added to the world.
     * @event addSpring
     * @param {Spring} spring
     */
    this.addSpringEvent = {
        type : "addSpring",
        spring : null,
    };

    /**
     * Fired when a first contact is created between two bodies. This event is fired after the step has been done.
     * @event impact
     * @param {Body} bodyA
     * @param {Body} bodyB
     */
    this.impactEvent = {
        type: "impact",
        bodyA : null,
        bodyB : null,
        shapeA : null,
        shapeB : null,
        contactEquation : null,
    };

    /**
     * Fired after the Broadphase has collected collision pairs in the world.
     * Inside the event handler, you can modify the pairs array as you like, to
     * prevent collisions between objects that you don't want.
     * @event postBroadphase
     * @param {Array} pairs An array of collision pairs. If this array is [body1,body2,body3,body4], then the body pairs 1,2 and 3,4 would advance to narrowphase.
     */
    this.postBroadphaseEvent = {
        type:"postBroadphase",
        pairs:null,
    };

    /**
     * How to deactivate bodies during simulation. Possible modes are: {{#crossLink "World/NO_SLEEPING:property"}}World.NO_SLEEPING{{/crossLink}}, {{#crossLink "World/BODY_SLEEPING:property"}}World.BODY_SLEEPING{{/crossLink}} and {{#crossLink "World/ISLAND_SLEEPING:property"}}World.ISLAND_SLEEPING{{/crossLink}}.
     * If sleeping is enabled, you might need to {{#crossLink "Body/wakeUp:method"}}wake up{{/crossLink}} the bodies if they fall asleep when they shouldn't. If you want to enable sleeping in the world, but want to disable it for a particular body, see {{#crossLink "Body/allowSleep:property"}}Body.allowSleep{{/crossLink}}.
     * @property sleepMode
     * @type {number}
     * @default World.NO_SLEEPING
     */
    this.sleepMode = World.NO_SLEEPING;

    /**
     * Fired when two shapes starts start to overlap. Fired in the narrowphase, during step.
     * @event beginContact
     * @param {Shape} shapeA
     * @param {Shape} shapeB
     * @param {Body}  bodyA
     * @param {Body}  bodyB
     * @param {Array} contactEquations
     */
    this.beginContactEvent = {
        type:"beginContact",
        shapeA : null,
        shapeB : null,
        bodyA : null,
        bodyB : null,
        contactEquations : [],
    };

    /**
     * Fired when two shapes stop overlapping, after the narrowphase (during step).
     * @event endContact
     * @param {Shape} shapeA
     * @param {Shape} shapeB
     * @param {Body}  bodyA
     * @param {Body}  bodyB
     * @param {Array} contactEquations
     */
    this.endContactEvent = {
        type:"endContact",
        shapeA : null,
        shapeB : null,
        bodyA : null,
        bodyB : null,
    };

    /**
     * Fired just before equations are added to the solver to be solved. Can be used to control what equations goes into the solver.
     * @event preSolve
     * @param {Array} contactEquations  An array of contacts to be solved.
     * @param {Array} frictionEquations An array of friction equations to be solved.
     */
    this.preSolveEvent = {
        type:"preSolve",
        contactEquations:null,
        frictionEquations:null,
    };

    // For keeping track of overlapping shapes
    this.overlappingShapesLastState = { keys:[] };
    this.overlappingShapesCurrentState = { keys:[] };

    this.overlapKeeper = new OverlapKeeper();
}
World.prototype = new Object(EventEmitter.prototype);
World.prototype.constructor = World;

/**
 * Never deactivate bodies.
 * @static
 * @property {number} NO_SLEEPING
 */
World.NO_SLEEPING = 1;

/**
 * Deactivate individual bodies if they are sleepy.
 * @static
 * @property {number} BODY_SLEEPING
 */
World.BODY_SLEEPING = 2;

/**
 * Deactivates bodies that are in contact, if all of them are sleepy. Note that you must enable {{#crossLink "World/islandSplit:property"}}.islandSplit{{/crossLink}} for this to work.
 * @static
 * @property {number} ISLAND_SLEEPING
 */
World.ISLAND_SLEEPING = 4;

/**
 * Add a constraint to the simulation.
 *
 * @method addConstraint
 * @param {Constraint} c
 */
World.prototype.addConstraint = function(c){
    this.constraints.push(c);
};

/**
 * Add a ContactMaterial to the simulation.
 * @method addContactMaterial
 * @param {ContactMaterial} contactMaterial
 */
World.prototype.addContactMaterial = function(contactMaterial){
    this.contactMaterials.push(contactMaterial);
};

/**
 * Removes a contact material
 *
 * @method removeContactMaterial
 * @param {ContactMaterial} cm
 */
World.prototype.removeContactMaterial = function(cm){
    var idx = this.contactMaterials.indexOf(cm);
    if(idx!==-1){
        Utils.splice(this.contactMaterials,idx,1);
    }
};

/**
 * Get a contact material given two materials
 * @method getContactMaterial
 * @param {Material} materialA
 * @param {Material} materialB
 * @return {ContactMaterial} The matching ContactMaterial, or false on fail.
 * @todo Use faster hash map to lookup from material id's
 */
World.prototype.getContactMaterial = function(materialA,materialB){
    var cmats = this.contactMaterials;
    for(var i=0, N=cmats.length; i!==N; i++){
        var cm = cmats[i];
        if( (cm.materialA.id === materialA.id) && (cm.materialB.id === materialB.id) ||
            (cm.materialA.id === materialB.id) && (cm.materialB.id === materialA.id) ){
            return cm;
        }
    }
    return false;
};

/**
 * Removes a constraint
 *
 * @method removeConstraint
 * @param {Constraint} c
 */
World.prototype.removeConstraint = function(c){
    var idx = this.constraints.indexOf(c);
    if(idx!==-1){
        Utils.splice(this.constraints,idx,1);
    }
};

var step_r = vec2.create(),
    step_runit = vec2.create(),
    step_u = vec2.create(),
    step_f = vec2.create(),
    step_fhMinv = vec2.create(),
    step_velodt = vec2.create(),
    step_mg = vec2.create(),
    xiw = vec2.fromValues(0,0),
    xjw = vec2.fromValues(0,0),
    zero = vec2.fromValues(0,0),
    interpvelo = vec2.fromValues(0,0);

/**
 * Step the physics world forward in time.
 *
 * There are two modes. The simple mode is fixed timestepping without interpolation. In this case you only use the first argument. The second case uses interpolation. In that you also provide the time since the function was last used, as well as the maximum fixed timesteps to take.
 *
 * @method step
 * @param {Number} dt                       The fixed time step size to use.
 * @param {Number} [timeSinceLastCalled=0]  The time elapsed since the function was last called.
 * @param {Number} [maxSubSteps=10]         Maximum number of fixed steps to take per function call.
 *
 * @example
 *     // fixed timestepping without interpolation
 *     var world = new World();
 *     world.step(0.01);
 *
 * @see http://bulletphysics.org/mediawiki-1.5.8/index.php/Stepping_The_World
 */
World.prototype.step = function(dt,timeSinceLastCalled,maxSubSteps){
    maxSubSteps = maxSubSteps || 10;
    timeSinceLastCalled = timeSinceLastCalled || 0;

    if(timeSinceLastCalled === 0){ // Fixed, simple stepping

        this.internalStep(dt);

        // Increment time
        this.time += dt;

    } else {

        // Compute the number of fixed steps we should have taken since the last step
        var internalSteps = Math.floor( (this.time+timeSinceLastCalled) / dt) - Math.floor(this.time / dt);
        internalSteps = Math.min(internalSteps,maxSubSteps);

        // Do some fixed steps to catch up
        var t0 = performance.now();
        for(var i=0; i!==internalSteps; i++){
            this.internalStep(dt);
            if(performance.now() - t0 > dt*1000){
                // We are slower than real-time. Better bail out.
                break;
            }
        }

        // Increment internal clock
        this.time += timeSinceLastCalled;

        // Compute "Left over" time step
        var h = this.time % dt;
        var h_div_dt = h/dt;

        for(var j=0; j!==this.bodies.length; j++){
            var b = this.bodies[j];
            if(b.type !== Body.STATIC && b.sleepState !== Body.SLEEPING){
                // Interpolate
                vec2.sub(interpvelo, b.position, b.previousPosition);
                vec2.scale(interpvelo, interpvelo, h_div_dt);
                vec2.add(b.interpolatedPosition, b.position, interpvelo);

                b.interpolatedAngle = b.angle + (b.angle - b.previousAngle) * h_div_dt;
            } else {
                // For static bodies, just copy. Who else will do it?
                vec2.copy(b.interpolatedPosition, b.position);
                b.interpolatedAngle = b.angle;
            }
        }
    }
};

var endOverlaps = [];

/**
 * Make a fixed step.
 * @method internalStep
 * @param  {number} dt
 * @private
 */
World.prototype.internalStep = function(dt){
    this.stepping = true;

    var that = this,
        doProfiling = this.doProfiling,
        Nsprings = this.springs.length,
        springs = this.springs,
        bodies = this.bodies,
        g = this.gravity,
        solver = this.solver,
        Nbodies = this.bodies.length,
        broadphase = this.broadphase,
        np = this.narrowphase,
        constraints = this.constraints,
        t0, t1,
        fhMinv = step_fhMinv,
        velodt = step_velodt,
        mg = step_mg,
        scale = vec2.scale,
        add = vec2.add,
        rotate = vec2.rotate,
        islandManager = this.islandManager;

    this.overlapKeeper.tick();

    this.lastTimeStep = dt;

    if(doProfiling){
        t0 = performance.now();
    }

    // Update approximate friction gravity.
    if(this.useWorldGravityAsFrictionGravity){
        var gravityLen = vec2.length(this.gravity);
        if(!(gravityLen === 0 && this.useFrictionGravityOnZeroGravity)){
            // Nonzero gravity. Use it.
            this.frictionGravity = gravityLen;
        }
    }

    // Add gravity to bodies
    if(this.applyGravity){
        for(var i=0; i!==Nbodies; i++){
            var b = bodies[i],
                fi = b.force;
            if(b.type !== Body.DYNAMIC || b.sleepState === Body.SLEEPING){
                continue;
            }
            vec2.scale(mg,g,b.mass*b.gravityScale); // F=m*g
            add(fi,fi,mg);
        }
    }

    // Add spring forces
    if(this.applySpringForces){
        for(var i=0; i!==Nsprings; i++){
            var s = springs[i];
            s.applyForce();
        }
    }

    if(this.applyDamping){
        for(var i=0; i!==Nbodies; i++){
            var b = bodies[i];
            if(b.type === Body.DYNAMIC){
                b.applyDamping(dt);
            }
        }
    }

    // Broadphase
    var result = broadphase.getCollisionPairs(this);

    // Remove ignored collision pairs
    var ignoredPairs = this.disabledBodyCollisionPairs;
    for(var i=ignoredPairs.length-2; i>=0; i-=2){
        for(var j=result.length-2; j>=0; j-=2){
            if( (ignoredPairs[i]   === result[j] && ignoredPairs[i+1] === result[j+1]) ||
                (ignoredPairs[i+1] === result[j] && ignoredPairs[i]   === result[j+1])){
                result.splice(j,2);
            }
        }
    }

    // Remove constrained pairs with collideConnected == false
    var Nconstraints = constraints.length;
    for(i=0; i!==Nconstraints; i++){
        var c = constraints[i];
        if(!c.collideConnected){
            for(var j=result.length-2; j>=0; j-=2){
                if( (c.bodyA === result[j] && c.bodyB === result[j+1]) ||
                    (c.bodyB === result[j] && c.bodyA === result[j+1])){
                    result.splice(j,2);
                }
            }
        }
    }

    // postBroadphase event
    this.postBroadphaseEvent.pairs = result;
    this.emit(this.postBroadphaseEvent);

    // Narrowphase
    np.reset(this);
    for(var i=0, Nresults=result.length; i!==Nresults; i+=2){
        var bi = result[i],
            bj = result[i+1];

        // Loop over all shapes of body i
        for(var k=0, Nshapesi=bi.shapes.length; k!==Nshapesi; k++){
            var si = bi.shapes[k],
                xi = bi.shapeOffsets[k],
                ai = bi.shapeAngles[k];

            // All shapes of body j
            for(var l=0, Nshapesj=bj.shapes.length; l!==Nshapesj; l++){
                var sj = bj.shapes[l],
                    xj = bj.shapeOffsets[l],
                    aj = bj.shapeAngles[l];

                var cm = this.defaultContactMaterial;
                if(si.material && sj.material){
                    var tmp = this.getContactMaterial(si.material,sj.material);
                    if(tmp){
                        cm = tmp;
                    }
                }

                this.runNarrowphase(np,bi,si,xi,ai,bj,sj,xj,aj,cm,this.frictionGravity);
            }
        }
    }

    // Wake up bodies
    for(var i=0; i!==Nbodies; i++){
        var body = bodies[i];
        if(body._wakeUpAfterNarrowphase){
            body.wakeUp();
            body._wakeUpAfterNarrowphase = false;
        }
    }

    // Emit end overlap events
    if(this.has('endContact')){
        this.overlapKeeper.getEndOverlaps(endOverlaps);
        var e = this.endContactEvent;
        var l = endOverlaps.length;
        while(l--){
            var data = endOverlaps[l];
            e.shapeA = data.shapeA;
            e.shapeB = data.shapeB;
            e.bodyA = data.bodyA;
            e.bodyB = data.bodyB;
            this.emit(e);
        }
    }

    var preSolveEvent = this.preSolveEvent;
    preSolveEvent.contactEquations = np.contactEquations;
    preSolveEvent.frictionEquations = np.frictionEquations;
    this.emit(preSolveEvent);

    // update constraint equations
    var Nconstraints = constraints.length;
    for(i=0; i!==Nconstraints; i++){
        constraints[i].update();
    }

    if(np.contactEquations.length || np.frictionEquations.length || constraints.length){
        if(this.islandSplit){
            // Split into islands
            islandManager.equations.length = 0;
            Utils.appendArray(islandManager.equations, np.contactEquations);
            Utils.appendArray(islandManager.equations, np.frictionEquations);
            for(i=0; i!==Nconstraints; i++){
                Utils.appendArray(islandManager.equations, constraints[i].equations);
            }
            islandManager.split(this);

            for(var i=0; i!==islandManager.islands.length; i++){
                var island = islandManager.islands[i];
                if(island.equations.length){
                    solver.solveIsland(dt,island);
                }
            }

        } else {

            // Add contact equations to solver
            solver.addEquations(np.contactEquations);
            solver.addEquations(np.frictionEquations);

            // Add user-defined constraint equations
            for(i=0; i!==Nconstraints; i++){
                solver.addEquations(constraints[i].equations);
            }

            if(this.solveConstraints){
                solver.solve(dt,this);
            }

            solver.removeAllEquations();
        }
    }

    // Step forward
    for(var i=0; i!==Nbodies; i++){
        var body = bodies[i];

        if(body.sleepState !== Body.SLEEPING && body.type !== Body.STATIC){
            body.integrate(dt);
        }
    }

    // Reset force
    for(var i=0; i!==Nbodies; i++){
        bodies[i].setZeroForce();
    }

    if(doProfiling){
        t1 = performance.now();
        that.lastStepTime = t1-t0;
    }

    // Emit impact event
    if(this.emitImpactEvent && this.has('impact')){
        var ev = this.impactEvent;
        for(var i=0; i!==np.contactEquations.length; i++){
            var eq = np.contactEquations[i];
            if(eq.firstImpact){
                ev.bodyA = eq.bodyA;
                ev.bodyB = eq.bodyB;
                ev.shapeA = eq.shapeA;
                ev.shapeB = eq.shapeB;
                ev.contactEquation = eq;
                this.emit(ev);
            }
        }
    }

    // Sleeping update
    if(this.sleepMode === World.BODY_SLEEPING){
        for(i=0; i!==Nbodies; i++){
            bodies[i].sleepTick(this.time, false, dt);
        }
    } else if(this.sleepMode === World.ISLAND_SLEEPING && this.islandSplit){

        // Tell all bodies to sleep tick but dont sleep yet
        for(i=0; i!==Nbodies; i++){
            bodies[i].sleepTick(this.time, true, dt);
        }

        // Sleep islands
        for(var i=0; i<this.islandManager.islands.length; i++){
            var island = this.islandManager.islands[i];
            if(island.wantsToSleep()){
                island.sleep();
            }
        }
    }

    this.stepping = false;

    // Remove bodies that are scheduled for removal
    if(this.bodiesToBeRemoved.length){
        for(var i=0; i!==this.bodiesToBeRemoved.length; i++){
            this.removeBody(this.bodiesToBeRemoved[i]);
        }
        this.bodiesToBeRemoved.length = 0;
    }

    this.emit(this.postStepEvent);
};

/**
 * Runs narrowphase for the shape pair i and j.
 * @method runNarrowphase
 * @param  {Narrowphase} np
 * @param  {Body} bi
 * @param  {Shape} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Shape} sj
 * @param  {Array} xj
 * @param  {Number} aj
 * @param  {Number} mu
 */
World.prototype.runNarrowphase = function(np,bi,si,xi,ai,bj,sj,xj,aj,cm,glen){

    // Check collision groups and masks
    if(!((si.collisionGroup & sj.collisionMask) !== 0 && (sj.collisionGroup & si.collisionMask) !== 0)){
        return;
    }

    // Get world position and angle of each shape
    vec2.rotate(xiw, xi, bi.angle);
    vec2.rotate(xjw, xj, bj.angle);
    vec2.add(xiw, xiw, bi.position);
    vec2.add(xjw, xjw, bj.position);
    var aiw = ai + bi.angle;
    var ajw = aj + bj.angle;

    np.enableFriction = cm.friction > 0;
    np.frictionCoefficient = cm.friction;
    var reducedMass;
    if(bi.type === Body.STATIC || bi.type === Body.KINEMATIC){
        reducedMass = bj.mass;
    } else if(bj.type === Body.STATIC || bj.type === Body.KINEMATIC){
        reducedMass = bi.mass;
    } else {
        reducedMass = (bi.mass*bj.mass)/(bi.mass+bj.mass);
    }
    np.slipForce = cm.friction*glen*reducedMass;
    np.restitution = cm.restitution;
    np.surfaceVelocity = cm.surfaceVelocity;
    np.frictionStiffness = cm.frictionStiffness;
    np.frictionRelaxation = cm.frictionRelaxation;
    np.stiffness = cm.stiffness;
    np.relaxation = cm.relaxation;
    np.contactSkinSize = cm.contactSkinSize;
    np.enabledEquations = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;

    var resolver = np[si.type | sj.type],
        numContacts = 0;
    if (resolver) {
        var sensor = si.sensor || sj.sensor;
        var numFrictionBefore = np.frictionEquations.length;
        if (si.type < sj.type) {
            numContacts = resolver.call(np, bi,si,xiw,aiw, bj,sj,xjw,ajw, sensor);
        } else {
            numContacts = resolver.call(np, bj,sj,xjw,ajw, bi,si,xiw,aiw, sensor);
        }
        var numFrictionEquations = np.frictionEquations.length - numFrictionBefore;

        if(numContacts){

            if( bi.allowSleep &&
                bi.type === Body.DYNAMIC &&
                bi.sleepState  === Body.SLEEPING &&
                bj.sleepState  === Body.AWAKE &&
                bj.type !== Body.STATIC
            ){
                var speedSquaredB = vec2.squaredLength(bj.velocity) + Math.pow(bj.angularVelocity,2);
                var speedLimitSquaredB = Math.pow(bj.sleepSpeedLimit,2);
                if(speedSquaredB >= speedLimitSquaredB*2){
                    bi._wakeUpAfterNarrowphase = true;
                }
            }

            if( bj.allowSleep &&
                bj.type === Body.DYNAMIC &&
                bj.sleepState  === Body.SLEEPING &&
                bi.sleepState  === Body.AWAKE &&
                bi.type !== Body.STATIC
            ){
                var speedSquaredA = vec2.squaredLength(bi.velocity) + Math.pow(bi.angularVelocity,2);
                var speedLimitSquaredA = Math.pow(bi.sleepSpeedLimit,2);
                if(speedSquaredA >= speedLimitSquaredA*2){
                    bj._wakeUpAfterNarrowphase = true;
                }
            }

            this.overlapKeeper.setOverlapping(bi, si, bj, sj);
            if(this.has('beginContact') && this.overlapKeeper.isNewOverlap(si, sj)){

                // Report new shape overlap
                var e = this.beginContactEvent;
                e.shapeA = si;
                e.shapeB = sj;
                e.bodyA = bi;
                e.bodyB = bj;

                // Reset contact equations
                e.contactEquations.length = 0;

                if(typeof(numContacts)==="number"){
                    for(var i=np.contactEquations.length-numContacts; i<np.contactEquations.length; i++){
                        e.contactEquations.push(np.contactEquations[i]);
                    }
                }

                this.emit(e);
            }

            // divide the max friction force by the number of contacts
            if(typeof(numContacts)==="number" && numFrictionEquations > 1){ // Why divide by 1?
                for(var i=np.frictionEquations.length-numFrictionEquations; i<np.frictionEquations.length; i++){
                    var f = np.frictionEquations[i];
                    f.setSlipForce(f.getSlipForce() / numFrictionEquations);
                }
            }
        }
    }

};

/**
 * Add a spring to the simulation
 *
 * @method addSpring
 * @param {Spring} s
 */
World.prototype.addSpring = function(s){
    this.springs.push(s);
    this.addSpringEvent.spring = s;
    this.emit(this.addSpringEvent);
};

/**
 * Remove a spring
 *
 * @method removeSpring
 * @param {Spring} s
 */
World.prototype.removeSpring = function(s){
    var idx = this.springs.indexOf(s);
    if(idx!==-1){
        Utils.splice(this.springs,idx,1);
    }
};

/**
 * Add a body to the simulation
 *
 * @method addBody
 * @param {Body} body
 *
 * @example
 *     var world = new World(),
 *         body = new Body();
 *     world.addBody(body);
 * @todo What if this is done during step?
 */
World.prototype.addBody = function(body){
    if(this.bodies.indexOf(body) === -1){
        this.bodies.push(body);
        body.world = this;
        this.addBodyEvent.body = body;
        this.emit(this.addBodyEvent);
    }
};

/**
 * Remove a body from the simulation. If this method is called during step(), the body removal is scheduled to after the step.
 *
 * @method removeBody
 * @param {Body} body
 */
World.prototype.removeBody = function(body){
    if(this.stepping){
        this.bodiesToBeRemoved.push(body);
    } else {
        body.world = null;
        var idx = this.bodies.indexOf(body);
        if(idx!==-1){
            Utils.splice(this.bodies,idx,1);
            this.removeBodyEvent.body = body;
            body.resetConstraintVelocity();
            this.emit(this.removeBodyEvent);
        }
    }
};

/**
 * Get a body by its id.
 * @method getBodyById
 * @return {Body|Boolean} The body, or false if it was not found.
 */
World.prototype.getBodyById = function(id){
    var bodies = this.bodies;
    for(var i=0; i<bodies.length; i++){
        var b = bodies[i];
        if(b.id === id){
            return b;
        }
    }
    return false;
};

/**
 * Disable collision between two bodies
 * @method disableCollision
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
World.prototype.disableBodyCollision = function(bodyA,bodyB){
    this.disabledBodyCollisionPairs.push(bodyA,bodyB);
};

/**
 * Enable collisions between the given two bodies
 * @method enableCollision
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
World.prototype.enableBodyCollision = function(bodyA,bodyB){
    var pairs = this.disabledBodyCollisionPairs;
    for(var i=0; i<pairs.length; i+=2){
        if((pairs[i] === bodyA && pairs[i+1] === bodyB) || (pairs[i+1] === bodyA && pairs[i] === bodyB)){
            pairs.splice(i,2);
            return;
        }
    }
};


function v2a(v){
    if(!v){
        return v;
    }
    return [v[0],v[1]];
}

function extend(a,b){
    for(var key in b){
        a[key] = b[key];
    }
}

function contactMaterialToJSON(cm){
    return {
        id : cm.id,
        materialA :             cm.materialA.id,
        materialB :             cm.materialB.id,
        friction :              cm.friction,
        restitution :           cm.restitution,
        stiffness :             cm.stiffness,
        relaxation :            cm.relaxation,
        frictionStiffness :     cm.frictionStiffness,
        frictionRelaxation :    cm.frictionRelaxation,
    };
}

/**
 * Resets the World, removes all bodies, constraints and springs.
 *
 * @method clear
 */
World.prototype.clear = function(){

    this.time = 0;
    this.fixedStepTime = 0;

    // Remove all solver equations
    if(this.solver && this.solver.equations.length){
        this.solver.removeAllEquations();
    }

    // Remove all constraints
    var cs = this.constraints;
    for(var i=cs.length-1; i>=0; i--){
        this.removeConstraint(cs[i]);
    }

    // Remove all bodies
    var bodies = this.bodies;
    for(var i=bodies.length-1; i>=0; i--){
        this.removeBody(bodies[i]);
    }

    // Remove all springs
    var springs = this.springs;
    for(var i=springs.length-1; i>=0; i--){
        this.removeSpring(springs[i]);
    }

    // Remove all contact materials
    var cms = this.contactMaterials;
    for(var i=cms.length-1; i>=0; i--){
        this.removeContactMaterial(cms[i]);
    }

    World.apply(this);
};

/**
 * Get a copy of this World instance
 * @method clone
 * @return {World}
 */
World.prototype.clone = function(){
    var world = new World();
    world.fromJSON(this.toJSON());
    return world;
};

var hitTest_tmp1 = vec2.create(),
    hitTest_zero = vec2.fromValues(0,0),
    hitTest_tmp2 = vec2.fromValues(0,0);

/**
 * Test if a world point overlaps bodies
 * @method hitTest
 * @param  {Array}  worldPoint  Point to use for intersection tests
 * @param  {Array}  bodies      A list of objects to check for intersection
 * @param  {Number} precision   Used for matching against particles and lines. Adds some margin to these infinitesimal objects.
 * @return {Array}              Array of bodies that overlap the point
 */
World.prototype.hitTest = function(worldPoint,bodies,precision){
    precision = precision || 0;

    // Create a dummy particle body with a particle shape to test against the bodies
    var pb = new Body({ position:worldPoint }),
        ps = new Particle(),
        px = worldPoint,
        pa = 0,
        x = hitTest_tmp1,
        zero = hitTest_zero,
        tmp = hitTest_tmp2;
    pb.addShape(ps);

    var n = this.narrowphase,
        result = [];

    // Check bodies
    for(var i=0, N=bodies.length; i!==N; i++){
        var b = bodies[i];
        for(var j=0, NS=b.shapes.length; j!==NS; j++){
            var s = b.shapes[j],
                offset = b.shapeOffsets[j] || zero,
                angle = b.shapeAngles[j] || 0.0;

            // Get shape world position + angle
            vec2.rotate(x, offset, b.angle);
            vec2.add(x, x, b.position);
            var a = angle + b.angle;

            if( (s instanceof Circle    && n.circleParticle  (b,s,x,a,     pb,ps,px,pa, true)) ||
                (s instanceof Convex    && n.particleConvex  (pb,ps,px,pa, b,s,x,a,     true)) ||
                (s instanceof Plane     && n.particlePlane   (pb,ps,px,pa, b,s,x,a,     true)) ||
                (s instanceof Capsule   && n.particleCapsule (pb,ps,px,pa, b,s,x,a,     true)) ||
                (s instanceof Particle  && vec2.squaredLength(vec2.sub(tmp,x,worldPoint)) < precision*precision)
                ){
                result.push(b);
            }
        }
    }

    return result;
};

/**
 * Sets the Equation parameters for all constraints and contact materials.
 * @method setGlobalEquationParameters
 * @param {object} [parameters]
 * @param {Number} [parameters.relaxation]
 * @param {Number} [parameters.stiffness]
 */
World.prototype.setGlobalEquationParameters = function(parameters){
    parameters = parameters || {};

    // Set for all constraints
    for(var i=0; i !== this.constraints.length; i++){
        var c = this.constraints[i];
        for(var j=0; j !== c.equations.length; j++){
            var eq = c.equations[j];
            if(typeof(parameters.stiffness) !== "undefined"){
                eq.stiffness = parameters.stiffness;
            }
            if(typeof(parameters.relaxation) !== "undefined"){
                eq.relaxation = parameters.relaxation;
            }
            eq.needsUpdate = true;
        }
    }

    // Set for all contact materials
    for(var i=0; i !== this.contactMaterials.length; i++){
        var c = this.contactMaterials[i];
        if(typeof(parameters.stiffness) !== "undefined"){
            c.stiffness = parameters.stiffness;
            c.frictionStiffness = parameters.stiffness;
        }
        if(typeof(parameters.relaxation) !== "undefined"){
            c.relaxation = parameters.relaxation;
            c.frictionRelaxation = parameters.relaxation;
        }
    }

    // Set for default contact material
    var c = this.defaultContactMaterial;
    if(typeof(parameters.stiffness) !== "undefined"){
        c.stiffness = parameters.stiffness;
        c.frictionStiffness = parameters.stiffness;
    }
    if(typeof(parameters.relaxation) !== "undefined"){
        c.relaxation = parameters.relaxation;
        c.frictionRelaxation = parameters.relaxation;
    }
};

/**
 * Set the stiffness for all equations and contact materials.
 * @method setGlobalStiffness
 * @param {Number} stiffness
 */
World.prototype.setGlobalStiffness = function(stiffness){
    this.setGlobalEquationParameters({
        stiffness: stiffness
    });
};

/**
 * Set the relaxation for all equations and contact materials.
 * @method setGlobalRelaxation
 * @param {Number} relaxation
 */
World.prototype.setGlobalRelaxation = function(relaxation){
    this.setGlobalEquationParameters({
        relaxation: relaxation
    });
};

var tmpRay = new Ray();

/**
 * Ray cast against all bodies. The provided callback will be executed for each hit with a RaycastResult as single argument.
 * @method raycastAll
 * @param  {Vec3} from
 * @param  {Vec3} to
 * @param  {Object} options
 * @param  {number} [options.collisionMask=-1]
 * @param  {number} [options.collisionGroup=-1]
 * @param  {boolean} [options.skipBackfaces=false]
 * @param  {boolean} [options.checkCollisionResponse=true]
 * @param  {Function} callback
 * @return {boolean} True if any body was hit.
 */
World.prototype.raycastAll = function(from, to, options, callback){
    options.mode = Ray.ALL;
    options.from = from;
    options.to = to;
    options.callback = callback;
    return tmpRay.intersectWorld(this, options);
};

/**
 * Ray cast, and stop at the first result. Note that the order is random - but the method is fast.
 * @method raycastAny
 * @param  {Vec3} from
 * @param  {Vec3} to
 * @param  {Object} options
 * @param  {number} [options.collisionMask=-1]
 * @param  {number} [options.collisionGroup=-1]
 * @param  {boolean} [options.skipBackfaces=false]
 * @param  {boolean} [options.checkCollisionResponse=true]
 * @param  {RaycastResult} result
 * @return {boolean} True if any body was hit.
 */
World.prototype.raycastAny = function(from, to, options, result){
    options.mode = Ray.ANY;
    options.from = from;
    options.to = to;
    options.result = result;
    return tmpRay.intersectWorld(this, options);
};

/**
 * Ray cast, and return information of the closest hit.
 * @method raycastClosest
 * @param  {Vec3} from
 * @param  {Vec3} to
 * @param  {Object} options
 * @param  {number} [options.collisionMask=-1]
 * @param  {number} [options.collisionGroup=-1]
 * @param  {boolean} [options.skipBackfaces=false]
 * @param  {boolean} [options.checkCollisionResponse=true]
 * @param  {RaycastResult} result
 * @return {boolean} True if any body was hit.
 */
World.prototype.raycastClosest = function(from, to, options, result){
    options.mode = Ray.CLOSEST;
    options.from = from;
    options.to = to;
    options.result = result;
    return tmpRay.intersectWorld(this, options);
};

},
function(require, exports, module, global) {

module.exports = {
  "name": "p2",
  "version": "0.6.1",
  "description": "A JavaScript 2D physics engine.",
  "author": {
    "name": "Stefan Hedman",
    "email": "schteppe@gmail.com",
    "url": "http://steffe.se"
  },
  "keywords": [
    "p2.js",
    "p2",
    "physics",
    "engine",
    "2d"
  ],
  "main": "./src/p2.js",
  "engines": {
    "node": "*"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/schteppe/p2.js.git"
  },
  "bugs": {
    "url": "https://github.com/schteppe/p2.js/issues"
  },
  "licenses": [
    {
      "type": "MIT"
    }
  ],
  "devDependencies": {
    "grunt": "~0.4.0",
    "grunt-contrib-jshint": "~0.9.2",
    "grunt-contrib-nodeunit": "~0.1.2",
    "grunt-contrib-uglify": "~0.4.0",
    "grunt-contrib-watch": "~0.5.0",
    "grunt-browserify": "~2.0.1",
    "grunt-contrib-concat": "^0.4.0"
  },
  "dependencies": {
    "poly-decomp": "0.1.0"
  },
  "homepage": "https://github.com/schteppe/p2.js",
  "_id": "p2@0.6.1",
  "dist": {
    "shasum": "b26fe8bc319ef0d89c18f975dd8ca2399f876b53",
    "tarball": "http://registry.npmjs.org/p2/-/p2-0.6.1.tgz"
  },
  "_from": "p2@0.6.1",
  "_npmVersion": "1.4.3",
  "_npmUser": {
    "name": "schteppe",
    "email": "schteppe@gmail.com"
  },
  "maintainers": [
    {
      "name": "schteppe",
      "email": "schteppe@gmail.com"
    }
  ],
  "directories": {},
  "_shasum": "b26fe8bc319ef0d89c18f975dd8ca2399f876b53",
  "_resolved": "https://registry.npmjs.org/p2/-/p2-0.6.1.tgz"
}


},
function(require, exports, module, global) {

var TupleDictionary = require(224);
var Utils = require(192);

module.exports = OverlapKeeper;

/**
 * Keeps track of overlaps in the current state and the last step state.
 * @class OverlapKeeper
 * @constructor
 */
function OverlapKeeper() {
    this.overlappingShapesLastState = new TupleDictionary();
    this.overlappingShapesCurrentState = new TupleDictionary();
    this.recordPool = [];
    this.tmpDict = new TupleDictionary();
    this.tmpArray1 = [];
}

/**
 * Ticks one step forward in time. This will move the current overlap state to the "old" overlap state, and create a new one as current.
 * @method tick
 */
OverlapKeeper.prototype.tick = function() {
    var last = this.overlappingShapesLastState;
    var current = this.overlappingShapesCurrentState;

    // Save old objects into pool
    var l = last.keys.length;
    while(l--){
        var key = last.keys[l];
        var lastObject = last.getByKey(key);
        var currentObject = current.getByKey(key);
        if(lastObject && !currentObject){
            // The record is only used in the "last" dict, and will be removed. We might as well pool it.
            this.recordPool.push(lastObject);
        }
    }

    // Clear last object
    last.reset();

    // Transfer from new object to old
    last.copy(current);

    // Clear current object
    current.reset();
};

/**
 * @method setOverlapping
 * @param {Body} bodyA
 * @param {Body} shapeA
 * @param {Body} bodyB
 * @param {Body} shapeB
 */
OverlapKeeper.prototype.setOverlapping = function(bodyA, shapeA, bodyB, shapeB) {
    var last = this.overlappingShapesLastState;
    var current = this.overlappingShapesCurrentState;

    // Store current contact state
    if(!current.get(shapeA.id, shapeB.id)){

        var data;
        if(this.recordPool.length){
            data = this.recordPool.pop();
            data.set(bodyA, shapeA, bodyB, shapeB);
        } else {
            data = new OverlapKeeperRecord(bodyA, shapeA, bodyB, shapeB);
        }

        current.set(shapeA.id, shapeB.id, data);
    }
};

OverlapKeeper.prototype.getNewOverlaps = function(result){
    return this.getDiff(this.overlappingShapesLastState, this.overlappingShapesCurrentState, result);
};

OverlapKeeper.prototype.getEndOverlaps = function(result){
    return this.getDiff(this.overlappingShapesCurrentState, this.overlappingShapesLastState, result);
};

/**
 * Checks if two bodies are currently overlapping.
 * @method bodiesAreOverlapping
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {boolean}
 */
OverlapKeeper.prototype.bodiesAreOverlapping = function(bodyA, bodyB){
    var current = this.overlappingShapesCurrentState;
    var l = current.keys.length;
    while(l--){
        var key = current.keys[l];
        var data = current.data[key];
        if((data.bodyA === bodyA && data.bodyB === bodyB) || data.bodyA === bodyB && data.bodyB === bodyA){
            return true;
        }
    }
    return false;
};

OverlapKeeper.prototype.getDiff = function(dictA, dictB, result){
    var result = result || [];
    var last = dictA;
    var current = dictB;

    result.length = 0;

    var l = current.keys.length;
    while(l--){
        var key = current.keys[l];
        var data = current.data[key];

        if(!data){
            throw new Error('Key '+key+' had no data!');
        }

        var lastData = last.data[key];
        if(!lastData){
            // Not overlapping in last state, but in current.
            result.push(data);
        }
    }

    return result;
};

OverlapKeeper.prototype.isNewOverlap = function(shapeA, shapeB){
    var idA = shapeA.id|0,
        idB = shapeB.id|0;
    var last = this.overlappingShapesLastState;
    var current = this.overlappingShapesCurrentState;
    // Not in last but in new
    return !!!last.get(idA, idB) && !!current.get(idA, idB);
};

OverlapKeeper.prototype.getNewBodyOverlaps = function(result){
    this.tmpArray1.length = 0;
    var overlaps = this.getNewOverlaps(this.tmpArray1);
    return this.getBodyDiff(overlaps, result);
};

OverlapKeeper.prototype.getEndBodyOverlaps = function(result){
    this.tmpArray1.length = 0;
    var overlaps = this.getEndOverlaps(this.tmpArray1);
    return this.getBodyDiff(overlaps, result);
};

OverlapKeeper.prototype.getBodyDiff = function(overlaps, result){
    result = result || [];
    var accumulator = this.tmpDict;

    var l = overlaps.length;

    while(l--){
        var data = overlaps[l];

        // Since we use body id's for the accumulator, these will be a subset of the original one
        accumulator.set(data.bodyA.id|0, data.bodyB.id|0, data);
    }

    l = accumulator.keys.length;
    while(l--){
        var data = accumulator.getByKey(accumulator.keys[l]);
        if(data){
            result.push(data.bodyA, data.bodyB);
        }
    }

    accumulator.reset();

    return result;
};

/**
 * Overlap data container for the OverlapKeeper
 * @class OverlapKeeperRecord
 * @constructor
 * @param {Body} bodyA
 * @param {Shape} shapeA
 * @param {Body} bodyB
 * @param {Shape} shapeB
 */
function OverlapKeeperRecord(bodyA, shapeA, bodyB, shapeB){
    /**
     * @property {Shape} shapeA
     */
    this.shapeA = shapeA;
    /**
     * @property {Shape} shapeB
     */
    this.shapeB = shapeB;
    /**
     * @property {Body} bodyA
     */
    this.bodyA = bodyA;
    /**
     * @property {Body} bodyB
     */
    this.bodyB = bodyB;
}

/**
 * Set the data for the record
 * @method set
 * @param {Body} bodyA
 * @param {Shape} shapeA
 * @param {Body} bodyB
 * @param {Shape} shapeB
 */
OverlapKeeperRecord.prototype.set = function(bodyA, shapeA, bodyB, shapeB){
    OverlapKeeperRecord.call(this, bodyA, shapeA, bodyB, shapeB);
};


},
function(require, exports, module, global) {

var vec2 = require(191)
,   Island = require(241)
,   IslandNode = require(242)
,   Body = require(195);

module.exports = IslandManager;

/**
 * Splits the system of bodies and equations into independent islands
 *
 * @class IslandManager
 * @constructor
 * @param {Object} [options]
 * @extends Solver
 */
function IslandManager(options){

    // Pooling of node objects saves some GC load
    this._nodePool = [];
    this._islandPool = [];

    /**
     * The equations to split. Manually fill this array before running .split().
     * @property {Array} equations
     */
    this.equations = [];

    /**
     * The resulting {{#crossLink "Island"}}{{/crossLink}}s.
     * @property {Array} islands
     */
    this.islands = [];

    /**
     * The resulting graph nodes.
     * @property {Array} nodes
     */
    this.nodes = [];

    /**
     * The node queue, used when traversing the graph of nodes.
     * @private
     * @property {Array} queue
     */
    this.queue = [];
}

/**
 * Get an unvisited node from a list of nodes.
 * @static
 * @method getUnvisitedNode
 * @param  {Array} nodes
 * @return {IslandNode|boolean} The node if found, else false.
 */
IslandManager.getUnvisitedNode = function(nodes){
    var Nnodes = nodes.length;
    for(var i=0; i!==Nnodes; i++){
        var node = nodes[i];
        if(!node.visited && node.body.type === Body.DYNAMIC){
            return node;
        }
    }
    return false;
};

/**
 * Visit a node.
 * @method visit
 * @param  {IslandNode} node
 * @param  {Array} bds
 * @param  {Array} eqs
 */
IslandManager.prototype.visit = function (node,bds,eqs){
    bds.push(node.body);
    var Neqs = node.equations.length;
    for(var i=0; i!==Neqs; i++){
        var eq = node.equations[i];
        if(eqs.indexOf(eq) === -1){ // Already added?
            eqs.push(eq);
        }
    }
};

/**
 * Runs the search algorithm, starting at a root node. The resulting bodies and equations will be stored in the provided arrays.
 * @method bfs
 * @param  {IslandNode} root The node to start from
 * @param  {Array} bds  An array to append resulting Bodies to.
 * @param  {Array} eqs  An array to append resulting Equations to.
 */
IslandManager.prototype.bfs = function(root,bds,eqs){

    // Reset the visit queue
    var queue = this.queue;
    queue.length = 0;

    // Add root node to queue
    queue.push(root);
    root.visited = true;
    this.visit(root,bds,eqs);

    // Process all queued nodes
    while(queue.length) {

        // Get next node in the queue
        var node = queue.pop();

        // Visit unvisited neighboring nodes
        var child;
        while((child = IslandManager.getUnvisitedNode(node.neighbors))) {
            child.visited = true;
            this.visit(child,bds,eqs);

            // Only visit the children of this node if it's dynamic
            if(child.body.type === Body.DYNAMIC){
                queue.push(child);
            }
        }
    }
};

/**
 * Split the world into independent islands. The result is stored in .islands.
 * @method split
 * @param  {World} world
 * @return {Array} The generated islands
 */
IslandManager.prototype.split = function(world){
    var bodies = world.bodies,
        nodes = this.nodes,
        equations = this.equations;

    // Move old nodes to the node pool
    while(nodes.length){
        this._nodePool.push(nodes.pop());
    }

    // Create needed nodes, reuse if possible
    for(var i=0; i!==bodies.length; i++){
        if(this._nodePool.length){
            var node = this._nodePool.pop();
            node.reset();
            node.body = bodies[i];
            nodes.push(node);
        } else {
            nodes.push(new IslandNode(bodies[i]));
        }
    }

    // Add connectivity data. Each equation connects 2 bodies.
    for(var k=0; k!==equations.length; k++){
        var eq=equations[k],
            i=bodies.indexOf(eq.bodyA),
            j=bodies.indexOf(eq.bodyB),
            ni=nodes[i],
            nj=nodes[j];
        ni.neighbors.push(nj);
        nj.neighbors.push(ni);
        ni.equations.push(eq);
        nj.equations.push(eq);
    }

    // Move old islands to the island pool
    var islands = this.islands;
    while(islands.length){
        var island = islands.pop();
        island.reset();
        this._islandPool.push(island);
    }

    // Get islands
    var child;
    while((child = IslandManager.getUnvisitedNode(nodes))){

        // Create new island
        var island = this._islandPool.length ? this._islandPool.pop() : new Island();

        // Get all equations and bodies in this island
        this.bfs(child, island.bodies, island.equations);

        islands.push(island);
    }

    return islands;
};


},
function(require, exports, module, global) {

var Body = require(195);

module.exports = Island;

/**
 * An island of bodies connected with equations.
 * @class Island
 * @constructor
 */
function Island(){

    /**
     * Current equations in this island.
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * Current bodies in this island.
     * @property bodies
     * @type {Array}
     */
    this.bodies = [];
}

/**
 * Clean this island from bodies and equations.
 * @method reset
 */
Island.prototype.reset = function(){
    this.equations.length = this.bodies.length = 0;
};

var bodyIds = [];

/**
 * Get all unique bodies in this island.
 * @method getBodies
 * @return {Array} An array of Body
 */
Island.prototype.getBodies = function(result){
    var bodies = result || [],
        eqs = this.equations;
    bodyIds.length = 0;
    for(var i=0; i!==eqs.length; i++){
        var eq = eqs[i];
        if(bodyIds.indexOf(eq.bodyA.id)===-1){
            bodies.push(eq.bodyA);
            bodyIds.push(eq.bodyA.id);
        }
        if(bodyIds.indexOf(eq.bodyB.id)===-1){
            bodies.push(eq.bodyB);
            bodyIds.push(eq.bodyB.id);
        }
    }
    return bodies;
};

/**
 * Check if the entire island wants to sleep.
 * @method wantsToSleep
 * @return {Boolean}
 */
Island.prototype.wantsToSleep = function(){
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i];
        if(b.type === Body.DYNAMIC && !b.wantsToSleep){
            return false;
        }
    }
    return true;
};

/**
 * Make all bodies in the island sleep.
 * @method sleep
 */
Island.prototype.sleep = function(){
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i];
        b.sleep();
    }
    return true;
};


},
function(require, exports, module, global) {

module.exports = IslandNode;

/**
 * Holds a body and keeps track of some additional properties needed for graph traversal.
 * @class IslandNode
 * @constructor
 * @param {Body} body
 */
function IslandNode(body){

	/**
	 * The body that is contained in this node.
	 * @property {Body} body
	 */
    this.body = body;

    /**
     * Neighboring IslandNodes
     * @property {Array} neighbors
     */
    this.neighbors = [];

    /**
     * Equations connected to this node.
     * @property {Array} equations
     */
    this.equations = [];

    /**
     * If this node was visiting during the graph traversal.
     * @property visited
     * @type {Boolean}
     */
    this.visited = false;
}

/**
 * Clean this node from bodies and equations.
 * @method reset
 */
IslandNode.prototype.reset = function(){
    this.equations.length = 0;
    this.neighbors.length = 0;
    this.visited = false;
    this.body = null;
};


},
function(require, exports, module, global) {

var odin = require(1),
    p2 = require(189);


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


},
function(require, exports, module, global) {

var odin = require(1),
    vec2 = require(68),
    vec3 = require(38),
    quat = require(154),
    p2 = require(189);


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


}], void 0, (new Function("return this;"))()));
