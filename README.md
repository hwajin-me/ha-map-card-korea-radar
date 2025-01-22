# `ha-map-card` Buienradar plugin
![image](https://github.com/user-attachments/assets/ac28568c-40f8-4254-9181-667680219644)


## Installation
Install [ha-map-card](https://github.com/nathan-gs/ha-map-card) version `v1.13.0` or above.
Then, install the plugin using one of these options:

#### HACS

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=kevinjil&repository=map-card-buienradar&category=plugin)

#### Manual
Copy `map-card-buienradar.js` to the `www` folder of your Home Assistance configuration.

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
  &copy; <a href="https://www.buienradar.nl">Buienradar.nl</a>
entities:
  - entity: zone.home
    display: icon
    size: 15
plugins:
  - name: buienradar
    url: /local/map-card-buienradar.js
    options:
      delayMs: 750
      offsetMinutes:
        negative: -20
        positive: 170
      opacity: 0.7
      renderBranding: false
```
