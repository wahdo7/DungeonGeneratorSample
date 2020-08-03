//class to represent a single occupiable space on the floor
class FloorSpace {
  constructor(type) {
    this.type = type;
    this.neighbors = [];
  }
}

//class to represent a wall separating two spaces
class Wall {
  constructor(space1_x, space1_y, space2_x, space2_y) {
    this.space1 = space1_x.toString() + "," + space1_y.toString();
    this.space2 = space2_x.toString() + "," + space2_y.toString();
    this.drawX = space2_x * 32;
    this.drawY = space2_y * 32;
    this.orientation = space2_x == space1_x ? "horizontal" : "vertical";
  }
}

//link button to function
document.getElementById("submitButton").onclick = generateFloor;

function generateFloor() {
	//get DOM elements
	var widthObj = document.getElementById("width");
  var heightObj = document.getElementById("height");
  var coinsObj = document.getElementById("coins");
  var spikesObj = document.getElementById("spikes");
  var resultsObj = document.getElementById("results");

	//get all of the menu inputs and store them for later
	var width = parseInt(widthObj.value);
  var height = parseInt(heightObj.value);
  var coins = parseInt(coinsObj.value);
  var spikes = parseInt(spikesObj.value);
  
  resultsObj.innerHTML = "";
  
  //validate the input data
  if (width < parseInt(widthObj.min) || width > parseInt(widthObj.max)) {
  	resultsObj.innerHTML = "Invalid width: must be between " + widthObj.min + " and " + widthObj.max;
    return;
  } else if (height < parseInt(heightObj.min) || height > parseInt(heightObj.max)) {
  	resultsObj.innerHTML = "Invalid height: must be between " + heightObj.min + " and " + heightObj.max;
    return;
  } else if (coins < parseInt(coinsObj.min) || coins > parseInt(coinsObj.max)) {
  	resultsObj.innerHTML = "Invalid number of coins: must be between " + coinsObj.min + " and " + coinsObj.max;
    return;
  } else if (spikes < parseInt(spikesObj.min) || spikes > parseInt(spikesObj.max)) {
  	resultsObj.innerHTML = "Invalid number of spikes: must be between " + spikesObj.min + " and " + spikesObj.max;
    return;
  }
  
  //create the 2D array objectGrid to represent the floor, initialize every space as "empty". emptySpaces tracks all unoccupied locations
  var objectGrid = [];
  var emptySpaces = [];
  
  //a wall may be placed between any two neighboring spaces. possibleWalls tracks all valid locations for a new wall, and placedWalls tracks locations where a wall has been added
  var possibleWalls = [];
  var placedWalls = [];
  
  //initialize objectGrid, emptySpaces, and possibleWalls
  for (var i = 0; i < width; i++) {
  	var thisColumn = [];
  	for (var j = 0; j < height; j++) {
    	var thisSpace = new FloorSpace("empty");
      emptySpaces.push([i,j]);
      if (i - 1 >= 0) thisSpace.neighbors.push((i - 1).toString() + "," + j.toString());
      if (j - 1 >= 0) thisSpace.neighbors.push(i.toString() + "," + (j - 1).toString());
      if (i + 1 < width) {
      	thisSpace.neighbors.push((i + 1).toString() + "," + j.toString());
        possibleWalls.push(new Wall(i, j, i + 1, j));
			}
      if (j + 1 < height) {
      	thisSpace.neighbors.push(i.toString() + "," + (j + 1).toString());
        possibleWalls.push(new Wall(i, j, i, j + 1));
			}
      thisColumn.push(thisSpace);
    }
  	objectGrid.push(thisColumn);
  }
  
  //place the player onto the floor
  var playerSpace = emptySpaces.splice(Math.floor(Math.random() * emptySpaces.length), 1)[0];
  objectGrid[playerSpace[0]][playerSpace[1]].type = "player";
  
  //place the goal onto the floor
  var goalSpace = emptySpaces.splice(Math.floor(Math.random() * emptySpaces.length), 1)[0];
  objectGrid[goalSpace[0]][goalSpace[1]].type = "goal";
  
  //place as many coins as possible onto the floor
  for (var i = 0; i < coins; i++) {
  	if (emptySpaces.length == 0) {
    	resultsObj.innerHTML += "<br/>" + i + " of the " + coins + " requested coins were placed.";
      break;
    }
    var coinSpace = emptySpaces.splice(Math.floor(Math.random() * emptySpaces.length), 1)[0];
  	objectGrid[coinSpace[0]][coinSpace[1]].type = "coin";
  }
  
  //place as many spikes as possible onto the floor
  for (var i = 0; i < spikes; i++) {
  	if (emptySpaces.length == 0) {
    	resultsObj.innerHTML += "<br/>" + i + " of the " + spikes + " requested spikes were placed.";
      break;
    }
    var spikeSpace = emptySpaces.splice(Math.floor(Math.random() * emptySpaces.length), 1)[0];
  	objectGrid[spikeSpace[0]][spikeSpace[1]].type = "spike";
  }
  
  var wallCount = 0;
  
  //randomly place walls until no more can be legally placed
  while (possibleWalls.length != 0) {
    var thisWall = possibleWalls.splice(Math.floor(Math.random() * possibleWalls.length), 1)[0];
    var space1 = objectGrid[thisWall.space1.split(",")[0]][thisWall.space1.split(",")[1]];
    var space2 = objectGrid[thisWall.space2.split(",")[0]][thisWall.space2.split(",")[1]];
    var removedneighbor1 = space1.neighbors.splice(space1.neighbors.indexOf(thisWall.space2), 1)[0];
    var removedneighbor2 = space2.neighbors.splice(space2.neighbors.indexOf(thisWall.space1), 1)[0];
    
    //explore the floor as if the new wall has been placed. If any spaces are now unreachable, remove the newly added wall and do not consider it again. If all spaces are still reachable, place the new wall.
    if (explore(objectGrid, playerSpace[0].toString() + "," + playerSpace[1].toString(), width * height)) {
    	placedWalls.push(thisWall);
      wallCount += 1;
    } else {
    	space1.neighbors.push(removedneighbor1);
      space2.neighbors.push(removedneighbor2);
    }
  }
  
  //load images to prepare for drawing
  var imagesLoaded = 0;
  var playerObj = new Image();
  playerObj.src = 'https://i.postimg.cc/CxmkxQs9/Daring-Daryl.png';
  playerObj.onload = function() {
     imagesLoaded++;
     if (imagesLoaded == 5) drawFloor();
  };
  var goalObj = new Image();
  goalObj.src = 'https://i.postimg.cc/wBrNhRPV/Trapdoor.png';
  goalObj.onload = function() {
     imagesLoaded++;
     if (imagesLoaded == 5) drawFloor();
  };
  var coinObj = new Image();
  coinObj.src = 'https://i.postimg.cc/nhHqZJBv/Coin.png';
  coinObj.onload = function() {
     imagesLoaded++;
     if (imagesLoaded == 5) drawFloor();
  };
  var spikeObj = new Image();
  spikeObj.src = 'https://i.postimg.cc/GptY8xMt/Spikes.png';
  spikeObj.onload = function() {
     imagesLoaded++;
     if (imagesLoaded == 5) drawFloor();
  };
  var backgroundObj = new Image();
  backgroundObj.src = 'https://i.postimg.cc/13rXmVst/Background.png';
  backgroundObj.onload = function() {
     imagesLoaded++;
     if (imagesLoaded == 5) drawFloor();
  };
  
  function drawFloor() {
  	//initialize the canvas
    var canvas = document.getElementById("floorCanvas");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#9e8866";
    
    //draw the background
    ctx.drawImage(backgroundObj, 0, 0);
    
    //draw all objects on the floor
   	for (var i = 0; i < width; i++) {
    	for (var j = 0; j < height; j++) {
      	if (objectGrid[i][j].type == "player") ctx.drawImage(playerObj, 32 * i, 32 * j);
        else if (objectGrid[i][j].type == "goal") ctx.drawImage(goalObj, 32 * i, 32 * j);
        else if (objectGrid[i][j].type == "coin") ctx.drawImage(coinObj, 32 * i, 32 * j);
        else if (objectGrid[i][j].type == "spike") ctx.drawImage(spikeObj, 32 * i, 32 * j);
        else ctx.fillRect(32 * i, 32 * j, 32, 32);
      }
    }
    
    //draw the walls
    ctx.fillStyle = "#000000";
    ctx.fillRect(32 * width, 0, 2, 32 * height);
    ctx.fillRect(0, 32 * height, 32 * width, 2);
    for (var i = 0; i < placedWalls.length; i++) {
      var thisWall = placedWalls[i];
      if (thisWall.orientation == "horizontal") ctx.fillRect(thisWall.drawX, thisWall.drawY - 1, 32, 2);
      else ctx.fillRect(thisWall.drawX - 1, thisWall.drawY, 2, 32);
    }
  }
}

//explore all possible spaces beginning at start. Return true if target number of spaces were visited, otherwise false.
function explore(objectGrid, start, target) {
	var open = [];
  var closed = [];
  var current;
  
  open.push(start);
  while (open.length != 0) {
  	current = open.shift();
    var currX = parseInt(current.split(",")[0]);
    var currY = parseInt(current.split(",")[1]);
    
    //if this space has already been visited, skip it
    if (!(closed.includes(current))) {
    	//add this space the closed (visited) list, and add all of its neighbors to the open list
    	closed.push(current);
      for (var i = 0; i < objectGrid[currX][currY].neighbors.length; i++) {
				open.push(objectGrid[currX][currY].neighbors[i]);
			}
    }
  }
  
  return closed.length == target ? true : false;
}