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

    // Setting attributes
    self.attrs = metaField.attrs;

    // Setting the cardinality
    self.card = metaField.card;

    // Is this metaField a title ?
    self.asTitle = 'asTitle' in metaField && metaField.asTitle;

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

    // Is it an array ?
    this.isArray = (this.type.substr(-2) == '[]');

    // Hide the field ?
    this.hide = 'hide' in metaField && metaField.hide;

    // Hide the label ?
    this.hideLabel = 'hideLabel' in metaField && metaField.hideLabel;

    // Field name
    this.name = metaField.name;

    this.prettyName = 'prettyName' in metaField ? metaField.prettyName
        : metaField.name;

    // A field row
    this.row = null;

    // Rows
    this.rows = null;

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
    this.getFieldHtml = function(justField, parameters)
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
                row += '<td>'+param.getFieldHtml(true, parameters)+'</td>';
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
                var field = '<input type="'+this.type+'" name="'+this.name+'" />'+this.unit;
            }

            if (!justField) {
                field = this.prettyName + ':&nbsp;' + field + '<br />';
            }

            return field;
        }
    };

    /**
     * Returns the HTML rendering
     */
    this.getHtml = function(parameters)
    {
        var html = '';

        if (!this.hideLabel) {
            html += '<b>' + this.name + '</b>: ';
        }
        
        html += this.getValue(parameters) + '<br/>';

        return html;
    };

    /**
     * Return the (value) HTML rendering
     */
    this.getValue = function()
    {
        var value = this.value;

        // If it's an array, concatenate it with ,
        if (value instanceof Array) {
            value = value.join(', ');
        }

        // Force checkboxes and booleans to be booleans
        if (this.type == 'checkbox') {
            value = !!value;
        }

        return value + ' ' + this.unit;
    };

    /**
     * Setting the value of the field
     */
    this.setValue = function(value)
    {
        this.value = value;
    };

    this.getLength = function()
    {
        if (metaField.isArray) {

        } else {

        }
    };
};
