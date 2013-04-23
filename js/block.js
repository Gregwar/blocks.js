/**
 * Creates an instance of a block
 */
Block = function(blocks, blockType, id)
{
    var parametersRatio = 1.3;
    var defaultFont = 12;
    var defaultWidth = 135;
    var defaultInputWidth = 100;
    var self = this;

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
    this.parameters = null;
    this.parametersManager = null;

    // Position
    this.x = 0;
    this.y = 0;

    // I/Os cardinality
    this.ios = {};

    // Which IO has focus ?
    this.focusedIo = null;

    // Edges
    this.edges = {};

    // Can this block be used to break a loop ?
    this.isLoopable = function()
    {
        return blockType.loopable;
    };

    /**
     * Update the block parameters
     */
    this.updateParameters = function(parameters)
    {
        blocks.history.save();
        this.parameters = parameters;
    };

    /**
     * Parses the cardinality
     */
    this.parseCardinality = function(ioCard, isOutput)
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
    this.parseLength = function(length)
    {
        if (typeof(length) == 'number') {
            return length;
        }

        expression = length.split(/\./);

        if (expression.length == 2) {
            var key = expression[0];
            var operation = expression[1];

            if (operation == 'length') {
                return self.parametersManager.getParameterSize(key);
            }

            if (operation == 'value') {
                return parseInt(self.parameters[key]);
            }
        }
    };

    /**
     * Html entities on a string
     */
    this.htmlentities = function(str)
    {
        str = str.replace(/</, '&lt;');
        str = str.replace(/>/, '&gt;');
        return str;
    }

    /**
     * Returns the render of the block
     */
    this.getHtml = function()
    {
	self.ios = {};

        html = '<div class="parameters"></div>';
        html += '<div class="blockTitle">' + blockType.name + '<span class="blockId">#' + self.id + '</span> <div class="blockicon delete"></div>';
        if (blockType.description) {
            html += '<div class="blockicon info"></div>';
            html += '<div class="description">' + blockType.description + '</div>';
        }
        html += '<div class="blockicon gear"></div></div>';
        
        var parameters = self.parametersManager.fields;
        for (k in parameters) {
            var parameter = parameters[k];
            var parameterHtml = parameter.getHtml(self.parameters);
            var key = 'param_'+k;
            if (!blocks.compactMode || (self.edges[key]!=undefined && self.edges[key].length>0)) {
                var card = self.parseCardinality(parameter.card, false)
                self.ios[key] = card;
                if (parameterHtml) {
                    html += '<div class="parameter '+key+'" rel="'+key+'">';
                    if (card[1] == '*' || card[1] > 0) {
                        html += '<div class="circle"></div>';
                    }
                    html += parameterHtml+'</div>';
                }
            }
        }

        // Handling inputs & outputs
        handle = function(key) {
            html += '<div class="' + key + 's '+(self.isLoopable() ? 'loopable' : '')+'">';

            for (k in blockType[key+'s']) {
                var isVariadic = false;
                var io = blockType[key+'s'][k];

                var size = 1;
                if (io.length != undefined) {
                    isVariadic = true;
                    size = self.parseLength(io.length);
                }

                for (x=0; x<size; x++) {
                    var ion = key + '_' + k;
                    var label = io.name.replace('#', x+1);

                    if (isVariadic) {
                        ion += '_' + x;
                    }

                    // Generating HTML
                    html += '<div class="'+key+' ' + ion + '" rel="' + ion + '"><div class="circle"></div>' + self.htmlentities(label) + '</div>';

                    // Setting cardinality
                    self.ios[ion] = self.parseCardinality(io.card, (key == 'output'));
                }
            }
                html += '</div>';
        };

        handle('input');
        handle('output');
	this.checkEdges();

        return html;
    };

    /**
     * Render the block
     */
    this.render = function()
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
    this.create = function(div)
    {
        html = '<div id="block' + this.id + '" class="block ' + blockType['class'] + '"></div>'

        div.append(html);
        this.div = div.find('#block' + this.id);
        
        if (this.parametersManager == undefined) {
            this.parametersManager = new ParametersManager(blockType, this);
	    if (this.parameters == null) {
                this.parameters = this.parametersManager.getDefaults();
	    }
        }

        this.render();
    };

    /**
     * Sets the position and the scale of the block
     */
    this.redraw = function(selected)
    {
        // Setting the position
        self.div.css('margin-left', blocks.center.x+self.x*blocks.scale+'px');
        self.div.css('margin-top', blocks.center.y+self.y*blocks.scale+'px');

        // Rescaling
        if (this.lastScale != blocks.scale) {
            self.div.css('font-size', Math.round(blocks.scale*defaultFont)+'px');
            self.div.css('width', Math.round(blocks.scale*defaultWidth)+'px');
        
            var size = Math.round(12*blocks.scale);
            self.div.find('.circle').css('width', size+'px');
            self.div.find('.circle').css('height', size+'px');
            self.div.find('.circle').css('background-size', size+'px '+size+'px');

            self.div.find('.inputs, .outputs').width(self.div.width()/2-10);
    
            self.cssParameters();
            this.lastScale = blocks.scale
        }

        // Changing the circle rendering
        for (k in self.ios) {
            var circle = self.div.find('.' + k + ' .circle');

            circle.removeClass('io_active');
            if (self.edges[k] != undefined && self.edges[k].length) {
                circle.addClass('io_active');
            }
        }

        // Updating the parameters manager div
        this.parametersManager.div = this.div.find('.parameters');

        // Is selected ?
        self.div.removeClass('block_selected');
        if (selected) {
            self.div.addClass('block_selected');
        }
    };

    /**
     * Sets the css for the inputs
     */
    this.cssParameters = function()
    {
        self.div.find('input').css('font-size', Math.round(blocks.scale*defaultFont)+'px');
        self.div.find('input').css('width', Math.round(blocks.scale*defaultInputWidth)+'px');
        self.div.find('.parameters').css('width', parametersRatio*Math.round(blocks.scale*defaultWidth)+'px');
    };

    /**
     * Init the function listeners
     */
    this.initListeners = function()
    {
        // Drag & drop the block
        self.div.find('.blockTitle').mousedown(function(event) {
            if (event.which == 1) {
                self.historySaved = false;
                self.drag = [blocks.mouseX/blocks.scale-self.x, blocks.mouseY/blocks.scale-self.y];
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
                    blocks.history.save();
                    self.historySaved = true;
                }
                self.x = (blocks.mouseX/blocks.scale-self.drag[0]);
                self.y = (blocks.mouseY/blocks.scale-self.drag[1]);
                blocks.redraw();
            }
        });

        // Drag the block
        $('html').mouseup(function() {
            self.drag = null;
        });

        // Draw a link
        self.div.find('.input, .output, .parameter').mousedown(function(event) {
            if (event.which == 1) {
                blocks.beginLink(self, $(this).attr('rel'));
                event.preventDefault();
            }
        });

        // Handle the parameters
        self.div.find('.gear').click(function() {
            self.parametersManager.toggle();
            self.cssParameters();
        });

        // Handle the deletion
        self.div.find('.delete').click(function() {
            blocks.removeBlock(blocks.getBlockId(self));
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
    this.linkPositionFor = function(io)
    {
        try {
            div = self.div.find('.' + io + ' .circle')

            var x = (div.offset().left-blocks.div.offset().left)+div.width()/2;
            var y = (div.offset().top-blocks.div.offset().top)+div.height()/2;
        } catch (error) {
            throw 'Unable to find link position for '+io+' ('+error+')';
        }

        return {x: x, y: y};
    };

    /**
     * Can the io be linked ?
     */
    this.canLink = function(ion)
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
    this.addEdge = function(ion, edge)
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
    this.checkEdges = function()
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
	    blocks.removeEdge(blocks.getEdgeId(toDelete[k]));
	}

	if (toDelete.length) {
	    blocks.redraw();
	}
    };

    /**
     * Erase an edge
     */
    this.eraseEdge = function(ion, edge)
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
    this.erase = function()
    {
        self.div.remove();
    };

    /**
     * Find all successors of a block, and their successors
     */
    this.allSuccessors = function()
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
    this.exportData = function()
    {
	return {
	    id: this.id,
	    x: this.x,
	    y: this.y,
	    type: blockType.name,
	    parameters: this.parametersManager.exportData(this.parameters)
	};
    };
};

/**
 * Imports a block from its data
 */
function BlockImport(blocks, data)
{
    for (t in blocks.blockTypes) {
	var blockType = blocks.blockTypes[t];
	if (blockType.name == data.type) {
	    var block = new Block(blocks, blockType, data.id);
	    block.x = data.x;
	    block.y = data.y;
	    block.parameters = ParametersImport(data.parameters);
	    return block;
	}
    }

    throw 'Unable to create a block of type ' + data.type;
};
