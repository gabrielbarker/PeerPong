/*
 *  Stuff
 */

//import { Canvas, animate, enemyPaddle } from './canvas.js';
import { Message } from './message.js';
import { Paddle } from './paddle.js';
import { Ball } from './ball.js';

window.addEventListener('keydown', (e) => {
  keys[e.keyCode] = true;
});

window.addEventListener('keyup', (e) => {
  delete keys[e.keyCode];
});

document.getElementById('enemyId').addEventListener('click', getEnemyId);
document.getElementById('myId').addEventListener('click', getMyId);
document.getElementById('sendMessage').addEventListener('click', sendChat);

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
const speed = 5;
const keys = [];
var leftPaddle = new Paddle(canvas, 10, 350, 0);
var rightPaddle = new Paddle(canvas, 1180, 350, 0);
var myBall = new Ball(canvas, 600, 400, 0);

const myself = new Peer(null, {
  debug: 2,
});
let myId;
let enemyId;
let connection;
let senderConnection;

function drawDivider() {
  var i;
  var posX = 595;
  var posY = 5;
  var width = 10;
  var height = 15;
  var spacer = 15;

  var gradient = ctx.createLinearGradient(posX, 0, posX, 800);
  gradient.addColorStop(0, '#1a2a6c');
  gradient.addColorStop(1 / 2, '#b21f1f');
  gradient.addColorStop(1, '#fdbb2d');

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.fillRect(posX, 0, width, 800);
  ctx.stroke();
  ctx.closePath();

  for (i = 0; i < 35; i++) {
    ctx.beginPath();
    ctx.fillStyle = '#393e46';
    ctx.fillRect(posX, posY + 15, width, height);
    ctx.stroke();
    ctx.closePath();
    posY = posY + height + spacer;
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawDivider();
  myBall.draw();
  leftPaddle.draw();
  rightPaddle.draw();
  moveMyPaddle();
  //moveEnemyPaddle();
  requestAnimationFrame(animate);
}
animate();

function moveMyPaddle() {
  /* 38 up arrow, 87  W key */
  if ((keys[38] || keys[87]) && leftPaddle.posY > 0) {
    console.log(leftPaddle.posY);
    leftPaddle.posY -= speed;

    var myMessage = new Message(leftPaddle.posY, null, null);
    send(myMessage);
  }

  /* 38 up arrow, 87  W key */
  if ((keys[40] || keys[83]) && leftPaddle.posY < 700) {
    console.log(leftPaddle.posY);
    leftPaddle.posY += speed;

    var myMessage = new Message(leftPaddle.posY, null, null);
    send(myMessage);
  }

  //var myMessage = new Message(leftPaddle, null, null);
  //send(myMessage);
}

function moveEnemyPaddle(enemyPosY) {
  console.log(enemyPosY);
  //enemyPaddle.posY = enemyPosY;
}

function getPallTrajectory() {}

myself.on('open', function (id) {
  console.log('My peer Id is: ' + id);
  myId = id;
  console.log(myId);
});

myself.on('connection', (playerConnection) => {
  connection = playerConnection;
  console.log('Connected to: ' + connection.peer);
  enemyId = connection.peer;
  listen();
});

function listen() {
  connection.on('open', () => {
    connection.on('data', (data) => {
      var chatMessage = data.chat;
      var enemyPaddle = data.paddle;
      var ball = data.ball;
      if (data.paddle) {
        rightPaddle.posY = data.paddle;
      }
      console.log(data);
      console.log('Data received');
      connection.send('Connection Established');
    });
  });

  connection.on('close', () => {
    console.log('Connection Lost');
    connection = null;
  });
}

function send(message) {
  var playerId = getEnemyId();
  if (senderConnection == null || senderConnection == undefined) {
    senderConnection = myself.connect(playerId, { reliable: true });
  }

  // senderConnection.on('open', () => {
  //   // Receive messages
  //   senderConnection.on('data', function (data) {
  //     console.log('Received', data);
  //   });

  //   // Send messages
  //   senderConnection.send(message);
  // });
  console.log('Sending: ');
  console.log(message);
  senderConnection.send(message);
}

function getEnemyId() {
  if (enemyId != null || enemyId != undefined) {
    return enemyId;
  }
  const url = window.location.href;
  const Id = url.split('?userId=')[1];
  console.log(Id);
  return Id;
}

function getMyId() {
  var input = document.createElement('input');
  input.setAttribute('value', myId);
  document.body.appendChild(input);
  input.select();
  var result = document.execCommand('copy');
  document.body.removeChild(input);
  console.log(myId);
  return result;
}

function sendChat() {
  var inputField = document.getElementById('myInput');
  var playerId = getEnemyId();
  console.log(playerId);
  console.log(inputField.value);
  var myMessage = new Message(null, null, inputField.value);
  send(myMessage);
}
