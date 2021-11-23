/*
Author: Griffin Quinn
Assignment: Assignment 5
Date: 10/29/21
Title: shadowBox.js
*/
var canvas;
var gl;

var cBuffer;
var modelView, projection;
var mvMatrix, pMatrix;

var light = vec3(0.0, 250.0, -50.0);

var shadowColors = [];

var points = [];
var colors = [];
var vertices = [
    vec3( -50, -50,  50 ),
    vec3( -50,  50,  50 ),
    vec3(  50,  50,  50 ),
    vec3(  50, -50,  50 ),
    vec3( -50, -50, -50 ),
    vec3( -50,  50, -50 ),
    vec3(  50,  50, -50 ),
    vec3(  50, -50, -50 )
];

var vertexColors = [
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 0.0, 1.0, 1.0 ]   // magenta
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];
var m;

var thetaLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    m = mat4();
    m[3][3] = 0;
    m[3][1] = -1/light[1];

    drawBox();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );
    pMatrix = ortho(-250, 250, -250, 250, -250, 250);
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

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
	}
}

function drawBox()
{
    quad( vertices[1], vertices[0], vertices[3], vertices[2], vertexColors[0] );
    quad( vertices[2], vertices[3], vertices[7], vertices[6], vertexColors[1] );
    quad( vertices[4], vertices[5], vertices[6], vertices[7], vertexColors[2] );
    quad( vertices[5], vertices[4], vertices[0], vertices[1], vertexColors[3] );
    quad( vertices[1], vertices[2], vertices[6], vertices[5], vertexColors[4] );
    quad( vertices[0], vertices[4], vertices[7], vertices[3], vertexColors[5] );


}

function quad(a, b, c, d, color) 
{

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( indices[i] );
        colors.push(color);
        shadowColors.push(vec4(0.3, 0.3, 0.3, 1.0));

        
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mvMatrix = mat4( );
    mvMatrix = mult(mvMatrix, rotate(30.0, 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, translate(0.0, 100.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));

	gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    mvMatrix = mat4( );
    mvMatrix = mult(mvMatrix, rotate(30.0, 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, translate(light[0], light[1], light[2], 0.0));
    mvMatrix = mult(mvMatrix, m);
    mvMatrix = mult(mvMatrix, translate(-light[0], -light[1], -light[2], 0.0));
    mvMatrix = mult(mvMatrix, translate(0.0, 100.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(shadowColors), gl.STATIC_DRAW );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    requestAnimFrame( render );
}

