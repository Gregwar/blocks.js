/**
 * Parameters managers
 */
function ParametersManager(div, blockType, block)
{
    var self = this;

    // Is the form displayed ?
    this.display = false;

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

        div.html(html);

        div.find('.close').click(function() {
            div.hide();
            self.save();
        });

        div.find('form').unserializeForm(block.parameters);

        for (k in this.fields) {
            this.fields[k].setListeners(div);
        }

        div.show();
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
        div.hide();
        display = false;
    };

    /**
     * Saves the form
     */
    this.save = function()
    {
        block.parameters = div.find('form').serializeForm();
    };

    /**
     * Show or hide the config
     */
    this.toggle = function()
    {
        if (this.display) {
            this.hide();
        } else {
            this.show();
        }
    };
};
