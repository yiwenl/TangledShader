# TangledShader

A simple tool for adjust the shader, build with Tangle Library by [Bret Victor @worrydream](http://worrydream.com/)<br />
https://github.com/worrydream/Tangle

## Usage
<pre>
new TangledShader(gl, shader, [callbackFunc]);
</pre>
<br />
you'll need to pass in the WebGL context (gl), the WebGL Shader (shader) and the callback function.


<pre>
new TangledShader(gl, fragment_shader, shaderUpdated);

function shaderUpdated( shader ) {
    fragment_shader = shader;
    var program = gl.createProgram();
	gl.attachShader( program, vertex_shader );
	gl.attachShader( program, fragment_shader );
	gl.linkProgram( program );
	currentProgram = program;
	
	//  render .... 
}
</pre>
