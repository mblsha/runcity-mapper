/*
	date.js, version 0.3
	Copyright (c) 2010, Valentin Shergin, valentin@shergin.com
	License: LGPL
*/


;(function () {
	var prototype = Date.prototype;
/*
	prototype.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	prototype.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	
*/
	// Templates for pattern matching
	var methods = [
		/*  0: nothing */ null,
		/*  1: year    */ function(x) {this.setFullYear(x < 100 ? (x < 70 ? 2000 + x : 1900 + x) : x);},
		/*  2: month   */ function(x) {this.setMonth(x - 1);},
		/*  3: date    */ prototype.setDate,
		/*  4: hours   */ prototype.setHours,
		/*  5: minutes */ prototype.setMinutes,
		/*  6: seconds */ prototype.setSeconds,
		/*  7: am/pm   */ function (x) { if (x.toLowerCase() == 'pm') this.setHours(this.getHours() + 12); },
		/*  8: 1th     */ function (x) { var y = this.getDate(); this.setDate(x); if (y > x) this.setMonth(this.getMonth() + 1); },
		/*  9: 2y      */ function (x) { this.setFullYear(this.getFullYear() + x); },
		/* 10: 3m      */ function (x) { this.setMonth(this.getMonth() + x); },
		/* 11: 4w      */ function (x) { this.setDate(this.getDate() + x * 7); },
		/* 12: 5d      */ function (x) { this.setDate(this.getDate() + x); },
		/* 13: 6h      */ function (x) { this.setHours(this.getHours() + x); }
	];
	
	// reversed priority!
	var patterns = [
			// 10th 1y 2m 3w 4d
			{e: /(-?\d+)\s*\-?\s*th\w*/i, p: [8]},
			{e: /(-?\d+)\s*y\w*/i, p: [9]},
			{e: /(-?\d+)\s*m\w*/i, p: [10]},
			{e: /(-?\d+)\s*w\w*/i, p: [11]},
			{e: /(-?\d+)\s*d\w*/i, p: [12]},
			{e: /(-?\d+)\s*h\w*/i, p: [13], time: 1},
			// {часы:минуты {am|pm}}
			{e: /(^|[^\d])([012]?\d|21|22|23)\s*([\:\-\.]+)\s*([0-5]?\d)\s*(am|pm)?/i, p: [0, 4, 0, 5, 7], time: 1}
		],
		// {mm/dd/yy, mm/dd/yyyy} (USA, etc.)
		monthDayYear = {e: /(^|[^\d])(0?\d|10|11|12)\s*(\/+)\s*([012]?\d|30|31)\s*\3\s*((19|20)?\d\d)([^\d]|$)/, p: [0, 2, 0, 3, 1]},
		// {dd.mm.yy, dd.mm.yyyy, /.,-} (EU, Russia, etc.)
		dayMonthYear = {e: /(^|[^\d])([012]?\d|30|31)\s*([\.\-\,\/]+)\s*(0?\d|10|11|12)\s*\3\s*((19|20)?\d\d)([^\d]|$)/, p: [0, 3, 0, 2, 1]},
		// {yyyy-mm-dd, yy-mm-dd} (Canada, China, Japan, etc.)
		yearMonthDay = {e: /(^|[^\d])((19|20)?\d\d)\s*([\.\-\/]+)\s*(0?\d|10|11|12)\s*\4\s*([012]?\d|30|31)([^\d]|$)/, p: [0, 1, 0, 0, 2, 3]};
	
	
	Object.append(Date, {
		locale: {
			days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
		},
		
		matching: {
			methods: methods,
			patterns: {
				'%d.%m.%Y': patterns.concat([yearMonthDay, monthDayYear, dayMonthYear]),
				'%m/%d/%y': patterns.concat([yearMonthDay, dayMonthYear, monthDayYear]),
				'%Y-%m-%d': patterns.concat([monthDayYear, dayMonthYear, yearMonthDay])
			}
		},
		
		military: function() {
			return this.format.time.indexOf('%p') < 0;
		},
		
		detect: function() {
			var date = new Date();
			date.setFullYear(2013 /*year*/, 10 /*month*/, 12 /*day*/);
			var string = date.toLocaleDateString(),
				notation,
				day = string.indexOf('12'),
				month = string.indexOf('11') /* +1 */,
				year = string.indexOf('13');
			
			if ((day == 0) || (day < month && day < year))
				notation = '%d.%m.%Y';
			else
				if (day < year)
					notation = '%m/%d/%y';
				else
					notation = '%Y-%m-%d';
			
			var military = !/\b(am|pm)\b/i.test(new Date().toLocaleTimeString());
			
			return {
				date: notation,
				time: this.military ? '%H:%M' : '%I:%M %p',
				weekStarts: 0
			};
		}
	});
	
	Date.format = Date.detect();
	
})();


Date.prototype.parse = function(s) {
	var allDay = true,
		patterns = Date.matching.patterns[Date.format.date],
		methods = Date.matching.methods;
	
	for (var i = patterns.length; i--;) {
		var pattern = patterns[i],
			match = s.match(pattern.e);
		
		if (match) {
			if (pattern.time)
				allDay = false;
			var pointers = pattern.p;
			
			for (var j = 0; j < pointers.length; j++)
				if (pointers[j] && match[j + 1]) {
					var value = parseInt(match[j + 1], 10);
					methods[pointers[j]].call(this, isNaN(value) ? match[j + 1] : value);
				}
			
			s = s.replace(pattern.e, '');
		}
	}
	
	this.allDay(allDay);
	
	return this;
}

Date.prototype.format = function(format) {
	if (!format)
		format = '%c';
	
	function leadingZeros(d) {
		return (d < 10 ? '0' : '') + d;
	}
	
	// like Python, more: http://docs.python.org/library/time.html#time.strftime
	var patterns = {
		//'a':																				// Locale’s abbreviated weekday name.
		'A':	function() { return this.days[this.getDay()]; },							// Locale’s full weekday name.
		//'b':																				// Locale’s abbreviated month name.
		'B':	function() { return Date.locale.months[this.getMonth()]; },					// Locale’s full month name.
		'c':	function() { return this.format('%x' + (this.allDay() ? '' : ' %X')); },	// Locale’s appropriate date and time representation.
		'd':	function() { return leadingZeros(this.getDate()); },						// Day of the month as a decimal number [01,31].
		'H':	function() { return leadingZeros(this.getHours()); },						// Hour (24-hour clock) as a decimal number [00,23].
		'I':	function() { return leadingZeros(this.getHours() % 12); },					// Hour (12-hour clock) as a decimal number [01,12].
		//'j':																				// Day of the year as a decimal number [001,366].
		'm':	function() { return leadingZeros(this.getMonth() + 1); },					// Month as a decimal number [01,12].
		'M':	function() { return leadingZeros(this.getMinutes()); },						// Minute as a decimal number [00,59].
		'p':	function() { return this.getHours() < 12 ? 'AM' : 'PM'; },					// Locale’s equivalent of either AM or PM.
		'S':	function() { return leadingZeros(this.getSeconds()); },						// Second as a decimal number [00,61].
		//'U':																				// Week number of the year (Sunday as the first day of the week) as a decimal number [00,53]. All days in a new year preceding the first Sunday are considered to be in week 0.
		//'w':																				// Weekday as a decimal number [0(Sunday),6].
		//'W':																				// Week number of the year (Monday as the first day of the week) as a decimal number [00,53]. All days in a new year preceding the first Monday are considered to be in week 0.
		'x':	function() { return this.format(Date.format.date); },						// Locale’s appropriate date representation.
		'X':	function() { return this.format(Date.format.time); },						// Locale’s appropriate time representation.
		'y':	function() { return leadingZeros(this.getFullYear() % 100); },				// Year without century as a decimal number [00,99].
		'Y':	function() { return '' + this.getFullYear(); },								// Year with century as a decimal number.
		'Z':	function() { return ''; }													// Time zone name (no characters if no time zone exists).
	};
	
	var context = this,
		result = format,
		pattern;
	
	function replacer() {
		return patterns[pattern].call(context);
	}
	
	for (pattern in patterns)
		result = result.replace(
			'%' + pattern,
			replacer
		);
	
	return result;
}

Date.prototype.timestamp = function(timestamp) {
	if (timestamp) {
		this.setTime(timestamp * 1000);
		return this;
	}
	return parseInt(this.valueOf() / 1000);
}

Date.prototype.allDay = function(value) {
	if (value == undefined)
		return this.getSeconds() == 1;
	this.setSeconds(value ? 1 : 0);
	return this;
}

Date.prototype.clone = function() {
	return new Date(this.valueOf());
}

Date.prototype.date = function() {
	return new Date(this.getFullYear(), this.getMonth(), this.getDate());
}

Date.prototype.getDaysInMonth = function() {
	var year = this.getFullYear(),
		month = this.getMonth();
	return [31,(((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) ? 29 : 28),31,30,31,30,31,31,30,31,30,31][month];
}
