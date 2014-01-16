/**
 * Parameters managers
 */
function Fields(block)
{
    var self = this;

    // Block & meta
    this.block = block;
    this.meta = block.meta;

    // Is the form displayed ?
    this.display = false;

    // Div
    this.div = null;

    // Fields
    this.fields = [];
    for (k in this.meta.fields) {
        var field = new Field(this.meta.fields[k]);
        field.onUpdate = function() {
            block.cssParameters();
        };
        this.fields.push(field);
    }

    // Indexed fields
    this.inputs = [];
    this.outputs = [];
    this.editables = [];
    this.indexedFields = {};

    // Indexing
    for (k in this.fields) {
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

    /**
     * Getting a field by name
     */
    this.getField = function(name)
    {
        return (name in this.indexedFields ? this.indexedFields[name] : null);
    };

    /**
     * Show the settings window
     */
    this.show = function()
    {
        html = '<h3>Parameters</h3>';

        html += '<form>';
        for (k in this.editables) {
            html += this.editables[k].getFieldHtml(false);
        }
        html += '<input type="submit" style="display:none" width="0" height="0" />';
        html += '</form>';
        
        html += '<a class="close" href="javascript:void(0);">Close</a>';

        this.div.html(html);

        this.div.find('.close').click(function() {
            self.div.hide();
            self.save();
        });

        this.div.find('form').submit(function() {
            self.div.hide();
            self.save();
            return false;
        });

        for (k in this.fields) {
            this.fields[k].setListeners(this.div);
        }

        this.div.find('input').click(function() {
            var val = $(this).val();
            $(this).val('');
            $(this).val(val);
        });

        this.div.find('input').dblclick(function() {
            $(this).select();
        });

        this.div.show();
        display = true;
    };

    /**
     * Show the fields
     */
    this.getHtml = function()
    {
        var html = '';

        for (k in this.editables) {
            html += this.editables[k].getHtml();
        }

        return html;
    };

    /**
     * Hide the form
     */
    this.hide = function()
    {
        this.div.hide();
        display = false;
    };

    /**
     * Saves the form
     */
    this.save = function()
    {
        var serialize = this.div.find('form').serializeForm();
        var values = {};

        for (key in serialize) {
            var newKey = key;
            var isArray = false;
            if (newKey.substr(newKey.length-2, 2) == '[]') {
                newKey = newKey.substr(0, newKey.length-2);
                isArray = true;
            }
            if (serialize[key] == null && isArray) {
                serialize[key] = [];
            }

            this.getField(newKey).setValue(serialize[key]);
        }

        block.render();
        block.redraw();
    };

    /**
     * Show or hide the config
     */
    this.toggle = function()
    {
        if (this.meta.parametersEditor != undefined && typeof(this.meta.parametersEditor) == 'function') {
            this.meta.parametersEditor(block.values, function(values) {
                block.updateValues(values);
                block.render();
                block.redraw();
            });
        } else {
            if (this.display) {
                this.hide();
            } else {
                this.show();
            }
        }
    };

    /**
     *  Format parameters for export
     */
    this.exportData = function(parameters)
    {
        return parameters;
    };
};

/**
 * Import some parameters
 */
function ParametersImport(data)
{
    return data;
};
