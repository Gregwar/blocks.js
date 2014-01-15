/**
 * A parameter field
 */
function ParameterField(parameter)
{
    var self = this;
    this.onUpdate = null;

    // Default unit
    if (parameter.unit == undefined) {
        this.unit = '';
    } else {
        this.unit = parameter.unit;
    }

    // Setting the cardinality
    self.card = parameter.card

    // Is this parameter a title ?
    self.asTitle = 'asTitle' in parameter && parameter.asTitle;

    // Getting type
    if (parameter.type == undefined) {
        parameter.type = 'text';
    } else {
        var type = parameter.type.toLowerCase();

        if (type == 'check' || type == 'bool' || type == 'boolean') {
            type = 'checkbox';
        }

        this.type = type;
    }

    // Is it an array ?
    this.isArray = (this.type.substr(-2) == '[]');

    // Hide the field ?
    this.hide = 'hide' in parameter && parameter.hide;

    // Hide the label ?
    this.hideLabel = 'hideLabel' in parameter && parameter.hideLabel;

    // Field name
    this.name = parameter.name;

    this.prettyName = 'prettyName' in parameter ? parameter.prettyName
        : parameter.name;

    // A field row
    this.row = null;

    // Rows
    this.rows = null;

    // Default value
    this.default = 'default' in parameter ? parameter.default : null;

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
        if (parameter.type instanceof Array) {
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

        if (parameter.type instanceof Array) {
            var head = '<th></th>';
            var row = '<td class="number"></td>';
            var nb = 1;

            for (k in parameter.type) {
                var type = parameter.type[k];
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
    this.getValue = function(parameters)
    {
        var value = '';

        // Getting the value from either the parameters, the
        // default value or '?' as fallback
        if (this.name in parameters) {
            value = parameters[this.name];
        } else if ('default' in parameter) {
            value = parameter['default'];
        } else {
            value = '?';
        }

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
};
