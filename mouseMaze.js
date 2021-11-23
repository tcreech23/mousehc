/* Author: Griffin Quinn
Date: 11/5/21
shadedCube.js*/

var canvas;
var gl;

var image = [ ];
var texCoordsArray = []; // holds texture coordinates
var texture = [ ];  // array of textures

var numVertices  = 36;

var pointsArray = [];
var normalsArray = [];

var xTran = 0;
var yTran = 0;
var zTran = 0;

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ), //front bot left
        vec4( -0.5,  0.5,  0.5, 1.0 ), //front top left
        vec4( 0.5,  0.5,  0.5, 1.0 ), //front top right
        vec4( 0.5, -0.5,  0.5, 1.0 ), //front bot right
        vec4( -0.5, -0.5, -0.5, 1.0 ), //back bot left
        vec4( -0.5,  0.5, -0.5, 1.0 ), //back top left
        vec4( 0.5,  0.5, -0.5, 1.0 ),  //back top right
        vec4( 0.5, -0.5, -0.5, 1.0 )   //back bot right
    ];

var verticesBoard = [
      vec4( -0.5, -0.1,  0.5, 1.0 ), //front bot left
      vec4( -0.5,  0.1,  0.5, 1.0 ), //front top left
      vec4( 0.5,  0.1,  0.5, 1.0 ), //front top right
      vec4( 0.5, -0.1,  0.5, 1.0 ), //front bot right
      vec4( -0.5, -0.1, -0.5, 1.0 ), //back bot left
      vec4( -0.5,  0.1, -0.5, 1.0 ), //back top left
      vec4( 0.5,  0.1, -0.5, 1.0 ),  //back top right
      vec4( 0.5, -0.1, -0.5, 1.0 )   //back bot right
  ];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightPosition2 = vec4(1.0, -1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialAmbient2 = vec4( 1.0, 0.0, 1.0, 1.0 );

var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialDiffuse2 = vec4( 1.0, 0.0, 0.8, 1.0);

var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular2 = vec4( 1.0, 0.0, 0.8, 1.0 );

var materialShininess = 100.0;

var ctm;
var ambientProduct, diffuseProduct, specularProduct;
var ambientProduct2, diffuseProduct2, specularProduct2;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[0, 0, 0];

var thetaLoc;

var flag = true;

function quad(a, b, c, d) {
     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[a]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);

     pointsArray.push(vertices[a]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[b]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal);   
     pointsArray.push(vertices[a]);  
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[d]); 
     normalsArray.push(normal);    
}

function quadBoard(a, b, c, d) {
   var t1 = subtract(verticesBoard[b], verticesBoard[a]);
   var t2 = subtract(verticesBoard[c], verticesBoard[a]);
   var normal = cross(t1, t2);
   var normal = vec3(normal);

   pointsArray.push(verticesBoard[a]); 
   normalsArray.push(normal); 
   pointsArray.push(verticesBoard[b]); 
   normalsArray.push(normal); 
   pointsArray.push(verticesBoard[c]); 
   normalsArray.push(normal);   
   pointsArray.push(verticesBoard[a]);  
   normalsArray.push(normal); 
   pointsArray.push(verticesBoard[c]); 
   normalsArray.push(normal); 
   pointsArray.push(verticesBoard[d]); 
   normalsArray.push(normal);    
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function colorBoard()
{
    quadBoard( 1, 0, 3, 2 );
    quadBoard( 2, 3, 7, 6 );
    quadBoard( 3, 0, 4, 7 );
    quadBoard( 6, 5, 1, 2 );
    quadBoard( 4, 5, 6, 7 );
    quadBoard( 5, 4, 0, 1 );
}

// function configureTexture() configures the texture for use
function configureTexture( image, id ) {
   texture[id] = gl.createTexture();
   gl.bindTexture( gl.TEXTURE_2D, texture[id] );
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
        gl.RGB, gl.UNSIGNED_BYTE, image );
   gl.generateMipmap( gl.TEXTURE_2D );
   gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                     gl.NEAREST_MIPMAP_LINEAR );
   gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
   
   gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();
    colorBoard();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    viewerPos = vec3(0.0, 0.0, -20.0 );

    projection = ortho(-1, 1, -1, 1, -100, 100);
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    ambientProduct2 = mult(lightAmbient, materialAmbient2);
    diffuseProduct2 = mult(lightDiffuse, materialDiffuse2);
    specularProduct2 = mult(lightSpecular, materialSpecular2);

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
	
    setLightProducts(ambientProduct, diffuseProduct, specularProduct);
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));

   // initialize textures
	 initializeTexture(image, "cheese.jpg", 0);
	
    thetaLoc = gl.getUniformLocation(program, "theta");
  
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );

    window.onkeydown = keyResponse;
    
    render();
}

function keyResponse(event) {
	var key = String.fromCharCode(event.keyCode);
	switch (key) {
      case 'W':
         yTran+= .01;
         break;
		case 'S':
			yTran-= .01;
			break;
		case 'D':
			xTran+= .01;
			break;
		case 'A':
			xTran-= .01;
	}
}

var render = function(){
            
   gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            

   setLightProducts(ambientProduct, diffuseProduct, specularProduct);
   gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );

   mvMatrix = mat4( );
	mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
   mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
   mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));
	pMatrix = perspective(45.0, 1.0, 1.0, 500.0);
	
	gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
	gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

	gl.bindTexture( gl.TEXTURE_2D, texture[0] );
		// one texture per side
	gl.drawArrays( gl.TRIANGLES, 0, points.length );
            
   modelView = mat4();
   modelView = mult(modelView, rotate(45, [1, 0, 0] ));
   modelView = mult(modelView, translate(0, -.5, 0, 1));
   //modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
   //modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
    
   gl.uniformMatrix4fv( gl.getUniformLocation(program, 
      "modelViewMatrix"), false, flatten(modelView) );
   gl.drawArrays( gl.TRIANGLES, numVertices, numVertices);

   setLightProducts(ambientProduct2, diffuseProduct2, specularProduct2);
   gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );

   modelView = mat4();
   modelView = mult(modelView, translate(xTran, yTran, zTran, 1));
   modelView = mult(modelView, translate(0, .2, 0, 1));
   modelView = mult(modelView, scalem(.1, .1, .1));
   modelView = mult(modelView, rotate(-45, [1, 0, 0] ));
   

   gl.uniformMatrix4fv( gl.getUniformLocation(program, 
      "modelViewMatrix"), false, flatten(modelView) );
   gl.drawArrays( gl.TRIANGLES, 0, numVertices );


   gl.drawArrays( gl.TRIANGLES, 0, numVertices );
            
            
   requestAnimFrame(render);
}

// initializes textures and put them into an array
function initializeTexture( myImage, fileName, id) {
	myImage[id] = new Image();
	myImage[id].onload = function() {
		configureTexture( myImage[id], id );
	}
	myImage[id].src = fileName;
}

function setLightProducts(ambientProduct, diffuseProduct, specularProduct){
   gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
      flatten(ambientProduct));
   gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
      flatten(diffuseProduct));
   gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
      flatten(specularProduct));	
}