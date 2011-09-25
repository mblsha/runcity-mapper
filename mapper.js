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
			{ name: "Москва 2010",
			  style: "default#pinkPoint",
			  fileName: "msk2010-all.json"
			},
			{ name: "Москва 2011",
			  style: "default#darkbluePoint",
			  fileName: "msk2011-all.json"
			}
		].forEach((function(data) {
			this.loadData(data);
		}).bind(this));
	},

	processData: function(name) {
		addKp = (function(name, kp) {
			if (!kp.lat || !kp.lon)
				return;

			kp.placemark = new YMaps.Placemark(
				new YMaps.GeoPoint(kp.lon, kp.lat),
				{ style: this.data[name].style }
			);
			kp.placemark.setIconContent(kp.id);
			kp.placemark.name = kp.name + " (" + name + ")";
			kp.placemark.description = kp.description;
			this.map.addOverlay(kp.placemark);
		}).bind(this, name);

		var d = this.data[name];

		for (var i in d.kpList) {
			addKp(d.kpList[i]);
		}
	},

	loadData: function(data) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "data/" + data.fileName, true);
		xhr.onreadystatechange = (function(data) {
			if ((xhr.readyState != 4) || (xhr.status != 200))
				return;

			this.data[data.name] = data;
			this.data[data.name].kpList = JSON.parse(xhr.responseText);
			this.processData(data.name);
		}).bind(this, data)
		xhr.send();
	}
});
