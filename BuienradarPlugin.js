/**
 *
 * @param L
 * @param pluginBase
 */
export default function (L, pluginBase) {
  return class BuienradarPlugin extends pluginBase {
    constructor(map, name, options = {}) {
      super(map, name, options);
      const { renderBranding } = options
      this.renderBranding = Boolean(renderBranding);
      console.debug("[HaMapCard] [BuienradarPlugin] Successfully invoked constructor of plugin:", this.name, "with options:", this.options);
    }

    init() {
      console.debug("[HaMapCard] [BuienradarPlugin] Called init() of plugin:", this.name);
      this.offsetMinutes = 0;
      setInterval(this.nextFrame.bind(this), 500);
    }

    asTimestamp(date) {
      return `${date.getUTCFullYear()}${(date.getUTCMonth() + 1).toString().padStart(2, '0')}${date.getUTCDate().toString().padStart(2, '0')}${date.getUTCHours().toString().padStart(2, '0')}${date.getUTCMinutes().toString().padStart(2, '0')}`;
    }

    renderMap() {
      console.debug("[HaMapCard] [BuienradarPlugin] Called render() of Plugin:", this.name);

      this.url = new URL("https://image.buienradar.nl/2.0/image/single/RadarMapRainWebmercatorNL");
      this.url.searchParams.set("extension", "png");
      this.url.searchParams.set("renderBackground", "false");
      this.url.searchParams.set("renderText", "false");
      this.url.searchParams.set("renderBranding", this.renderBranding.toString());
      this.url.searchParams.set("timestamp", this.asTimestamp(new Date()));
      let latLngBounds = L.latLngBounds([[49.5, 0], [54.8, 10]]);

      this.rainLayer = L.imageOverlay(this.url.href, latLngBounds, { "opacity": 0.7 });
      this.rainLayer.addTo(this.map);

      L.Control.textbox = L.Control.extend({
        onAdd: function (map) {
          let text = L.DomUtil.create('div');
          text.innerHTML = '<strong style="font-size: 2em"></strong>';
          return text;
        },

        onRemove: function (map) {
          // Nothing to do here
        }
      });
      L.control.textbox = function (opts) { return new L.Control.textbox(opts); }
      this.timeBox = L.control.textbox({ position: 'topright' }).addTo(this.map);
    }

    update() {}

    nextFrame() {
      this.offsetMinutes += 5;
      this.offsetMinutes %= 60 * 3;
      const date = new Date(new Date().getTime() + this.offsetMinutes * 60000)
      date.setMinutes(Math.floor(date.getMinutes() / 5) * 5);

      this.url.searchParams.set("timestamp", this.asTimestamp(date));
      this.rainLayer.setUrl(this.url.href);
      this.timeBox._container.firstChild.innerHTML = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  };
}
