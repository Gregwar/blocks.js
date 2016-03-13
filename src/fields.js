"use strict";

/**
 * Parameters managers
 */
var Fields = function(block)
{
    var self = this;

    // Block & meta
    this.block = block;
    this.meta = this.block.meta;

    // Is the form displayed ?
    this.display = false;

    // Div
    this.div = null;

    // Fields
    this.fields = [];
    for (var k in this.meta.fields) {
        var field = new Field(this.meta.fields[k]);
        field.onUpdate = function() {
            self.block.cssParameters();
        };
        this.block.blocks.types.register(field.type);
        this.fields.push(field);
    }

    // Indexed fields
    this.inputs = [];
    this.outputs = [];
    this.editables = [];
    this.indexedFields = {};

    // Indexing
    for (var k in this.fields) {
        var field = this.fields[k];
        this.indexedFields[field.name] = field;

        if ('editable' in field.attrs) {
            this.editables.push(field);
        }
        if ('input' in field.attrs) {
            this.inputs.push(field);
            field.hide = true;
        }
        if ('output' in field.attrs) {
            this.outputs.push(field);
            field.hide = true;
        }
    }
};

/**
 * Getting a field by name
 */
Fields.prototype.getField = function(name)
{
    name = name.toLowerCase();

    return (name in this.indexedFields ? this.indexedFields[name] : null);
};

/**
 * Show the settings window
 */
Fields.prototype.show = function()
{
    var self = this;
    var html = '<h3>'+this.block.meta.name+'#'+this.block.id+'</h3>';

    html += '<form class="form">';
    for (var k in this.editables) {
        html += this.editables[k].getFieldHtml();
    }
    html += '<input type="submit" style="display:none" width="0" height="0" />';
    html += '</form>';
    
    html += '<button class="save" href="javascript:void(0);">Save</button>';
    html += '<button class="close" href="javascript:void(0);">Close</button>';

    this.div.html(html);

    this.div.find('.close').click(function() {
        $.fancybox.close();
    });

    var form = this.div.find('form');
    
    this.div.find('.save').click(function() {
        form.find('.pattern').remove();
        self.save(form.serializeForm());
        $.fancybox.close();
    });

    this.div.find('form').submit(function() {
        form.find('.pattern').remove();
        self.save($(this).serializeForm());
        $.fancybox.close();
        return false;
    });

    this.div.find('input').dblclick(function() {
        $(this).select();
    });

    this.handleArrays();

    $.fancybox.open(this.div, {wrapCSS: 'blocks_js_modal'});
    this.display = true;
};

/**
 * Handle Add & Remove buttons on fields array
 */
Fields.prototype.handleArrays = function()
{
    this.div.find('.fieldsArray').each(function() {
        var pattern = $(this).find('.pattern').html();
        var fields = $(this).find('.fields');

        var buttons = '<div class="buttons">';
        buttons += '<a class="add" href="#">Add</a> ';
        buttons += '<a class="remove" href="#">Remove</a>';
        buttons += '</div>';
        $(this).append(buttons);

        $(this).find('.add').click(function() {
            fields.append('<div class="field">'+pattern+'</div>');
        });

        $(this).find('.remove').click(function() {
            fields.find('.field').last().remove();
        });
    });
};

/**
 * Show the fields
 */
Fields.prototype.getHtml = function()
{
    var html = '';

    for (var k in this.editables) {
        html += this.editables[k].getHtml();
    }

    return html;
};

/**
 * Hide the form
 */
Fields.prototype.hide = function()
{
    this.div.hide();
    this.display = false;
};

/**
 * Saves the form
 */
Fields.prototype.save = function(serialize)
{
    var values = {};

    var boolFields = {};
    for (var entry in this.indexedFields) {
        if (this.indexedFields[entry].type == 'bool') {
            boolFields[entry] = this.indexedFields[entry];
        }
    }

    for (var key in serialize) {
        var newKey = key;
        var isArray = false;
        if (newKey.substr(newKey.length-2, 2) == '[]') {
            newKey = newKey.substr(0, newKey.length-2);
            isArray = true;
        }
        if (serialize[key] == null && isArray) {
            serialize[key] = [];
        }

        if (newKey in boolFields) {
            delete boolFields[newKey];
        }
        this.getField(newKey).setValue(serialize[key]);
    }

    for (var key in boolFields) {
        this.getField(key).setValue(false);
    }

    this.block.render();
    this.block.redraw();
};

/**
 * Show or hide the config
 */
Fields.prototype.toggle = function()
{
    if (this.meta.parametersEditor != undefined && typeof(this.meta.parametersEditor) == 'function') {
        this.meta.parametersEditor(this.block.values, function(values) {
            this.block.updateValues(values);
            this.block.render();
            this.block.redraw();
        });
    } else {
        if (this.display) {
            this.hide();
        } else {
            this.show();
        }
    }
};
