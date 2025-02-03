export default function (L, pluginBase, logger) {
  return class KoreaRadarCustomMapCardPlugin extends pluginBase {
    constructor(map, name, options = {}) {
      super(map, name, options);

      this.now = new Date();
      const {
        delay = 2,
        opacity = 1,
        range = {
          start: new Date(this.now).setHours(this.now.getHours() - 1),
          end: new Date(this.now).setHours(this.now.getHours() + 1)
        },
        decorate = '<strong style="font-size: 2em">{date}</strong>'
      } = options;

      this.hass = document.querySelector('home-assistant').hass;
      this.delay = delay < 1 ? 1 : Number(delay);
      this.opacity = Number(opacity);
      this.decorate = decorate;
      this.option(range);
    }

    option(range) {
      if (range === null || range === undefined) {
        this.start = new Date(this.now);
        this.start.setHours(this.now.getHours() - 2);
        this.end = new Date(this.now);
        this.end.setHours(this.now.getHours() + 2);
        this.start.setMinutes(this.start.getMinutes() - this.start.getMinutes() % 10);
        this.end.setMinutes(this.end.getMinutes() - this.end.getMinutes() % 10);

        return;
      }

      if (typeof range['start'] === 'string') {
        this.start = new Date(Date.parse(range['start']));
      } else if (typeof range['start'] === 'object' && range['start'] !== null) {
        this.start = new Date(Date.parse(this.hass.states[range['start']['entity']][range['start']['attribute'] || 'state']));
      } else {
        this.start = new Date(this.now);
        this.start.setHours(this.now.getHours() - 2);
      }

      if (typeof range['end'] === 'string') {
        this.end = new Date(Date.parse(range['end']));
      } else if (typeof range['end'] === 'object' && range['end'] !== null) {
        this.end = new Date(Date.parse(this.hass.states[range['end']['entity']][range['end']['attribute'] || 'state']));
      } else {
        this.end = new Date(this.now);
        this.end.setHours(this.now.getHours() + 2);
      }

      this.start.setMinutes(this.start.getMinutes() - this.start.getMinutes() % 10);
      this.end.setMinutes(this.end.getMinutes() - this.end.getMinutes() % 10);
    }

    async init() {
      this.overlayImages = []
      this.currentImage = 0;
      const self = this;

      for (let d = new Date(this.start); d <= this.end && d.getHours() <= this.now.getHours(); d.setMinutes(d.getMinutes() + 10)) {
        this.overlayImages.push({
          src: `https://www.weather.go.kr/w/cgi-bin/rdr_new/nph-vs_rdr_cmp_img?tm=${d.getFullYear().toString().padStart(2, '0')}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}&size=4453`,
          timestamp: d,
          label: `${d.getFullYear().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
        });
      }

      const textbox = L.Control.extend({
        onAdd: function (map) {
          const text = L.DomUtil.create('div');
          text.id = 'date-text';
          text.innerHTML = self.decorate;
          return text;
        },
        updateText: function (text) {
          const container = this.getContainer();
          if (!container) return;
          container.innerHTML = self.decorate.replace(new RegExp("\\{date}", "gi"), text);
        }
      });
      this.textbox = new textbox({position: 'topright'});
      this.textbox.addTo(this.map);

      this.delayInterval = setInterval(this.nextFrame.bind(this), this.delay * 1000);
    }

    destroy() {
      clearInterval(this.delayInterval);
      this.delayInterval = undefined;
    }

    renderMap() {
      if (this.overlayImages.length === 0) {
        return;
      }

      const latLngBounds = L.latLngBounds([[30.830733701421657, 121.3822799316216], [40.11457219962541, 133.06990387691684]]);
      this.rainLayer = L.imageOverlay(this.overlayImages[0].src, latLngBounds, {"opacity": this.opacity});
      this.rainLayer.addTo(this.map);
      this.textbox.updateText(this.overlayImages[0].label);
    }

    update() {
      //
    }

    nextFrame() {
      this.now = new Date();
      this.currentImage = (this.currentImage + 1) % this.overlayImages.length;

      if (this.overlayImages[this.currentImage] === undefined) {
        return;
      }

      if (this.rainLayer !== undefined) {
        this.rainLayer.setUrl(this.overlayImages[this.currentImage].src);
      }

      this.textbox.updateText(this.overlayImages[this.currentImage].label);
    }
  };
}
