//Author: McMacker4 (Hans) Under MIT License - 2016

var main_canvas = document.getElementById("upgaming");
var trail_canvas = document.getElementById("trail_canvas");
var g = main_canvas.getContext('2d');
var trail_g = trail_canvas.getContext('2d');

var lastFrame = 0;
var delta = 0;
var frameCount = 0;
var lastFps = 0;
var FPS = 0;

var aliveTime = 0;

var startingEnemies = 5;
var maxEnemies = startingEnemies;

var debugEnabled = false;

var score = 0;

var paused = false;
var focused = true;

var WEAPON_CLASSIC = new Weapon();
var WEAPON_TRIPLE = new TripleBeamWeapon();

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
    if(paused || !focused) delta = 0;
    aliveTime += delta;
    maxEnemies = startingEnemies + aliveTime / 30000;
    player.update();
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

    g.fillText("McMacker4.com © 2016", main_canvas.width - g.measureText("McMacker4.com © 2016").width - 10, main_canvas.height - 3);

    if(paused && !player.dead) {
        g.font = "120px Verdana";
        g.fontWeight = "bold";
        g.fillStyle = "#FFF";
        g.fillText("PAUSED", main_canvas.width / 2 - g.measureText("PAUSED").width / 2, main_canvas.height / 2);
        g.font = "16px Verdana";
        g.fillText("Press Esc to unpause.", main_canvas.width / 2 - g.measureText("Press Esc to unpause.").width / 2, main_canvas.height / 2 + 18);
    }


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
    g.fillText("DT: " + delta, 10, 20);
    g.fillText("FPS: " + FPS, 10, 20 + 18);
    g.fillText("Bullets: " + bullets.length, 10, 20 + 18 * 2);
    g.fillText("Enemies: " + enemies.length, 10, 20 + 18 * 3);
    g.fillText("Dist player <-> mouse: " + player.pos.dist(mousePos), 10, 20 + 18 * 4);
    g.fillText("Player HP: " + player.hp + " (" + (player.dead ? "" : "not ") + "dead)", 10, 20 + 18 * 5);
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
    KEY_ESCAPE = 27,
    ARROW_UP = 38,
    ARROW_DOWN = 40,
    ARROW_RIGHT = 39,
    ARROW_LEFT = 37;

var CLICK_LEFT = 0,
    CLICK_MIDDLE = 1,
    CLICK_RIGHT = 2;

window.onresize = function() {
    main_canvas.width = window.innerWidth;
    main_canvas.height = window.innerHeight;
    trail_canvas.width = main_canvas.width;
    trail_canvas.height = main_canvas.height;
    render();
};

window.oncontextmenu = function() {
    return false;
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
    if(evt.keyCode == KEY_ESCAPE && !player.dead)
        paused = !paused;
};

var mousePos = { x: 0, y: 0 };
var mouseStates = {};
main_canvas.onmousemove = function(evt) {
    mousePos.x = evt.pageX;
    mousePos.y = evt.pageY;
};

main_canvas.onmousedown = function(evt) {
    mouseStates[evt.button] = true;
};

main_canvas.onmouseup = function(evt) {
    mouseStates[evt.button] = false;
};

main_canvas.onmouseleave = function() {
    mouseStates[CLICK_LEFT] = false;
    mouseStates[CLICK_MIDDLE] = false;
    mouseStates[CLICK_RIGHT] = false;
};

// window.onfocus = function() {
//     focused = true;
//     delta = 0;
// };

window.onblur = function() {
    paused = true;
};

//================== CLASSES ====================
//-------Player--------------

Player.speed = 0.15;
Player.bulletSpeed = 0.6;
Player.maxHealth = 100;

var player = new Player();
function Player() {
    this.pos = new Vector(main_canvas.width / 2, main_canvas.height / 2);
    this.dir = new Vector(0, 0);
    this.hp = Player.maxHealth;
    this.dead = false;
    this.lastShot = 0;
}

Player.prototype.update = function() {

    this.lastShot += delta;
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
        this.dir.scale(Player.speed).scale(delta);
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

    this.shoot();

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

Player.prototype.shoot = function() {
    if(paused) return;
    var pos = new Vector(player.pos.x, player.pos.y);
    var dir = new Vector(0, 0);
    var weapon = WEAPON_TRIPLE;
    if(mouseStates[CLICK_LEFT] || mouseStates[CLICK_RIGHT]) {
        dir = new Vector(mousePos.x - player.pos.x, mousePos.y - player.pos.y);
        weapon = mouseStates[CLICK_LEFT] ? WEAPON_CLASSIC : WEAPON_TRIPLE;
    } else {
        weapon = WEAPON_CLASSIC;
        if(keyStates[ARROW_LEFT] && !keyStates[ARROW_RIGHT]) {
            dir.x = -1;
        } else if(keyStates[ARROW_RIGHT] && !keyStates[ARROW_LEFT]) {
            dir.x = 1;
        }
        if(keyStates[ARROW_UP] && !keyStates[ARROW_DOWN]) {
            dir.y = -1;
        } else if(keyStates[ARROW_DOWN] && !keyStates[ARROW_UP]) {
            dir.y = 1;
        }
    }
    if((dir.x !=  0 || dir.y != 0) && weapon.canShoot(this.lastShot)) {
        dir.normalize().scale(Player.bulletSpeed).add(player.dir.scale(0.01));
        weapon.shoot(pos, dir);
        this.lastShot = 0;
    }
};


//-------Enemy--------------
var enemies = [];
function Enemy() {
    this.hp = 20;
    this.dead = false;
    this.pos = new Vector(Math.random() * main_canvas.width, Math.random() * main_canvas.height);
    this.lastShot = 0;

    while(this.pos.dist(player.pos) < Enemy.minSpawnDistance) {
        this.pos = new Vector(Math.random() * main_canvas.width, Math.random() * main_canvas.height);
    }

    if(this.pos.x == 0) this.pos.x -= this.hp + 5;
    else this.pos.x += this.hp + 5;
    if(this.pos.y == 0) this.pos.y -= this.hp + 5;
    else this.pos.y += this.hp + 5;
}

Enemy.speed = 0.06;
Enemy.bulletSpeed = 0.35;
Enemy.minSpawnDistance = 300;

Enemy.prototype.update = function() {
    var distToPlayer = this.pos.dist(player.pos);
    if(distToPlayer > 260) {
        this.pos.add(new Vector(player.pos).sub(this.pos).normalize().scale(Enemy.speed).scale(delta));
    } else if(distToPlayer < 240) {
        this.pos.add(new Vector(player.pos).sub(this.pos).normalize().scale(-Enemy.speed).scale(delta));
    }

    this.lastShot += delta;
    if(this.lastShot > 2500 && this.pos.dist(player.pos) < 500 && !paused) {
        this.shoot();
        this.lastShot = 0;
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
    //This line is saved for when difficulty levels are implemented.
    //Change the 0.2 with lower values for lower difficulty. (0.2 -> hard)
    //var bulletDir = new Vector(player.pos).add(new Vector(player.dir).scale(player.pos.dist(this.pos) * 0.2)).sub(this.pos).normalize();
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

Bullet.prototype.update = function() {
    this.pos.add(new Vector(this.dir).scale(delta));
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
            var dist;
            var dmg;
            bullet.update();
            if(bullet.color == "#0F0") {
                for (var j = 0; j < enemies.length; j++) {
                    var enemy = enemies[j];
                    if (bullet.pos.dist(enemy.pos) < enemy.hp + 5 + bullet.size) {
                        dist = bullet.spawnPoint.dist(enemy.pos);
                        dmg = dist < 350 ? 5 - 0.0000325 * Math.pow(bullet.spawnPoint.dist(enemy.pos), 2) : 1;
                        enemy.hit(dmg);
                        score += dmg;
                        break;
                    }
                }
            } else if(bullet.color == "#90F") {
                if (bullet.pos.dist(player.pos) < player.hp * 0.1 + 10 + bullet.size) {
                    dist = bullet.spawnPoint.dist(player.pos);
                    dmg = dist < 350 ? 5 - 0.0000325 * Math.pow(bullet.spawnPoint.dist(player.pos), 2) : 1;
                    player.hit(dmg);
                    bullets.splice(i--, 1);
                    break;
                }
            }
        }
    }
};

Bullet.renderAll = function() {
    if(!player.dead && !paused) {
        trail_g.fillStyle = "rgba(0, 0, 0, .2)";
        trail_g.fillRect(0, 0, trail_canvas.width, trail_canvas.height);
        for (var i = 0; i < bullets.length; i++)
            bullets[i].render();
    }
    g.drawImage(trail_canvas, 0, 0, main_canvas.width, main_canvas.height);
};

Bullet.spawn = function(pos, dir) {
    bullets.push(new Bullet(pos, dir))
};



//-------Text Particles--------------
var textParticles = [];
function TextParticle(text, pos) {
    this.text = text;
    this.opacity = 1;
    this.pos = new Vector(pos);
}

TextParticle.verticalSpeed = -0.05;

TextParticle.prototype.update = function() {
    this.pos.add(new Vector(0, TextParticle.verticalSpeed).scale(delta));
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

//Classic weapon
function Weapon() {
    this.freq = 10;
}
Weapon.prototype.shoot = function(o, dir) {
    Bullet.spawn(o, dir);
};

Weapon.prototype.canShoot = function(last) {
    return last > (1000 / this.freq);
};

//Tripple beam weapon
function TripleBeamWeapon() {
    Weapon.call(this);
    this.freq = 4;
}
TripleBeamWeapon.prototype.shoot = function(o, dir) {
    var dir1 = new Vector(dir);
    var dir2 = new Vector(dir).rotate(toRadians(10));
    var dir3 = new Vector(dir).rotate(toRadians(-10));
    Bullet.spawn(o, dir1);
    Bullet.spawn(o, dir2);
    Bullet.spawn(o, dir3);
};

TripleBeamWeapon.prototype.canShoot = function(last) {
    return last > (1000 / this.freq);
};

//Initializing stuff
lastFrame = Date.now();
lastFps = Date.now();
requestAnimationFrame(frame);