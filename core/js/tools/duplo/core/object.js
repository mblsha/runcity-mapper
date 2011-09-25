Object.append = function(object) {
	for (var i = 1; i < arguments.length; i++) {
		var extension = arguments[i];
		for (var key in extension)
			if (extension.hasOwnProperty(key))
				object[key] = extension[key];
	}
	
	return object;
}


Object.$empty = function () {}

Object.$base = function $base() {
	var caller = $base.caller || arguments.callee.caller;
	return caller.$class.$super.prototype[caller.$name].apply(this, arguments.length ? arguments : caller.arguments);
}

Object.$super = function $super() {
	var caller = $super.caller || arguments.callee.caller;
	return caller.$class.$super.prototype;
}

Object.append(Object, {
	merge: function() {
		return Object.append.apply(this, [{}].concat(Array.make(arguments)))
	},
	
	extend: function(members, statics) {
		
		var $class = function $class() {
			if ($class.prototype.$constructor)
				return $class.prototype.$constructor.apply(this, arguments);
		}
		
		var prototype = {},
			parent = (this == Object ? null : this);
		
		if (parent) {
			if (prototype.__proto__) {
				prototype.__proto__ = parent.prototype;
			} else {
				Class.$empty.prototype = parent.prototype;
				prototype = new Object.$empty();
			}
			prototype.constructor = $class;
		}
		
		$class.$super = parent;
		$class.prototype = prototype;
		$class.extend = Object.extend;
		
		prototype.$class = $class;
		prototype.$super = Object.$super;
		prototype.$base = Object.$base;
		
		if (members.constructor && members.constructor != Object) {
			members.$constructor = members.constructor;
			delete members.constructor;
		}
		
		for (var name in members) {
			var member = members[name];
			if (member instanceof Function) {
				member.$name = name;
				member.$class = $class;
			}
			prototype[name] = member;
		}
		
		if (statics)
			for (var name in statics)
				$class[name] = statics[name];
		
		return $class;
	},
	
	implement: function(object, implementation) {
		var prototype = object.prototype;
		for (var key in implementation)
			if (implementation.hasOwnProperty(key) && !(key in prototype))
				prototype[key] = implementation[key];
	}
});
