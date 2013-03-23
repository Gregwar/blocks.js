/**
 * Parameters managers
 */
function ParametersManager(blockType, block)
{
    var self = this;

    // Is the form displayed ?
    this.display = false;

    // Div
    this.div = null;

    // Fields
    this.fields = [];
    for (k in blockType.parameters) {
        var parameter = blockType.parameters[k];
        var field = new ParameterField(parameter);
        this.fields.push(field);
    }

    // Parameters defaults
    this.getDefaults = function()
    {
        var defaults = {};

        for (k in this.fields) {
            var field = this.fields[k];
            field.appendDefault(defaults);
        }

        return defaults;
    };

    /**
     * Show the settings window
     */
    this.show = function()
    {
        html = '<h3>Parameters</h3>';

        html += '<form>';
        for (k in this.fields) {
            html += this.fields[k].getFieldHtml(false, block.parameters);
        }
        html += '</form>';
        
        html += '<a class="close" href="javascript:void(0);">Close</a>';

        this.div.html(html);

        this.div.find('.close').click(function() {
            self.div.hide();
            self.save();
        });

        this.div.find('form').unserializeForm(block.parameters);

        this.div.find('form').submit(function() {
            self.div.hide();
            self.save();
            return false;
        });

        for (k in this.fields) {
            this.fields[k].setListeners(this.div);
        }

        this.div.show();
        display = true;
    };

    /**
     * Show the fields
     */
    this.getHtml = function()
    {
        var html ='';

        for (k in this.fields) {
            html += this.fields[k].getHtml(block.parameters);
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
        block.parameters = this.div.find('form').serializeForm();
        block.render();
        block.redraw();
    };

    /**
     * Show or hide the config
     */
    this.toggle = function()
    {
        if (blockType.parametersEditor != undefined && typeof(blockType.parametersEditor) == 'function') {
            blockType.parametersEditor(block.parameters, function(parameters) {
                block.parameters = parameters;
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
	var exportData = {};

	for (key in parameters) {
	    var eKey = key;
	    if (key.substr(-2) == '[]') {
		eKey = key.substr(0, key.length-3);
		eKey = eKey.replace('[', '.');
	    }

	    exportData[eKey] = parameters[key];
	}

	return exportData;
    };
};

/**
 * Import some parameters
 */
function ParametersImport(data)
{
    var parameters = {};

    for (key in data) {
	var entry = data[key];
	if (key.indexOf('.') > 0) {
	    key = key.replace('.', '[');
	    key += '][]';
	}
	parameters[key] = entry;
    }

    return parameters;
};
