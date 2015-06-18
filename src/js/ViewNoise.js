// ViewNoise.js


var GL = bongiovi.GL;
var gl;
var glslify = require("glslify");
// var ShaderTangle = require("./ShaderTangle");

function ViewNoise() {
	gl = GL.gl;
	bongiovi.View.call(this, null, glslify("../shaders/noise.frag"));

	console.log(this.shader.fragmentShader);
	// ShaderTangle.load(this.shader.fragmentShader, this.shader);

	new TangledShader(gl, this.shader.fragmentShader, this._onShaderUpdate.bind(this));
}

var p = ViewNoise.prototype = new bongiovi.View();
p.constructor = ViewNoise;


p._init = function() {
	this.mesh = bongiovi.MeshUtils.createPlane(2, 2, 1);
};

p._onShaderUpdate = function(shader) {
	this.shader.attachShaderProgram();
};

p.render = function() {
	this.shader.bind();
	GL.draw(this.mesh);
};

module.exports = ViewNoise;