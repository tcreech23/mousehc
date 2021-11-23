/* Author: Griffin Quinn
 * Date: 10/1/21
 * Assignment: Assignment 3
 * Title: flower.js
 * */
var canvas;
var gl;
var vBuffer;
var triColor;
var vColorLoc;
var vertices = [];
//var modelView; // variable modelView inherited from HTML

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
   
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    triColor = vec4(1.0, 0.0, 0.0, 1.0);

    square(); //sets up vertices to use
    
    // Load the data into the GPU

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    vColorLoc = gl.getUniformLocation(program, "vColor");
    modelView = gl.getUniformLocation(program, "modelView");
    console.log("We made it");

    render();
};

function square() {
    var x = -.1;
    var y = -.1;
    var side = .2;

    vertices.push(vec2(x, y));
	vertices.push(vec2(x+side, y));
	vertices.push(vec2(x+side, y+side));
	vertices.push(vec2(x, y+side));
} //end spiral



function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform4fv(vColorLoc, triColor);
    var mvMatrix = [];

    //Draw out elements of flower at 30 degree iterations
    for(var i = 0; i < 12; i++) {

        //Outer Petal, Drawn Clockwise
        mvMatrix = rotate(i * -30.0, 0.0, 0.0, 1.0);
        mvMatrix = mult(mvMatrix, scalem(.5, 2.5, 1.0));
        mvMatrix = mult(mvMatrix, translate(0.0, 0.1 * Math.sqrt(2), 1.0));
        mvMatrix = mult(mvMatrix, rotate(-45, 0.0, 0.0, 1.0));
        gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));
        gl.drawArrays( gl.LINE_LOOP, 0, 4);

        //Inner Petal, Drawn Clockwise
        mvMatrix = rotate(i * -30.0, 0.0, 0.0, 1);
        mvMatrix = mult(mvMatrix, scalem(.25, 1.75, 1.0));
        mvMatrix = mult(mvMatrix, translate(0.0, 0.1 * Math.sqrt(2), 1.0));
        mvMatrix = mult(mvMatrix, rotate(-45, 0.0, 0.0, 1.0));
        gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));
        gl.drawArrays( gl.LINE_LOOP, 0, 4);

        //Outer Squares
        mvMatrix = rotate(i * -30.0 - 15.0, 0.0, 0.0, 1);
        mvMatrix = mult(mvMatrix, translate(0.0, .8, 1.0));
        gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));
        gl.drawArrays( gl.LINE_LOOP, 0, 4);


        //Outer Diamonds
        mvMatrix = rotate(i * -30.0 - 15.0, 0.0, 0.0, 1);
        mvMatrix = mult(mvMatrix, translate(0.0, 0.8, 1.0));
        mvMatrix = mult(mvMatrix, scalem(Math.sqrt(.02)/.2, Math.sqrt(.02)/.2, 1.0));
        mvMatrix = mult(mvMatrix, rotate(-45, 0.0, 0.0, 1.0));
        gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));
        gl.drawArrays( gl.LINE_LOOP, 0, 4);


    }
    window.requestAnimFrame(render);
}
