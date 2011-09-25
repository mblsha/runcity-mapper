Object.implement(String, {
	escapeRegExp: function() {
		return this.replace(/([\|\!\[\]\^\$\(\)\{\}\+\=\?\.\*\\])/g, "\\$1");
	},
	
	trim: function() {
		return this.replace(/(^[\s\xA0]+|[\s\xA0]+$)/g, '');
	},
	
	normalize: function(string) {
		return this.trim(this.replace(/[\s\xA0]{2,}/g, ''));
	}
});




String.prototype.SPLIT = function xxx() {
	var m = this == '' ? [] : this.split(','),
		tags = [];
	for (var i = m.length; i --;) {
		var tag = (m[i] || '').normalize();
		if (tag)
			tags.pushUnique(tag);
	}
	tags.sort();
	return tags;
}


String.prototype.test = function(text) {
	return ((text == (lower = text.toLowerCase())) ? this.toLowerCase().indexOf(lower) : this.indexOf(text)) != -1;
}
