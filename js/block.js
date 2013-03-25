/**
 * Creates an instance of a block
 */
Block = function(blocks, blockType, id)
{
    var defaultFont = 13;
    var defaultWidth = 170;
    var self = this;

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

    /**
     * Returns the render of the block
     */
    this.getHtml = function()
    {
	self.ios = {};

        html = '<div class="parameters"></div>';
        html += '<div class="blockTitle">' + blockType.name + ' <div class="blockicon delete"></div>';
        if (blockType.description) {
            html += '<div class="blockicon info"></div>';
            html += '<div class="description">' + blockType.description + '</div>';
        }
        html += '<div class="blockicon gear"></div></div>';
        
        chunks = self.parametersManager.getHtmlChunks();
        for (k in chunks) {
            var key = 'param_'+k;
            if (!blocks.compactMode || (self.edges[key]!=undefined && self.edges[key].length>0)) {
                self.ios[key] = [0,1];
                if (chunks[k]) {
                    html += '<div class="parameter '+key+'" rel="'+key+'"><div class="circle"></div> '+chunks[k]+'</div>';
                }
            }
        }

        // Handling inputs & outputs
        handle = function(key) {
            html += '<div class="' + key + 's">';

            for (k in blockType[key+'s']) {
                var io = blockType[key+'s'][k];

                var size = 1;
                if (io.length != undefined) {
                    var pkey = io.length;
                    if (self.parameters != undefined && self.parameters[pkey] != undefined) {
                        size = self.parameters[pkey].length;
                    }
                }

                for (x=0; x<size; x++) {
                    var ion = key + '_' + (parseInt(k)+x);
                    var label = io.name.replace('#', x+1);

                    // Generating HTML
                    html += '<div class="'+key+' ' + ion + '" rel="' + ion + '"><div class="circle"></div>' + label + '</div>';

                    // Setting cardinality
                    var card = [0, '*'];
                    if (io.card != undefined) {
                        tab = io.card.split('-');
                        if (tab.length == 1) {
                            card = [0, tab[0]];
                        } else {
                            card = tab;
                        }
                    }
                    self.ios[ion] = card;
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
    }

    /**
     * Init the function listeners
     */
    this.initListeners = function()
    {
        // Drag & drop the block
        self.div.find('.blockTitle').mousedown(function(event) {
            if (event.which == 1) {
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
        self.div.find('.input, .output').mousedown(function(event) {
            if (event.which == 1) {
                blocks.beginLink(self, $(this).attr('rel'));
                event.preventDefault();
            }
        });

        // Handle the parameters
        self.div.find('.gear').click(function() {
            self.parametersManager.toggle();
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
        div = self.div.find('.' + io + ' .circle')

        var x = (div.offset().left-blocks.div.offset().left)+div.width()/2;
        var y = (div.offset().top-blocks.div.offset().top)+div.height()/2;

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
                    fromTo = currentBlock.edges[key][i].fromTo();

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
