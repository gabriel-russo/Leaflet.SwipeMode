# Leaflet.SwipeMode

A Leaflet control to add a split screen to compare two map overlays.

Requires [Leaflet](https://github.com/Leaflet/Leaflet/releases) 1.0.0+ branches

## Demo

checkout the [demo](https://gabriel-russo.github.io/Leaflet.SwipeMode/example/)

![screencast example](docs/images/demo.gif)

## Install

```shell
npm install leaflet-swipe-mode
```

## L.control.sideBySide(_leftLayer_, _rightLayer_)

Creates a new Leaflet Control for comparing two layers or collections of layers. It does not add the layers to the map - you need to do that manually.

## Parameters

| parameter    | type           | description   |
| ----------    | -------------- | ------------- |
| `leftLayer`  | L.Layer\|array | A Leaflet Layer or array of layers to show on the left side of the map. Any layer added to the map that is in this array will be shown on the left |
| `rightLayer` | L.Layer\|array | A Leaflet Layer or array of layers to show on the right side of the map. Any layer added to the map that is in this array will be shown on the right. These *should not be* the same as any layers in `leftLayers` |
| `options`    | Object         | Options |

## Options
| parameter                 | type                | description                                                                                                      |
|---------------------------|---------------------|------------------------------------------------------------------------------------------------------------------|
| `padding`                 | Number              | Padding between slider min/max and the edge of the screen in pixels. Defaults to `44` - the width of the slider thumb |
| `button`                  | Button HTML Element | If you want to make a webapp with custom html elements, you can bind a button to toggle this plugin              |
| `text`                    | String              | You can translate the plugin inner text                                                                          |
| `text.title`              | String              | Control's Button text                                                                                            |
| `text.leftLayerSelector`  | String              | Select's left layer label                                                                                        |
| `text.rightLayerSelector` | String              | Select's right layer label                                                                                       |

### Option example

```javascript
options = {
    position: 'topleft',
    thumbSize: 42,
    padding: 0,
    button: document.getElementById('my-button'), // If you use this option, the control will be disabled
    text: {
      title: 'Enable Swipe Mode',
      leftLayerSelector: 'Left Layer',
      rightLayerSelector: 'Right Layer',
    },
  };
```

## Events

Subscribe to events using [these methods](http://leafletjs.com/reference.html#events)

| Event         | Data           | Description                                                                                                                                         |
| ----------    | -------------- |-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `swipemode:newlayer`  | [LayerEvent](http://leafletjs.com/reference.html#layer-event) | Fired when a layer is added to any side                                                                                                             |
| `swipemode:leftlayeradd`  | [LayerEvent](http://leafletjs.com/reference.html#layer-event) | Fired when a layer is added to the left-hand-side pane                                                                                              |
| `swipemode:leftlayerremove` | [LayerEvent](http://leafletjs.com/reference.html#layer-event) | Fired when a layer is removed from the left-hand-side pane                                                                                          |
| `swipemode:rightlayeradd` | [LayerEvent](http://leafletjs.com/reference.html#layer-event) | Fired when a layer is added to the right-hand-side pane                                                                                             |
| `swipemode:rightlayerremove` | [LayerEvent](http://leafletjs.com/reference.html#layer-event) | You guessed it... fired when a layer is removed from the right-hand-side pane                                                                       |
| `swipemode:dividermove` | {x: Number} | Fired when the divider is moved. Returns an event object with the property `x` = the pixels of the divider from the left side of the map container. |

## Methods

| Method         | Returns | Description                                            |
|----------------|---------|--------------------------------------------------------|
| `setLeftLayer` | `this`  | Set the layer for the left side                        |
| `setRightLayer` | `this`  | Set the layer for the right side                       |
| `toggle`       | `this`    | Toggles the swipe mode on or off                       |
| `enabled`       | `this`    | Gets a true/false of whether the swipe mode is enabled |
## Usage

```js
const map = L.map('map').setView([51.505, -0.09], 13);

const myLayer1 = L.tileLayer(...).addTo(map);

const myLayer2 = L.tileLayer(...).addTo(map)

const myLayer3 = L.tileLayer(...).addTo(map)

const options = {...}; // optional

// myLayer1 and myLayer2 will be the default when enabled
L.control.sideBySide(myLayer1, myLayer2, options).addTo(map);
```

### Custom html button
If you are developing a web application and you want to use your own html button outside the map container, you can use the following code:
```javascript
const map = L.map('map').setView([51.505, -0.09], 13);

const myLayer1 = L.tileLayer(...).addTo(map);

const myLayer2 = L.tileLayer(...).addTo(map)

const myLayer3 = L.tileLayer(...).addTo(map)

const options = {
  button: document.getElementById('my-button'),
}; // optional

// myLayer1 and myLayer2 will be the default when enabled
const sm = L.control.sideBySide(myLayer1, myLayer2, options).addTo(map);

// If you want to change the current layers, just use:
sm.setLeftLayer(myLayer3); //or setRightLayer

```

### Future features

- Update LayerPicker when a new layer is added to the map

### Known issues

- If you set the same layer to both sides, the control will not work properly.

### Limitations

- The divider is not movable with IE.
- Probably won't work in IE8, but what does?

### License

MIT
