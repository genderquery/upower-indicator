const Main = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension()
const UPowerIndicator = Me.imports.indicator;


let _indicator = null;

/* exported init */
function init(_metadata) {}

/* exported enable */
function enable() {
    try {
        _indicator = new UPowerIndicator();
        Main.panel.addToStatusArea('UPowerIndicator', _indicator, 0, 'right');
    } catch (e) {
        logError(e, "Unhandled exception");
    }
}

/* exported disable */
function disable() {
    if (_indicator) {
        _indicator.destroy();
    }
}