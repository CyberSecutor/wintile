'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext;
const _ = Gettext.domain('wintile').gettext;

function init() {
}

function createColOptions(){
    let options = [
        { name: _("2") },
        { name: _("3") },
        { name: _("4"),}
    ];
    let liststore = new Gtk.ListStore();
    liststore.set_column_types([GObject.TYPE_STRING])
    for (let i = 0; i < options.length; i++ ) {
        let option = options[i];
        let iter = liststore.append();
        liststore.set (iter, [0], [option.name]);
    }
    return liststore;
}

function buildPrefsWidget() {
    // Copy the same GSettings code from `extension.js`
    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        Me.dir.get_child('schemas').get_path(),
        Gio.SettingsSchemaSource.get_default(),
        false
    );

    this.settings = new Gio.Settings({
        settings_schema: gschema.lookup('org.gnome.shell.extensions.wintile', true)
    });

    let rendererText = new Gtk.CellRendererText();

    // Create a parent widget that we'll return from this function
    let layout = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    });

    let row = 0;
    
    // Add a simple title and add it to the layout
    let title = new Gtk.Label({
        label: `<b>${Me.metadata.name} Extension Preferences</b>`,
        halign: Gtk.Align.CENTER,
        use_markup: true,
        visible: true
    });
    layout.attach(title, 0, row++, 2, 1);
    
    // Column setting
    let colsLabel = new Gtk.Label({
        label: _("Number of columns"),
        visible: true,
        hexpand: true,
        halign: Gtk.Align.START
    });
    let colsInput = new Gtk.ComboBox({
        model: createColOptions(),
        visible: true
    });
    colsInput.pack_start (rendererText, false);
    colsInput.add_attribute (rendererText, "text", 0);
    layout.attach(colsLabel, 0, row, 1, 1);
    layout.attach(colsInput, 1, row++, 1, 1);

    // Maximize setting
    let maximizeLabel = new Gtk.Label({
        label: _("Use true maximizing of windows"),
        visible: true,
        hexpand: true,
        halign: Gtk.Align.START
    });
    let maximizeInput = new Gtk.Switch({
        active: this.settings.get_boolean ('use-maximize'),
        halign: Gtk.Align.END,
        visible: true
    });
    layout.attach(maximizeLabel, 0, row, 1, 1);
    layout.attach(maximizeInput, 1, row++, 1, 1);

    // Preview settings
    let previewEnabled = this.settings.get_boolean ('preview');
    let previewLabel = new Gtk.Label({
        label: _("Enable preview while dragging windows"),
        visible: true,
        hexpand: true,
        halign: Gtk.Align.START
    });
    let previewInput = new Gtk.Switch({
        active: previewEnabled,
        halign: Gtk.Align.END,
        visible: true
    });
    layout.attach(previewLabel, 0, row, 1, 1);
    layout.attach(previewInput, 1, row++, 1, 1);

    // Double width previews
    let doubleWidthLabel = new Gtk.Label({
        label: _("     Use double width previews on sides in 4 column mode"),
        visible: true,
        hexpand: true,
        halign: Gtk.Align.START
    });
    let doubleWidthInput = new Gtk.Switch({
        active: this.settings.get_boolean ('double-width'),
        halign: Gtk.Align.END,
        visible: true
    });
    layout.attach(doubleWidthLabel, 0, row, 1, 1);
    layout.attach(doubleWidthInput, 1, row++, 1, 1);

    // Debug setting
    let debugLabel = new Gtk.Label({
        label: _("Turn on debugging"),
        visible: true,
        hexpand: true,
        halign: Gtk.Align.START
    });
    let debugInput = new Gtk.Switch({
        active: this.settings.get_boolean ('debug'),
        halign: Gtk.Align.END,
        visible: true
    });
    layout.attach(debugLabel, 0, row, 1, 1);
    layout.attach(debugInput, 1, row++, 1, 1);

    this.settings.bind('cols', colsInput, 'active', Gio.SettingsBindFlags.DEFAULT);
    this.settings.bind('double-width', doubleWidthInput, 'active', Gio.SettingsBindFlags.DEFAULT);
    this.settings.bind('use-maximize', maximizeInput, 'active', Gio.SettingsBindFlags.DEFAULT);
    this.settings.bind('preview', previewInput, 'active', Gio.SettingsBindFlags.DEFAULT);
    this.settings.bind('debug', debugInput, 'active', Gio.SettingsBindFlags.DEFAULT);

    let setDoubleWidthWidgetsEnabled = function(enabled) {
        doubleWidthLabel.set_sensitive(enabled);
        doubleWidthInput.set_sensitive(enabled);
    };

    setDoubleWidthWidgetsEnabled(previewEnabled);
    previewInput.connect('state-set', function(widget, state) {
        setDoubleWidthWidgetsEnabled(state);
    });

    // Return our widget which will be added to the window
    return layout;
}
