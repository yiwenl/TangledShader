(function() {
	var formHTMLString = function(str) {	return str.replace(/\>/g, "&gt").replace(/\</g, "&lt");	};

	TangledShader = function(gl, shader, callback, textOnly) {
		if(!gl) {	console.warn("Error , No WebGL Context");	}
		if(!shader) {	console.warn("Error , No WebGL Shader");	}

		if(shader.split !== undefined) textOnly = true;

		this._callback = callback;
		this.gl        = gl;
		this._shader   = shader;
		this._textOnly = textOnly === undefined ? false : textOnly;

		this._init();
	}

	var p = TangledShader.prototype;

	p._init = function() {
		this._tangleBind = this._tangle.bind(this);

		var strShader;
		if(this._textOnly) {
			strShader = this._shader;
		} else {
			strShader = this.gl.getShaderSource(this._shader);
		}
		 
		
		//	INIT UI
		this._uiContainer = document.createElement("div");
		this._uiContainer.className = "TangledShader";
		document.body.appendChild(this._uiContainer);
		this.tangleScript = document.createElement("p");
		this._uiContainer.appendChild(this.tangleScript);
		this.tangleScript.className = "TangledShader-tangleScript";
		this._formTangle(strShader);

		this.editor = document.createElement("textarea");
		this._uiContainer.appendChild(this.editor);
		this.editor.className = "TangledShader-tangleScript TangledShader-tangleScript--editor";
		this.editor.innerHTML = strShader;
		
		this.btnArrow = document.createElement("div");
		this.btnArrow.className = "TangledShader-closeButton";
		this._uiContainer.appendChild(this.btnArrow);
		this.btnArrow.addEventListener("click", this._onToggle.bind(this));

		this.btnUpdate = document.createElement("button");
		this.btnUpdate.innerHTML = "UPDATE SHADER";
		this.btnUpdate.className = "TangledShader-updateButton";
		this._uiContainer.appendChild(this.btnUpdate);
		this.btnUpdate.addEventListener("click", this._onUpdate.bind(this));
		console.log(this.btnUpdate);

		this._formTangle(strShader);

		this.editor.addEventListener("keydown", function(e) {
			this.classList.remove("is-Error");
			if(e.keyCode==9 || e.which==9){
				e.preventDefault();
				var s = this.selectionStart;
				this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
				this.selectionEnd = s+1; 
			}
		});
	};


	p._onUpdate = function() {
		var strShader = this.editor.value;
		console.log(strShader);
		this._formTangle(strShader);
	};



	p._onToggle = function() {
		this.isOpened = !this.isOpened;
		if(this.isOpened) this._uiContainer.classList.remove("is-Closed");
		else this._uiContainer.classList.add("is-Closed");
	};


	p._formTangle = function(str) {
		var p = this.tangleScript;
		p.classList.remove("is-Error");
		var strP            = "";
		// var reg             = new RegExp(/(?![vec]|\(|[GLSLIFY\s]|[mat]|\,|\*|\-|\+|[sampler]|\=|\/|\<|\>).\d*\.+\d+/g);
		var reg             = new RegExp(/\d*\.+\d+/g);
		var match;
		var values          = [];
		var i               = 0;
		var preIndex        = 0;
		this._tangleStrings = [];

		while (match = reg.exec(str)) {
			var strBefore  = str.substring(preIndex, match.index);
			preIndex       = reg.lastIndex;
			var value      = parseFloat(match);
			values.push(value);
			var precision  = this.getPrecision(value);
			var step       = this.getStep(precision);
			var valueRange = this.getValueRange(value);
			var strBeforeP = formHTMLString(strBefore);

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
		strLeft = formHTMLString(strLeft);
		strP += strLeft;
		strP = strP.replace(/\n/g, "<br/>").replace(/\t/g, "&emsp;&emsp;&emsp;&emsp;");
		
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

		if(this._textOnly) {
			this._callback(strNewShader);
			return;
		}

		this.gl.shaderSource(this._shader, strNewShader);
		this.gl.compileShader(this._shader);

		if(!this.gl.getShaderParameter(this._shader, this.gl.COMPILE_STATUS)) {
			console.warn("Error in Fragment Shader: ", this.gl.getShaderInfoLog(this._shader));
			console.warn(this.gl.getShaderSource(this._shader));
			this.tangleScript.classList.add("is-Error");
			this.editor.classList.add("is-Error");
			return;
		}
		
		// this.gl.attachShader(this._program, this._shader);
		if(this._callback) this._callback(this._shader);
	};


	p.getPrecision = function(value) {	return 2;	};

	p.getStep = function(mPrecision) {	return 1/Math.pow(10, mPrecision);	};

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

	var cssString = "html, body {width: 100%;height: 100%;margin: 0;padding: 0;overflow: hidden;position: static;background: #151413; }html {-webkit-text-size-adjust: none;-ms-text-size-adjust: none;text-size-adjust: none; }h1, h2, h3, h4, text, p, textarea {-webkit-font-smoothing: antialiased;-moz-osx-webkit-font-smoothing: antialiased; }textarea {border: none;overflow: auto;outline: none;-webkit-box-shadow: none;-moz-box-shadow: none;box-shadow: none;}.TangledShader-tangleScript {font-family: Courier;font-size: .8em;color: white;position: fixed;right: 0px;top: 0px;width: 40%;height: 50%;background: rgba(0, 0, 0, .8);margin: 0px;padding: 20px;box-sizing: border-box;overflow-y: scroll;transition: all .35s ease-out; }.TangledShader-tangleScript.is-Error {background: rgba(150, 0, 0, 0.5); }.is-Closed .TangledShader-tangleScript {-webkit-transform: translate(50%, 0);transform: translate(50%, 0);opacity: 0;pointer-events: none; }.TangledShader-tangleScript--editor {top:50%;background: rgba(33, 33, 33, .8);/*color:black;*/border: 1px solid rgba(255, 255, 255, .2);border: none;overflow: auto;outline: none;-webkit-box-shadow: none;-moz-box-shadow: none;box-shadow: none;}.TangledShader-closeButton {width: 24px;height: 24px;position: absolute;top: 10px;right: 10px;z-index: 9;cursor: pointer;transition: all .5s ease-in-out; }.is-Closed .TangledShader-closeButton {-webkit-transform: rotate(180deg);transform: rotate(180deg); }.TangledShader-closeButton:before {position: absolute;content: '';width: 12px;height: 1px;background: gray;-webkit-transform: translate(6px, 8px) rotate(45deg);transform: translate(6px, 8px) rotate(45deg);transition: all .5s ease-out; }.TangledShader-closeButton:after {position: absolute;content: '';width: 12px;height: 1px;background: gray;-webkit-transform: translate(6px, 16px) rotate(-45deg);transform: translate(6px, 16px) rotate(-45deg);transition: all .5s ease-out; }.TangledShader-closeButton:hover:before, .TangledShader-closeButton:hover:after {background: white; }.TangledShader-updateButton {position: absolute;right:30px;bottom:calc(50% - 30px);transition: all .35s ease-out}.is-Closed .TangledShader-updateButton {-webkit-transform: translate(50%, 0);transform: translate(50%, 0);opacity: 0;pointer-events: none; }";
	var doc = document;
	var injected = document.createElement('style');
	injected.type = 'text/css';
	injected.innerHTML = cssString;
	doc.getElementsByTagName('head')[0].appendChild(injected);
})();