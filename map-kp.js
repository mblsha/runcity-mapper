var MapKP = Object.extend({
	constructor: function(layer, rawData) {
		this.layer = layer
		this.rawData = rawData;
	},

	setVisible: function(map, visible) {
		var placemark = this.getPlacemark();
		if (placemark == null)
			return;

		if (visible) {
			map.addOverlay(placemark);
			if (this.layer.application.initialKpData(this)) {
				this.layer.application.addKpWithData(this);
			}
		}
		else {
			map.removeOverlay(placemark);
		}
	},

	getPlacemark: function() {
		if (this.placemark)
			return this.placemark;

		if (!this.rawData.lat || !this.rawData.lon)
			return null;

		this.placemark = new YMaps.Placemark(
			new YMaps.GeoPoint(this.rawData.lon, this.rawData.lat),
			{ style: this.layer.style }
		);
		// this.placemark.setIconContent(this.rawData.id);
		this.placemark.name = this.rawData.id + " " + this.rawData.name + " (" + this.layer.name + ")";
		this.placemark.description = this.rawData.description;
		return this.placemark;
	},

	setIdOnPlacemarkVisible: function(visible, data) {
		var text = null;
		if (visible) {
			text = this.displayId(data.showLayerName);
		}

		if (this.placemark) {
			this.placemark.setIconContent(text);
		}
	},

	fullId: function() {
		return this.rawData.id + ":" + this.layer.name + ":" +  this.layer.city.name;
	},

	shortId: function() {
		return this.rawData.id + ":" + this.layer.name;
	},

	displayId: function(showLayerName) {
		if (showLayerName)
			return this.shortId();
		return this.rawData.id;
	}
});
