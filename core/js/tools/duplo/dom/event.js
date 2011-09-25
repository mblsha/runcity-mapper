(function() {
	function EventListener(element, type, listener, options) {
		this.element = element;
		this.type = type instanceof Array ? type : [type];
		this.options = options || {};
		this.listener = this.options.context ? listener.bind(this.options.context) : listener;
		this.enabled = false;
		
		if (this.options.add !== false)
			this.enable();
	}
	
	Object.implement(EventListener, {
		enable: function() {
			if (this.enabled)
				return;
			for (var i = 0; i < this.type.length; i++)
				this.element.addEventListener(this.type[i], this.listener, this.options.capture);
			this.enabled = true;
		},
		
		disable: function() {
			if (!this.enabled)
				return;
			for (var i = 0; i < this.type.length; i++)
				this.element.removeEventListener(this.type[i], this.listener, this.options.capture);
			this.enabled = false;
		}
	});
	
	var events = {
		on: function(type, listener, options) {
			return new EventListener(this, type, listener, options);
		},
		
		fire: function(type) {
			if (document.createEvent) {
				var event = document.createEvent('HTMLEvents');
				event.initEvent(type, true, true);
				return this.dispatchEvent(event);
			}
			else
				if (document.createEventObject) {
					var event = document.createEventObject();
					return this.fireEvent('on' + type, event);
				}
		}
	}
	
	// temporary ugly workaround for Opera
	Object.implement(XMLHttpRequest, {
		addEventListener: function(type, listener, capture) {
			this['on' + type] = function() {
				listener({target: this});
			};
		},
		
		removeEventListener: function() {
		}
	});

	
	Object.implement(HTMLElement, events);
	Object.implement(XMLHttpRequest, events);
	Object.append(window, events);
	Object.append(document, events);
})();