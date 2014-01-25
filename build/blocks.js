"use strict";

/**
 * Remove an item from an array
 */
function arrayRemove(array, index)
{
    index = parseInt(index);
    var last = array[array.length-1];
    array[array.length-1] = array[index];
    array[index] = last;
    array.pop();
};
"use strict";

/**
 * A metaField field
 */
var Field = function(metaField)
{
    var self = this;
    this.onUpdate = null;

    // Value
    this.value = null;

    if ('defaultValue' in metaField) {
        this.value = metaField.defaultValue;
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
    this.choices = 'choices' in metaField ? metaField.choices : null;

    // Is this field auto-extensible?
    this.extensible = 'extensible' in metaField && metaField.extensible;
    this.size = 1;
    
    // Is it an array ?
    this.isArray = (this.type.substr(-2) == '[]');

    if (this.isArray) {
        if (this.dimension == null) {
            this.dimension = this.name;
        }
        this.type = this.type.substr(0, this.type.length-2);
    }

    // Is variadic?
    this.variadic = !!this.dimension;

    // Default value
    this.defaultValue = 'defaultValue' in metaField ? metaField.defaultValue : null;
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
    var field = this.label+':<br/>';

    if (this.isArray) {
        field += '<div class="fieldsArray">';
        field += '<div class="pattern">';
        field += this.getSingleFieldHtml('');
        field += '</div>';
        field += '<div class="fields">';
        var value = this.getValue();
        for (var k in value) {
            field += '<div class="field">';
            field += this.getSingleFieldHtml(value[k]);
            field += '</div>';
        }
        field += '</div>';
        field += '</div>';
    } else {
        field += this.getSingleFieldHtml();
    }

    field += '<br/>';

    return field;
};

/**
 * Return the (field) name, which is the name suffixed with []
 * if it's an array
 */
Field.prototype.getFieldName = function()
{
    var name = this.name;

    if (this.isArray) {
        name += '[]';
    }

    return name;
};

/**
 * Gets the HTML code for a single field
 */
Field.prototype.getSingleFieldHtml = function(value)
{
    var field = '';

    if (value == undefined) {
        value = this.getPrintableValue();
    }

    if (this.type == 'longtext') {
        field += '<textarea name="'+this.getFieldName()+'"></textarea>';
    } else if (this.type == 'choice' || this.choices) {
        field += '<select name="'+this.getFieldName()+'">';
        for (var k in this.choices) {
            var choice = this.choices[k];
            var selected = (choice == value) ? 'selected' : '';
            field += '<option '+selected+' value="'+choice+'">'+choice+'</option>';
        }
        field += '</select>';
    } else {
        var type = this.type == 'bool' ? 'checkbox' : 'text';
        field += '<input value="'+value+'" type="'+type+'" name="'+this.getFieldName()+'" />'+this.unit;
    }

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
            value = value.join(', ');
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
        value = value.split(', ');
    }

    if (this.type == 'bool') {
        value = !!value;
    }

    this.value = value;
};

/**
 * Gets as variadic dimension
 */
Field.prototype.asDimension = function()
{
    if (this.extensible) {
        return this.size+1;
    } else if (this.isArray) {
        var value = this.getValue();

        if (value instanceof Array) {
            return this.getValue().length;
        } else {
            throw "Unable to get the dimension of field "+this.name;
        }
    } else {
        return parseInt(this.getValue());
    }
};

/**
 * Gets the variadic dimension
 */
Field.prototype.getDimension = function(fields)
{
    if (typeof(this.dimension) == 'number') {
        return this.dimension;
    }

    var field = fields.getField(this.dimension);
    if (!field) {
        throw 'Unable to find dimension field '+this.dimension;
    }

    return field.asDimension();
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
            card = [0, ioCard];
        } else {
            var tab = ioCard.split('-');
            if (tab.length == 1) {
                card = [0, tab[0]];
            } else {
                card = tab;
            }
        }
    }

    for (var idx in card) {
        if (card[idx] != '*') {
            card[idx] = parseInt(card[idx]);
        }
    }

    return card;
};
"use strict";

/**
 * Parameters managers
 */
var Fields = function(block)
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
    for (var k in this.meta.fields) {
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
    for (var k in this.fields) {
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
    for (var k in this.editables) {
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
        form.find('.pattern').remove();
        self.save(form.serializeForm());
        $.fancybox.close();
    });

    this.div.find('form').submit(function() {
        form.find('.pattern').remove();
        self.save($(this).serializeForm());
        $.fancybox.close();
        return false;
    });

    this.div.find('input').dblclick(function() {
        $(this).select();
    });

    this.handleArrays();

    $.fancybox.open(this.div, {wrapCSS: 'blocks_js_modal'});
    this.display = true;
};

/**
 * Handle Add & Remove buttons on fields array
 */
Fields.prototype.handleArrays = function()
{
    this.div.find('.fieldsArray').each(function() {
        var pattern = $(this).find('.pattern').html();
        var fields = $(this).find('.fields');

        var buttons = '<div class="buttons">';
        buttons += '<a class="add" href="#">Add</a> ';
        buttons += '<a class="remove" href="#">Remove</a>';
        buttons += '</div>';
        $(this).append(buttons);

        $(this).find('.add').click(function() {
            fields.append('<div class="field">'+pattern+'</div>');
        });

        $(this).find('.remove').click(function() {
            fields.find('.field').last().remove();
        });
    });
};

/**
 * Show the fields
 */
Fields.prototype.getHtml = function()
{
    var html = '';

    for (var k in this.editables) {
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

    for (var key in serialize) {
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
"use strict";

var Segment = function(x, y, dx, dy)
{
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
};

/**
 * Distance
 */
Segment.prototype.distance = function(point1, point2)
{
    return Math.sqrt(Math.pow(point2.x-point1.x,2) + Math.pow(point2.y-point1.y,2));
}

/**
 * Distance with a point
 */
Segment.prototype.distanceP = function(point)
{
    var normal = this.normal();
    normal.x = point.x;
    normal.y = point.y;
    var intersection = this.intersection(normal);

    return [intersection[0], this.distance(normal.alpha(intersection[1]), point)];
};

/**
 * Normal
 */
Segment.prototype.normal = function()
{
    return new Segment(this.x, this.y, this.dy, -this.dx);
};

/**
 * Gets the intersection alpha with another 
 */
Segment.prototype.intersection = function(other)
{
    var a = this.dx;
    var b = -other.dx;
    var c = this.dy;
    var d = -other.dy;
    var b0 = other.x-this.x;
    var b1 = other.y-this.y;
    var det = a*d - b*c;

    if (det == 0) {
        return null;
    }

    var r1 = (d*b0 - b*b1)/det;
    var r2 = (-c*b0 + a*b1)/det;

    return [r1, r2];
};

/**
 * Gets the alpha point
 */
Segment.prototype.alpha = function(a)
{
    var point = {};
    point.x = this.x+this.dx*a;
    point.y = this.y+this.dy*a;

    return point;
};
"use strict";

/**
 * Manage the types compatibility
 */
var Types = function()
{
    this.compatibles = {};
};

/**
 * Normalize types
 */
Types.normalize = function(type)
{
    type = type.toLowerCase();

    if (type == 'check' || type == 'bool' || type == 'checkbox') {
        type = 'bool';
    }

    if (type == 'integer') {
        type = 'int';
    }

    if (type == 'float' || type == 'double') {
        type = 'number';
    }

    if (type == 'text') {
        type = 'string';
    }

    if (type == 'select' || type == 'choices' || type == 'combobox') {
        type = 'choice';
    }

    if (type == 'textarea') {
        type = 'longtext';
    }

    return type;
}

/**
 * Checks if a type is compatible with another
 */
Types.prototype.isCompatible = function(typeA, typeB)
{
    typeA = Types.normalize(typeA);
    typeB = Types.normalize(typeB);

    if (typeA == typeB) {
        return true;
    }

    if (typeA in this.compatibles) {
        for (var k in this.compatibles[typeA]) {
            if (typeB == this.compatibles[typeA][k]) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Get all the compatible types
 */
Types.prototype.getCompatibles = function(type)
{
    type = Types.normalize(type);
    var compatibles = [type];

    if (type in this.compatibles) {
        for (var k in this.compatibles[type]) {
            compatibles.push(this.compatibles[type][k]);
        }
    }

    return compatibles;
};

/**
 * Add compatibility (one way)
 */
Types.prototype.addCompatibilityOneWay = function(typeA, typeB)
{
    typeA = Types.normalize(typeA);
    typeB = Types.normalize(typeB);

    if (!(typeA in this.compatibles)) {
        this.compatibles[typeA] = [];
    }

    this.compatibles[typeA].push(typeB);
};

/**
 * Add a types compatibility
 */
Types.prototype.addCompatibility = function(typeA, typeB)
{
    typeA = Types.normalize(typeA);
    typeB = Types.normalize(typeB);

    this.addCompatibilityOneWay(typeA, typeB);
    this.addCompatibilityOneWay(typeB, typeA);
};
"use strict";

/**
 * A connector
 */
var Connector = function(name, type, index)
{
    this.name = name;
    this.type = type;
    this.index = (index == null) ? null : parseInt(index);
};

/**
 * Gets the connector identifier
 */
Connector.prototype.id = function()
{
    var id = this.name + '_' + this.type;

    if (this.index != null) {
        id += '_' + this.index;
    }

    return id;
};

/**
 * Is this connector an input?
 */
Connector.prototype.isInput = function()
{
    return this.type == 'input';
};

/**
 * Is this connector an output?
 */
Connector.prototype.isOutput = function()
{
    return this.type == 'output';
};

/**
 * Is this connector the same as another?
 */
Connector.prototype.same = function(other)
{
    return (this.name == other.name && 
            this.index == other.index && this.type == other.type);
};

/**
 * Export the connector
 */
Connector.prototype.export = function()
{
    var data = [this.name, this.type];

    if (this.index !== null) {
        data.push(this.index);
    }

    return data;
}

/**
 * Import a connector
 */
function ConnectorImport(data)
{
    if (!(data instanceof Array) || data.length<2 || data.length>3) {
        throw 'Unable to import a connector';
    }

    if (data.length == 2) {
        data.push(null);
    }

    return new Connector(data[0], data[1], data[2]);
}

/**
 * Creates a connector from its id
 */
function IdToConnector(connectorId)
{
    var parts = connectorId.split('_');

    var name = parts[0];
    var type = parts[1];
    var index = null;
    if (parts.length == 3) {
        index = parts[2];
    }

    return new Connector(name, type, index);
}
"use strict";

/**
 * An edge linking two blocks
 */
var Edge = function(id, block1, connector1, block2, connector2, blocks)
{
    this.blocks = blocks;
    this.label = null;
    this.id = parseInt(id);
    this.block1 = block1;
    this.connector1 = connector1;
    this.block2 = block2;
    this.connector2 = connector2;
    this.selected = false;

    this.defaultSize = 3;
    this.defaultFontSize = 10;

    this.position1 = null;
    this.position2 = null;
    this.segment = null;

    if (!block1.hasConnector(connector1) || !block2.hasConnector(connector2)) {
        throw "Can't create edge because a connector don't exist";
    }
};

/**
 * Should this edge be ignored in loop analysis ?
 */
Edge.prototype.isLoopable = function()
{
    return (this.block1.isLoopable() || this.block2.isLoopable());
}

/**
 * Returns an array with the blocks ordered
 */
Edge.prototype.fromTo = function()
{
    return [this.block1, this.block2];
};

/**
 * Sets the label of the edge
 */
Edge.prototype.setLabel = function(label)
{
    this.label = label;
};

/**
 * Draws the edge
 */
Edge.prototype.draw = function(svg)
{
    this.position1 = this.block1.linkPositionFor(this.connector1);
    this.position2 = this.block2.linkPositionFor(this.connector2);
    
    this.segment = new Segment(
        this.position1.x, this.position1.y, 
        this.position2.x-this.position1.x, this.position2.y-this.position1.y
    );

    var lineWidth = this.defaultSize*this.blocks.scale;

    if (this.selected) {
        var strokeStyle = 'rgba(0, 200, 0, 1)';
    } else {
        var strokeStyle = 'rgba(255, 200, 0, 1)';
    }
    svg.line(this.position1.x, this.position1.y, this.position2.x, this.position2.y, {
        stroke: strokeStyle, strokeWidth: lineWidth
    });
    
    var xM = ((this.position1.x+this.position2.x)/2.0);
    var yM = ((this.position1.y+this.position2.y)/2.0);
    var norm = Math.sqrt(Math.pow(this.position1.x-this.position2.x,2)+Math.pow(this.position1.y-this.position2.y,2));
    var alpha = 30;
    alpha = (alpha*Math.PI/180.0);
    var cos = Math.cos(alpha);
    var sin = Math.sin(alpha);
    var cosB = Math.cos(-alpha);
    var sinB = Math.sin(-alpha);

    // Drawing the arrow
    if (this.blocks.getOption('orientation', true)) {
        var xA = (this.position1.x-xM)*this.blocks.scale*10/(norm/2);
        var yA = (this.position1.y-yM)*this.blocks.scale*10/(norm/2);
        var lineWidth = this.defaultSize*this.blocks.scale/3.0;
        svg.line(xM, yM, xM+(xA*cos-yA*sin), yM+(yA*cos+xA*sin), {
            stroke: strokeStyle, strokeWidth: lineWidth
        });
        svg.line(xM, yM, xM+(xA*cosB-yA*sinB), yM+(yA*cosB+xA*sinB), {
            stroke: strokeStyle, strokeWidth: lineWidth
        });
    }

    if (this.label != null) {
        var fontSize = Math.round(this.defaultFontSize*this.blocks.scale);

        svg.text(xM-2*fontSize, yM+fontSize/3, this.label, {
            fontSize: fontSize+'px',
            fill: '#3a3b01',
            stroke: '#fff',
            strokeWidth: 2
        });
        svg.text(xM-2*fontSize, yM+fontSize/3, this.label, {
            fontSize: fontSize+'px',
            fill: '#3a3b01',
        });
    }
    };

/**
 * Does the position collide the line ?
 */
Edge.prototype.collide = function(x, y)
{
    var dp = this.segment.distanceP({x: x, y: y});

    if (dp[0] >= 0 && dp[0] <= 1) {
        if (dp[1] < (this.defaultSize*blocks.scale)*2) {
            return dp[0];
        }
    }

    return false;
};

/**
 * Initializes the edge and do some tests
 */ 
Edge.prototype.create = function()
{
    // You can't link a block to itself
    if (this.block1 == this.block2) {
        throw 'You can\'t link a block to itself';
    }

    // You have to link an input with an output
    if (!this.blocks.getOption('canLinkInputs', false) && this.connector1.type == this.connector2.type) {
        throw 'You have to link an input with an output';
    }

    // The cards have to be okay
    if ((!this.block1.canLink(this.connector1)) || (!this.block2.canLink(this.connector2))) {
        throw 'Can\'t create such an edge because of the cardinalities';
    }

    this.block1.addEdge(this.connector1, this);
    this.block2.addEdge(this.connector2, this);
    this.block1.render();
    this.block2.render();
};

/**
 * Get the types of the blocks
 */
Edge.prototype.getTypes = function()
{
    return [this.block1.getField(this.connector1.name).type,
            this.block2.getField(this.connector2.name).type];
};

/**
 * Erase an edge
 */
Edge.prototype.erase = function()
{
    this.block1.eraseEdge(this.connector1, this);
    this.block2.eraseEdge(this.connector2, this);
    this.block1.render();
    this.block2.render();
};

/**
 * Test if this edge is the same than another
 */
Edge.prototype.same = function(other)
{
    if (this.block1 == other.block1 && this.block2 == other.block2 
            && this.connector1.same(other.connector1)
            && this.connector2.same(other.connector2)) {
        return true;
    }
    
    if (this.block1 == other.block1 && this.block2 == other.block2 
            && this.connector1.same(other.connector2)
            && this.connector2.same(other.connector1)) {
        return true;
    }

    return false;
};

/**
 * Exports the edge to JSON
 */
Edge.prototype.export = function()
{
    return {
        id: this.id,
        block1: this.block1.id,
        connector1: this.connector1.export(),
        block2: this.block2.id,
        connector2: this.connector2.export()
    };
};

/**
 * Imports JSON data into an edge
 */
function EdgeImport(blocks, data)
{
    if (!'id' in data) {
        throw "An edge does not have id";
    }

    var block1 = blocks.getBlockById(data.block1);
    var block2 = blocks.getBlockById(data.block2);

    if (!block1 || !block2) {
	throw "Error while importing an edge, a block did not exists";
    }

    return new Edge(data.id, block1, ConnectorImport(data.connector1), 
                             block2, ConnectorImport(data.connector2), blocks);
};
"use strict";

/**
 * Draw messages on the screen
 */
var BlocksMessages = function(messages, width)
{
    var self = this;

    // Timer to hide
    this.hideTimer = null;

    // Messages
    this.messages = messages;

    // Width
    this.width = width;

    messages.click(function() {
	self.hide();
    });
};

/**
 * Show a message
 */
BlocksMessages.prototype.show = function(text, options)
{
    var self = this;

    if (this.hideTimer != null) {
        clearTimeout(this.hideTimer);
    }

    var classes = 'message';

    if (options['class'] != undefined) {
        classes += ' '+options['class'];
    }

    var html = '<div class="'+classes+'">'+text+'</div>';

    this.messages.html(html);
    this.messages.fadeIn();
    this.messages.css('margin-left', Math.round((this.width-350)/2.0)+'px');
    this.messages.css('margin-top', '20px');

    this.hideTimer = setTimeout(function() { self.hide(); }, 5000);
};

/**
 * Hide the message
 */
BlocksMessages.prototype.hide = function()
{
    this.messages.fadeOut();
    this.hideTimer = null;
};
"use strict";

/**
 * Handles the menu for creating blocks
 */
var BlocksMenu = function(blocks)
{
    var self = this;

    // Is the menu visible ?
    this.visible = false;

    // Position on the scene
    this.position = {};

    // Blocks
    this.blocks = blocks;

    // Menu div
    this.menu = blocks.div.find('.contextmenu');

    // Menu items
    this.actions = [
	{
	    label: 'Compact',
	    action: function(blocks) {
		blocks.toggleCompact();
	    },
            icon: 'compact'
	},
	{
	    label: 'Scale',
	    action: function(blocks) {
		blocks.perfectScale();
	    },
            icon: 'scale'
	}
    ];

    /**
     * Initialisation
     */
    blocks.div.bind('contextmenu', function() {
        if (self.visible) {
            self.hide();
        } else {
            self.position = blocks.getPosition();

            // Sorting types by family
            var families = {};
            for (var k in blocks.metas) {
                var meta = blocks.metas[k];

                if (meta.family in families) {
                    families[meta.family].push(meta);
                } else {
                    families[meta.family] = [meta];
                }
            }

            var html = '';

	    for (var action in self.actions) {
                var icon = 'none';
                if ('icon' in self.actions[action]) {
                    icon = self.actions[action].icon;
                }
		html += '<div rel="'+action+'" class="menuentry menu_action_'+action+'"><div class="menu_icon menu_icon_'+icon+'"></div>'+self.actions[action].label+'</div>';
	    }

            for (var family in families) {
                if (family) {
                    var className = family.replace(/[^a-zA-Z]/g,'');
                    html += '<div class="family">';
                    html += '<div class="familyName family_'+family+'"><div class="menu_icon menu_icon_family_'+className+'"></div>'+family+' <span>&raquo;</span></div>';
                    html += '<div class="childs">';
                }
                for (var k in families[family]) {
                    var type = families[family][k];
                    html += '<div class="type type_'+type.name+'" rel="'+type.name+'">'+type.name+'</div>';
                }
                if (family) {
                    html += '</div>';
                    html += '</div>';
                }
            }

            self.menu.find('.types').html(html);
            self.show();

            self.menu.find('.type').click(function() {
                blocks.addBlock($(this).attr('rel'), self.position.x, self.position.y);
                self.hide();
            });

            self.menu.find('.family').each(function() {
                var family = $(this);
                $(this).find('.familyName').hover(function() {
                    self.menu.find('.childs').hide();
                    family.find('.childs').show();
                });
            });

	    for (var k in self.actions) {
		self.menu.find('.menu_action_'+k).click(function() {
		    var action = self.actions[$(this).attr('rel')];
		    action.action(blocks);
		    self.hide();
		});
	    }

            $(this).find('.types > .type').hover(function() {
                self.menu.find('.childs').hide();
            });
        }
        
        return false;
    });
}

/**
 * Adds an action
 */
BlocksMenu.prototype.addAction = function(name, action, icon)
{
    this.actions.push({label: name, action: action, icon: icon});
};

/**
 * Hide the menu
 */
BlocksMenu.prototype.hide = function()
{
    this.menu.hide();
    this.visible = false;
};

/**
 * Show the menu
 */
BlocksMenu.prototype.show = function()
{
    this.menu.css('margin-left', (5+this.blocks.mouseX)+'px');
    this.menu.css('margin-top', (5+this.blocks.mouseY)+'px');
    this.menu.show();
    this.visible = true;
};

"use strict";

/**
 * Manage one block meta
 */
var Meta = function(meta)
{
    var self = this;

    this.name = meta.name;
    this.loopable = ('loopable' in meta && meta['loopable']);
    this.size = ('size' in meta ? meta.size : 'normal');
    this.fields = [];

    // Importing fields meta data
    if ('fields' in meta) {
        for (var k in meta.fields) {
            var field = meta.fields[k];
            var attributes = ('attrs' in field ? field.attrs.split(' ') : []);
            field.attrs = {};
            for (var i in attributes) {
                field.attrs[attributes[i]] = true;
            }
            this.fields.push(field);
        }
    }

    // Checking for parameters editor
    for (var k in meta.parametersEditor) {
        var key = keys[k];
        if (meta[key] != undefined) {
            this[key] = meta[key];
        } else {
            this[key] = [];
        }
    }

    // Adding module
    if ('module' in meta) {
        this.module = meta.module;
    } else {
        this.module = null;
    }

    // Checking the family
    if (meta.family == undefined) {
        this.family = ''; // Root family
    } else {
        this.family = meta.family;
    }

    // Style
    if (meta['class'] != undefined) {
        this['class'] = meta['class'];
    } else {
        this['class'] = '';
    }

    // Description
    this.description = null;
    if (meta.description != undefined) {
        this.description = meta.description;
    }
}

"use strict";

/**
 * Handles the history
 */
var History = function(blocks)
{
    var self = this;
    this.historySize = 30;

    this.blocks = blocks;
    this.history = [];
    this.historyPos = 0;
    this.ctrlDown = false;
    
    $(document).keydown(function(evt) {
        if (evt.keyCode == 17) {
            self.ctrlDown = true;
        } 

        // Ctrl+Z
        if (evt.keyCode == 90 && self.ctrlDown) {
            self.restoreLast();
        }
    });

    $(document).keyup(function(evt) {
        if (evt.keyCode == 17) {
            self.ctrlDown = false;
        }
    });
};

/**
 * Save the current situation to the history
 */
History.prototype.save = function()
{
    this.history.push(this.blocks.export());

    if (this.history.length > this.historySize) {
        this.history.shift();
    }
};

/**
 * Restores the last saved situation
 */
History.prototype.restoreLast = function()
{
    if (this.history.length) {
        var last = this.history.pop();
        this.blocks.importData(last);
    } else {
        alert('Nothing to get');
    }
};
"use strict";

/**
 * Creates an instance of a block
 */
var Block = function(blocks, meta, id)
{
    this.blocks = blocks;
    this.meta = meta;

    // Appareance values
    this.defaultFont = 10;

    // Custom description
    this.description = null;
    
    // Width
    if (this.meta.size == 'normal') {
        this.width = 150;
    } else if (this.meta.size == 'small') {
        this.width = 100;
    } else {
        this.width = this.meta.size;
    }

    // History saved before move
    this.historySaved = false;

    // Id
    this.id = id;

    // Do I have focus ?
    this.hasFocus = false;

    // Division (object)
    this.div = null;

    // Is the user dragging ?
    this.drag = null;

    // Last scale
    this.lastScale = null;

    // Parameters
    this.fields = new Fields(this);

    // Position
    this.x = 0;
    this.y = 0;

    // I/Os cardinality
    this.ios = {};

    // Which IO has focus ?
    this.focusedConnector = null;

    // Edges
    this.edges = {};

    // Connectors
    this.connectors = [];
};

// Can this block be used to break a loop ?
Block.prototype.isLoopable = function()
{
    return this.meta.loopable;
};

/**
 * Sets the block description to something custom
 */
Block.prototype.setDescription = function(description)
{
    this.description = description;
    this.div.find('.description').html(description);
};

/**
 * Update the block values
 */
Block.prototype.updateValues = function()
{
    this.blocks.history.save();
};

/**
 * Set the values
 */
Block.prototype.setValues = function(values)
{
    for (var field in values) {
        this.fields.getField(field).setValue(values[field]);
    }
};

/**
 * Getting the values
 */
Block.prototype.getValues = function(values)
{
    var values = {};
    for (var k in this.fields.editables) {
        var field = this.fields.editables[k];
        values[field.name] = field.getValue();
    }

    return values;
};

/**
 * Getting a field value
 */
Block.prototype.getValue = function(name)
{
    var field = this.fields.getField(name);

    if (field) {
        return field.getValue();
    } else {
        return null;
    }
};

/**
 * Html entities on a string
 */
Block.prototype.htmlentities = function(str)
{
    str = str.replace(/</, '&lt;');
    str = str.replace(/>/, '&gt;');
    return str;
}

/**
 * Set the infos of the block
 */
Block.prototype.setInfos = function(html)
{
    this.div.find('.infos').html(html);
};

/**
 * Returns the render of the block
 */
Block.prototype.getHtml = function()
{
    var self = this;
    this.connectors = [];

    // Getting the title
    var title = this.meta.name + '<span class="blockId">#' + this.id + '</span>';
    for (var k in this.fields.fields) {
        var field = this.fields.fields[k];
        if (field.asTitle) {
            title = field.getPrintableValue();
        }
    }

    var html = '<div class="parameters"></div>';
    html += '<div class="blockTitle"><span class="titleText">'+title+'</span><div class="blockicon delete"></div>';
    html += '<div class="blockicon info"></div>';

    if (this.description) {
        html += '<div class="description">' + self.description + '</div>';
    } else {
        if (this.meta.description) {
            html += '<div class="description">' + this.meta.description + '</div>';
        } else {
            html += '<div class="description">No description</div>';
        }
    }
    html += '<div class="blockicon settings"></div></div>';
    html += '<div class="infos"></div>';
    
    for (var k in self.fields.editables) {
        var field = self.fields.editables[k];
        var fieldHtml = field.getHtml();
        if (html && (!field.hide) && (!field.asTitle) && (!this.blocks.compactMode)) {
            html += '<div class="parameter">'+fieldHtml+'</div>';
        }
    }

    // Handling inputs & outputs
    var handle = function(key, fields) {
        html += '<div class="' + key + 's '+(self.isLoopable() ? 'loopable' : '')+'">';

        for (var k in fields) {
            var field = fields[k];

            if (field.extensible) {
                field.size = self.maxEntry(field.name);
            }

            var size = 1;
            if (field.variadic) {
                size = field.getDimension(self.fields);
            }

            for (var x=0; x<size; x++) {
                var connectorId = field.name.toLowerCase() + '_' + key;
                var label = field.getLabel().replace('#', x+1);

                var value = '';
                if (field.dynamicLabel != null) {
                    label = String(field.dynamicLabel(self, x));
                } else {
                    if (field && field.is('editable')) {
                        value = ' ('+field.getPrintableValueWithUnit(field.variadic ? x : undefined)+')';
                    }
                }

                if (field.variadic) {
                    connectorId += '_' + x;
                }

                // Generating HTML
                html += '<div class="'+key+' type_'+field.type+' connector '+connectorId+'" rel="'+connectorId+ '"><div class="circle"></div>' + self.htmlentities(label) + value + '</div>';
                self.connectors.push(connectorId);
            }
        }
            html += '</div>';
    };

    handle('input', this.fields.inputs);
    handle('output', this.fields.outputs);

    return html;
};

/**
 * Render the block
 */
Block.prototype.render = function()
{
    this.lastScale = null;
    this.hasFocus = false;
    this.div.html(this.getHtml());
    this.initListeners();
    this.redraw();
};

/**
 * Returns the maximum index of entry for input field name
 */
Block.prototype.maxEntry = function(name)
{
    var max = 0;

    for (var connectorId in this.edges) {
        if (this.edges[connectorId].length) {
            var connector = IdToConnector(connectorId);
            if (connector.name == name) {
                max = Math.max(parseInt(connector.index)+1, max);
            }
        }
    }

    return max;
};

/**
 * Creates and inject the div
 */
Block.prototype.create = function(div)
{
    var html = '<div id="block' + this.id + '" class="block ' + this.meta['class'] + '"></div>'

    div.append(html);
    this.div = div.find('#block' + this.id);

    this.render();
};

/**
 * Sets the position and the scale of the block
 */
Block.prototype.redraw = function(selected)
{
    // Setting the position
    this.div.css('margin-left', this.blocks.center.x+this.x*this.blocks.scale+'px');
    this.div.css('margin-top', this.blocks.center.y+this.y*this.blocks.scale+'px');

    // Showing/hiding icons
    if (this.blocks.showIcons && this.blocks.scale > 0.8) {
        this.div.find('.blockicon').show();
    } else {
        this.div.find('.blockicon').hide();
    }

    // Rescaling
    if (this.lastScale != this.blocks.scale) {
        this.div.css('font-size', Math.round(this.blocks.scale*this.defaultFont)+'px');
        this.div.css('width', Math.round(this.blocks.scale*this.width)+'px');
    
        var size = Math.round(12*this.blocks.scale);
        this.div.find('.circle').css('width', size+'px');
        this.div.find('.circle').css('height', size+'px');
        this.div.find('.circle').css('background-size', size+'px '+size+'px');

        this.div.find('.inputs, .outputs').width(this.div.width()/2-10);

        this.cssParameters();
        this.lastScale = this.blocks.scale
    }

    // Changing the circle rendering
    for (var k in this.connectors) {
        var connectorId = this.connectors[k];
        var connectorDiv = this.div.find('.' + connectorId);
        var connectorVisual = connectorDiv.find('.circle');

        connectorVisual.removeClass('io_active');
        connectorVisual.removeClass('io_selected');
        if (connectorId in this.edges && this.edges[connectorId].length) {
            connectorVisual.addClass('io_active');

            for (var n in this.edges[connectorId]) {
                if (this.edges[connectorId][n].selected) {
                    connectorVisual.addClass('io_selected');
                }
            }
        }
    }

    // Updating the fields manager div
    this.fields.div = this.div.find('.parameters');

    // Is selected ?
    this.div.removeClass('block_selected');
    if (selected) {
        this.div.addClass('block_selected');
    }
};

/**
 * Sets the css for the inputs
 */
Block.prototype.cssParameters = function()
{
    this.div.find('input').css('font-size', Math.round(this.blocks.scale*this.defaultFont)+'px');
};

/**
 * Init the function listeners
 */
Block.prototype.initListeners = function()
{
    var self = this;
    // Drag & drop the block
    self.div.find('.blockTitle').mousedown(function(event) {
        if (event.which == 1) {
            self.historySaved = false;
            self.drag = [self.blocks.mouseX/self.blocks.scale-self.x, self.blocks.mouseY/self.blocks.scale-self.y];
        }
    });

    // Handle focus
    self.div.hover(function() {
        self.hasFocus = true;
    }, function() {
        self.hasFocus = false;
    });

    // Handle focus on the I/Os
    self.div.find('.connector').hover(function() {
        self.focusedConnector = $(this).attr('rel');
    }, function() {
        self.focusedConnector = null;
    });
        
    // Dragging
    $('html').mousemove(function(evt) {
        if (self.drag) {
            if (!self.historySaved) {
                self.blocks.history.save();
                self.historySaved = true;
            }
            self.x = (self.blocks.mouseX/self.blocks.scale-self.drag[0]);
            self.y = (self.blocks.mouseY/self.blocks.scale-self.drag[1]);
            self.blocks.redraw();
        }
    });

    // Drag the block
    $('html').mouseup(function() {
        self.drag = null;
    });

    // Draw a link
    self.div.find('.connector').mousedown(function(event) {
        if (event.which == 1) {
            self.blocks.beginLink(self, $(this).attr('rel'));
            event.preventDefault();
        }
    });

    // Handle the parameters
    self.div.find('.settings').click(function() {
        self.fields.toggle();
        self.cssParameters();
    });

    // Handle the deletion
    self.div.find('.delete').click(function() {
        self.blocks.removeBlock(self.blocks.getBlockId(self));
    });

    // Show the description
    self.div.find('.info').hover(function() {
        self.div.find('.description').show();
    }, function() {
        self.div.find('.description').hide();
    });
};

/**
 * Gets the link position for an input or output
 */
Block.prototype.linkPositionFor = function(connector)
{
    var connectorId = connector;

    if (connector instanceof Object) {
        connectorId = connector.id();
    }

    try {
        var div = this.div.find('.' + connectorId + ' .circle')

        var x = (div.offset().left-this.blocks.div.offset().left)+div.width()/2;
        var y = (div.offset().top-this.blocks.div.offset().top)+div.height()/2;
    } catch (error) {
        throw 'Unable to find link position for '+connectorId+' ('+error+')';
    }

    return {x: x, y: y};
};

/**
 * Can the io be linked ?
 */
Block.prototype.canLink = function(connector)
{
    var tab = [];
    var connectorId = connector.id();

    if (connectorId in this.edges) {
        tab = this.edges[connectorId];
    }

    var card = this.fields.getField(connector.name).card;

    if (card[1] == '*') {
        return true;
    }

    return (tab.length < card[1]);
};

/**
 * Add an edge
 */
Block.prototype.addEdge = function(connector, edge)
{
    var tab = [];
    var connectorId = connector.id();

    if (this.edges[connectorId] != undefined) {
        tab = this.edges[connectorId];
    }

    tab.push(edge);
    this.edges[connectorId] = tab;
};

/**
 * Erase an edge
 */
Block.prototype.eraseEdge = function(connector, edge)
{
    var connectorId = connector.id();

    if (this.edges[connectorId] != undefined) {
        for (var k in this.edges[connectorId]) {
            if (this.edges[connectorId][k] == edge) {
                arrayRemove(this.edges[connectorId], k);
                break;
            }
        }
    }
};

/**
 * Erase the block
 */
Block.prototype.erase = function()
{
    this.div.remove();
};

/**
 * Find all successors of a block, and their successors
 */
Block.prototype.allSuccessors = function()
{
    // Blocks already explored
    var explored = {};
    var exploreList = [this];
    var ids = [this.id];
    explored[this.id] = true;

    while (exploreList.length > 0) {
        var currentBlock = exploreList.pop();

        for (var key in currentBlock.edges) {
            for (var i in currentBlock.edges[key]) {
                var edge = currentBlock.edges[key][i];
                if (edge.isLoopable()) {
                    continue;
                }
                var fromTo = edge.fromTo();

                if (fromTo[0] == currentBlock) {
                    var target = fromTo[1];
                    
                    if (!(target.id in explored)) {
                        explored[target.id] = true;
                        exploreList.push(target);
                        ids.push(target.id);
                    }
                }
            }
        }
    }

    return ids;
};

/**
 * Exports the block to JSON
 */
Block.prototype.export = function()
{
    return {
        id: this.id,
        x: this.x,
        y: this.y,
        type: this.meta.name,
        module: this.meta.module,
        values: this.getValues()
    };
};

/**
 * Gets the field
 */
Block.prototype.getField = function(name)
{
    return this.fields.getField(name);
};

/**
 * Does the block has the given connector ?
 */
Block.prototype.hasConnector = function(connector)
{
    var field = this.getField(connector.name);

    if (!field) {
        return false;
    }

    if (field.variadic) {
        return (connector.index != null) && 
            (field.getDimension(this.fields) >= connector.index);
    } else {
        return (connector.index == null);
    }
};

/**
 * Imports a block from its data
 */
function BlockImport(blocks, data)
{
    for (var t in blocks.metas) {
	var meta = blocks.metas[t];
        var module = ('module' in data) ? data.module : null;
	if (meta.name == data.type && meta.module == module) {
	    var block = new Block(blocks, meta, data.id);
	    block.x = data.x;
	    block.y = data.y;
            block.setValues(data.values);
	    return block;
	}
    }

    throw 'Unable to create a block of type ' + data.type;
}
"use strict";

/**
 * Manage the blocks
 *
 * Options can contains :
 * - canLinkInputs (default false): can inputs be linked together?
 * - orientatiion (default true): is the graph oriented?
 */
var Blocks = function(options)
{
    if (typeof options != 'undefined') {
        this.options = options;
    } else {
        this.options = {};
    }

    // Types checker
    this.types = new Types;

    // View center & scale
    this.center = {};
    this.scale = 1.0;
    this.redrawTimeout = null;

    // History manager
    this.history = null;

    // Is the user dragging the view ?
    this.moving = null;

    // Is the system ready ?
    this.isReady = false;

    // Compact mode
    this.compactMode = false;

    // Context menu
    this.menu = null;

    // Mouse
    this.mouseX = 0;
    this.mouseY = 0;

    // Linking ?
    this.linking = null;

    // Selected items
    this.selectedLink = null;
    this.selectedSide = null;
    this.selectedBlock = null;

    // BLocks division
    this.div = null;

    // Context for drawingc
    this.context = null;

    // Blocks types
    this.metas = [];

    // Instances
    this.blocks = [];

    // Edges
    this.edges = [];

    /**
     * Next block id
     */
    this.id = 1;

    /**
     * Next edge id
     */
    this.edgeId = 1;

    /**
     * Clears blocks
     */
    this.clear = function()
    {
        this.edges = [];
        this.blocks = [];
        this.id = 1;
        this.edgeId = 1;
        this.div.find('.blocks').html('');
        this.redraw();
    }

    /**
     * Gets an option value
     */
    this.getOption = function(key, defaultValue)
    {
        if (key in this.options) {
            return this.options[key];
        } else {
            return defaultValue;
        }
    }

    /**
     * Show/hide icons
     */
    this.showIcons = true;    
};

/**
 * Runs the blocks editor
 */
Blocks.prototype.run = function(selector)
{
    var self = this;

    $(document).ready(function() {
        self.div = $(selector);

        if (!self.div.size()) {
            alert('blocks.js: Unable to find ' + selector);
        }

        // Inject the initial editor
        self.div.html(
              '<div class="blocks_js_editor">'
            + '<div class="messages"></div>'
            + '<div class="contextmenu"><div class="types"></div></div>'
            + '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>'
            + '<div class="blocks"></div>'
            + '</div>'
        );

        self.div.find('svg').css('width', '100%');
        self.div.find('svg').css('height', '100%');

        self.context = self.div.find('svg');

        // Setting up default viewer center
        self.center.x = self.div.width()/2;
        self.center.y = self.div.height()/2;

        // Run the menu
        self.menu = new BlocksMenu(self);

        // Create the message handler
        self.messages = new BlocksMessages(self.div.find('.messages'), self.div.width());

        // Listen for mouse position
        self.div[0].addEventListener('mousemove', function(evt) {
            self.mouseX = evt.pageX - self.div.offset().left;
            self.mouseY = evt.pageY - self.div.offset().top;
            self.move(evt);
        });

        $('html').mouseup(function(event) {
            if (event.which == 1) {
                self.release();
            }
        });

        // Detect clicks on the canvas
        self.div.mousedown(function(event) {
            if (self.canvasClicked()) {
                event.preventDefault();
            } 
            
            if (event.which == 2 || (!self.selectedLink && !self.selectedBlock && event.which == 1)) {
                self.moving = [self.mouseX, self.mouseY];
            }
        });
        
        self.div.mouseup(function(event) {
            if (event.which == 2 || event.which == 1) {
                self.moving = null;
            }
           
            if (event.which == 1) {
                self.menu.hide();
            }
        });
        
        // Initializing canvas
        self.context.svg();

        // Detecting key press
        $(document).keydown(function(e){
            if ($('input').is(':focus')) {
                return;
            }   

            // "del" will delete a selected link
            if (e.keyCode == 46) {
                self.deleteEvent();
            }
        });

        // Binding the mouse wheel
        self.div.bind('mousewheel', function(event, delta, deltaX, deltaY) {
            var dX = self.mouseX - self.center.x;
            var dY = self.mouseY - self.center.y;
            var deltaScale = Math.pow(1.1, deltaY);
            self.center.x -= dX*(deltaScale-1);
            self.center.y -= dY*(deltaScale-1);
            self.scale *= deltaScale;
            self.redraw();
            event.preventDefault();
        });

        self.history = new History(self);

        if (!self.isReady) {
            self.postReady();
        }
    });
};

/**
 * Tell the system is ready
 */
Blocks.prototype.postReady = function()
{
    this.isReady = true;
    if (this.readyQueue != undefined) {
        for (var k in this.readyQueue) {
            this.readyQueue[k]();
        }
    }
};

/**
 * Callback when ready
 */
Blocks.prototype.ready = function(callback) 
{
    if (this.isReady) {
        callback();
    } else {
        var queue = [];
        if (this.readyQueue != undefined) {
            queue = this.readyQueue;
        }
        queue.push(callback);
        this.readyQueue = queue;
    }
};

/**
 * Gets the mouse position
 */
Blocks.prototype.getPosition = function()
{
    var position = {};
    position.x = (this.mouseX-this.center.x)/this.scale;
    position.y = (this.mouseY-this.center.y)/this.scale;

    return position;
};

/**
 * Adds a block
 */
Blocks.prototype.addBlock = function(name, x, y)
{
    for (var k in this.metas) {
        var type = this.metas[k];

        if (type.name == name) {
            var block = new Block(this, this.metas[k], this.id);
            block.x = x;
            block.y = y;
            block.create(this.div.find('.blocks'));
            this.history.save();
            this.blocks.push(block);
            this.id++;
        }
    }
};

/**
 * Registers a new block type
 */
Blocks.prototype.register = function(meta)
{
    this.metas.push(new Meta(meta));
};

/**
 * Begin to draw an edge
 */
Blocks.prototype.beginLink = function(block, connectorId)
{
    this.linking = [block, connectorId];
    this.highlightTargets();
};

/**
 * Highlight possible targets for a connector ID
 */
Blocks.prototype.highlightTargets = function()
{
    var block = this.linking[0];
    var connector = IdToConnector(this.linking[1]);
    var type = block.getField(connector.name).type;
    $('.connector').addClass('disabled');

    var compatibles = this.types.getCompatibles(type);
    for (var k in compatibles) {
        var compatible = compatibles[k];
        $('.connector.type_'+compatible).removeClass('disabled');
    }
};

/**
 * The mouse has moved
 */
Blocks.prototype.move = function()
{
    if (this.selectedSide) {
        var distance = Math.sqrt(Math.pow(this.mouseX-this.selectedSide[1],2)+Math.pow(this.mouseY-this.selectedSide[2],2));
        if (distance > 15) {
            var edge = this.edges[this.selectedLink];
            if (this.selectedSide[0] == 2) {
                this.linking = [edge.block1, edge.connector1.id()];
            } else {
                this.linking = [edge.block2, edge.connector2.id()];
            }

            this.removeEdge(this.selectedLink);
            this.selectedSide = null;
            this.highlightTargets();
            if (this.selectedLink != null) {
                this.edges[this.selectedLink].selected = false;
            }
            this.selectedLink = null;
            this.redraw();
        }
    }

    if (this.moving) {
        this.center.x += (this.mouseX-this.moving[0]);
        this.center.y += (this.mouseY-this.moving[1]);
        this.moving = [this.mouseX, this.mouseY];
        this.redraw();
    }

    if (this.linking) {
        this.redraw();
    }
};

/**
 * Clicks the canvas
 */
Blocks.prototype.canvasClicked = function()
{
    var prevent = false;
    this.selectedBlock = null;
    if (this.selectedLink != null) {
        this.edges[this.selectedLink].selected = false;
    }
    this.selectedLink = null;
    this.selectedSide = null;

    for (var k in this.blocks) {
        var block = this.blocks[k];
        if (block.hasFocus) {
            this.selectedBlock = k;
        }
    }

    if (!this.selectedBlock) {
        for (var k in this.edges) {
            var collide = this.edges[k].collide(this.mouseX, this.mouseY);
            if (collide != false) {
                if (collide < 0.2) {
                    this.selectedSide = [1, this.mouseX, this.mouseY];
                } else if (collide > 0.8) {
                    this.selectedSide = [2, this.mouseX, this.mouseY];
                }
                this.selectedLink = k;
                this.edges[k].selected = true;
                prevent = true;
                break;
            }
        }
    }
            
    this.redraw();
    return prevent;
};

/**
 * Edge to remove
 */
Blocks.prototype.removeEdge = function(edge)
{
    this.history.save();
    this.edges[edge].erase();
    arrayRemove(this.edges, edge);
};

/**
 * Returns an edge id
 */
Blocks.prototype.getEdgeId = function(edge)
{
    for (var k in this.edges) {
        if (edge == this.edges[k]) {
            return k;
        }
    }

    return false;
};
    
/**
 * Remove a block
 */
Blocks.prototype.removeBlock = function(key)
{
    var block = this.blocks[key];

    var newEdges = [];
    for (var k in this.edges) {
        var edge = this.edges[k];
        if (edge.block1 == block || edge.block2 == block) {
            edge.erase();
        } else {
            newEdges.push(edge);
        }
    }
    this.edges = newEdges;

    block.erase();
    arrayRemove(this.blocks, this.selectedBlock);

    this.redraw();
};

/**
 * Get a block id
 */
Blocks.prototype.getBlockId = function(block)
{
    for (var k in this.blocks) {
        if (this.blocks[k] == block) {
            return k;
        }
    }

    return null;
};

/**
 * Retreive a block by ID
 */
Blocks.prototype.getBlockById = function(blockId)
{
    for (var k in this.blocks) {
        if (this.blocks[k].id == blockId) {
            return this.blocks[k];
        }
    }

    return null;
};

/**
 * Delete the current link
 */
Blocks.prototype.deleteEvent = function()
{
    // Remove a block and its edges
    if (this.selectedBlock != null) {
        this.history.save();
        this.removeBlock(this.selectedBlock);
        this.selectedBlock = null;
    }

    // Remove an edge
    if (this.selectedLink != null) {
        this.history.save();
        this.removeEdge(this.selectedLink);
        this.selectedLink = null;
        this.redraw();
    }
};

/**
 * Do the redraw
 */
Blocks.prototype.doRedraw = function()
{
    // Set the position for blocks
    for (var k in this.blocks) {
        this.blocks[k].redraw(this.selectedBlock == k);
    }

    // Redraw edges
    var svg = this.context.svg('get');
    svg.clear();

    for (var k in this.edges) {
        this.edges[k].draw(svg);
    }

    if (this.linking) {
        try {
            var position = this.linking[0].linkPositionFor(this.linking[1]);

            svg.line(position.x, position.y, this.mouseX, this.mouseY, {
                stroke: 'rgba(0,0,0,0.4)',
                strokeWidth: 3*this.scale
            });
        } catch (error) {
            this.linking = null;
        }
    }
    
    this.redrawTimeout = null;
};

/**
 *  Draw the edges
 */
Blocks.prototype.redraw = function()
{
    var self = this;

    if (!this.redrawTimeout) {
        this.redrawTimeout = setTimeout(function() { self.doRedraw(); }, 25);
    }
};

/**
 * Release the mouse
 */
Blocks.prototype.release = function()
{
    if (this.linking) {
        this.tryEndLink();
        this.linking=null;
    }
    $('.connector').removeClass('disabled');
    this.redraw();
};

/**
 * Tries to end a link
 */
Blocks.prototype.tryEndLink = function()
{
    for (var k in this.blocks) {
        var block = this.blocks[k];
        if (block.hasFocus && block.focusedConnector) {
            this.endLink(block, block.focusedConnector);
            break;
        }
    }
};

/**
 * End drawing an edge
 */
Blocks.prototype.endLink = function(block, connectorId)
{
    try {
        var id = this.edgeId++;

        var blockA = this.linking[0];
        var connectorA = IdToConnector(this.linking[1]);
        var blockB = block;
        var connectorB = IdToConnector(connectorId);

        if (connectorA.isOutput()) {
            var edge = new Edge(id, blockA, connectorA, blockB, connectorB, this);
        } else {
            var edge = new Edge(id, blockB, connectorB, blockA, connectorA, this);
        }

        for (var k in this.edges) {
            var other = this.edges[k];
            if (other.same(edge)) {
                throw 'This edge already exists';
            }
        }

        var fromTo = edge.fromTo();
        if (fromTo[1].allSuccessors().indexOf(fromTo[0].id) != -1) {
            throw 'You can not create a loop';
        }

        this.history.save();
        edge.create();
        var edgeIndex = this.edges.push(edge)-1;

        var types = edge.getTypes();
        if (!this.types.isCompatible(types[0], types[1])) {
            this.removeEdge(edgeIndex);
            throw 'Types '+types[0]+' and '+types[1]+' are not compatible';
        }
    } catch (error) {
        this.messages.show('Unable to create this edge :' + "\n" + error, {'class': 'error'});
    }
    this.linking = null;
    this.selectedBlock = null;
    this.redraw();
};

/**
 * Changing the compact mode
 */
Blocks.prototype.toggleCompact = function()
{
    this.compactMode = !this.compactMode;
    for (var k in this.blocks) {
        this.blocks[k].render();
    }
    this.redraw();
};

/**
 * Export the scene
 */
Blocks.prototype.export = function()
{
    var blocks = [];
    var edges = [];

    for (var k in this.blocks) {
        blocks.push(this.blocks[k].export());
    }

    for (var k in this.edges) {
        edges.push(this.edges[k].export());
    }

    return {
        edges: edges,
        blocks: blocks
    };
};

/**
 * Import some data
 */
Blocks.prototype.importData = function(scene)
{
    this.clear();
    this.doLoad(scene, false);
}

/**
 * Lads a scene
 */
Blocks.prototype.load = function(scene)
{
    this.doLoad(scene, true);
}

/**
 * Loads the scene
 */
Blocks.prototype.doLoad = function(scene, init)
{
    var self = this;

    this.ready(function() {
            var errors = [];
            self.id = 1;
            self.edgeId = 1;

            for (var k in scene.blocks) {
                try {
                    var data = scene.blocks[k];
                    var block = BlockImport(self, data);
                    self.id = Math.max(self.id, block.id+1);
                    block.create(self.div.find('.blocks'));
                    self.blocks.push(block);
                } catch (error) {
                    errors.push('Block #'+k+ ':'+error);
                }
            }

            for (var k in scene.edges) {
                try {
                    var data = scene.edges[k];
                    var edge = EdgeImport(self, data);

                    self.edgeId = Math.max(self.edgeId, edge.id+1);

                    edge.create();
                    self.edges.push(edge);
                } catch (error) {
                    errors.push('Edge #'+k+' :'+error);
                }
            }

            if (errors.length) {
                var text = errors.length + " loading errors :<br/>";
                text += '<ul>';
                for (var k in errors) {
                    text += '<li>' + errors[k] + '</li>';
                }
                text += '</ul>';
                self.messages.show(text, {'class': 'error'});
            }

            self.redraw();

            if (init) {
                self.perfectScale();	    
            }
    });
};

/**
 * Go to the perfect scale
 */
Blocks.prototype.perfectScale = function()
{
    if (!this.div) {
        return;
    }

    var xMin = null, xMax = null;
    var yMin = null, yMax = null;

    for (var k in this.blocks) {
        var block = this.blocks[k];
        if (xMin == null) {
            xMin = xMax = block.x;
            yMin = yMax = block.y;
        } else {
            xMin = Math.min(xMin, block.x-15);
            xMax = Math.max(xMax, block.x+block.width+18);
            yMin = Math.min(yMin, block.y-15);
            yMax = Math.max(yMax, block.y+115);
        }
    }
    var scaleA = this.div.width()/(xMax-xMin);
    var scaleB = this.div.height()/(yMax-yMin);
    var scale = Math.min(scaleA, scaleB);

    this.scale = scale;
    this.center.x = this.div.width()/2 - scale*(xMin+xMax)/2.0;
    this.center.y = this.div.height()/2 - scale*(yMin+yMax)/2.0;

    this.redraw();
}

/**
 * Write labels on the edges, edges is an object of ids => label
 */
Blocks.prototype.setLabels = function(labels)
{
    for (var k in this.edges) {
        var edge = this.edges[k];

        if (edge.id in labels) {
            edge.setLabel(labels[k]);
        }
    }
}
