
/**
 * @author      dmitrijs.balabka
 * @since       1.0
 * @version     SVN: $
 */

//FightCode can only understand your robot
//if its class is called Robot
var Robot = function (robot) {

  this.id = robot.id;
  this.parentId = robot.parentId;

  /**
   * @type {number} Tick counter
   */
  this.tick = 0;
  this.tickCounters = {};

  this.tickHit = 0;

  /**
   * @type {number} how many steps already was strafed to left or right
   */
  this.tickStrafe = 0;

  /**
   * @type {boolean} 1 - left, -1 - right
   */
  this.strafeDirection = 1;
  this.strafeAmount = 100; 

  this.opponentId = false;
  this.pos = {x: 1, y: 1, tick: 0};
  this.prevPos = false;
  this.detected = false;
  this.turn = true;
  //this.aimCannon(robot, this.pos);
  //robot.rotateCannon(90);
};

Robot.prototype.onIdle = function (ev) {
  this.tick++;
  var robot = ev.robot
    , pos = {};
  if (robot.parentId === null && robot.availableClones != 0) {
    //robot.clone();
  }
  if (!this.detected) {
    robot.rotateCannon(1);
  } else {
    if (false === this.prevPos) {
      pos = this.getNextPos(this.pos, this.pos.angle, 10);
      this.aimCannon(robot, pos);
    } else {
      pos = this.getNextPos(this.pos, this.pos.angle, this.calculateSpeed(this.pos, this.pos.tick, this.prevPos, this.prevPos.tick) * (this.tick - this.pos.tick));
      robot.fire();
    }
    this.strafe(robot, this.pos);
    //this.turn ? robot.ahead(10) : robot.back(10);
    if (this.checkTick('hit', 100)) {
      this.detected = false;
    }
  }

};

Robot.prototype.isFriend = function (scannedRobot) {
  return this.parentId === scannedRobot.id || this.id === scannedRobot.parentId;
};

Robot.prototype.onScannedRobot = function (ev) {
  var robot = ev.robot
    , scannedRobot = ev.scannedRobot;

  // ignore my clones
  if (this.isFriend(scannedRobot)) {
    return;
  }

  if (this.opponentId == scannedRobot.id) {
    this.prevPos = {};
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
    this.prevPos.angle = this.pos.angle;
    this.prevPos.tick = this.pos.tick;
  } else {
    this.prevPos = false;
  }

  this.opponentId = scannedRobot.id;
  this.pos.x = scannedRobot.position.x;
  this.pos.y = scannedRobot.position.y;
  this.pos.angle = scannedRobot.angle;
  this.pos.tick = this.tick;

  this.detected = true;
  if (false === this.prevPos) {
    // try to predict next opponent position

  }

  // TODO: do bullet speed and cannon turn correction before fire
  //robot.fire();

  // TODO: strafe to another side from opponent cannon
  //this.aimCannon(robot, this.pos);
  //console.log('Robot: ' + robot.position.x + 'px ' + robot.position.y + 'px');
  //console.log('Opponent: ' + ev.scannedRobot.position.x + 'px ' + ev.scannedRobot.position.y + 'px');
  //console.log('Angle: ' + this.getAngle(robot.position, ev.scannedRobot.position));
  //console.log('Robot angle:' + (robot.angle));
  //console.log('Cannon cannonRelativeAngle:' + (robot.angle));

};

Robot.prototype.calculateSpeed = function (pos1, tick1, pos2, tick2) {
  var distance = this.getDistance(pos1, pos2)
    , tick = tick1 - tick2;
  return distance / tick;
};

/**
 * @param {String} counterName
 * @param {Number} limit
 * @returns {boolean} Returns true if counter was reached the limit otherwise false
 */
Robot.prototype.checkTick = function (counterName, limit) {
  if (this.tick - (this.tickCounters[counterName]|0) > limit) {
    this.tickCounters[counterName] = this.tick;
    return true;
  }
  return false;
};

Robot.prototype.strafe = function (robot, aimPos) {
  this.updateStrafeDirection(robot, aimPos);
  if (this.checkTick('strafe', this.strafeAmount)) { //console.log('wefwef');
    this.strafeDirection *= -1; // change direction
  }
  robot.move(1, this.strafeDirection);
};

/**
 * Set robot angle correction for strafe
 * @param robot
 * @param aimPos
 */
Robot.prototype.updateStrafeDirection = function (robot, aimPos) {
  var angle = this.getAngle(robot.position, aimPos);
  var turnAngle = Math.round(angle - robot.angle);
  if (turnAngle > 180) {
    turnAngle -= 360;
  } else if (turnAngle < -180) {
    turnAngle += 360;
  }
  robot.turn(turnAngle + 90);
};

Robot.prototype.aimCannon = function (robot, aimPos) {
  var angle = this.getAngle(robot.position, aimPos);
  var turnAngle = Math.round(angle - this.getCannonAngle(robot));
  if (turnAngle > 180) {
    turnAngle -= 360;
  } else if (turnAngle < -180) {
    turnAngle += 360;
  }
  robot.rotateCannon(turnAngle);
};


Robot.prototype.getCannonAngle = function (robot) {
  var absolute = robot.cannonAbsoluteAngle + 270;
  if (absolute > 360) {
    absolute -= 360;
  }
  return absolute;
};

Robot.prototype.getNextPos = function (pos, angle, distance) {
  var a = angle
    , x = 1, y = 1;
  if (a > 90 && a <= 180) {
    a = 180 - a;
    y *= -1;
  } else if (a > 180 && a <= 270) {
    a = a - 180;
    x *= -1;
    y *= -1;
  } else if (a > 270 && a <= 360) {
    a = 360 - a;
    x *= -1;
  }
  y = Math.sin(a) * distance * y;
  x = Math.cos(a) * distance * x;
  return {x: pos.x + x, y: pos.y + y};
};

Robot.prototype.getAngle = function (yourPos, opponentPos) {
  var x = opponentPos.x - yourPos.x
    , y = opponentPos.y - yourPos.y
    , a = Math.toDegrees(Math.atan(Math.abs(y) / Math.abs(x)));

  if (y < 0 && x > 0) {
    a = 90 - a; // console.log('I');
  } else if (y > 0 && x > 0) {
    a = 90 + a; // console.log('II');
  } else if (y > 0 && x < 0) {
    a = 270 - a; //console.log('III');
  } else if (y < 0 && x < 0) {
    a = 270 + a; //console.log('IV');
  }

  return a;
};

Robot.prototype.getDistance = function (pos1, pos2) {
  var x = Math.abs(pos1.x - pos2.x)
    , y = Math.abs(pos1.y - pos2.y);
  return Math.sqrt(x * x + y * y);
};

Robot.prototype.onRobotCollision = function () {
  this.turn = this.turn ^ 1;
}

Robot.prototype.onWallCollision = function () {
  this.turn = this.turn ^ 1;
}

Math.toDegrees = function (radians) {
  return radians * 180 / Math.PI;
};

Robot.prototype.onHitByBullet = function(ev) {
    var robot = ev.robot;
    ev.bearing;
  // TODO: strafe to another side from bullets flow
  // TODO: disappear
    //robot.ahead(20); // Turn to wherever the bullet was fired
                            // so we can see who shot it
};
