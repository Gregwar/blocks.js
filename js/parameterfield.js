/**
 * A parameter field
 */
function ParameterField(parameter)
{
    var self = this;

    // Default unit
    if (parameter.unit == undefined) {
        this.unit = '';
    } else {
        this.unit = parameter.unit;
    }

    // Default type
    if (parameter.type == undefined) {
        parameter.type = 'text';
    } else {
        this.type = parameter.type;
    }

    // Hide the field ?
    this.hide = false;
    if (parameter.hide != undefined) {
        this.hide = true;
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
        if (parameter.default != undefined) {
            object[this.name] = parameter.default;
        }

        if (parameter.type instanceof Array) {
            for (k in parameter.type) {
                var param = new ParameterField(parameter.type[k]);
                param.name = this.name + '[' +param.name + '][]';
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
            this.rows = div.find('.' + this.name + '_rows');
            div.find('.' + this.name + '_add').click(function() {
                self.rows.append(self.row);
            });
            div.find('.' + this.name + '_remove').click(function() {
                self.rows.find('td').last().remove();
            });
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
            var head = '';
            var row = '';
            var nb = 1;

            for (k in parameter.type) {
                var type = parameter.type[k];
                var param = new ParameterField(type);
                param.name = this.name + '[' +param.name + '][]';

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

            var html = '<table><tr>'+head+'</tr><tbody class="'+this.name+'_rows">'+initRows+'</tbody></table>';
            html += '<a href="javascript:void(0);" class="'+this.name+'_add">Add</a> ';
            html += '<a href="javascript:void(0);" class="'+this.name+'_remove">Remove</a>';

            return html;
        } else {
            var type;
            if (parameter.type == 'check' || parameter.type == 'bool') {
                type = 'checkbox';
            }

            if (parameter.type == 'number') {
                type = 'text';
            }
            
            var field = '<input type="'+type+'" name="'+this.name+'" />'+this.unit;

            if (!justField) {
                field = this.prettyName + '<br/>' + field + '<br />';
            }

            return field;
        }
    };

    /**
     * Returns the HTML rendering
     */
    this.getHtml = function(parameters)
    {
        if (this.hide) {
            return '';
        }

        if (parameter.type instanceof Array) {
            var head = '';
            var rows = [];

            for (k in parameter.type) {
                var rows = [];
                var rowsHtml = '';
                var type = parameter.type[k];
                var param = new ParameterField(type);
                param.name = this.name + '[' +param.name + '][]';

                head += '<th>'+param.prettyName+'</th>';

                if (parameters[param.name]) {
                    for (k in parameters[param.name]) {
                        var val = parameters[param.name][k];

                        if (rows[k] == undefined) {
                            rows[k] = [];
                        }
                        rows[k].push(val);
                    }

                    for (k in rows) {
                        rowsHtml += '<tr>';
                        for (n in rows[k]) {
                            rowsHtml += '<td>'+rows[k][n]+'</td>';
                        }
                        rowsHtml += '</tr>';
                    }
                }
            }

            return '<table><tr>'+head+'</tr>'+rowsHtml+'</table>';
        } else {
            return '<b>' + this.name + '</b>: ' + parameters[this.name] + '<br/>';
        }
    };
};
