var MapLayer = Object.extend({
	constructor: function(application, data, kpDataText) {
		this.application = application;
		this.initData = data;
		this.kpList = JSON.parse(kpDataText);

		this.addToMapListForm(application.mapListForm);
	},

	addToMapListForm: function(mapListForm) {
		var li = document.createElement('li');
		var label = document.createElement('label');
		var checkbox = document.createElement('input');
		var centerLink = document.createElement('a');

		li.appendChild(label);
		label.textContent = this.initData.name;
		label.prependChild(checkbox);
		label.appendChild(centerLink);
		mapListForm.appendChild(li);

		label.onmouseover = function() { this.className += " hover"; };
		label.onmouseout = function() { this.className = this.className.replace(" hover", ""); };

		checkbox.setAttribute('type', 'checkbox');
		checkbox.setAttribute('id',   this.initData.fileName);

		checkbox.onclick = (function(id) {
			var checkbox = document.getElementById(id);
			this.setVisible(checkbox.checked);
		}).bind(this, this.initData.fileName);

		centerLink.setAttribute('href', '#');
		centerLink.textContent = "(центрировать)";
		centerLink.onclick = (function() {
			this.centerMap();
		}).bind(this);
	},

	setVisible: function(visible) {
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
	},

	centerMap: function() {
		application.map.setCenter(this.initData.center, 10);
	}

});
