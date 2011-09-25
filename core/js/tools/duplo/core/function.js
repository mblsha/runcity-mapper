Object.implement(Function, {
/*
	implement: function(members) {
		Object.implement(this, members);
	},
*/	
	bind: function(context) {
		var a = arguments,
			f = this;
		return function() {
			return f.apply(
				context,
				Array.prototype.slice.call(a, 1).concat(
					Array.prototype.slice.call(arguments, 0)
				)
			)
		};
	},
	
	timeout: function (context, timeout) {
		var method = this,
			args = Array.prototype.slice.call(arguments, 1);
		timeout = timeout || 1;
		return window.setTimeout(
			function() {
				return method.apply(context, args);
			},
			timeout
		);
	},
	
	filter: function() {
		var a = arguments,
			f = this;
		clearTimeout(this.timer);
		this.timer = setTimeout(function() {f.apply(f.context || null, Array.prototype.slice.call(a));}, this.delay || 500);
	}
});
