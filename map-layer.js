var MapLayer = Object.extend({
	constructor: function(application, data, kpDataText) {
		this.application = application;
		this.initData = data;
		this.kpList = JSON.parse(kpDataText);

		var li = document.createElement('li');
		var label = document.createElement('label');
		label.textContent = data.name;
		label.onmouseover = function() { this.className += " hover"; };
		label.onmouseout = function() { this.className = this.className.replace(" hover", ""); };

		var checkbox = document.createElement('input');
		checkbox.setAttribute('type', 'checkbox');
		checkbox.setAttribute('id',   data.fileName);

		checkbox.onclick = (function(id) {
			var checkbox = document.getElementById(id);
			this.setVisible(checkbox.checked);
		}).bind(this, data.fileName);

		li.appendChild(label);
		label.prependChild(checkbox);
		application.mapListForm.appendChild(li);
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
		kp.placemark.name = kp.name + " (" + this.initData.name + ")";
		kp.placemark.description = kp.description;
		return kp.placemark;
	}

});
