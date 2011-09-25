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

		this.data = {};

		var moscowCenter = new YMaps.GeoPoint(37.64, 55.76);
		var spbCenter = new YMaps.GeoPoint(30.313622, 59.93772);
		var kievCenter = new YMaps.GeoPoint(30.522301, 50.451118);

		[
			{ name: "Москва 2007",
			  style: "default#nightSmallPoint",
			  fileName: "msk2007-all.json",
			  center: moscowCenter
			},
			{ name: "Москва 2008",
			  style: "default#yellowSmallPoint",
			  fileName: "msk2008-all.json",
			  center: moscowCenter
			},
			{ name: "Москва 2010",
			  style: "default#pinkSmallPoint",
			  fileName: "msk2010-all.json",
			  center: moscowCenter
			},
			{ name: "Москва 2011",
			  style: "default#darkblueSmallPoint",
			  fileName: "msk2011-all.json",
			  center: moscowCenter
			},
			{ name: "СПБ 2008",
			  style: "default#darkblueSmallPoint",
			  fileName: "spb2008-all.json",
			  center: spbCenter
			},
			{ name: "Киев 2010",
			  style: "default#darkblueSmallPoint",
			  fileName: "kiev2010-all.json",
			  center: kievCenter
			}
		].forEach((function(data) {
			this.loadData(data);
		}).bind(this));
	},

	loadData: function(data) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "data/" + data.fileName, true);
		xhr.onreadystatechange = (function(data) {
			if ((xhr.readyState != 4) || (xhr.status != 200))
				return;

			this.data[data.name] = new MapLayer(this, data, xhr.responseText);
		}).bind(this, data)
		xhr.send();
	}
});
