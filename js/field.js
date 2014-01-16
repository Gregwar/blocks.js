/**
 * A metaField field
 */
function Field(metaField)
{
    var self = this;
    this.onUpdate = null;

    // Value
    this.value = null;

    if ('default' in metaField) {
        this.value = metaField.default;
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
    this.choices = 'choices' in metaField ? metaField.choices : [];
    
    // Is it an array ?
    this.isArray = (this.type.substr(-2) == '[]');

    if (this.isArray) {
        this.dimension = this.name;
        this.type = this.type.substr(0, this.type.length-2);
    }

    // Is variadic?
    this.variadic = !!this.dimension;

    // Default value
    this.default = 'default' in metaField ? metaField.default : null;
};

/**
 * Append the default value
 */
Field.prototype.appendDefault = function(object)
{
    if (this.default != null) {
        object[this.name] = this.default;
    } else if (this.isArray) {
        object[this.name] = [];
    } else {
        object[this.name] = null;
    }
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
    var field = this.label+': ';

    if (this.type == 'longtext') {
        field += '<textarea name="'+this.name+'"></textarea>';
    } else if (this.type == 'choice') {
        field += '<select name="'+this.name+'">';
        for (k in this.choices) {
            var choice = this.choices[k];
            field += '<option value="'+choice+'">'+choice+'</option>';
        }
        field += '</select>';
    } else {
        field += '<input value="'+this.getPrintableValue()+'" type="'+this.type+'" name="'+this.name+'" />'+this.unit;
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
    if (this.isArray) {
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
            tab = ioCard.split('-');
            if (tab.length == 1) {
                card = [0, tab[0]];
            } else {
                card = tab;
            }
        }
    }

    for (idx in card) {
        if (card[idx] != '*') {
            card[idx] = parseInt(card[idx]);
        }
    }

    return card;
};
