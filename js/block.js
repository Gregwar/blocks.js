/**
 * Creates an instance of a block
 */
Block = function(blocks, meta, id)
{
    this.blocks = blocks;
    this.meta = meta;

    // Appareance values
    this.valuesRatio = 1.3;
    this.defaultFont = 12;
    this.defaultInputWidth = 100;

    // Custom description
    this.description = null;
    
    // Width
    this.defaultWidth = this.meta.size == 'small' ? 100 : 135;

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
    this.focusedIo = null;

    // Edges
    this.edges = {};
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
    for (field in values) {
        this.fields.getField(field).setValue(values[field]);
    }
};

/**
 * Getting the values
 */
Block.prototype.getValues = function(values)
{
    var values = {};
    for (k in this.fields.editables) {
        var field = this.fields.editables[k];
        values[field.name] = field.getValue();
    }

    return values;
};

/**
 * Parses the cardinality
 */
Block.prototype.parseCardinality = function(ioCard, isOutput)
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

/**
 * Parses a length
 */
Block.prototype.parseLength = function(length)
{
    if (typeof(length) == 'number') {
        return length;
    }

    return this.fields.getField(length).getLength();
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
    this.ios = {};

    // Getting the title
    var title = this.meta.name + '<span class="blockId">#' + this.id + '</span>';
    for (k in this.fields.fields) {
        var field = this.fields.fields[k];
        if (field.asTitle) {
            title = field.getPrintableValue();
        }
    }

    html = '<div class="parameters"></div>';
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
    html += '<div class="blockicon gear"></div></div>';
    html += '<div class="infos"></div>';
    
    for (k in self.fields.editables) {
        var field = self.fields.editables[k];
        var fieldHtml = field.getHtml();
        if (html && (!field.hide) && (!field.asTitle) && (!this.blocks.compactMode)) {
            html += '<div class="parameter">'+fieldHtml+'</div>';
        }
    }

    // Handling inputs & outputs
    handle = function(key, fields) {
        html += '<div class="' + key + 's '+(self.isLoopable() ? 'loopable' : '')+'">';

        for (k in fields) {
            var isVariadic = false;
            var io = fields[k];

            var size = 1;
            if (io.length != undefined) {
                isVariadic = true;
                size = self.parseLength(io.length);
            }

            for (x=0; x<size; x++) {
                var ion = key + '_' + k;
                var label = io.name.replace('#', x+1);

                if (io.dynamicLabel) {
                    label = String(eval(io.dynamicLabel));
                }
                if (isVariadic) {
                    ion += '_' + x;
                }

                var value = '';
                var field = self.fields.getField(io.name);
                if (field && field.is('editable')) {
                    value = ' ('+field.getPrintableValue()+')';
                }

                // Generating HTML
                html += '<div class="'+key+' ' + ion + '" rel="' + ion + '"><div class="circle"></div>' + self.htmlentities(label) + value + '</div>';

                // Setting cardinality
                self.ios[ion] = self.parseCardinality(io.card, (key == 'output'));
            }
        }
            html += '</div>';
    };

    handle('input', this.fields.inputs);
    handle('output', this.fields.outputs);
    this.checkEdges();

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
 * Creates and inject the div
 */
Block.prototype.create = function(div)
{
    html = '<div id="block' + this.id + '" class="block ' + this.meta['class'] + '"></div>'

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
    if (this.blocks.showIcons) {
        this.div.find('.blockicon').show();
    } else {
        this.div.find('.blockicon').hide();
    }

    // Rescaling
    if (this.lastScale != this.blocks.scale) {
        this.div.css('font-size', Math.round(this.blocks.scale*this.defaultFont)+'px');
        this.div.css('width', Math.round(this.blocks.scale*this.defaultWidth)+'px');
    
        var size = Math.round(12*this.blocks.scale);
        this.div.find('.circle').css('width', size+'px');
        this.div.find('.circle').css('height', size+'px');
        this.div.find('.circle').css('background-size', size+'px '+size+'px');

        this.div.find('.inputs, .outputs').width(this.div.width()/2-10);

        this.cssParameters();
        this.lastScale = this.blocks.scale
    }

    // Changing the circle rendering
    for (k in this.ios) {
        var circle = this.div.find('.' + k + ' .circle');

        circle.removeClass('io_active');
        if (this.edges[k] != undefined && this.edges[k].length) {
            circle.addClass('io_active');
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
    this.div.find('input').css('width', Math.round(this.blocks.scale*this.defaultInputWidth)+'px');
    this.div.find('.parameters').css('width', this.valuesRatio*Math.round(this.blocks.scale*this.defaultWidth)+'px');
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
    self.div.find('.input, .output, .parameter').hover(function() {
        self.focusedIo = $(this).attr('rel');
    }, function() {
        self.focusedIo = null;
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
    self.div.find('.input, .output, .parameter').mousedown(function(event) {
        if (event.which == 1) {
            self.blocks.beginLink(self, $(this).attr('rel'));
            event.preventDefault();
        }
    });

    // Handle the parameters
    self.div.find('.gear').click(function() {
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
Block.prototype.linkPositionFor = function(io)
{
    try {
        div = this.div.find('.' + io + ' .circle')

        var x = (div.offset().left-this.blocks.div.offset().left)+div.width()/2;
        var y = (div.offset().top-this.blocks.div.offset().top)+div.height()/2;
    } catch (error) {
        throw 'Unable to find link position for '+io+' ('+error+')';
    }

    return {x: x, y: y};
};

/**
 * Can the io be linked ?
 */
Block.prototype.canLink = function(ion)
{
    var tab = [];
    if (this.edges[ion] != undefined) {
        tab = this.edges[ion];
    }

    var card = this.ios[ion];

    if (card[1] != '*') {
        return (tab.length < card[1]);
    }

    return true;
};

/**
 * Add an edge
 */
Block.prototype.addEdge = function(ion, edge)
{
    var tab = [];
    if (this.edges[ion] != undefined) {
        tab = this.edges[ion];
    }

    tab.push(edge);
    this.edges[ion] = tab;
};

/**
 * Check that all edges reference a valid I/O
 */
Block.prototype.checkEdges = function()
{
    var toDelete = [];
    for (ion in this.edges) {
        var edges = this.edges[ion];

        if (!(ion in this.ios)) {
            for (k in edges) {
                toDelete.push(edges[k]);
            }

            delete this.edges[ion];
        }
    }

    for (k in toDelete) {
        this.blocks.removeEdge(this.blocks.getEdgeId(toDelete[k]));
    }

    if (toDelete.length) {
        this.blocks.redraw();
    }
};

/**
 * Erase an edge
 */
Block.prototype.eraseEdge = function(ion, edge)
{
    if (this.edges[ion] != undefined) {
        for (k in this.edges[ion]) {
            if (this.edges[ion][k] == edge) {
                arrayRemove(this.edges[ion], k);
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

        for (key in currentBlock.edges) {
            for (i in currentBlock.edges[key]) {
                var edge = currentBlock.edges[key][i];
                if (edge.isLoopable()) {
                    continue;
                }
                fromTo = edge.fromTo();

                if (fromTo[0] == currentBlock) {
                    target = fromTo[1];
                    
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
Block.prototype.exportData = function()
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
 * Imports a block from its data
 */
function BlockImport(blocks, data)
{
    for (t in blocks.metas) {
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
