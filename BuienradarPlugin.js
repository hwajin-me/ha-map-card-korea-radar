/**
 *
 * @param L
 * @param pluginBase
 */
export default function (L, pluginBase) {
  return class BuienradarPlugin extends pluginBase {
    constructor(map, name, options = {}) {
      super(map, name, options);
      const { delayMs, opacity, renderBranding } = options
      this.delayMs = Number(delayMs);
      this.c = Number(opacity);
      this.renderBranding = Boolean(renderBranding);
      console.debug("[HaMapCard] [BuienradarPlugin] Successfully invoked constructor of plugin:", this.name, "with options:", this.options);
    }

    init() {
      console.debug("[HaMapCard] [BuienradarPlugin] Called init() of plugin:", this.name);
      this.offsetMinutes = 0;
      this.url = new URL("https://image.buienradar.nl/2.0/image/single/RadarMapRainWebmercatorNL");
      this.url.searchParams.set("extension", "png");
      this.url.searchParams.set("renderBackground", "false");
      this.url.searchParams.set("renderText", "false");
      this.url.searchParams.set("renderBranding", this.renderBranding.toString());
      this.url.searchParams.set("timestamp", this.getTimestamp(this.getDate()));

      L.Control.Textbox = L.Control.extend({
        onAdd: function (map) {
          let text = L.DomUtil.create('div');
          text.innerHTML = '<strong style="font-size: 2em"></strong>';
          return text;
        },

        onRemove: function (map) {
          // Nothing to do here
        }
      });
      L.control.textbox = function (opts) { return new L.Control.Textbox(opts); }

      this.interval = setInterval(this.nextFrame.bind(this), this.delayMs);
    }

    getDate() {
      const date = new Date();
      date.setTime(date.getTime() - (date.getTime() % (5 * 60000)) + (this.offsetMinutes * 60000));
      return date;
    }

    getTimestamp(date) {
      const pad = (num) => num.toString().padStart(2, '0');
      return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}`;
    }

    renderMap() {
      console.debug("[HaMapCard] [BuienradarPlugin] Called render() of Plugin:", this.name);

      const latLngBounds = L.latLngBounds([[49.5, 0], [54.8, 10]]);
      this.rainLayer = L.imageOverlay(this.url.href, latLngBounds, { "opacity": this.opacity });
      this.rainLayer.addTo(this.map);

      this.timeBox = L.control.textbox({ position: 'topright' });
      this.timeBox.addTo(this.map);
    }

    update() {}

    nextFrame() {
      this.offsetMinutes += 5;
      this.offsetMinutes %= 60 * 3;
      const date = this.getDate();

      this.url.searchParams.set("timestamp", this.getTimestamp(date));
      this.rainLayer.setUrl(this.url.href);
      this.timeBox._container.firstChild.innerHTML = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  };
}
