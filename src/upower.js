const Gio = imports.gi.Gio;

// TODO: documentation on methods and properties

const ClientInterface = '<node> \
<interface name="org.freedesktop.UPower"> \
<method name="EnumerateDevices"> \
    <arg name="devices" direction="out" type="ao"/> \
</method> \
<method name="GetDisplayDevice"> \
    <arg name="device" direction="out" type="o"/> \
</method> \
<method name="GetCriticalAction"> \
    <arg name="action" direction="out" type="s"/> \
</method> \
<signal name="DeviceAdded"> \
    <arg name="device" type="o"/> \
</signal> \
<signal name="DeviceRemoved"> \
    <arg name="device" type="o"/> \
</signal> \
<property name="DaemonVersion" type="s" access="read"/> \
<property name="OnBattery" type="b" access="read"/> \
<property name="LidIsClosed" type="b" access="read"/> \
<property name="LidIsPresent" type="b" access="read"/> \
</interface> \
</node>';
/* exported ClientProxy */
const ClientProxy = Gio.DBusProxy.makeProxyWrapper(ClientInterface);

const DeviceInterface = '<node> \
<interface name="org.freedesktop.UPower.Device"> \
<method name="Refresh"/> \
<method name="GetHistory"> \
    <arg name="type" direction="in" type="s"/> \
    <arg name="timespan" direction="in" type="u"/> \
    <arg name="resolution" direction="in" type="u"/> \
    <arg name="data" direction="out" type="a(udu)"/> \
</method> \
<method name="GetStatistics"> \
    <arg name="type" direction="in" type="s"/> \
    <arg name="data" direction="out" type="a(dd)"/> \
</method> \
<property name="NativePath" type="s" access="read"/> \
<property name="Vendor" type="s" access="read"/> \
<property name="Model" type="s" access="read"/> \
<property name="Serial" type="s" access="read"/> \
<property name="UpdateTime" type="t" access="read"/> \
<property name="Type" type="u" access="read"/> \
<property name="PowerSupply" type="b" access="read"/> \
<property name="HasHistory" type="b" access="read"/> \
<property name="HasStatistics" type="b" access="read"/> \
<property name="Online" type="b" access="read"/> \
<property name="Energy" type="d" access="read"/> \
<property name="EnergyEmpty" type="d" access="read"/> \
<property name="EnergyFull" type="d" access="read"/> \
<property name="EnergyFullDesign" type="d" access="read"/> \
<property name="EnergyRate" type="d" access="read"/> \
<property name="Voltage" type="d" access="read"/> \
<property name="Luminosity" type="d" access="read"/> \
<property name="TimeToEmpty" type="x" access="read"/> \
<property name="TimeToFull" type="x" access="read"/> \
<property name="Percentage" type="d" access="read"/> \
<property name="Temperature" type="d" access="read"/> \
<property name="IsPresent" type="b" access="read"/> \
<property name="State" type="u" access="read"/> \
<property name="IsRechargeable" type="b" access="read"/> \
<property name="Capacity" type="d" access="read"/> \
<property name="Technology" type="u" access="read"/> \
<property name="WarningLevel" type="u" access="read"/> \
<property name="IconName" type="s" access="read"/> \
</interface> \
</node>';
/* exported DeviceProxy */
const DeviceProxy = Gio.DBusProxy.makeProxyWrapper(DeviceInterface);

/**
 * UpDeviceKind:
 *
 * The device type.
 **/
/* exported DeviceKind */
const DeviceKind = {
    UNKNOWN: 0,
    LINE_POWER: 1,
    BATTERY: 2,
    UPS: 3,
    MONITOR: 4,
    MOUSE: 5,
    KEYBOARD: 6,
    PDA: 7,
    PHONE: 8,
    MEDIA_PLAYER: 9,
    TABLET: 10,
    COMPUTER: 11
};

/**
 * UpDeviceState:
 *
 * The device state.
 **/
/* exported DeviceState */
const DeviceState = {
    UNKNOWN: 0,
    CHARGING: 1,
    DISCHARGING: 2,
    EMPTY: 3,
    FULLY_CHARGED: 4,
    PENDING_CHARGE: 5,
    PENDING_DISCHARGE: 6
};

/**
 * UpDeviceTechnology:
 *
 * The device technology.
 **/
/* exported DeviceTechnology */
const DeviceTechnology = {
    UNKNOWN: 0,
    ION: 1,
    POLYMER: 2,
    PHOSPHATE: 3,
    ACID: 4,
    CADMIUM: 5,
    HYDRIDE: 6
};

/**
 * UpDeviceLevel:
 *
 * The warning level of a battery.
 **/
/* exported DeviceLevel */
const DeviceLevel = {
    UNKNOWN: 0,
    NONE: 1,
    DISCHARGING: 2,
    LOW: 3,
    CRITICAL: 4,
    ACTION: 5
};
