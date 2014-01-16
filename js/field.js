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
        this.type = 'text';
    } else {
        var type = metaField.type.toLowerCase();

        if (type == 'check' || type == 'bool' || type == 'boolean') {
            type = 'checkbox';
        }

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

    // A field row
    this.row = null;

    // Rows
    this.rows = null;
    
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

    /**
     * Append the default value
     */
    this.appendDefault = function(object)
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
     * Setup the listeners on the div
     */
    this.setListeners = function(div)
    {
        if (metaField.type instanceof Array) {
            var updateNumbers = function() {
                div.find('table').each(function() {
                    var number = 1;
                    $(this).find('.number').each(function() {
                        $(this).text(number++);
                    });
                });
            }
            updateNumbers();
            this.rows = div.find('.' + this.name + '_rows');
            div.find('.' + this.name + '_add').click(function() {
                self.rows.append(self.row);
                self.updated();
                updateNumbers();
            });
            div.find('.' + this.name + '_remove').click(function() {
                self.rows.find('tr').last().remove();
            });
        }
    };

    /**
     * The render was updated
     */
    this.updated = function()
    {
        if (this.onUpdate) {
            this.onUpdate();
        }
    };

    /**
     * HTML render for the field
     */
    this.getFieldHtml = function(justField)
    {
        if (justField == undefined) {
            justField = false;
        }

        if (metaField.type instanceof Array) {
            var head = '<th></th>';
            var row = '<td class="number"></td>';
            var nb = 1;

            for (k in metaField.type) {
                var type = metaField.type[k];
                var param = new ParameterField(type);
                param.name = this.name + '.' +param.name;

                if (parameters[param.name] != undefined) {
                    nb = Math.max(nb, parameters[param.name].length);
                }

                head += '<th>'+param.prettyName+'</th>';
                row += '<td>'+param.getFieldHtml(true)+'</td>';
            }
            this.row = '<tr>'+row+'</tr>';
            var initRows = '';

            for (k=0; k<nb; k++) {
                initRows += this.row;
            }

            var html = '<table class="fields"><tr>'+head+'</tr><tbody class="'+this.name+'_rows">'+initRows+'</tbody></table>';
            html += '<a href="javascript:void(0);" class="'+this.name+'_add">Add</a> ';
            html += '<a href="javascript:void(0);" class="'+this.name+'_remove">Remove</a>';

            return html;
        } else { 
            if (this.type == 'textarea') {
                var field = '<textarea name="'+this.name+'"></textarea>';
            } else {
                var field = '<input value="'+this.getPrintableValue()+'" type="'+this.type+'" name="'+this.name+'" />'+this.unit;
            }

            if (!justField) {
                field = this.label + ':&nbsp;' + field + '<br />';
            }

            return field;
        }
    };

    /**
     * Returns the HTML rendering
     */
    this.getHtml = function()
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
    this.getValue = function()
    {
        return this.value;
    };

    /**
     * Get printable value
     */
    this.getPrintableValue = function(index)
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
    this.getPrintableValueWithUnit = function(index)
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
    this.getLabel = function()
    {
        return this.label;
    };

    /**
     * Setting the value of the field
     */
    this.setValue = function(value)
    {
        if (this.isArray && !(value instanceof Array)) {
            value = value.split(',');
        }

        if (this.type == 'checkbox') {
            value = !!value;
        }

        this.value = value;
    };
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
