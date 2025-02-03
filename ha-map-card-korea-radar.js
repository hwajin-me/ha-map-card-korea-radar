/**
 *
 * @param L
 * @param pluginBase
 */
export default function (L, pluginBase, logger) {
  return class BuienradarPlugin extends pluginBase {
    constructor(map, name, options = {}) {
      super(map, name, options);
      const { delaySeconds, refreshSeconds, opacity, imageRange } = options;
      this.delaySeconds = Number(delaySeconds);
      this.refreshSeconds = Number(refreshSeconds);
      this.history = Number(imageRange['history']);
      this.forecast = Number(imageRange['forecast']);
      this.skip = Number(imageRange['skip']);
      this.opacity = Number(opacity);
      logger.debug("[HaMapCard] [BuienradarPlugin] Successfully invoked constructor of plugin:", this.name, "with options:", this.options);
    }

    async init() {
      logger.debug("[HaMapCard] [BuienradarPlugin] Called init() of plugin:", this.name);
      this.url = new URL("https://image.buienradar.nl/2.0/metadata/sprite/RadarMapRainWebmercatorNL");
      this.url.searchParams.set("width", 1058);
      this.url.searchParams.set("height", 915);
      this.url.searchParams.set("extension", "png");
      this.url.searchParams.set("renderBackground", "false");
      this.url.searchParams.set("renderText", "false");
      this.url.searchParams.set("renderBranding", "false");
      this.url.searchParams.set("history", this.history);
      this.url.searchParams.set("forecast", this.forecast);
      this.url.searchParams.set("skip", this.skip);
      this.overlayImages = await this.getOverlayImages();
      this.currentImage = 0;

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

      this.delayInterval = setInterval(this.nextFrame.bind(this), this.delaySeconds * 1000);
      this.refreshInterval = setInterval(this.refreshOverlayImages.bind(this), this.refreshSeconds * 1000);
    }

    destroy() {
      clearInterval(this.delayInterval);
      this.delayInterval = undefined;
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }

    async getOverlayImages() {
      const res = await fetch(this.url);
      if (!res.ok) {
        throw new Error("Could not fetch spites metadata");
      }

      const json = await res.json();
      const images = json["times"].map((t) => {
        const preload = new Image();
        const promise = new Promise((resolve, reject) => {
          preload.onload = resolve;
          preload.onerror = reject;
        });
        preload.src = t["url"];
        return {
          'timestamp': new Date(t["timestamp"] + "Z"),
          'image': preload,
          'loadPromise': promise,
        }
      });

      return images;
    }

    async refreshOverlayImages() {
      const images = await this.getOverlayImages();
      const promises = images.map((i) => i['loadPromise']);
      await Promise.all(promises);
      this.overlayImages = images;
    }

    renderMap() {
      logger.debug("[HaMapCard] [BuienradarPlugin] Called render() of Plugin:", this.name);

      const latLngBounds = L.latLngBounds([[49.5, 0], [54.8, 10]]);
      this.rainLayer = L.imageOverlay(this.overlayImages[0].image.src, latLngBounds, { "opacity": this.opacity });
      this.rainLayer.addTo(this.map);

      this.timeBox = L.control.textbox({ position: 'topright' });
      this.timeBox.addTo(this.map);
      this.rainLayer.on('load', () => this.timeBox._container.style.color = '');
    }

    update() { }

    nextFrame() {
      this.currentImage = (this.currentImage + 1) % this.overlayImages.length;
      const current = this.overlayImages[this.currentImage];
      this.rainLayer.setUrl(current.image.src);
      const date = current.timestamp;
      this.timeBox._container.firstChild.innerHTML = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      if (!current.image.complete) {
        this.timeBox._container.style.color = 'var(--error-color)';
      }
    }
  };
}
