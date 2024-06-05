ws = new WebSocket("wss://araeyn-dripserver.hf.space");
let font;
function start() {
  //textFont(junction);
  textSize(128);
  textAlign(CENTER, CENTER);
  text("", windowWidth / 2, windowHeight / 4);
  textAlign(CENTER, CENTER);
  //textFont(junction);
  textSize(16);
  div.position(0, 0);
  tokenbox.position(windowWidth / 2 - 110, windowHeight / 2 - 50);
  namebox.position(windowWidth / 2 - 110, windowHeight / 2 + 60);
  colorbox.position(windowWidth / 2 - 110, windowHeight / 2 + 170);
  fill(0);
  text("token", windowWidth / 2, windowHeight / 2 - 60);
  text("name", windowWidth / 2, windowHeight / 2 + 50);
  text("color ( hex )", windowWidth / 2, windowHeight / 2 + 160);
}

function rain() {
  count = (Math.floor(Math.random() * (windowWidth + 1000)) + 1000) * view;
  let rainx = [];
  let angle = PI / 32;
  rotate(angle);
  for (let i = 0; i < count; i++) {
    rainx.push(Math.floor(Math.random() * (windowWidth + 1000)));
    for (let k = 0; k < 1 * view; k++) {
      noStroke();
      colors = [];
      colors.push([74, 101, 131]);
      colors.push([108, 128, 148]);
      colors.push([78, 104, 129]);
      colors.push([105, 122, 140]);
      colors.push([60, 83, 105]);
      color = colors[Math.floor(Math.random() * colors.length)];
      fill(color[0], color[1], color[2]);
      rect(
        rainx[i],
        Math.floor(Math.random() * (windowHeight + 5000) - 5000),
        1 / view,
        80 / view,
      );
    }
  }
  rotate(-angle);
}
function reconnect() {
  reconnectButton.hide();
  ws.send(JSON.stringify({ type: "login", token: token }));
}
function preload() {
  //sniglet = loadFont(
  //  "https://raw.githubusercontent.com/theleagueof/sniglet/master/Sniglet%20Regular.otf",
  //);
  //ostrichSans = loadFont(
  //  "https://raw.githubusercontent.com/theleagueof/ostrich-sans/master/OstrichSans-Black.otf",
  //);
  //junction = loadFont(
  //  "https://raw.githubusercontent.com/theleagueof/junction/master/Junction-regular.otf",
  //);
}

ws.addEventListener("message", (event) => {
  data = JSON.parse(event.data);
  if (data["type"] == "init") {
    x = data["data"]["pos"]["x"];
    y = data["data"]["pos"]["y"];
    gevent = "game";
    alreadyReconnected = false;
  }
  if (data["type"] == "update") {
    players = data["data"]["players"];
  }
  if (data["type"] == "reconnect") {
    gevent = "reconnect";
  }
});

function setup() {
  resizeCanvas(windowWidth, windowHeight);
  x = NaN;
  y = NaN;
  vx = 0;
  view = 1;
  vy = 0;
  alreadyReconnected = false;
  size = 20;
  players = [];
  gevent = "start";
  //div = createDiv(`<input type="text" placeholder="What's your name?">
  //  <div class="line"></div>`);
  div = createDiv();
  div.addClass("field");
  tokenbox = createInput("", "text");
  tokenbox.parent(div);
  namebox = createInput("", "text");
  namebox.parent(div);
  colorbox = createInput("", "text");
  colorbox.parent(div);
  reconnectButton = createButton("reconnect");
  reconnectButton.hide();
  start();
  onGround = false;
  frameRate(60);
  rn = 0;
  level = [
    //["rect", [60, 555, 100, 50]],
    ["rect", [0, 600, 300, 75]],
    ["rect", [400, 550, 400, 100]],
  ];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (gevent === "start") {
    clear();
    start();
  }
  if (gevent === "reconnect") {
    reconnectButton.center();
  }
}
function draw() {
  clear();
  background(201, 232, 253);
  //rain();
  textSize(12);
  textAlign(RIGHT, TOP);
  fill(0);
  text("fps: " + Math.round(1000 / deltaTime), windowWidth - 10, 10);
  if (gevent === "start") {
    start();
    if (keyIsDown(ENTER)) {
      gevent = "game";
      div.remove();
      token = tokenbox.value();
      pname = namebox.value();
      color = colorbox.value();
      if (color.length === 0) {
        color = "#A7C7E7";
      } else if (/^#([0-9a-f]{3}){1,2}$/i.test(color.substring(1)) === true) {
        color = "#A7C7E7";
      }
      console.log(color);
      ws.send(JSON.stringify({ type: "login", token: token }));
    }
  } else if (gevent === "game") {
    if (isNaN(x) && isNaN(y)) {
      return;
    }
    //textFont(junction);
    textSize(16);
    textAlign(CENTER, CENTER);
    if (y > 2000) {
      x = 0;
      y = 0;
    }
    scrollX = windowWidth / 2 - x / view - size / 2 / view + vx / view;
    scrollY = windowHeight / 2 - y / view - size / 2 / view;
    for (let i = 0; i < players.length; i++) {
      fill(players[i]["color"]);
      player = players[i];
      square(
        player["pos"]["x"] / view + scrollX,
        player["pos"]["y"] / view + scrollY,
        size / view,
      );
      textAlign(CENTER);
      fill(192, 192, 192);
      text(
        player["name"],
        (player["pos"]["x"] + size / 2) / view + scrollX,
        (player["pos"]["y"] - size / 2) / view + scrollY,
      );
    }
    fill(color);
    noStroke();
    square(x / view + scrollX, y / view + scrollY, size / view);
    fsRIGHT = true;
    fsLEFT = true;
    fsUP = true;
    for (let i = 0; i < level.length; i++) {
      if (level[i][0] === "rect") {
        //fill(129, 133, 137);
        fill(229, 228, 226);
        fill("#CCCCFF");
        rect(
          level[i][1][0] / view + scrollX,
          level[i][1][1] / view + scrollY,
          level[i][1][2] / view,
          level[i][1][3] / view,
        );
        if (
          (level[i][1][1] + level[i][1][3]) / view > y / view &&
          y + size > level[i][1][1] &&
          level[i][1][0] - x < 5 + size &&
          level[i][1][0] - x > 5
        ) {
          fsRIGHT = false;
        }
        if (
          level[i][1][1] + level[i][1][3] > y &&
          y + size > level[i][1][1] &&
          x - level[i][1][0] - level[i][1][2] < 5 &&
          x - level[i][1][0] - level[i][1][2] > 5 - size
        ) {
          fsLEFT = false;
        }
      }
    }
    if (keyIsDown(LEFT_ARROW) === true && fsLEFT === true) {
      vx += -5;
      x -= 5;
    }

    if (keyIsDown(RIGHT_ARROW) === true && fsRIGHT === true) {
      vx += 5;
      x += 5;
    }

    if (keyIsDown(UP_ARROW) === true && onGround === true) {
      vy = -5;
      onGround = false;
    }
    for (let i = 0; i < vy * 10; i++) {
      y += vy / Math.abs(vy) / 10;
      for (let i = 0; i < level.length; i++) {
        if (level[i][0] === "rect") {
          if (
            level[i][1][0] - size < x &&
            x < level[i][1][0] + level[i][1][2] &&
            y + size > level[i][1][1] &&
            y < level[i][1][1] + level[i][1][3]
          ) {
            onGround = true;
            while (
              level[i][1][0] - size < x &&
              x < level[i][1][0] + level[i][1][2] &&
              y + size > level[i][1][1] &&
              y < level[i][1][1] + level[i][1][3]
            ) {
              y -= vy / Math.abs(vy) / 10;
            }
            vy = 0;
            break;
          } else {
            onGround = false;
          }
        }
      }
    }
    y += vy;
    vy += 0.15;
    vx *= 0.9;
    for (let i = 0; i < players.length; i++) {
      fill(193, 225, 193);
      player = players[i];
    }
    ws.send(
      JSON.stringify({
        type: "update",
        data: {
          pos: { x: x, y: y, vy: vy },
          name: pname,
          time: Date.now(),
          color: color,
        },
        token: token,
      }),
    );
  } else if (gevent === "reconnect") {
    if (alreadyReconnected === false) {
      reconnectButton.show();
      alreadyReconnected = true;
    }
    reconnectButton.center();
    reconnectButton.mousePressed(reconnect);
  }
}
