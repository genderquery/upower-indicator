const Signals = imports.signals;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension()
const UPower = Me.imports.upower;

// TODO: make DBus calls asynchronous
// TOOD: translations
const UPowerIndicator = new Lang.Class({
    Name: 'UPowerIndicator',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, _("UPower Indicator"));

        this._hbox = new St.BoxLayout({
            style_class: 'panel-status-menu-box'
        });
        this._hbox.add_child(new St.Icon({
            style_class: 'system-status-icon',
            icon_name: 'battery-symbolic'
        }));
        this._hbox.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));
        this.actor.add_child(this._hbox);

        this._client = new UPower.ClientProxy(Gio.DBus.system,
            'org.freedesktop.UPower', '/org/freedesktop/UPower');
        this._propertiesChangedId = this._client.connect('g-properties-changed',
            Lang.bind(this, this._syncDevicesMenu));
        this._deviceAddedId = this._client.connectSignal('DeviceAdded', 
            Lang.bind(this, this._syncDevicesMenu));
        this._deviceRemovedId = this._client.connectSignal('DeviceRemoved', 
            Lang.bind(this, this._syncDevicesMenu));

        this._syncDevicesMenu();
    },
   
    _syncDevicesMenu: function() {
        this.menu.removeAll();

        const devicePaths = this._client.EnumerateDevicesSync()[0];
        for (let devicePath of devicePaths) {
            const device = new UPower.DeviceProxy(Gio.DBus.system,
                'org.freedesktop.UPower', devicePath);
            if (device.Type === UPower.DeviceKind.UNKNOWN ||
                device.Type === UPower.DeviceKind.LINE_POWER) {
                // only show batteries and peripherals 
                continue;
            }
            // TODO: use configurable name for devices
            const menuItem = new PopupMenu.PopupSubMenuMenuItem(
                device.NativePath, true);
            menuItem.icon.icon_name = device.IconName;
            // TODO: disconnect these signals before they destroyed
            device.connect('g-properties-changed', () => {
                Lang.bind(this, this._syncDeviceProperties, 
                    device, menuItem.menu);
            });
            this._syncDeviceProperties(device, menuItem.menu);
            this.menu.addMenuItem(menuItem);
        }

        // if gnome-power-statistics is installed, add it to the menu
        let powerStats = Shell.AppSystem.get_default()
            .lookup_app('org.gnome.PowerStats.desktop');
        if (powerStats) {
            this.menu.addAction("Power Statistics", function() {
                Main.overview.hide();
                powerStats.activate();
            });
        }
    },

    _syncDeviceProperties: function(device, menu) {
        menu.removeAll();
        const state = this._getDeviceStateString(device);
        menu.addMenuItem(new PopupMenu.PopupMenuItem(state));
        if (device.EnergyRate) {
            // Translators: this is Energy rate: <watts>
            const rate = _("Energy rate: %3.1f W").format(device.EnergyRate);
            menu.addMenuItem(new PopupMenu.PopupMenuItem(rate));
        }
        if (device.Temperature) {
            // Translators: this is Temperature: <degrees Celsius>
            const temp = _("Temperature: %3.1f \u2103")
                .format(device.Temperature);
            menu.addMenuItem(new PopupMenu.PopupMenuItem(temp));
        }
        if (device.Capacity) {
            // Translators: this is Capacity: <percentage>
            const capacity = _("Capacity: %d\u2009%%").format(device.Capacity);
            menu.addMenuItem(new PopupMenu.PopupMenuItem(capacity));
        }
    },

    _getDeviceStateString: function(device) {
        let seconds = 0;

        if (device.State === UPower.DeviceState.UNKNOWN) {
            return _("Unknown State")
        } else if (device.State === UPower.DeviceState.CHARGING) {
            seconds = device.TimeToFull;
        } else if (device.State === UPower.DeviceState.DISCHARGING) {
            seconds = device.TimeToEmpty;
        } else if (device.State === UPower.DeviceState.EMPTY) {
            return _("Empty");
        } else if (device.State === UPower.DeviceState.FULLY_CHARGED) {
            return _("Fully Charged");
        } else {
            // state is one of PENDING_CHARGING, PENDING_DISCHARGING
            return _("Estimating…");
        }
   
        let time = Math.round(seconds / 60);
        if (time == 0) {
            if (device.State === UPower.DeviceState.CHARGING) {
                // Translators: this is Charging (<percentage>)
                return _("Charging (%d\u2009%%)").format(device.Percentage);
            } else {
                // Translators: this is Discharging (<percentage>)
                return _("Discharging (%d\u2009%%)").format(device.Percentage);
            }
        }

        let minutes = time % 60;
        let hours = Math.floor(time / 60);

        if (device.State === UPower.DeviceState.DISCHARGING) {
            // Translators: this is <hours>:<minutes> Remaining (<percentage>)
            return _("%d\u2236%02d Remaining (%d\u2009%%)")
                .format(hours, minutes, device.Percentage);
        }

        if (device.State === UPower.DeviceState.CHARGING) {
            // Translators: this is <hours>:<minutes> Until Full (<percentage>)
            return _("%d\u2236%02d Until Full (%d\u2009%%)")
                .format(hours, minutes, device.Percentage);
        }

        return null;
    }
});
Signals.addSignalMethods(UPowerIndicator.prototype);