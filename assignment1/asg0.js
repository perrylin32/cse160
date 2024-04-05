// Draws a vector v of a color given by the string color on a canvas
function drawVector(v, color) {
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, canvas.height / 2);
  ctx.lineTo(canvas.width / 2 + v.elements[0] * 20, canvas.height / 2 - v.elements[1] * 20);
  ctx.stroke();
}

function angleBetween(v1, v2){
  var angle = Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude())) * 180 / Math.PI;
  return angle;
}

function areaTriangle(v1, v2){
  var area = Vector3.cross(v1, v2).magnitude() / 2;
  return area;
}

function handleDrawEvent(){
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0,  1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var v1 = new Vector3([document.getElementById('v1x').value, document.getElementById('v1y').value, 0]);
  var v2 = new Vector3([document.getElementById('v2x').value, document.getElementById('v2y').value, 0]);
  drawVector(v1, 'red');
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent(){
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0,  1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var v1 = new Vector3([document.getElementById('v1x').value, document.getElementById('v1y').value, 0]);
  var v2 = new Vector3([document.getElementById('v2x').value, document.getElementById('v2y').value, 0]);
  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  var operation = document.getElementById('operation').value;
  if (operation == "Add"){
    v1.add(v2);
    drawVector(v1, 'green');
  }else if (operation == "Subtract"){
    v1.sub(v2);
    drawVector(v1, 'green');
  }else if (operation == "Multiply"){
    v1.mul(document.getElementById('scalar').value);
    v2.mul(document.getElementById('scalar').value);
    drawVector(v1, 'green');
    drawVector(v2, 'green');
  }else if (operation == "Divide"){
    v1.div(document.getElementById('scalar').value);
    v2.div(document.getElementById('scalar').value);
    drawVector(v1, 'green');
    drawVector(v2, 'green');
  }else if (operation == "Magnitude"){
    console.log("Magnitude v1: " + v1.magnitude());
    console.log("Magnitude v2: " + v2.magnitude());
  }else if (operation == "Normalize"){
    v1.normalize();
    v2.normalize();
    drawVector(v1, 'green');
    drawVector(v2, 'green');
  }else if (operation == "AngleBetween"){
    angle = angleBetween(v1, v2);
    console.log("Angle: " + angle);
  }else if (operation == "Area"){
    console.log("Area of the triangle: " + areaTriangle(v1, v2));
  }

}



// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 0,  1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //var x = 2.25;
  //var y = 2.25;
  //var z = 0;
  //var v1 = new Vector3([x, y, z]);

  //drawVector(v1, 'red');

}
