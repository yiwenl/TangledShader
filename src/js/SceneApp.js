// SceneApp.js

var GL = bongiovi.GL, gl;
var ViewNoise = require("./ViewNoise");
var ViewMountain = require("./ViewMountain");
var ViewNormal = require("./ViewNormal");

function SceneApp() {
	gl = GL.gl;
	bongiovi.Scene.call(this);
	this.sceneRotation.lock(true);
	this.camera.lockRotation(false);
	this.camera._rx.value = -.5;
	this.camera._ry.value = .5;

	window.addEventListener("resize", this._resize.bind(this));
}


var p = SceneApp.prototype = new bongiovi.Scene();

p._initTextures = function() {
	console.log('Init Textures');

	for(var s in images) {
		this.texture = new bongiovi.GLTexture(images[s]);
	}

	var noiseSize = 512;
	this._fboNoise = new bongiovi.FrameBuffer(noiseSize, noiseSize);
	this._fboNormal = new bongiovi.FrameBuffer(noiseSize, noiseSize);

};

p._initViews = function() {
	console.log('Init Views');

	this._vNoise = new ViewNoise();
	this._vCopy = new bongiovi.ViewCopy();
	this._vMountain = new ViewMountain();
	this._vNormal   = new ViewNormal();
	
};

p.render = function() {
	gl.disable(gl.DEPTH_TEST);
	GL.setMatrices(this.cameraOtho);
	GL.rotate(this.rotationFront);

	this._fboNoise.bind();
	GL.setViewport(0, 0, this._fboNoise.width, this._fboNoise.height);
	this._vNoise.render();
	this._fboNoise.unbind();

	this._fboNormal.bind();
	this._vNormal.render(this._fboNoise.getTexture());
	this._fboNormal.unbind();

	GL.clear(0, 0, 0, 0);
	this._vCopy.render(this._fboNoise.getTexture());
	GL.setViewport(0, 0, GL.canvas.width, GL.canvas.height);
	gl.enable(gl.DEPTH_TEST);
	GL.setMatrices(this.camera);
	GL.rotate(this.sceneRotation.matrix);
	this._vMountain.render(this._fboNoise.getTexture(), this._fboNormal.getTexture(), this.texture);
};


p._resize = function() {
	GL.setSize(window.innerWidth, window.innerHeight);
	this.camera.resize(GL.aspectRatio);
};

module.exports = SceneApp;