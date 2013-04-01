
/**
 * @author      dmitrijs.balabka
 * @since       1.0
 * @version     SVN: $
 */

//FightCode can only understand your robot
//if its class is called Robot
var Robot = function (robot) {
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

  this.pos = {x: 1, y: 1};
  this.prevPos = {x: 1, y: 1};
  this.detected = false;
  this.turn = true;
  //this.aimCannon(robot, this.pos);
  //robot.rotateCannon(90);
};

Robot.prototype.onIdle = function (ev) {
  this.tick++;
  var robot = ev.robot;
  if (!this.detected) {
    robot.turn(1);
  } else {
    this.aimCannon(robot, this.pos);   
    this.strafe(robot, this.pos);
    //this.turn ? robot.ahead(10) : robot.back(10);
    if (this.checkTick('hit', 500)) { 
      this.detected = false;
    }
  }

};

Robot.prototype.onScannedRobot = function (ev) {
  var robot = ev.robot;
	this.tickHit = this.tick;
  //console.log('fire');
  this.pos.x = ev.scannedRobot.position.x;
  this.pos.y = ev.scannedRobot.position.y;
  this.detected = true;
  robot.fire();
  //this.aimCannon(robot, this.pos);
  //console.log('Robot: ' + robot.position.x + 'px ' + robot.position.y + 'px');
  //console.log('Opponent: ' + ev.scannedRobot.position.x + 'px ' + ev.scannedRobot.position.y + 'px');
  //console.log('Angle: ' + this.getAngle(robot.position, ev.scannedRobot.position));
  //console.log('Robot angle:' + (robot.angle));
  //console.log('Cannon cannonRelativeAngle:' + (robot.angle));

};

/**
 * @param {String} counterName
 * @param {Number} limit
 * @returns {boolean} Returns true if counter was reached the limit otherwise false
 */
Robot.prototype.checkTick = function (counterName, limit) {
  if (this.tick - (this.tickCounters[counterName]|0) > limit) {
    this.tickCounters[counterName] = this.tick;console.log('wefwefwe');
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
    console.log(turnAngle);
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
    console.log(turnAngle);
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

Robot.prototype.getRobotDistance = function (pos1, pos2) {
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
    //robot.turn(ev.bearing); // Turn to wherever the bullet was fired
                            // so we can see who shot it
};
