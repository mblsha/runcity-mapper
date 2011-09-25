// Internet Explorer test
if ('\v' == 'v') {
	(function() {
		HTMLElement = Element;
		//Event.implement = Element.implement = Object.implement;
		
		var listening = {
			addEventListener: function(type, listener, capture) {
				var element = this;
				
				var wrapper = function() {
					listener.call(element, window.event);
				}
				
				this.attachEvent('on' + type, wrapper);
			},
			
			removeEventListener: function() {
				this.detachEvent('on' + type, listener)
			}
		};
		
		Object.implement(HTMLElement, listening)
		Object.append(document, listening);
		Object.append(window, listening);
		
		Event.implement({
			preventDefault: function() {
				this.returnValue = false;
			},
			
			stopPropagation: function() {
				this.cancelBubble = true;
			}
		});
		
		Object.defineProperty(Event.prototype, 'target', {
			get: function() {
				return this.srcElement;
			}
		});
		
	})();
}
