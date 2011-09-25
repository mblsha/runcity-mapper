var Mapper = Object.extend({
	constructor: function() {
		this.map = new YMaps.Map(document.getElementById("YMapsID"));
		this.map.setCenter(new YMaps.GeoPoint(37.64, 55.76), 10);

		this.map.addControl(new YMaps.TypeControl());
		this.map.addControl(new YMaps.ToolBar());
		this.map.addControl(new YMaps.Zoom());
		this.map.addControl(new YMaps.MiniMap());
		this.map.addControl(new YMaps.ScaleLine());

		this.data = {};

		[
			'msk2010-all.json',
			'msk2011-all.json'
		].forEach((function(fileName) {
			this.loadData(fileName);
		}).bind(this));
	},

	processData: function(fileName) {
		addKp = (function(kp) {
			if (!kp.lat || !kp.lon)
				return;

			kp.placemark = new YMaps.Placemark(new YMaps.GeoPoint(kp.lon, kp.lat));
			kp.placemark.name = kp.name;
			kp.placemark.description = kp.description;
			this.map.addOverlay(kp.placemark);
		}).bind(this);

		var d = this.data[fileName];

		for (var i in d) {
			addKp(d[i]);
		}
	},

	loadData: function(fileName) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "data/" + fileName, true);
		xhr.onreadystatechange = (function(fileName) {
			if ((xhr.readyState != 4) || (xhr.status != 200))
				return;

			this.data[fileName] = JSON.parse(xhr.responseText);
			this.processData(fileName);
		}).bind(this, fileName)
		xhr.send();
	}
});
