var MapLayer = Object.extend({
	constructor: function(application, city, data, kpDataText) {
		this.application = application;
		this.city = city;
		this.initData = data;
		this.kpList = JSON.parse(kpDataText);
		this.visible = false;

		this.addToMapListForm(application.mapListForm);
	},

	addToMapListForm: function(mapListForm) {
		var result = this.application.createListCheckboxItem(this.initData.name);
		this.addLayerToCityList(this.initData.name, result.li);

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
		this.visible = visible;
		this.checkbox.checked = visible;

		for (var i in this.kpList) {
			var placemark = this.getPlacemark(this.kpList[i]);
			if (placemark == null)
				continue;

			if (visible)
				application.map.addOverlay(placemark);
			else
				application.map.removeOverlay(placemark);
		}
	},

	getPlacemark: function(kp) {
		if (kp.placemark)
			return kp.placemark;

		if (!kp.lat || !kp.lon)
			return null;

		kp.placemark = new YMaps.Placemark(
			new YMaps.GeoPoint(kp.lon, kp.lat),
			{ style: this.initData.style }
		);
		// kp.placemark.setIconContent(kp.id);
		kp.placemark.name = kp.id + " " + kp.name + " (" + this.initData.name + ")";
		kp.placemark.description = kp.description;
		return kp.placemark;
	}
});
