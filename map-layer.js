var MapLayer = Object.extend({
	constructor: function(application, city, data, kpDataText) {
		this.application = application;
		this.city = city;
		this.name = data.name;
		this.style = data.style;
		this.initData = data;
		this.visible = false;

		this.kpList = [];
		var rawKpList = JSON.parse(kpDataText);
		for (var i in rawKpList) {
			this.kpList.push(new MapKP(this, rawKpList[i]));
		}

		this.initListItem();

		if (this.application.getCheckedState(this.checkedStateKey()) != null) {
			this.setVisible(this.application.getCheckedState(this.checkedStateKey()));
		}
	},

	checkedStateKey: function() {
		return this.city.name + ":" + this.name;
	},

	initListItem: function() {
		var result = this.application.createListCheckboxItem(this.name);
		this.addLayerToCityList(this.name, result.li);

		this.checkbox = result.checkbox;
		result.checkbox.onclick = (function() {
			this.setVisible(this.checkbox.checked);
		}).bind(this);
	},

	addLayerToCityList: function(name, li) {
		var existingLi = this.city.listRoot.getElementsByTagName('li');
		for (var i = 0; i < existingLi.length; ++i) {
			var el = existingLi[i];
			var existingName = el.getElementsByTagName('label')[0].innerText;
			if (name < existingName) {
				this.city.listRoot.insertBefore(li, el);
				return;
			}
		}

		this.city.listRoot.appendChild(li);
	},

	setVisible: function(visible) {
		if (this.visible == visible)
			return;
		this.visible = visible;
		this.checkbox.checked = visible;
		this.application.setCheckedState(this.checkedStateKey(), visible);

		this.kpList.forEach((function(map, visible, kp) {
			kp.setVisible(map, visible);
		}).bind(this, this.application.map, visible))
	},

	getVisibleKP: function(bounds) {
		var result = [];
		this.kpList.forEach((function(result, bounds, kp) {
			var placemark = kp.getPlacemark();
			if (placemark && bounds.contains(placemark.getGeoPoint())) {
				result.push(kp);
			}
		}).bind(this, result, bounds))
		return result;
	}
});
