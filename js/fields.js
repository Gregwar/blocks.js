/**
 * Parameters managers
 */
function Fields(block)
{
    var self = this;

    // Block & meta
    this.block = block;
    this.meta = this.block.meta;

    // Is the form displayed ?
    this.display = false;

    // Div
    this.div = null;

    // Fields
    this.fields = [];
    for (k in this.meta.fields) {
        var field = new Field(this.meta.fields[k]);
        field.onUpdate = function() {
            self.block.cssParameters();
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
};

/**
 * Getting a field by name
 */
Fields.prototype.getField = function(name)
{
    name = name.toLowerCase();

    return (name in this.indexedFields ? this.indexedFields[name] : null);
};

/**
 * Show the settings window
 */
Fields.prototype.show = function()
{
    var self = this;
    var html = '<h3>'+this.block.meta.name+'#'+this.block.id+'</h3>';

    html += '<form class="form">';
    for (k in this.editables) {
        html += this.editables[k].getFieldHtml();
    }
    html += '<input type="submit" style="display:none" width="0" height="0" />';
    html += '</form>';
    
    html += '<button class="save" href="javascript:void(0);">Save</button>';
    html += '<button class="close" href="javascript:void(0);">Close</button>';

    this.div.html(html);

    this.div.find('.close').click(function() {
        $.fancybox.close();
    });

    var form = this.div.find('form');
    
    this.div.find('.save').click(function() {
        self.save(form.serializeForm());
        $.fancybox.close();
    });

    this.div.find('form').submit(function() {
        self.save($(this).serializeForm());
        $.fancybox.close();
        return false;
    });

    this.div.find('input').dblclick(function() {
        $(this).select();
    });

    $.fancybox.open(this.div, {wrapCSS: 'blocks_js_modal'});
    this.display = true;
};

/**
 * Show the fields
 */
Fields.prototype.getHtml = function()
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
Fields.prototype.hide = function()
{
    this.div.hide();
    this.display = false;
};

/**
 * Saves the form
 */
Fields.prototype.save = function(serialize)
{
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

    this.block.render();
    this.block.redraw();
};

/**
 * Show or hide the config
 */
Fields.prototype.toggle = function()
{
    if (this.meta.parametersEditor != undefined && typeof(this.meta.parametersEditor) == 'function') {
        this.meta.parametersEditor(this.block.values, function(values) {
            this.block.updateValues(values);
            this.block.render();
            this.block.redraw();
        });
    } else {
        if (this.display) {
            this.hide();
        } else {
            this.show();
        }
    }
};
