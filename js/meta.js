/**
 * Manage one block meta
 */
Meta = function(meta)
{
    var self = this;

    this.name = meta.name;
    this.loopable = ('loopable' in meta && meta['loopable']);
    this.size = ('size' in meta ? meta.size : 'normal');
    this.fields = [];

    // Importing fields meta data
    if ('fields' in meta) {
        for (k in meta.fields) {
            var field = meta.fields[k];
            var attributes = ('attrs' in field ? field.attrs.split(' ') : []);
            field.attrs = {};
            for (i in attributes) {
                field.attrs[attributes[i]] = true;
            }
            this.fields.push(field);
        }
    }

    // Checking for parameters editor
    for (k in meta.parametersEditor) {
        var key = keys[k];
        if (meta[key] != undefined) {
            this[key] = meta[key];
        } else {
            this[key] = [];
        }
    }

    // Adding module
    if ('module' in meta) {
        this.module = meta.module;
    } else {
        this.module = null;
    }

    // Checking the family
    if (meta.family == undefined) {
        this.family = ''; // Root family
    } else {
        this.family = meta.family;
    }

    // Style
    if (meta['class'] != undefined) {
        this['class'] = meta['class'];
    } else {
        this['class'] = '';
    }

    // Description
    this.description = null;
    if (meta.description != undefined) {
        this.description = meta.description;
    }
}

