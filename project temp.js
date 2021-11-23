// Author: Terrence Creech
// Date: 11/08/21
// Assignment 7 

var canvas;
var gl;

var newX = 0;
var newY = 0;
var newZ = -1;

var NumVertices  = 36;
var numTextures = 1;	// 1 texture per side of cube

var points = [];
var texCoordsArray = []; // holds texture coordinates
var texture = [ ];  // array of textures

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var image = [ ];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

var vertices = [
    vec4( -100, -100,  100, 100.0 ),
    vec4( -100,  100,  100, 100.0 ),
    vec4( 100,  100,  100, 100.0 ),
    vec4( 100, -100,  100, 100.0 ),
    vec4( -100, -100, -100, 100.0 ),
    vec4( -100,  100, -100, 100.0 ),
    vec4( 100,  100, -100, 100.0 ),
    vec4( 100, -100, -100, 100.0 )
];

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

function quad(a, b, c, d) 
{
	// pushes texture coordinates with vertice coordinates
	 points.push(vertices[a]); 
     texCoordsArray.push(texCoord[0]);

     points.push(vertices[b]); 
     texCoordsArray.push(texCoord[1]); 

     points.push(vertices[c]); 
     texCoordsArray.push(texCoord[2]); 
   
     points.push(vertices[a]); 
     texCoordsArray.push(texCoord[0]); 

     points.push(vertices[c]); 
     texCoordsArray.push(texCoord[2]); 

     points.push(vertices[d]); 
     texCoordsArray.push(texCoord[3]);   
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

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	colorCube();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord ); 
    
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
		case '1':
			axis = xAxis;
			theta[axis] += 2.0;
			break;
		case '2':
			axis = xAxis;
			theta[axis] -= 2.0;
			break;
		case '3':
			axis = yAxis;
			theta[axis] += 2.0;
			break;
		case '4':
			axis = yAxis;
			theta[axis] -= 2.0;
			break;
		case '5':
			axis = zAxis;
			theta[axis] += 2.0;
			break;
		case '6':
			axis = zAxis;
			theta[axis] -= 2.0;
			break;
		case 'F':
			newZ += .1;
			break;
		case 'B':
			newZ += -.1;
			break;
		case 'U':
			newY += 1;
			break;
		case 'D':
			newY -= 1;
			break;
		case 'R':
			newX += 1;
			break; 
		case 'L':
			newX -= 1;
			break;
	}
}

// initializes textures and put them into an array
function initializeTexture( myImage, fileName, id) {
	myImage[id] = new Image();
	myImage[id].onload = function() {
		configureTexture( myImage[id], id );
	}
	myImage[id].src = fileName;
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   //theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, flatten(theta));
	
	mvMatrix = mat4( );
	mvMatrix = mult(mvMatrix, translate(newX, newY, newZ, 0.0));
	mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));
	pMatrix = perspective(45.0, 1.0, 1.0, 500.0);
	
	gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
	gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

	gl.bindTexture( gl.TEXTURE_2D, texture[0] );
		// one texture per side
	gl.drawArrays( gl.TRIANGLES, 0, points.length );

    requestAnimFrame( render );
}

