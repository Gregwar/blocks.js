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
        this.dimension = this.name;
        this.type = this.type.substr(0, this.type.length-2);
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

    if (this.type == 'longtext') {
        field += '<textarea name="'+this.name+'"></textarea>';
    } else if (this.type == 'choice' || this.choices) {
        field += '<select name="'+this.name+'">';
        for (var k in this.choices) {
            var choice = this.choices[k];
            field += '<option value="'+choice+'">'+choice+'</option>';
        }
        field += '</select>';
    } else {
        var type = this.type == 'bool' ? 'checkbox' : 'text';
        field += '<input value="'+this.getPrintableValue()+'" type="'+type+'" name="'+this.name+'" />'+this.unit;
    }

    field += '<br/>';

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
            value = value.join(',');
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
        value = value.split(',');
    }

    if (this.type == 'bool') {
        value = !!value;
    }

    this.value = value;
};

/**
 * Gets the variadic dimension
 */
Field.prototype.getDimension = function()
{
    if (this.extensible) {
        return this.size+1;
    } else if (this.isArray) {
        return this.getValue().length;
    } else {
        return parseInt(this.getValue());
    }
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
            card = [ioCard, ioCard];
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
