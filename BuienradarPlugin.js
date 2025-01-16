/**
 *
 * @param L
 * @param pluginBase
 */
export default function (L, pluginBase) {
  return class BuienradarPlugin extends pluginBase {
    constructor(map, name, options = {}) {
      super(map, name, options);
      const { delayMs, opacity, offsetMinutes, renderBranding } = options
      this.delayMs = Number(delayMs);
      this.offsetMinutesPositive = Number(offsetMinutes['positive']);
      this.offsetMinutesNegative = Number(offsetMinutes['negative']);
      this.opacity = Number(opacity);
      this.renderBranding = Boolean(renderBranding);
      console.debug("[HaMapCard] [BuienradarPlugin] Successfully invoked constructor of plugin:", this.name, "with options:", this.options);
    }

    init() {
      console.debug("[HaMapCard] [BuienradarPlugin] Called init() of plugin:", this.name);
      this.offsetMinutes = this.offsetMinutesNegative;
      this.url = new URL("https://image.buienradar.nl/2.0/image/single/RadarMapRainWebmercatorNL");
      this.url.searchParams.set("extension", "png");
      this.url.searchParams.set("renderBackground", "false");
      this.url.searchParams.set("renderText", "false");
      this.url.searchParams.set("renderBranding", this.renderBranding.toString());

      this.preloadDate = this.getDate();
      this.preload = new Image();
      this.url.searchParams.set("timestamp", this.getTimestamp(this.preloadDate));
      this.preload.src = this.url.href;

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
      this.rainLayer.on('load', () => this.timeBox._container.style.color = '');
    }

    update() {}

    nextFrame() {
      this.rainLayer.setUrl(this.preload.src);
      const date = this.preloadDate;
      this.timeBox._container.firstChild.innerHTML = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      if (!this.preload.complete) {
        this.timeBox._container.style.color = 'var(--error-color)';
      }

      this.offsetMinutes += 5;
      if (this.offsetMinutes > this.offsetMinutesPositive) {
        this.offsetMinutes = this.offsetMinutesNegative;
      }

      this.preloadDate = this.getDate();
      this.url.searchParams.set("timestamp", this.getTimestamp(this.preloadDate));
      this.preload.src = this.url.href;
    }
  };
}
