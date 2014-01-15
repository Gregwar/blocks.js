/**
 * Manage one block type
 */
BlockType = function(type)
{
    var self = this;

    this.name = type.name;
    this.loopable = ('loopable' in type && type['loopable']);
    this.size = ('size' in type ? type.size : 'normal');
    this.fields = [];
    this.inputs = [];
    this.outputs = [];
    this.parameters = [];

    // Getting fields
    if ('fields' in type) {
        for (k in type.fields) {
            var field = type.fields[k];
            var attributes = ('attrs' in field ? field.attrs.split(' ') : []);
            field.attrs = {};
            for (i in attributes) {
                field.attrs[attributes[i]] = true;
            }
            this.fields.push(field);

            if ('editable' in field.attrs) {
                this.parameters.push(field);
            }
            if ('input' in field.attrs) {
                field.hide = true;
                this.inputs.push(field);
            }
            if ('output' in field.attrs) {
                field.hide = true;
                this.outputs.push(field);
            }
        }
    }

    // Checking for parameters editor
    for (k in type.parametersEditor) {
        var key = keys[k];
        if (type[key] != undefined) {
            this[key] = type[key];
        } else {
            this[key] = [];
        }
    }

    // Adding module
    if ('module' in type) {
        this.module = type.module;
    } else {
        this.module = null;
    }

    // Checking the family
    if (type.family == undefined) {
        this.family = ''; // Root family
    } else {
        this.family = type.family;
    }

    // Style
    if (type['class'] != undefined) {
        this['class'] = type['class'];
    } else {
        this['class'] = '';
    }

    // Description
    this.description = null;
    if (type.description != undefined) {
        this.description = type.description;
    }
}

