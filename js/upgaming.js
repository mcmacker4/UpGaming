//Author: McMacker4 (Hans) Under MIT License - 2016

var main_canvas = document.getElementById("upgaming");
var trail_canvas = document.getElementById("trail_canvas");
var g = main_canvas.getContext('2d');
var trail_g = trail_canvas.getContext('2d');

var startTime = Date.now();
var lastFrame = 0;
var delta = 0;
var frameCount = 0;
var lastFps = 0;
var FPS = 0;

var aliveTime = 0;

var startingEnemies = 5;
var maxEnemies = startingEnemies;

var debugEnabled = false;

var lastBullet = 0;

var score = 0;

main_canvas.width = window.innerWidth;
main_canvas.height = window.innerHeight;
trail_canvas.width = main_canvas.width;
trail_canvas.height = main_canvas.height;

function frame() {
    calculateFPS();
    update();
    render();
    requestAnimationFrame(frame);
}

function update() {
    if(player.dead) return;
    aliveTime += delta;
    maxEnemies = startingEnemies + Math.round((Date.now() - startTime) / 30000);
    player.update();
    Bullet.shoot();
    Bullet.updateAll();
    Enemy.updateAll();
    TextParticle.updateAll();
}

function render() {
    clear();
    Bullet.renderAll();
    player.render();
    Enemy.renderAll();
    TextParticle.renderAll();
    drawDebugInfo();
    drawInfo();
}

function clear() {
    g.fillStyle = "#000";
    g.fillRect(0, 0, main_canvas.width, main_canvas.height);
}

function reset() {
    enemies = [];
    bullets = [];
    textParticles = [];
    score = 0;
    aliveTime = 0;
    maxEnemies = startingEnemies;
    player = new Player();
}

function drawInfo() {
    g.font = "20px Verdana";
    g.fontWeight = "normal";
    g.fillStyle = "#FFF";

    var milliseconds = parseInt((aliveTime%1000)/100)
        , seconds = parseInt((aliveTime/1000)%60)
        , minutes = parseInt((aliveTime/(1000*60))%60)
        , hours = parseInt((aliveTime/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    var time = hours + ":" + minutes + ":" + seconds + "." + milliseconds;

    g.fillText("Health: ", main_canvas.width - g.measureText("Health: ").width - 120, 20);
    g.fillText("Time: " + time, main_canvas.width - g.measureText("Time: " + time).width - 10, 20 + 22);
    g.fillText("Score: " + Math.round(score), main_canvas.width - g.measureText("Score: " + Math.round(score)).width - 10, 20 + 22 * 2);

    g.fillStyle = "#0C0";
    g.fillRect(main_canvas.width - 110, 3, 100, 16);

    g.fillStyle = "#C00";
    var width = 100 - (player.hp / Player.maxHealth * 100);
    g.fillRect(main_canvas.width - 10 - width, 3, width, 16);

    if (player.dead) {
        g.font = "120px Verdana";
        g.fontWeight = "bold";
        g.fillStyle = "#FFF";
        g.fillText("DEAD", main_canvas.width / 2 - g.measureText("DEAD").width / 2, main_canvas.height / 2);
        g.font = "16px Verdana";
        g.fillText("Press SPACE to restart.", main_canvas.width / 2 - g.measureText("Press SPACE to restart.").width / 2, main_canvas.height / 2 + 18);
    }
}

function calculateFPS() {
    var now = Date.now();
    delta = now - lastFrame;
    lastFrame = now;
    if(now - lastFps > 1000) {
        FPS = frameCount;
        frameCount = 0;
        lastFps = now;
    }
    frameCount++;
}

function drawDebugInfo() {
    if(!debugEnabled)
        return;
    g.font = "14px Verdana";
    g.fontWeight = "normal";
    g.fillStyle = "#FFF";
    g.fillText("McMacker4.com © 2016", main_canvas.width - 170, main_canvas.height - 3);
    g.fillText("DT: " + delta, 10, 20);
    g.fillText("FPS: " + FPS, 10, 20 + 18);
    g.fillText("Bullets: " + bullets.length, 10, 20 + 18 * 2);
    g.fillText("Enemies: " + enemies.length, 10, 20 + 18 * 3);
    g.fillText("Dist player <-> mouse: " + player.pos.dist(mousePos), 10, 20 + 18 * 4);
    g.fillText("Player HP: " + player.hp + " (" + (player.dead ? "" : "not ") + "dead)", 10, 20 + 18 * 5)
    g.fillText("'R' to disable debug.", 10, 20 + 18 * 6);
}


//================== EVENTS ====================

var KEY_W = 87,
    KEY_A = 65,
    KEY_S = 83,
    KEY_D = 68,
    KEY_R = 82,
    KEY_X = 88,
    KEY_SPACE = 32,
    ARROW_UP = 38,
    ARROW_DOWN = 40,
    ARROW_RIGHT = 39,
    ARROW_LEFT = 37;

window.onresize = function() {
    main_canvas.width = window.innerWidth;
    main_canvas.height = window.innerHeight;
    trail_canvas.width = main_canvas.width;
    trail_canvas.height = main_canvas.height;
    render();
};

var keyStates = {};
window.onkeydown = function(evt) {
    keyStates[evt.keyCode] = true;
};
window.onkeyup = function(evt) {
    keyStates[evt.keyCode] = false;
    if(evt.keyCode == KEY_R)
        debugEnabled = !debugEnabled;
    if((player.dead && evt.keyCode == KEY_SPACE) || evt.keyCode == KEY_X)
        reset();
};

var mousePos = { x: 0, y: 0 };
var mouseDown = false;
main_canvas.onmousemove = function(evt) {
    mousePos.x = evt.pageX;
    mousePos.y = evt.pageY;
};

main_canvas.onmousedown = function() {
    mouseDown = true;
};

main_canvas.onmouseup = function() {
    mouseDown = false;
};

main_canvas.onmouseleave = function() {
    mouseDown = false;
};

//================== CLASSES ====================
//-------Player--------------

Player.speed = 3;
Player.bulletSpeed = 10;
Player.maxHealth = 100;

var player = new Player();
function Player() {
    this.pos = new Vector(main_canvas.width / 2, main_canvas.height / 2);
    this.dir = new Vector(0, 0);
    this.hp = Player.maxHealth;
    this.dead = false;
}

Player.prototype.update = function() {

    var rad = this.hp * 0.05 + 10;

    if(keyStates[KEY_A] && !keyStates[KEY_D])
        this.dir.x = -1;
    else if(keyStates[KEY_D] && !keyStates[KEY_A])
        this.dir.x = 1;
    else
        this.dir.x = 0;

    if(keyStates[KEY_W] && !keyStates[KEY_S])
        this.dir.y = -1;
    else if(keyStates[KEY_S] && !keyStates[KEY_W])
        this.dir.y = 1;
    else
        this.dir.y = 0;

    if(this.dir.length() > 0) {
        this.dir.normalize();
        this.dir.scale(Player.speed);
        this.pos.add(this.dir);
    }

    if(this.pos.x < rad)
        this.pos.x = rad;
    if(this.pos.y < rad)
        this.pos.y = rad;
    if(this.pos.x > main_canvas.width - rad)
        this.pos.x = main_canvas.width - rad;
    if(this.pos.y > main_canvas.height - rad)
        this.pos.y = main_canvas.height - rad;
};

Player.prototype.render = function() {
    g.beginPath();
    g.fillStyle = "#39C";
    g.arc(this.pos.x, this.pos.y, this.hp * 0.1 + 10, 0, 3*Math.PI);
    g.fill();
    g.closePath();
};

Player.prototype.hit = function(dmg) {
    this.hp -= dmg;
    if(this.hp <= 0) {
        this.hp = 0;
        this.dead = true;
    }
};


//-------Enemy--------------
var enemies = [];
function Enemy() {
    this.hp = 20;
    this.dead = false;
    this.pos = new Vector(Math.random() * main_canvas.width, Math.random() * main_canvas.height);
    this.lastShot = Date.now() - Math.random() * 2500;

    while(this.pos.dist(player.pos) < Enemy.minSpawnDistance) {
        this.pos = new Vector(Math.random() * main_canvas.width, Math.random() * main_canvas.height);
    }

    if(this.pos.x == 0) this.pos.x -= this.hp + 5;
    else this.pos.x += this.hp + 5;
    if(this.pos.y == 0) this.pos.y -= this.hp + 5;
    else this.pos.y += this.hp + 5;
}

Enemy.speed = 1;
Enemy.bulletSpeed = 6;
Enemy.minSpawnDistance = 300;

Enemy.prototype.update = function() {
    var now = Date.now();

    var distToPlayer = this.pos.dist(player.pos);
    if(distToPlayer > 260) {
        this.pos.add(new Vector(player.pos).sub(this.pos).normalize().scale(Enemy.speed));
    } else if(distToPlayer < 240) {
        this.pos.add(new Vector(player.pos).sub(this.pos).normalize().scale(-Enemy.speed));
    }

    if(now - this.lastShot > 2500 && this.pos.dist(player.pos) < 500) {
        this.shoot();
        this.lastShot = now;
    }

};

Enemy.prototype.render = function() {
    g.beginPath();
    g.fillStyle = "#F44";
    g.strokeStyle = "#A00";
    g.lineWidth = 2;
    g.arc(this.pos.x, this.pos.y, this.hp + 5, 0, 2*Math.PI);
    g.fill();
    g.stroke();
    g.closePath();
    if(debugEnabled) {
        g.font = "14px Verdana";
        g.fontWeight = "normal";
        g.fillStyle = "#FFF";
        var txt = this.hp + "hp";
        g.fillText(txt, this.pos.x - (g.measureText(txt).width / 2), this.pos.y + 4);
    }
};

Enemy.prototype.hit = function(dmg) {
    this.hp -= dmg;
    if(this.hp <= 0) {
        this.dead = true;
        score += 100;
        TextParticle.spawn("+100", this.pos);
    }
};

Enemy.prototype.shoot = function() {
    var bulletDir = new Vector(player.pos).sub(this.pos).normalize();
    bullets.push(new Bullet(this.pos, bulletDir.scale(Enemy.bulletSpeed), "#90F"));
};

Enemy.updateAll = function () {
    for(var i = 0; i < maxEnemies; i++) {
        if(i >= enemies.length) {
            enemies.push(new Enemy());
        }
        enemies[i].update();
        if(enemies[i].dead)
            enemies.splice(i--, 1);
    }
};

Enemy.renderAll = function() {
    for(var j = 0; j < enemies.length; j++) {
        enemies[j].render();
    }
};

//-------Bullet--------------
var bullets = [];
function Bullet(pos, dir, color) {
    this.pos = new Vector(pos);
    this.spawnPoint = new Vector(pos);
    this.dir = dir;
    this.size = 3;
    this.color = (typeof color == 'undefined') ? "#0F0" : color;
}

Bullet.shootFreq = 10;

Bullet.prototype.update = function() {
    this.pos.add(this.dir);
};

Bullet.prototype.render = function() {
    trail_g.beginPath();
    trail_g.fillStyle = this.color;
    trail_g.arc(this.pos.x, this.pos.y, this.size, 0, 2*Math.PI);
    trail_g.fill();
    trail_g.closePath();
};

Bullet.updateAll = function() {
    for (var i = 0; i < bullets.length; i++) {
        var bullet = bullets[i];
        if (bullet.pos.x < 0 || bullet.pos.x > main_canvas.width || bullet.pos.y < 0 || bullet.pos.y > main_canvas.height) {
            bullets.splice(i--, 1);
        } else {
            bullet.update();
            if(bullet.color == "#0F0") {
                for (var j = 0; j < enemies.length; j++) {
                    var enemy = enemies[j];
                    if (bullet.pos.dist(enemy.pos) < enemy.hp + 5 + bullet.size) {
                        var dist = bullet.spawnPoint.dist(enemy.pos);
                        var dmg = dist < 350 ? 5 - 0.0000325 * Math.pow(bullet.spawnPoint.dist(enemy.pos), 2) : 1;
                        enemy.hit(dmg);
                        score += dmg;
                        //bullets.splice(i--, 1);
                        break;
                    }
                }
            } else if(bullet.color == "#90F") {
                if (bullet.pos.dist(player.pos) < player.hp * 0.1 + 10 + bullet.size) {
                    var dist = bullet.spawnPoint.dist(player.pos);
                    var dmg = dist < 350 ? 5 - 0.0000325 * Math.pow(bullet.spawnPoint.dist(player.pos), 2) : 1;
                    player.hit(dmg);
                    bullets.splice(i--, 1);
                    break;
                }
            }
        }
    }
};

Bullet.renderAll = function() {
    if(!player.dead) {
        trail_g.fillStyle = "rgba(0, 0, 0, .2)";
        trail_g.fillRect(0, 0, trail_canvas.width, trail_canvas.height);
        for (var i = 0; i < bullets.length; i++)
            bullets[i].render();
    }
    g.drawImage(trail_canvas, 0, 0, main_canvas.width, main_canvas.height);
};

Bullet.shoot = function() {
    var now = Date.now();
    if(now - lastBullet < 1000 / Bullet.shootFreq)
        return;
    var pos = new Vector(player.pos.x, player.pos.y);
    var dir = null;
    if(mouseDown) {
        dir = new Vector(mousePos.x - player.pos.x, mousePos.y - player.pos.y).normalize().scale(Player.bulletSpeed).add(player.dir.scale(0.2));
    } else if(keyStates[ARROW_UP]) {
        dir = new Vector(0, -1).scale(Player.bulletSpeed).add(player.dir.scale(0.2));
    } else if(keyStates[ARROW_DOWN]) {
        dir = new Vector(0, 1).scale(Player.bulletSpeed).add(player.dir.scale(0.2));
    } else if(keyStates[ARROW_RIGHT]) {
        dir = new Vector(1, 0).scale(Player.bulletSpeed).add(player.dir.scale(0.2));
    } else if(keyStates[ARROW_LEFT]) {
        dir = new Vector(-1, 0).scale(Player.bulletSpeed).add(player.dir.scale(0.2));
    }
    if(dir != null) {
        bullets.push(new Bullet(pos, dir));
        lastBullet = now;
    }
};

//-------Text Particles--------------
var textParticles = [];
function TextParticle(text, pos) {
    this.text = text;
    this.opacity = 1;
    this.pos = new Vector(pos);
}

TextParticle.prototype.update = function() {
    this.pos.sub(0, 1);
    this.opacity -= 0.03;
};

TextParticle.prototype.render = function() {
    g.font = "16px Verdana";
    g.fontWeight = "bold";
    g.fillStyle = "rgba(0, 255, 0, " + this.opacity + ")";
    g.fillText(this.text, this.pos.x - g.measureText(this.text).width / 2, this.pos.y);
};

TextParticle.updateAll = function() {
    for(var i = 0; i < textParticles.length; i++) {
        textParticles[i].update();
        if(textParticles[i].opacity <= 0)
            textParticles.splice(i--, 1);
    }
};

TextParticle.renderAll = function() {
    for(var i = 0; i < textParticles.length; i++) {
        textParticles[i].render();
    }
};

TextParticle.spawn = function(text, pos) {
    textParticles.push(new TextParticle(text, pos));
};

//-------Vector--------------
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

Vector.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ")";
};


//Initializing stuff
lastFrame = Date.now();
lastFps = Date.now();
requestAnimationFrame(frame);