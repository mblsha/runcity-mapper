var Mapper = Object.extend({
	constructor: function() {
		this.mapListForm = document.getElementById("MapListForm");
		this.kpList = document.getElementById("KPList");
		this.addButton = document.getElementById("AddButton");
		this.addButton.onclick = (function() {
			this.addButtonClicked();
		}).bind(this);

		this.clearButton = document.getElementById("ClearButton");
		this.clearButton.onclick = (function() {
			this.clearButtonClicked();
		}).bind(this);

		this.map = new YMaps.Map(document.getElementById("YMapsID"));
		this.map.setCenter(new YMaps.GeoPoint(37.64, 55.76), 10);

		this.map.addControl(new YMaps.TypeControl());
		this.map.addControl(new YMaps.ToolBar());
		this.map.addControl(new YMaps.Zoom());
		// this.map.addControl(new YMaps.MiniMap());
		this.map.addControl(new YMaps.ScaleLine());

		this.initData();
	},

	initData: function() {
		this.checkedState = {};
		this.data = [];
		this.visibleKP = {};

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
			this.data.push(new MapCity(this, city));
		}).bind(this));
	},

	startSaveStateTimer: function() {
		if (this.saveStateTimer) {
			clearTimeout(this.saveStateTimer);
			this.saveStateTimer = null;
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
		localStorage.setItem('visible_kp', JSON.stringify(this.initialVisibleKP));

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

		this.clearButtonClicked();
		var initialVisibleKPState = localStorage.getItem('visible_kp');
		if (initialVisibleKPState == null || initialVisibleKPState == "undefined" || initialVisibleKPState.length == 0)
			return;
		this.initialVisibleKP = JSON.parse(initialVisibleKPState);
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

	addButtonClicked: function() {
		var result = [];
		this.data.forEach((function(result, city) {
			result.push(city.getVisibleKP(this.map.getBounds()));
		}).bind(this, result));

		// FIXME: could this be done easier?
		result.forEach((function(city) {
			city.forEach((function(layer) {
				layer.forEach((function(kp) {
					this.visibleKP[kp.fullId()] = kp;
				}).bind(this));
			}).bind(this));
		}).bind(this));

		this.visibleKPChanged();
	},

	clearButtonClicked: function() {
		this.showUniqueIdsForVisibleKP(false);
		this.visibleKP = {};
		this.visibleKPChanged();
	},

	visibleKPChanged: function() {
		this.updateVisibleKPnonUniqueIds();
		this.showUniqueIdsForVisibleKP(true);
		this.updateKPList();
	},

	updateVisibleKPnonUniqueIds: function() {
		this.visibleKPnonUniqueIds = {};
		var idHash = {};

		this.hashKeys(this.visibleKP).sort().forEach((function(idHash, key) {
			var kp = this.visibleKP[key];
			if (!idHash[kp.rawData.id]) {
				idHash[kp.rawData.id] = [];
			}
			idHash[kp.rawData.id].push(kp);
		}).bind(this, idHash));

		this.hashKeys(idHash).sort().forEach((function(idHash, key) {
			var array = idHash[key]
			if (array.length > 1) {
				for (var i = 0; i < array.length; ++i) {
					this.visibleKPnonUniqueIds[array[i].fullId()] = true;
				}
			}
		}).bind(this, idHash));
	},

	showUniqueIdsForVisibleKP: function(visible) {
		this.initialVisibleKP = {};
		this.hashKeys(this.visibleKP).sort().forEach((function(key) {
			var kp = this.visibleKP[key];
			var data = {
				showLayerName: this.visibleKPnonUniqueIds[kp.fullId()] != null
			};
			kp.setIdOnPlacemarkVisible(visible, data);

			this.initialVisibleKP[key] = data;
		}).bind(this));
	},

	updateKPList: function() {
		this.clearKPList();

		createSpan = function(klass, text, li) {
			if (!text || text.length == 0)
				return;

			var span = document.createElement('span');
			li.appendChild(span);

			span.setAttribute('class', klass);
			span.textContent = text;
		};

		this.sortedVisibleKPkeys().forEach((function(createSpan, key) {
			var kp = this.visibleKP[key];

			var li = document.createElement('li');
			var showLayerName = this.visibleKPnonUniqueIds[kp.fullId()] != null;
			createSpan('id', kp.displayId(showLayerName), li);
			createSpan('name', kp.rawData.name, li);
			// createSpan("image", kp.rawData.image, li);
			createSpan('description', kp.rawData.description, li);
			createSpan('quest', kp.rawData.quest, li);
			createSpan('answer', kp.rawData.answer, li);
			createSpan('longanswer', kp.rawData.longanswer, li);

			this.kpList.appendChild(li);
		}).bind(this, createSpan));
	},

	clearKPList: function() {
		while (this.kpList.children.length) {
			this.kpList.removeChild(this.kpList.children[0]);
		}
	},

	sortedVisibleKPkeys: function() {
		var intHash = {};
		this.hashKeys(this.visibleKP).sort().forEach((function(intHash, key) {
			var kp = this.visibleKP[key];

			var intHashKey = parseInt(kp.rawData.id);
			if (!intHash[intHashKey])
				intHash[intHashKey] = [];
			intHash[intHashKey].push(key);
		}).bind(this, intHash));

		var result = [];
		// intHash is sorted by default
		for (var key in intHash) {
			result = result.concat(intHash[key]);
		}
		return result;
	},

	initialKpData: function(kp) {
		return this.initialVisibleKP[kp.fullId()];
	},

	addKpWithData: function(kp) {
		kp.setIdOnPlacemarkVisible(true, this.initialKpData(kp));
		this.visibleKP[kp.fullId()] = kp;

		if (this.addKpWithDataTimer) {
			clearTimeout(this.addKpWithDataTimer);
			this.addKpWithDataTimer = null;
		}

		this.addKpWithDataTimer = setTimeout((function() {
			this.visibleKPChanged();
		}).bind(this), 500);
	},

//----------------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------------

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
