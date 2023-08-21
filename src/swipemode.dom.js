import L from 'leaflet';

function bindEvent(el, event, fn, context) {
  L.DomEvent
    .addListener(el, event, L.DomEvent.stopPropagation)
    .addListener(el, event, L.DomEvent.preventDefault)
    .addListener(el, event, fn, context);
}

function createContainer(className, parent) {
  return L.DomUtil.create('div', className, parent);
}

function createLayerPicker(label, container, onChange, side, context) {
  const sides = {
    right: context._userRightLayer,
    left: context._userLeftLayer,
  };

  const layerPickerBox = L.DomUtil.create('div', 'leaflet-control-sm-layer-selector-box', container);
  const selectEl = L.DomUtil.create('select', '', layerPickerBox);
  const labelEl = L.DomUtil.create('label', '', layerPickerBox);

  const randomInt = Math.floor(Math.random() * 1000);

  labelEl.innerHTML = label;
  selectEl.name = `${randomInt}-layer-picker`;
  labelEl.htmlFor = `${randomInt}-layer-picker`;

  context._map.eachLayer((layer) => {
    if (context._map.hasLayer(layer) && layer instanceof L.TileLayer) {
      const opt = new Option(layer.options.name, layer._leaflet_id);
      opt.selected = layer === sides[side];
      selectEl.add(opt);
    }
  });

  bindEvent(selectEl, 'change', onChange, context);

  return selectEl;
}

function createExitBar(parent, exitFn, context) {
  const container = L.DomUtil.create('div', 'leaflet-control-sm-exit-bar', parent);
  const exitButton = L.DomUtil.create('a', '', container);

  exitButton.innerHTML = 'X';

  bindEvent(exitButton, 'click', exitFn, context);
}

export {
  bindEvent, createExitBar, createLayerPicker, createContainer,
};
