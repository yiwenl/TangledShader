// mountain.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform sampler2D textureHeight;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoord;
varying float vDepth;
varying float vHeight;

//float n = 5.0;
//float f = 800.0;
	
float getDepth(float z, float n, float f) {
	return (2.0 * n) / (f + n - z*(f-n));
}

void main(void) {
	vec4 pos = vec4(aVertexPosition, 1.0);
	vTextureCoord = aTextureCoord;

	float h = texture2D(textureHeight, aTextureCoord).r;	
	vHeight = h;
	pos.y += h * 200.0;

	vec4 V = uPMatrix * uMVMatrix * pos;
    gl_Position = V;   

    vDepth = 1.0 - getDepth(V.z/V.w, 5.0, 1000.0);
}