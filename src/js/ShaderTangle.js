// ShaderTangle.js
var GL = bongiovi.GL;
var gl;
function ShaderTangle() {
	this.isOpened = true;
}


var p = ShaderTangle.prototype;


var formHTMLString = function(mStr) {
	mStr = mStr.replace(">", "&gt");
	mStr = mStr.replace("<", "&lt");
	mStr = mStr.replace(/\n/g, '<br/>');
	mStr = mStr.replace(/\t/g, '&emsp;&emsp;&emsp;&emsp;');
	return mStr;
}


p.load = function(mShader, mShaderProgram) {
	if(!gl) gl = GL.gl;

	this._shader = mShader;
	this._program = mShaderProgram;
	this._tangleBind = this._tangle.bind(this);
	var strShader = gl.getShaderSource(mShader);
	// strShader = formHTMLString(strShader);
	
	this._uiContainer = document.createElement("div");
	this._uiContainer.className = "Tangle-Container";
	document.body.appendChild(this._uiContainer);
	var p = document.createElement("p");
	this._uiContainer.appendChild(p);
	p.className = 'Shader-Tangle';
	this._formTangle(strShader);

	this.btnArrow = document.createElement("div");
	this.btnArrow.className = "Tangle-Button";
	this._uiContainer.appendChild(this.btnArrow);
	this.btnArrow.addEventListener("click", this._onToggle.bind(this));
};


p._onToggle = function() {
	this.isOpened = !this.isOpened;
	if(this.isOpened) this._uiContainer.classList.remove("is-Closed");
	else this._uiContainer.classList.add("is-Closed");
};


p._formTangle = function(str) {
	var p = document.querySelector('.Shader-Tangle');
	p.classList.remove("is-Error");
	var strP = "";

	var reg = new RegExp(/(?![vec]|[\(]|[GLSLIFY\s]|[mat]|[\,]|[\*]|[\-]|[\+]|[sampler]).\d*\.+\d+/g);
	var match;
	var values = [];
	var i = 0;
	var preIndex = 0;
	this._tangleStrings = [];
	while (match = reg.exec(str)) {
		var strBefore = str.substring(preIndex, match.index);
		preIndex = reg.lastIndex;
		var value = parseFloat(match);
		values.push(value);
		var precision = this.getPrecision(value);
		var step = this.getStep(precision);
		var valueRange = this.getValueRange(value);

		var strBeforeP = strBefore.replace(">", "&gt");
		strBeforeP = strBefore.replace("<", "&lt");

		strP += strBeforeP;
		this._tangleStrings.push(strBefore);
		strP += '<span class="TKAdjustableNumber" data-var="data'+i+'" data-min="'+valueRange.min+'" data-max="'+valueRange.max+'" data-step="'+step+'" data-format="%.' + precision + 'f"></span>';
		i++;
	}

	if(i == 0 ) {
		p.innerHTML = "";
		return;
	}

	var strLeft = str.substring(preIndex);
	this._tangleStrings.push(strLeft);
	strLeft = strLeft.replace(">", "&gt");
	strLeft = strLeft.replace("<", "&lt");
	strP += strLeft;
	strP = strP.replace(/\n/g, '<br/>');
	strP = strP.replace(/\t/g, '&emsp;&emsp;&emsp;&emsp;');
	
	p.innerHTML = strP;

	var that = this;

	var modelRange = {
		initialize: function () {
			this.numData = 0;
			for(var i=0; i<values.length;i++) {
				this["data" + i] = values[i];
				this.numData ++;
			}
		},
		update: function () {
			var ary = [];
			for(var i=0; i<this.numData; i++) {
				ary.push(this["data"+i]);
			}
			that._tangleBind(ary);
		}
	}

	var tangleRange = new Tangle(p, modelRange);
};


p._tangle = function(tangle) {
	var strNewShader = "";
	for(var i=0; i<tangle.length; i++) {
		strNewShader += this._tangleStrings[i];
		strNewShader += this.getFloatString(tangle[i]);
	}

	strNewShader += this._tangleStrings[this._tangleStrings.length-1];

	if(!this._program) return;

	gl.shaderSource(this._shader, strNewShader);
	gl.compileShader(this._shader);

	if(!gl.getShaderParameter(this._shader, gl.COMPILE_STATUS)) {
		console.warn("Error in Fragment Shader: ", gl.getShaderInfoLog(this._shader));
		console.warn(gl.getShaderSource(this._shader));
		var p = document.querySelector('.Shader-Tangle');
		p.classList.add("is-Error");
		return;
	}
	this._program.attachShaderProgram();
};

p.getPrecision = function(value) {
	var s = value + "";
	return 2;
	if(s.length == 1) {
		return 0;
	}
	var precision = (value + "").split(".")[1].length;
	return 4;
	// return precision;
};

p.getStep = function(mPrecision) {
	return 1/Math.pow(10, mPrecision);
};

p.getValueRange = function(value) {
	var tmp = Math.floor(value*10);
	if(tmp == 0) tmp = 1;
	return {max:tmp, min:-tmp};
};


p.getFloatString = function(value) {
	var s = value +'';
	if(s.indexOf(".") == -1) s += '.0';
	return s;
};



module.exports = new ShaderTangle();