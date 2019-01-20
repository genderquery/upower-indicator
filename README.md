# UPower Indicator

GNOME Shell extension that adds an indicator to the panel with a menu that lists
all battery-powered devices.

The built-in indicator in GNOME Shell only shows the "DisplayDevice", a
composite of power-providing batteries. This extension adds an indicator with a
drop-down menu displaying the status of all battery-powered deviced connected to
the system.

![upower-indicator-screenshot](https://gitlab.com/genderquery/upower-indicator/wikis/uploads/9ba363aa0c9cde2572e404e306dde3b5/upower-indicator-screenshot.png)

## Optional components
* `gnome-power-manager` for "Power Statistics" menu option

## To-do
* Test on other Shell versions
* Unit tests
* Documentation
* Make DBus calls asynchronous
* Allow renaming of devices
* Translations