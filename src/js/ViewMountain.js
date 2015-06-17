// ViewMountain.js

var GL = bongiovi.GL;
var gl;
var glslify = require("glslify");


function ViewMountain() {
	// bongiovi.View.call(this, glslify("../shaders/mountain.vert"), bongiovi.ShaderLibs.get("simpleColorFrag"));
	bongiovi.View.call(this, glslify("../shaders/mountain.vert"), glslify("../shaders/mountain.frag"));
}

var p = ViewMountain.prototype = new bongiovi.View();
p.constructor = ViewMountain;


p._init = function() {
	gl = GL.gl;
	var positions = [];
	var coords = [];
	var indices = []; 

	var index = 0;
	var size = 300;
	var numSeg = 100;
	var u, v;
	var uvGap = 1/numSeg;
	var sx = - size * .5;


	var getPosition = function(x, y) {
		var px = x/numSeg;
		var pz = y/numSeg;

		tx = sx + px * size;
		ty = -0;
		tz = sx +  pz * size;

		return[tx, ty, tz];
	}

	for(var j=0; j<numSeg; j++) {
		for(var i=0; i<numSeg; i++) {
			positions.push(getPosition(i, j+1));
			positions.push(getPosition(i+1, j+1));
			positions.push(getPosition(i+1, j));
			positions.push(getPosition(i, j));

			u = i/numSeg;
			v = j/numSeg;

			coords.push([u, v+uvGap]);
			coords.push([u+uvGap, v+uvGap]);
			coords.push([u+uvGap, v]);
			coords.push([u, v]);

			indices.push(index*4 + 0);
			indices.push(index*4 + 1);
			indices.push(index*4 + 2);
			indices.push(index*4 + 0);
			indices.push(index*4 + 2);
			indices.push(index*4 + 3);

			index++;
		}
	}

	this.mesh = new bongiovi.Mesh(positions.length, indices.length, GL.gl.TRIANGLES);
	this.mesh.bufferVertex(positions);
	this.mesh.bufferTexCoords(coords);
	this.mesh.bufferIndices(indices);
};

p.render = function(textureHeight, textureNormal, texture) {
	this.shader.bind();
	this.shader.uniform("texture", "uniform1i", 0);
	this.shader.uniform("textureHeight", "uniform1i", 1);
	this.shader.uniform("textureNormal", "uniform1i", 2);
	texture.bind(0);
	textureHeight.bind(1);
	textureNormal.bind(2);
	GL.draw(this.mesh);
};

module.exports = ViewMountain;