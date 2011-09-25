var Mapper = Object.extend({
	constructor: function() {
		this.mapListForm = document.getElementById("MapListForm");

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
			  fileName: "msk2010-all.json",
			  center: new YMaps.GeoPoint(37.64, 55.76)
			},
			{ name: "Москва 2011",
			  style: "default#darkbluePoint",
			  fileName: "msk2011-all.json",
			  center: new YMaps.GeoPoint(37.64, 55.76)
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
			// kp.placemark.setIconContent(kp.id);
			kp.placemark.name = kp.name + " (" + name + ")";
			kp.placemark.description = kp.description;
			this.map.addOverlay(kp.placemark);
		}).bind(this, name);

		var d = this.data[name];

		for (var i in d.kpList) {
			addKp(d.kpList[i]);
		}
	},

	getPlacemark: function(kp, name) {
		if (kp.placemark)
			return kp.placemark;

		if (!kp.lat || !kp.lon)
			return null;

		kp.placemark = new YMaps.Placemark(
			new YMaps.GeoPoint(kp.lon, kp.lat),
			{ style: this.data[name].style }
		);
		// kp.placemark.setIconContent(kp.id);
		kp.placemark.name = kp.name + " (" + name + ")";
		kp.placemark.description = kp.description;
		return kp.placemark;
	},

	setKpVisible: function(name, visible) {
		var d = this.data[name];

		for (var i in d.kpList) {
			var placemark = this.getPlacemark(d.kpList[i], name);
			if (placemark == null)
				continue;

			if (visible)
				this.map.addOverlay(placemark);
			else
				this.map.removeOverlay(placemark);
		}
	},

	loadData: function(data) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "data/" + data.fileName, true);
		xhr.onreadystatechange = (function(data) {
			if ((xhr.readyState != 4) || (xhr.status != 200))
				return;

			this.data[data.name] = data;
			var d = this.data[data.name];
			d.kpList = JSON.parse(xhr.responseText);

			var li = document.createElement('li');
			var label = document.createElement('label');
			label.textContent = data.name;

			label.onmouseover = function() { this.className += " hover"; };
			label.onmouseout = function() { this.className = this.className.replace(" hover", ""); };

			d.mapCheckbox = document.createElement('input');
			d.mapCheckbox.setAttribute('type', 'checkbox');
			d.mapCheckbox.setAttribute('id',   data.fileName);

			d.mapCheckbox.onclick = (function(id, name) {
				var checkbox = document.getElementById(id);
				this.setKpVisible(name, checkbox.checked);
			}).bind(this, data.fileName, data.name);

			li.appendChild(label);
			label.prependChild(d.mapCheckbox);
			this.mapListForm.appendChild(li);
		}).bind(this, data)
		xhr.send();
	}
});
