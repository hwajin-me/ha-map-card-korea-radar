#

## Installation
1. Install [ha-map-card](https://github.com/nathan-gs/ha-map-card).
1. Copy `BuienradarPlugin.js` to the `www` folder of your Home Assistance configuration.

## Configuration
Add the [ha-map-card](https://github.com/nathan-gs/ha-map-card) custom card to your Home Assistant dashboard.
Use the following configuration as example:
```yaml
type: custom:map-card
card_size: 8
focus_entity: zone.home
zoom: 7
tile_layer_url: https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png
tile_layer_attribution: >-
  &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>,
  &copy; <a href="https://carto.com/attributions">CARTO</a>,
  &copy; <a href="https://buienradar.nl">Buienradar</a>
entities:
  - entity: zone.home
    display: icon
    size: 15
plugins:
  - name: buienradar
    url: /local/BuienradarPlugin.js
    options:
      renderBranding: false
```