function Cookies(document) {
	this.document = document;
}

Cookies.prototype = {
	set: function(name, value, options) {
		if (options.encode != false)
			value = encodeURIComponent(value);
		if (options.domain)
			value += '; domain=' + options.domain;
		if (options.path)
			value += '; path=' + options.path;
		if (options.duration) {
			var date = new Date();
			date.setTime(date.getTime() + options.duration * 24 * 60 * 60 * 1000);
			value += '; expires=' + date.toGMTString();
		}
		
		if (options.secure)
			value += '; secure';
		
		this.document.cookie = name + '=' + value;
	},
	
	get: function(name) {
		var value = this.document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
		return value ? decodeURIComponent(value[1]) : null;
	},
	
	remove: function(name, options) {
		options.duration = -1;
		this.write(name, '', options);
	}
}

document.cookies = new Cookies(document);
