var Mapper = Object.extend({
	constructor: function() {
		this.mapListForm = document.getElementById("MapListForm");

		this.map = new YMaps.Map(document.getElementById("YMapsID"));
		this.map.setCenter(new YMaps.GeoPoint(37.64, 55.76), 10);

		this.map.addControl(new YMaps.TypeControl());
		this.map.addControl(new YMaps.ToolBar());
		this.map.addControl(new YMaps.Zoom());
		// this.map.addControl(new YMaps.MiniMap());
		this.map.addControl(new YMaps.ScaleLine());

		this.checkedState = {};
		this.data = {};

		this.restoreSavedState();
		this.startSaveStateTimer();

		// http://api.yandex.ru/maps/jsapi/doc/ref/reference/styles.xml
		[
			{ name: "Москва",
			  center: new YMaps.GeoPoint(37.64, 55.76),
			  layers: [
			    { name: "2007",
			      style: "default#orangeSmallPoint",
			      fileName: "msk2007-all.json"
			    },
			    { name: "2008",
			      style: "default#yellowSmallPoint",
			      fileName: "msk2008-all.json"
			    },
			    { name: "2010",
			      style: "default#pinkSmallPoint",
			      fileName: "msk2010-all.json"
			    },
			    { name: "2011",
			      style: "default#darkblueSmallPoint",
			      fileName: "msk2011-all.json"
			    }
			  ]
			},

			{ name: "Санкт-Петербург",
			  center: new YMaps.GeoPoint(30.313622, 59.93772),
			  layers: [
			    { name: "2000",
			      style: "default#nightSmallPoint",
			      fileName: "spb2000-all.json"
			    },
			    { name: "2001",
			      style: "default#whiteSmallPoint",
			      fileName: "spb2001-all.json"
			    },
			    { name: "2002",
			      style: "default#greenSmallPoint",
			      fileName: "spb2002-all.json"
			    },
			    { name: "2003",
			      style: "default#redSmallPoint",
			      fileName: "spb2003-all.json"
			    },
			    { name: "2004",
			      style: "default#yellowSmallPoint",
			      fileName: "spb2004-all.json"
			    },
			    { name: "2007",
			      style: "default#greySmallPoint",
			      fileName: "spb2007-all.json"
			    },
			    { name: "2008",
			      style: "default#orangeSmallPoint",
			      fileName: "spb2008-all.json"
			    },
			    { name: "2009",
			      style: "default#pinkSmallPoint",
			      fileName: "spb2009-all.json"
			    },
			    { name: "2010",
			      style: "default#darkblueSmallPoint",
			      fileName: "spb2010-all.json"
			    }
			  ]
			},

			{ name: "Киев",
			  center: new YMaps.GeoPoint(30.522301, 50.451118),
			  layers: [
			    { name: "2010",
			      style: "default#pinkSmallPoint",
			      fileName: "kiev2010-all.json"
			    },
			    { name: "2011",
			      style: "default#darkblueSmallPoint",
			      fileName: "kiev2011-all.json"
			    }
			  ]
			}
		].forEach((function(city) {
			this.data[city.name] = new MapCity(this, city);
		}).bind(this));
	},

	startSaveStateTimer: function() {
		if (this.saveStateTimer) {
			clearTimeout(this.saveStateTimer);
			this.saveStateTimer = null
		}
		this.saveStateTimer = setTimeout("window.application.saveStateTimerTimeout()", 1000);
	},

	saveStateTimerTimeout: function() {
		state = {
			lat: this.map.getCenter().getLat(),
			lng: this.map.getCenter().getLng(),
			zoom: this.map.getZoom()
		};

		localStorage.setItem('map_state', JSON.stringify(state));

		this.startSaveStateTimer();
	},

	restoreSavedState: function() {
		var state = localStorage.getItem('map_state');
		if (state == null || state.length == 0)
			return;
		state = JSON.parse(state);
		this.map.setCenter(new YMaps.GeoPoint(state.lng, state.lat), state.zoom);

		var checkedState = localStorage.getItem('checked_state');
		if (checkedState == null || checkedState.length == 0)
			return;
		this.checkedState = JSON.parse(checkedState);
	},

	getCheckedState: function(key) {
		return this.checkedState[key]
	},

	setCheckedState: function(key, value) {
		this.checkedState[key] = value;
		if (!value)
			delete this.checkedState[key];
		localStorage.setItem('checked_state', JSON.stringify(this.checkedState));
	},

	createListCheckboxItem: function(name) {
		this.checkboxUniqueId = this.checkboxUniqueId || 0;
		this.checkboxUniqueId += 1;
		var id = 'check_' + this.checkboxUniqueId;

		var li = document.createElement('li');
		var label = document.createElement('label');
		var checkbox = document.createElement('input');
		var anchor = document.createElement('a');

		li.appendChild(label);
		label.textContent = name;
		label.prependChild(checkbox);
		label.appendChild(anchor);

		label.onmouseover = function() { this.className += " hover"; };
		label.onmouseout = function() { this.className = this.className.replace(" hover", ""); };

		checkbox.setAttribute('type', 'checkbox');
		checkbox.setAttribute('id', id);

		return {
			li: li,
			label: label,
			checkbox: checkbox,
			anchor: anchor
		};
	},

	hashKeys: function(obj) {
		var keys = [];
		for(var key in obj) {
			keys.push(key);
		}
		return keys;
	},

	randomString: function(len) {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var result = '';
		for (var i = 0; i < len; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			result += chars.substring(rnum,rnum+1);
		}
		return result;
	}
});
