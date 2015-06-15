precision mediump float;
varying vec2 vTextureCoord;

uniform sampler2D texture;
uniform sampler2D textureNormal;
varying float vDepth;
varying float heightOffset;

float contrast(float mValue, float mScale, float mMidPoint) {
	return clamp( (mValue - mMidPoint) * mScale + mMidPoint, 0.0, 1.0);
}

float contrast(float mValue, float mScale) {
	return contrast(mValue,  mScale, .5);
}


const vec3 lightColor = vec3(1.0);
const vec3 ambient = vec3(0.2);
const vec3 lightDir = vec3(1.0, 0.15, .2);
const float lightAmnt = 2.4;

void main(void) {
	vec4 color = texture2D(texture, vTextureCoord);
	vec3 normal = texture2D(textureNormal, vTextureCoord).rgb;
	normal = normalize(normal * 2.0 - 1.0);

	float lightWeight = max(dot(normal, normalize(lightDir)), 0.0);
	color.rgb = color.rgb * ambient + color.rgb * lightWeight * lightColor * lightAmnt;

	color.rgb *= contrast(vDepth, 2.45, .475);
	gl_FragColor = color;
	// gl_FragColor.rgb = normal;
}