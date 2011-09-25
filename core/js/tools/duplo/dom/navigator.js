Object.append(navigator, {
	isOpera: function() {
		return !!window.opera;
	},
	
	isGecko: function() {
		return /a/[-1] == 'a';
	},
	
	isIE: function() {
		return '\v' == 'v';
	},
	
	isWebKit: function() {
		return navigator.userAgent.indexOf('WebKit') >= 0;
	}
});
