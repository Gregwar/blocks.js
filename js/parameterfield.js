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

    // Default type
    if (parameter.type == undefined) {
        parameter.type = 'text';
    } else {
        var type = parameter.type;

        if (type == 'check' || type == 'bool') {
            type = 'checkbox';
        }

        this.type = type;
    }

    // Hide the field ?
    this.hide = false;
    if (parameter.hide != undefined) {
        this.hide = true;
    }

    this.hideLabel = false;
    if (parameter.hideLabel != undefined) {
        this.hideLabel = true;
    }

    // Field name
    this.name = parameter.name;
    this.prettyName = parameter.name;

    if (parameter.prettyName != undefined) {
        this.prettyName = parameter.prettyName;
    }

    // A field row
    this.row = null;

    // Rows
    this.rows = null;

    /**
     * Append the default value
     */
    this.appendDefault = function(object)
    {
        if (parameter['default'] != undefined) {
            object[this.name] = parameter['default'];
        }

        if (parameter.type instanceof Array) {
            for (k in parameter.type) {
                var param = new ParameterField(parameter.type[k]);
                param.name = this.name + '.' +param.name;
                param.appendDefault(object);
            }
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

        if (this.name in parameters) {
            value = parameters[this.name];
        } else if ('default' in parameter) {
            value = parameter['default'];
        } else {
            value = '?';
        }

        if (this.type == 'checkbox' || this.type == 'bool') {
            value = !!value;
        }

        return value + ' ' + this.unit;
    };
};
