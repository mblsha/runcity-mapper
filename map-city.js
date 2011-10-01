var MapCity = Object.extend({
	constructor: function(application, data) {
		this.application = application;
		this.name = data.name;
		this.center = data.center;
		this.layers = {};

		this.initListItem();

		data.layers.forEach((function(layerData) {
			this.loadLayerData(layerData);
		}).bind(this));

		if (this.application.getCheckedState(this.checkedStateKey()) != null) {
			this.checkbox.checked = this.application.getCheckedState(this.checkedStateKey());
		}
	},

	checkedStateKey: function() {
		return this.name;
	},

	initListItem: function() {
		var result = this.application.createListCheckboxItem(this.name);
		this.application.mapListForm.appendChild(result.li);
		this.listRoot = result.li;

		result.anchor.setAttribute('href', '#');
		result.anchor.textContent = "(центрировать)";
		result.anchor.onclick = (function() {
			this.centerMap();
		}).bind(this);

		this.checkbox = result.checkbox;
		result.checkbox.onclick = (function() {
			this.setAllLayersVisible(this.checkbox.checked);
		}).bind(this);
	},

	loadLayerData: function(layerData) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "data/" + layerData.fileName, true);
		xhr.onreadystatechange = (function(layerData) {
			if ((xhr.readyState != 4) || (xhr.status != 200))
				return;

			this.layers[layerData.fileName] = new MapLayer(this.application, this, layerData, xhr.responseText);
		}).bind(this, layerData);
		xhr.send();
	},

	centerMap: function() {
		this.application.map.setCenter(this.center, 10);
	},

	setAllLayersVisible: function(visible) {
		this.checkbox.checked = visible;
		this.application.setCheckedState(this.checkedStateKey(), visible);

		this.application.hashKeys(this.layers).sort().forEach((function(key) {
			this.layers[key].setVisible(visible);
		}).bind(this));
	},

	getVisibleKP: function(bounds) {
		var result = [];
		this.application.hashKeys(this.layers).sort().forEach((function(result, bounds, key) {
			var layer = this.layers[key];
			if (layer.visible) {
				result.push(layer.getVisibleKP(bounds));
			}
		}).bind(this, result, bounds));
		return result;
	}
});
