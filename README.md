# TangledShader

![alt text](http://www.bongiovi.tw/projects/tangledShader/tangledShader.jpg)
<br />
A simple tool for adjust the shader, build with Tangle Library by [Bret Victor @worrydream](http://worrydream.com/)<br />
https://github.com/worrydream/Tangle
<br />

## Usage
<pre>
new TangledShader(gl, shader, [callbackFunc, textOnly]);
</pre>
<br />
you'll need to pass in the WebGL context (gl), the WebGL Shader or the shader string (shader) and the callback function. There's an optional parameter "textOnly" which will indicate if it's in text only mode. Which will just return the updated shader string but not the WebGL Shader.

<br />
<br />
### With WebGL Shader
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

<br />
<br />
###With Shader String (e.g. using three.js)
<pre>
new TangledShader(renderer.context, fragment_shader, shaderUpdated);

function shaderUpdated( shaderStr ) {
    var material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: shaderStr
    } );

    mesh.material = material;
	
	//  render .... 
}
</pre>
