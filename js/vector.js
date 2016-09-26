/**
 * Created by McMacker4 on 26/09/2016.
 */
function Vector(x, y) {
    if(typeof x == 'number' && typeof y == 'number') {
        this.x = x;
        this.y = y;
    } else if(x instanceof Vector) {
        this.x = x.x;
        this.y = x.y;
    } else {
        console.error("Invalid parameter type.");
    }
}

Vector.prototype.add = function(x, y) {
    if(x instanceof Vector) {
        this.x += x.x;
        this.y += x.y;
    } else if(typeof x == 'number' && typeof y == 'number') {
        this.x += x;
        this.y += y;
    } else {
        console.error("Invalid parameter type.");
    }
    return this;
};

Vector.prototype.sub = function(x, y) {
    if(x instanceof Vector) {
        this.x -= x.x;
        this.y -= x.y;
    } else if(typeof x == 'number' && typeof y == 'number') {
        this.x -= x;
        this.y -= y;
    } else {
        console.error("Invalid parameter type.");
    }
    return this;
};

Vector.prototype.normalize = function() {
    var len = this.length();
    this.x /= len;
    this.y /= len;
    return this;
};

Vector.prototype.length = function() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};

Vector.prototype.scale = function(scl) {
    if(typeof scl == 'number') {
        this.x *= scl;
        this.y *= scl;
    } else {
        console.error("Invalid parameter type.");
    }
    return this;
};

Vector.prototype.set = function(x, y) {
    if(typeof x == 'number' && typeof y == 'number') {
        this.x = x;
        this.y = y;
    } else {
        console.error("Invalid parameter type.");
    }
};

Vector.prototype.dist = function(vec) {
    return Math.sqrt(Math.pow(Math.abs(vec.x - this.x), 2) + Math.pow(Math.abs(vec.y - this.y), 2));
};

Vector.prototype.rotate = function(angle) {
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    var x = this.x * cos - this.y * sin;
    var y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
};

function toRadians(deg) {
    return deg * Math.PI / 180;
}
