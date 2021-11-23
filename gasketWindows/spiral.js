/* Author: Griffin Quinn
 * Date: 9/15/21
 * Assignment: Assignment 1
 * Title: spiral.js
 * */
var gl;
var points = [];

var NumPoints = 5000;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Calling spiral to set up points array
    //
    spiral();
    
   
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function spiral() {
    var vertices = 100;
    var a = 0;
    var angInc = (35 * (Math.PI / 180));
    var r = .02;
    var rInc = .004;
    var xc = 0;
    var yc = 0;
    var x = 0;
    var y = 0;
    var vector = vec2(0, 0);

    for (let i = 0; i < vertices; i++) {
        x = xc + (r * (Math.cos(a))); //use trig to find new x and y for spiral
        y = yc + (r * (Math.sin(a)));

        vector = vec2(x, y);
        points.push(vector); //vectorize and push onto points list

        a += angInc;
        r += rInc; //increment radius and angle
    }
} //end spiral



function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, points.length );
}
