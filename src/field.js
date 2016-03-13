"use strict";

/**
 * A metaField field
 */
var Field = function(metaField)
{
    var self = this;
    this.onUpdate = null;

    // Value
    this.value = null;

    if ('defaultValue' in metaField) {
        this.value = metaField.defaultValue;
    }

    // Default unit
    if (metaField.unit == undefined) {
        this.unit = '';
    } else {
        this.unit = metaField.unit;
    }

    // Length
    this.dimension = 'dimension' in metaField ? metaField.dimension : null;

    // Setting attributes
    this.attrs = metaField.attrs;

    // Is this metaField a title ?
    this.asTitle = 'asTitle' in metaField && metaField.asTitle;

    // Getting type
    if (metaField.type == undefined) {
        this.type = 'string';
    } else {
        var type = metaField.type.toLowerCase();
        type = Types.normalize(type);

        this.type = type;
    }

    // Cardinalities
    this.card = 'card' in metaField ? metaField.card : '*';
    this.card = this.parseCardinality(this.card, this.is('output'));

    // Hide the field ?
    this.hide = 'hide' in metaField && metaField.hide;

    // Hide the label ?
    this.hideLabel = 'hideLabel' in metaField && metaField.hideLabel;

    // Field iname
    this.name = metaField.name.toLowerCase();

    this.label = 'label' in metaField ? metaField.label
        : metaField.name;

    this.dynamicLabel = 'dynamicLabel' in metaField ? metaField.dynamicLabel
        : null;

    // Choices
    this.choices = 'choices' in metaField ? metaField.choices : null;

    // Is this field auto-extensible?
    this.extensible = 'extensible' in metaField && metaField.extensible;
    this.size = 1;
    
    // Is it an array ?
    this.isArray = (this.type.substr(-2) == '[]');

    if (this.isArray) {
        if (this.dimension == null) {
            this.dimension = this.name;
        }
        this.type = Types.normalize(this.type.substr(0, this.type.length-2));
    }

    // Is variadic?
    this.variadic = !!this.dimension;

    // Default value
    this.defaultValue = 'defaultValue' in metaField ? metaField.defaultValue : null;
};

/**
 * The render was updated
 */
Field.prototype.updated = function()
{
    if (this.onUpdate) {
        this.onUpdate();
    }
};

/**
 * HTML render for the field
 */
Field.prototype.getFieldHtml = function()
{
    var field = this.label+':<br/>';

    if (this.isArray) {
        field += '<div class="fieldsArray">';
        field += '<div class="pattern">';
        field += this.getSingleFieldHtml('');
        field += '</div>';
        field += '<div class="fields">';
        var value = this.getValue();
        for (var k in value) {
            field += '<div class="field">';
            field += this.getSingleFieldHtml(value[k]);
            field += '</div>';
        }
        field += '</div>';
        field += '</div>';
    } else {
        field += this.getSingleFieldHtml();
    }

    field += '<br/>';

    return field;
};

/**
 * Return the (field) name, which is the name suffixed with []
 * if it's an array
 */
Field.prototype.getFieldName = function()
{
    var name = this.name;

    if (this.isArray) {
        name += '[]';
    }

    return name;
};

/**
 * Gets the HTML code for a single field
 */
Field.prototype.getSingleFieldHtml = function(value)
{
    var field = '';

    if (value == undefined) {
        value = this.getPrintableValue();
    }

    if (this.type == 'longtext') {
        field += '<textarea name="'+this.getFieldName()+'"></textarea>';
    } else if (this.type == 'choice' || this.choices) {
        field += '<select name="'+this.getFieldName()+'">';
        for (var k in this.choices) {
            var choice = this.choices[k];
            var selected = (choice == value) ? 'selected' : '';
            field += '<option '+selected+' value="'+choice+'">'+choice+'</option>';
        }
        field += '</select>';
    } else {
        var type = this.type == 'bool' ? 'checkbox' : 'text';
        var checked = '';
        if (this.type == 'bool') {
            checked = value ? 'checked="checked"' : '';
        }
        field += '<input '+checked+' value="'+value+'" type="'+type+'" name="'+this.getFieldName()+'" />'+this.unit;
    }

    return field;
};

/**
 * Returns the HTML rendering
 */
Field.prototype.getHtml = function()
{
    var html = '';

    if (!this.hideLabel) {
        html += '<b>' + this.label + '</b>: ';
    }
    
    html += this.getPrintableValueWithUnit() + '<br/>';

    return html;
};

/**
 * Return the (value) HTML rendering
 */
Field.prototype.getValue = function()
{
    return this.value;
};

/**
 * Get printable value
 */
Field.prototype.getPrintableValue = function(index)
{
    var value = this.getValue();

    if (value instanceof Array) {
        if (index == undefined) {
            value = value.join(', ');
        } else {
            value = value[index];
        }
    }

    return value;
};

/**
 * Get printable value with units
 */
Field.prototype.getPrintableValueWithUnit = function(index)
{
    var value = this.getPrintableValue(index);

    if (this.unit) {
        value += this.unit;
    }

    return value;
};

/**
 * Getting the label
 */
Field.prototype.getLabel = function()
{
    return this.label;
};

/**
 * Setting the value of the field
 */
Field.prototype.setValue = function(value)
{
    if (this.isArray && !(value instanceof Array)) {
        value = value.split(', ');
    }

    if (this.type == 'bool') {
        value = !!value;
    }

    this.value = value;
};

/**
 * Gets as variadic dimension
 */
Field.prototype.asDimension = function()
{
    if (this.extensible) {
        return this.size+1;
    } else if (this.isArray) {
        var value = this.getValue();

        if (value instanceof Array) {
            return this.getValue().length;
        } else {
            throw "Unable to get the dimension of field "+this.name;
        }
    } else {
        return parseInt(this.getValue());
    }
};

/**
 * Gets the variadic dimension
 */
Field.prototype.getDimension = function(fields)
{
    if (typeof(this.dimension) == 'number') {
        return this.dimension;
    }

    var field = fields.getField(this.dimension);
    if (!field) {
        throw 'Unable to find dimension field '+this.dimension;
    }

    return field.asDimension();
};


/**
 * Checks if the fields has an attribute
 */
Field.prototype.is = function(attr)
{
    return (attr in this.attrs);
};

/**
 * Parses the cardinality
 */
Field.prototype.parseCardinality = function(ioCard, isOutput)
{
    var card = [0, 1];

    if (isOutput) {
        card = [0, '*'];
    }

    if (ioCard != undefined) {
        if (typeof(ioCard) != 'string') {
            card = [0, ioCard];
        } else {
            var tab = ioCard.split('-');
            if (tab.length == 1) {
                card = [0, tab[0]];
            } else {
                card = tab;
            }
        }
    }

    for (var idx in card) {
        if (card[idx] != '*') {
            card[idx] = parseInt(card[idx]);
        }
    }

    return card;
};
