# `ha-map-card` for Korea Radar from Buienradar plugin
![image](./preview/2025-01-26_v0.2.0.gif)


## Installation
Install [ha-map-card](https://github.com/hwajin-me/ha-map-card-korea-radar) version `v1.13.0` or above.
Then, install the plugin using one of these options:

#### HACS

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=hwajin-me&repository=ha-map-card-korea-radar&category=plugin)

#### Manual
Copy `ha-map-card-korea-radar.js` to the `www` folder of your Home Assistance configuration.

Note: with a manual installation, the `url` in the configuration should be `/local/ha-map-card-korea-radar.js`

## Configuration
Add the [ha-map-card](https://github.com/hwajin-me/ha-map-card-korea-radar/) custom card to your Home Assistant dashboard.

| Option                   | Description                                                                    |
| ------------------------ | ------------------------------------------------------------------------------ |
| `delaySeconds`           | The amount of seconds between every sprite image.                              |
| `imageRange.start`       | The start date-time to fetch.                                                  |
| `imageRange.end`         | The end date-time to fetch                                                     |
| `opacity`                | The opacity of the image overlay.                                              |
| `decorate`               | The HTML string for date-time to display (default is `<div>{date}</div>`)      |

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
  - name: korea-radar
    url: >-
      /local/community/ha-map-card-korea-radar/ha-map-card-korea-radar.js
    options:
      delaySeconds: 3
      imageRange:
        start: "2025-02-03T10:00:00"
        end: "2025-02-03T10:10:00"
      opacity: 0.5
      decorate: <div>{date}</div>

```
