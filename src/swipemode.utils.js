function getRangeEvent(rangeInput) {
  return 'oninput' in rangeInput ? 'input' : 'change';
}

function findLayerById(map, id) {
  let layer = null;

  map.eachLayer((l) => {
    if (l._leaflet_id === parseInt(id, 10)) {
      layer = l;
    }
  });

  return layer;
}

export { getRangeEvent, findLayerById };
