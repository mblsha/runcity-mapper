Object.append(Array, {
	make: function(object) {
		return [].slice.call(object, 0)
	}
})

Object.implement(Array, {
	pushUnique: function(item) {
		if (this.indexOf(item) == -1)
			return this.push(item);
	},
	
	exists: function(item) {
		return this.indexOf(item) >= 0;
	},
	
	replace: function(before, after) {
		var index = this.indexOf(before);
		if (index != -1)
			return this[index] = after;
	},
	
	remove: function(item) {
		var index = this.indexOf(item);
		if (index != -1)
			return this.splice(index, 1)[0];
	},
	
	toggle: function(item) {
		if (this.exists(item))
			this.remove(item);
		else
			this.push(item);
	},
	
	forEach: function(callback, context) {
		var length = this.length >>> 0;
		if (typeof callback != "function")
			throw new TypeError();
		
		for (var i = 0; i < length; i++) {
			if (i in this)
				callback.call(context, this[i], i, this);
		}
	},
	
	JOIN: function() {
		return this.join(', ');
	}
});

