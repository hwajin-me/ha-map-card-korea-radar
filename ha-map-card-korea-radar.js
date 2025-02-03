/**
 *
 * @param L
 * @param pluginBase
 */
export default function (L, pluginBase, logger) {
  return class BuienradarPlugin extends pluginBase {
    constructor(map, name, options = {}) {
      super(map, name, options);
      const { delaySeconds, refreshSeconds, opacity, imageRange, decorate } = options;
      this.delaySeconds = Number(delaySeconds);
      this.start = new Date(Date.parse(imageRange['start']));
      this.end = new Date(Date.parse(imageRange['end']));
      this.opacity = Number(opacity);
      this.decorate = decorate;
      if (this.decorate == undefined || this.decorate == null || this.decoreate == '') {
        this.decorate = '<strong style="font-size: 2em">{date}</strong>';
      }
      logger.debug("[HaMapCard] [Korea Radar from BuienradarPlugin] Successfully invoked constructor of plugin:", this.name, "with options:", this.options);
    }
 
    async init() {
      logger.debug("[HaMapCard] [Korea Radar from BuienradarPlugin] Called init() of plugin:", this.name);
      this.overlayImages = []
      this.currentImage = 0;
      const self = this;
 
      for (var d = new Date(this.start); d <= this.end; d.setMinutes(d.getMinutes() + 10)) {
        this.overlayImages.push({
          src: `https://www.weather.go.kr/w/cgi-bin/rdr_new/nph-vs_rdr_cmp_img?tm=${d.getFullYear().toString().padStart(2, '0')}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}&size=1453`,
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
      this.textbox = new textbox({ position: 'topright' });
      this.textbox.addTo(this.map);
      
      this.delayInterval = setInterval(this.nextFrame.bind(this), this.delaySeconds * 1000);
    }
 
    destroy() {
      clearInterval(this.delayInterval);
      this.delayInterval = undefined;
    }
 
    renderMap() {
      logger.debug("[HaMapCard] [Korea Radar from BuienradarPlugin] Called render() of Plugin:", this.name);
 
      const latLngBounds = L.latLngBounds([[30.830733701421657, 121.3822799316216], [40.11457219962541, 133.06990387691684]]);
      this.rainLayer = L.imageOverlay(this.overlayImages[0].src, latLngBounds, { "opacity": this.opacity });
      this.rainLayer.addTo(this.map);
      this.textbox.updateText(this.overlayImages[0].label);
    }
 
    update() { }
 
    nextFrame() {
      this.currentImage = (this.currentImage + 1) % this.overlayImages.length;
      this.rainLayer.setUrl(this.overlayImages[this.currentImage].src);
      this.textbox.updateText(this.overlayImages[this.currentImage].label);
    }
  };
}
