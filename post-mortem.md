# GNOME Shell Extensions

Extensions for GNOME Shell are written in JavaScript with bindings to GLib. Gjs
runs the code and uses the SpiderMonkey engine. 

Extensions are defined by `metadata.json` and `extension.js` files (optionally
`stylesheet.css`, too, but that isn't yet used for this project). `extension.js`
must define three function that will be called by Gjs:
* `init(metadata)` is called when the extension is first loaded
* `enable()`
* `disable()`

There are some functions in the global namespace:
* `log(...)` - logs messages to the systemd journal
* `logError(error, message)` - logs with the given `message` and stacktrace of
  `error`
* `_(string)` - marks a `string` for translation with gettext

Strings that shouldn't be translated should be enclosed in single quotes (') and
strings that are intended to be translated should be enclosed in double quotes
(").

# Components and Classes

Components are imported through `imports.*`, such as `const Gio =
imports.gi.Gio`. Components within the extension can be imported with help from
`misc.ExtensionUtils`:
```javascript
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const UPower = Me.imports.upower;
```

Gjs uses it's own class system. Classes are created by creating a new
`Lang.Class` and defined as properties. Adding support for signals is done by
passing the class prototype to `signals.addSignalMethods`.
```javascript
const MyClass = new Lang.Class({
    Name: 'MyClass',
    Extends: MyBaseClass,

    _init: function(opts) {
         this.parent();
    },

    myFunction: function() {}
}
Signals.addSignalMethods(MyClass.prototype);
```

# DBus

To connect to the DBus system, there is a helper function,
`gi.Gio.DBusProxy.makeProxyWrapper`, that will build a proxy wrapper function
given a DBus XML interface file. These interface files are stored under
`/usr/share/dbus-1/interfaces/` and include documentation and attributes that
aren't necessary and sometimes cause the wrapper function to fail. To extract
only what was necessary to build the proxy object, I wrote an XSL file to
transform the XML.
```javascript
const ClientProxy = Gio.DBusProxy.makeProxyWrapper(ClientInterface);
```

The proxy object is constructed from the wrapper function by passing the bus
(`system` or `user`), the interface, and the object path:
```javascript
const client = new UPower.ClientProxy(Gio.DBus.system,
    'org.freedesktop.UPower', '/org/freedesktop/UPower');
```

Properties of a DBus object are set as simple JavaScript object properties and
can be accessed using dot or bracket notation. Note that DBus uses TitleCase for
property names. 

Methods can be called synchronously or asynchronously by suffixing `Sync` or
`Remote` to end of the method name. Note that use *must* specify which.
Asynchronous methods take a `callback` argument.

You can `connect` the `g-properties-changed` signal to listen for changes in a
DBus object's properties. A list of changed properties is passed to the
callback. Object-specific signals are connected using `connectSignal`. These
function return an integer that can be used later to disconnect the signal. To
ensure the `this` context is preserved, callbacks should be bound using
`Lang.bind`.
```javascript
this._propertiesChangedId = this._client.connect('g-properties-changed',
    Lang.bind(this, this._onPropertiesChanged));
this._deviceAddedId = this._client.connectSignal('DeviceAdded', 
    Lang.bind(this, this._onDeviceAdded));
```

# UPower

The UPower system is used to get information about power devices connected to
the system. It exposes an interface over DBus, which also lets us listen to
signals.

The client object, at `/org/freedesktop/UPower`, has an `EnumerateDevices`
method as well as the signals `DeviceAdded` and `DeviceRemoved`.

Calling `EnumerateDevices` will give you a list of all the DBus object paths.
You can then create a proxy object for each by passing the path.
```javascript
const devicePaths = this._client.EnumerateDevicesSync()[0];
for (let devicePath of devicePaths) {
    const device = new UPower.DeviceProxy(Gio.DBus.system,
        'org.freedesktop.UPower', devicePath);
}
```

The device objects, under `/org/freedesktop/UPower/devices/`, have many
properties, not all of which are valid for a given device and will generally
read `0` or `""` if that is the case. To listen for changes in device
properties, connect the `g-properties-changed` signal.

# Panel Menu and Popup Menus

To create a new panel menu button, subclass `ui.panelMenu.PanelMenu.Button`. The
parent constructor takes a `menuAlignment`, `nameText`, and `dontCreateMenu`.
For this project, I used a `BoxLayout` with an `Icon` and a down-arrow menu
`Icon` inside.
```javascript
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
```

Each device menu entry is a `ui.popupMenu.PopupSubMenuMenuItem`, with a label
and an icon. Sub-menu property items are added as `ui.popupMenu.PopupMenuItem`s.
Menu items are added with `menu.addMenuItem`.

# Tools

Several tools proved helpful in development and debugging.

Logging output from GNOME Shell can be viewed with the `journalctl` tool:
`journalctl /usr/bin/gnome-shell --follow --output=cat`

The `upower` command line tool allows one to `--enumerate` all devices known to
UPower, `--dump` their current properties, and `--monitor` changes.

`mdbus2` provides an `--interactive` shell that features auto-completion and
makes it easy to explore and interact with the DBus system. It can also
`--listen` for signals.

In order to debug the extension without risking crashing my own GNOME Shell
session, I ran it in a QEMU VM and used SSH and scp to deploy and test the
extension.

LookingGlass, accessible by running the `lg` command in the run command prompt
(`Alt+F2`), is a debugging tool built into GNOME Shell, but I found it's
usefulness limited. There is also the `gjs` command line REPL interrupter that
helped in examining some objects interactively.