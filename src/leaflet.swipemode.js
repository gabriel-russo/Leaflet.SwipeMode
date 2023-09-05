import * as L from "leaflet";
import "./leaflet.swipemode.css";
import { findLayerById, getRangeEvent } from "./swipemode.utils";
import {
  createContainer,
  createExitBar,
  createLayerPicker,
} from "./swipemode.dom";

L.Control.SwipeMode = L.Control.extend({
  options: {
    position: "topleft",
    thumbSize: 42,
    padding: 0,
    noControl: false,
    text: {
      title: "Enable Swipe Mode",
      leftLayerSelector: "Left Layer",
      rightLayerSelector: "Right Layer",
    },
  },

  initialize(leftLayer, rightLayer, options) {
    this._isSwipeModeActive = false;
    this._MAX_ZINDEX = 9999;

    this._userLeftLayer = leftLayer;

    if (leftLayer) {
      this._sourceLeftLayerZindex = leftLayer.options.zIndex || 1;
    }

    this._userRightLayer = rightLayer;

    if (rightLayer) {
      this._sourceRightLayerZindex = rightLayer.options.zIndex || 1;
    }

    L.setOptions(this, options);
  },

  setPosition: () => {},

  includes: L.Evented.prototype || L.Mixin.Events,

  onAdd(map) {
    if (this.options.noControl) {
      return L.DomUtil.create("div", "leaflet-bar"); // Leaflet needs a DOM element returned
    }

    if (this.options.button) {
      L.DomEvent.on(this.options.button, "click", this.toggle, this);
      return L.DomUtil.create("div", "leaflet-bar"); // Leaflet needs a DOM element returned
    }

    let className = "leaflet-control-sm";

    const container = L.DomUtil.create("div", `leaflet-bar`);

    let link = L.DomUtil.create("a", `${className}-button`, container);

    link.href = "#";

    link.title = this.options.text.title;

    L.DomEvent.addListener(link, "click", L.DomEvent.stopPropagation)
      .addListener(link, "click", L.DomEvent.preventDefault)
      .addListener(link, "click", this._openLayerSelector, this)
      .addListener(link, "click", this.toggle, this);

    return container;
  },

  enabled() {
    return this._isSwipeModeActive;
  },

  toggle() {
    if (!this.enabled()) {
      this._isSwipeModeActive = true;
      this._enable();
      this._map.fire("swipemode:start");
    } else {
      this._isSwipeModeActive = false;
      this._disable();
      this._map.fire("swipemode:stop");
    }
  },

  setLeftLayer(leftLayer) {
    this._userLeftLayer = leftLayer;
    this._sourceLeftLayerZindex = leftLayer.options.zIndex || 1;
    if (!this.options.noControl) {
      this._updateLayers();
    }
    return this;
  },

  setRightLayer(rightLayer) {
    this._userRightLayer = rightLayer;
    this._sourceRightLayerZindex = rightLayer.options.zIndex || 1;
    if (!this.options.noControl) {
      this._updateLayers();
    }
    return this;
  },

  _getDividerPosition() {
    let rangeValue = this._range.value;
    let offset =
      (0.5 - rangeValue) * (2 * this.options.padding + this.options.thumbSize);
    return this._map.getSize().x * rangeValue + offset;
  },

  _enable() {
    this._swipeModeContainer = L.DomUtil.create(
      "div",
      "leaflet-sm",
      this._map.getContainer()
    );

    this._divider = L.DomUtil.create(
      "div",
      "leaflet-sm-divider",
      this._swipeModeContainer
    );

    this._range = L.DomUtil.create(
      "input",
      "leaflet-sm-range",
      this._swipeModeContainer
    );

    this._button = L.DomUtil.create(
      "div",
      "leaflet-sm-button",
      this._swipeModeContainer
    );

    this._range.type = "range";
    this._range.min = 0;
    this._range.max = 1;
    this._range.step = "any";
    this._range.value = 0.5;
    this._range.style.paddingLeft = `${this.options.padding}px`;
    this._range.style.paddingRight = `${this.options.padding}px`;
    this._addEvents();
    this._updateLayers();
  },

  _disable() {
    if (!this._map) {
      return this;
    }

    if (this._leftLayer) {
      this._leftLayer.setZIndex(this._sourceLeftLayerZindex);
      this._leftLayer.getContainer().style.clip = "";
    }

    if (this._rightLayer) {
      this._rightLayer.setZIndex(this._sourceRightLayerZindex);
      this._rightLayer.getContainer().style.clip = "";
    }

    this._removeEvents();

    L.DomUtil.remove(this._swipeModeContainer);
  },

  _updateClip() {
    let nw = this._map.containerPointToLayerPoint([0, 0]);
    let se = this._map.containerPointToLayerPoint(this._map.getSize());
    let clipX = nw.x + this._getDividerPosition();
    let dividerX = this._getDividerPosition();

    this._divider.style.left = `${dividerX}px`;
    this._button.style.left = `${dividerX}px`;

    this.fire("swipemode:dividermove", { x: dividerX });

    let clipLeft = `rect(${[nw.y, clipX, se.y, nw.x].join("px,")}px)`;
    let clipRight = `rect(${[nw.y, se.x, se.y, clipX].join("px,")}px)`;

    if (this._leftLayer) {
      this._leftLayer.getContainer().style.clip = clipLeft;
    }
    if (this._rightLayer) {
      this._rightLayer.getContainer().style.clip = clipRight;
    }
  },

  _updateLayers() {
    if (!this._map) {
      return this;
    }

    let prevLeft = this._leftLayer;
    let prevRight = this._rightLayer;

    this._leftLayer = null;
    this._rightLayer = null;

    if (this._map.hasLayer(this._userLeftLayer)) {
      this._leftLayer = this._userLeftLayer;
      this._leftLayer.setZIndex(this._MAX_ZINDEX);
    }

    if (this._map.hasLayer(this._userRightLayer)) {
      this._rightLayer = this._userRightLayer;
      this._rightLayer.setZIndex(this._MAX_ZINDEX);
    }

    if (prevLeft !== this._leftLayer) {
      if (prevLeft) {
        prevLeft.setZIndex(this._sourceLeftLayerZindex);
      }
      this._map.fire("swipemode:newlayer");
      this._map.fire("swipemode:leftlayerremove", { layer: prevLeft });
      this._map.fire("swipemode:leftlayeradd", { layer: this._leftLayer });
    }

    if (prevRight !== this._rightLayer) {
      if (prevRight) {
        prevRight.setZIndex(this._sourceRightLayerZindex);
      }
      this._map.fire("swipemode:newlayer");
      this.fire("swipemode:rightlayerremove", { layer: prevRight });
      this.fire("swipemode:rightlayeradd", { layer: this._rightLayer });
    }

    this._updateClip();
  },

  _enableMapDrag(e) {
    this._refocusOnMap(e);
    if (!this._map.dragging.enabled()) {
      this._map.dragging.enable();
    }
  },

  _cancelMapDrag() {
    if (this._map.dragging.enabled()) {
      this._map.dragging.disable();
    }
  },

  _addEvents() {
    if (!this._map || !this._range) return;

    this._map.on("move", this._updateClip, this);

    this._map.on("swipemode:newlayer", this._updateLayers, this);

    L.DomEvent.on(
      this._range,
      getRangeEvent(this._range),
      this._updateClip,
      this
    );

    L.DomEvent.on(this._range, "touchend", this._enableMapDrag, this).on(
      this._range,
      "mouseup",
      this._enableMapDrag,
      this
    );

    L.DomEvent.on(this._range, "touchstart", this._cancelMapDrag, this).on(
      this._range,
      "mousedown",
      this._cancelMapDrag,
      this
    );
  },

  _removeEvents() {
    if (this._range) {
      L.DomEvent.off(
        this._range,
        getRangeEvent(this._range),
        this._updateClip,
        this
      )
        .off(this._range, "touchend", this._enableMapDrag, this)
        .off(this._range, "mouseup", this._enableMapDrag, this)
        .off(this._range, "mousedown", this._cancelMapDrag, this)
        .off(this._range, "touchstart", this._cancelMapDrag, this);
    }
    if (this._map) {
      this._map.off("swipemode:newlayer", this._updateLayers, this);
      this._map.off("move", this._updateClip, this);
    }
  },

  _openLayerSelector() {
    L.DomUtil.addClass(
      this._container,
      "leaflet-control-sm-layer-selector-open"
    );

    this._layerPickerContainer = createContainer(
      "leaflet-control-sm-layer-selector-container",
      this._container
    );

    createExitBar(this._layerPickerContainer, this._closeLayerSelector, this);

    const pickerContainer = createContainer(
      "leaflet-control-sm-layer-picker-container",
      this._layerPickerContainer
    );

    createLayerPicker(
      this.options.text.leftLayerSelector,
      pickerContainer,
      (e) => {
        this.setLeftLayer(findLayerById(this._map, e.target.value));
      },
      "left",
      this
    );

    createLayerPicker(
      this.options.text.rightLayerSelector,
      pickerContainer,
      (e) => {
        this.setRightLayer(findLayerById(this._map, e.target.value));
      },
      "right",
      this
    );
  },

  _closeLayerSelector() {
    L.DomUtil.removeClass(
      this._container,
      "leaflet-control-sm-layer-selector-open"
    );
    if (this._layerPickerContainer) {
      L.DomUtil.empty(this._layerPickerContainer);
    }
    this.toggle();
  },
});

L.Control.swipeMode = (leftLayer, rightLayer, options) =>
  new L.Control.SwipeMode(leftLayer, rightLayer, options);
