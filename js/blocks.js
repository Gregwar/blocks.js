/**
 * Manage the blocks
 */
Blocks = function()
{
    var self = this;

    // View center & scale
    this.center = {};
    this.scale = 1.0;
    this.redrawTimeout = null;

    // Is the user dragging the view ?
    this.moving = null;

    // Is the system ready ?
    this.isReady = false;

    // Compact mode
    this.compactMode = false;

    // Context menu
    this.menu;

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
    this.blockTypes = [];

    // Instances
    this.blocks = [];

    // Edges
    this.edges = [];

    /**
     * Next block id
     */
    this.id = 1;
    
    /**
     * Runs the blocks editor
     */
    this.run = function(selector)
    {
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

            self.div.find('svg').attr('width',(self.div.width()));
            self.div.find('svg').attr('height',(self.div.height()));
            self.div.find('svg').width(self.div.width());
            self.div.find('svg').height(self.div.height());
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
            self.div.mousedown(function(evt) {
                if (self.canvasClicked()) {
                    evt.preventDefault();
                }
            });

            self.div.mousedown(function(event) {
                if (event.which == 2) {
                    self.moving = [self.mouseX, self.mouseY];
                }
            });
            
            self.div.mouseup(function(event) {
                if (event.which == 2) {
                    self.moving = null;
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

	    self.postReady();
        });
    };

    /**
     * Tell the system is ready
     */
    this.postReady = function()
    {
	this.isReady = true;
	if (this.readyQueue != undefined) {
	    for (k in this.readyQueue) {
		this.readyQueue[k]();
	    }
	}
    };

    /**
     * Callback when ready
     */
    this.ready = function(callback) 
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
    this.getPosition = function()
    {
        var position = {};
        position.x = (self.mouseX-self.center.x)/self.scale;
        position.y = (self.mouseY-self.center.y)/self.scale;

        return position;
    };

    /**
     * Adds a block
     */
    this.addBlock = function(name, x, y)
    {
        for (k in self.blockTypes) {
            var type = self.blockTypes[k];

            if (type.name == name) {
                var block = new Block(self, self.blockTypes[k], this.id);
                block.x = x;
                block.y = y;
                block.create(self.div.find('.blocks'));
                this.blocks.push(block);
                this.id++;
            }
        }
    };

    /**
     * Registers a new block type
     */
    this.register = function(type)
    {
        self.blockTypes.push(new BlockType(type));
    };

    /**
     * Begin to draw an edge
     */
    this.beginLink = function(block, io)
    {
        this.linking = [block, io];
    };

    /**
     * The mouse has moved
     */
    this.move = function()
    {
        if (self.selectedSide) {
            var distance = Math.sqrt(Math.pow(this.mouseX-this.selectedSide[1],2)+Math.pow(this.mouseY-this.selectedSide[2],2));
            if (distance > 15) {
                var edge = this.edges[this.selectedLink];
                if (this.selectedSide[0] == 2) {
                    this.linking = [edge.block1, edge.io1];
                } else {
                    this.linking = [edge.block2, edge.io2];
                }

                this.removeEdge(this.selectedLink);
                this.selectedSide = null;
                this.selectedLink = null;
                this.redraw();
            }
        }

        if (self.moving) {
            self.center.x += (self.mouseX-self.moving[0]);
            self.center.y += (self.mouseY-self.moving[1]);
            self.moving = [self.mouseX, self.mouseY];
            self.redraw();
        }

        if (self.linking) {
            self.redraw();
        }
    };

    /**
     * Clicks the canvas
     */
    this.canvasClicked = function()
    {
        var prevent = false;
        this.selectedBlock = null;
        this.selectedLink = null;
        this.selectedSide = null;

        for (k in this.blocks) {
            var block = this.blocks[k];
            if (block.hasFocus) {
                this.selectedBlock = k;
            }
        }

        if (!this.selectedBlock) {
            for (k in this.edges) {
                var collide = this.edges[k].collide(this.mouseX, this.mouseY);
                if (collide != false) {
                    if (collide < 0.2) {
                        this.selectedSide = [1, this.mouseX, this.mouseY];
                    } else if (collide > 0.8) {
                        this.selectedSide = [2, this.mouseX, this.mouseY];
                    }
                    this.selectedLink = k;
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
    this.removeEdge = function(edge)
    {
        this.edges[edge].erase();
        arrayRemove(this.edges, edge);
    };

    /**
     * Returns an edge id
     */
    this.getEdgeId = function(edge)
    {
	for (k in this.edges) {
	    if (edge == this.edges[k]) {
		return k;
	    }
	}

	return false;
    };
        
    /**
     * Remove a block
     */
    this.removeBlock = function(key)
    {
        var block = this.blocks[key];

        var newEdges = [];
        for (k in self.edges) {
            var edge = self.edges[k];
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
    this.getBlockId = function(block)
    {
        for (k in self.blocks) {
            if (self.blocks[k] == block) {
                return k;
            }
        }

        return null;
    };

    /**
     * Retreive a block by ID
     */
    this.getBlockById = function (blockId)
    {
	for (k in self.blocks) {
	    if (self.blocks[k].id == blockId) {
		return self.blocks[k];
	    }
	}

	return null;
    };

    /**
     * Delete the current link
     */
    this.deleteEvent = function()
    {
        // Remove a block and its edges
        if (this.selectedBlock != null) {
            this.removeBlock(this.selectedBlock);
            this.selectedBlock = null;
        }

        // Remove an edge
        if (this.selectedLink != null) {
            this.removeEdge(this.selectedLink);
            this.selectedLink = null;
            this.redraw();
        }
    };

    /**
     * Do the redraw
     */
    this.doRedraw = function()
    {
        // Set the position for blocks
        for (k in self.blocks) {
            self.blocks[k].redraw(self.selectedBlock == k);
        }

        // Redraw edges
        var svg = self.context.svg('get');
        svg.clear();

        for (k in self.edges) {
            self.edges[k].draw(svg, self.selectedLink == k);
        }

        if (self.linking) {
            var position = this.linking[0].linkPositionFor(this.linking[1]);

            svg.line(position.x, position.y, self.mouseX, self.mouseY, {
                stroke: 'rgba(0,0,0,0.4)',
                strokeWidth: 3*self.scale
            });
        }
        
        self.redrawTimeout = null;
    };

    /**
     *  Draw the edges
     */
    this.redraw = function()
    {
        if (!this.redrawTimeout) {
            this.redrawTimeout = setTimeout(function() { self.doRedraw(); }, 50);
        }
    };

    /**
     * Release the mouse
     */
    this.release = function()
    {
        if (self.linking) {
            self.tryEndLink();
            self.linking=null;
        }
        self.redraw();
    };

    /**
     * Tries to end a link
     */
    this.tryEndLink = function()
    {
        for (k in self.blocks) {
            var block = self.blocks[k];
            if (block.hasFocus && block.focusedIo) {
                self.endLink(block, block.focusedIo);
                break;
            }
        }
    };

    /**
     * End drawing an edge
     */
    this.endLink = function(block, io)
    {
        try {
            var edge = new Edge(this.linking[0], this.linking[1], block, io, self);

            for (k in self.edges) {
                var other = self.edges[k];
                if (other.same(edge)) {
                    throw 'This edge already exists';
                }
            }

            var fromTo = edge.fromTo();
            if (fromTo[1].allSuccessors().indexOf(fromTo[0].id) != -1) {
                throw 'You can not create a loop';
            }

            edge.create();
            this.edges.push(edge);
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
    this.toggleCompact = function()
    {
        this.compactMode = !this.compactMode;
        for (k in this.blocks) {
            this.blocks[k].render();
        }
        this.redraw();
    };

    /**
     * Export the scene
     */
    this.exportData = function()
    {
	var blocks = [];
	var edges = [];

	for (k in this.blocks) {
	    blocks.push(this.blocks[k].exportData());
	}

	for (k in this.edges) {
	    edges.push(this.edges[k].exportData());
	}

	return {
	    edges: edges,
	    blocks: blocks
	};
    };

    /**
     * Loads the scene
     */
    this.load = function(scene)
    {
	self.ready(function() {
		var errors = [];
		self.id = 1;

		for (k in scene.blocks) {
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

		for (k in scene.edges) {
		    try {
			var data = scene.edges[k];
			var edge = EdgeImport(self, data);
			edge.create();
			self.edges.push(edge);
		    } catch (error) {
			errors.push('Edge #'+k+' :'+error);
		    }
		}

		if (errors.length) {
		    var text = errors.length + " loading errors :<br/>";
		    text += '<ul>';
		    for (k in errors) {
			text += '<li>' + errors[k] + '</li>';
		    }
		    text += '</ul>';
		    self.messages.show(text, {'class': 'error'});
		}

		self.redraw();
		self.perfectScale();	    
	});
    };

    /**
     * Go to the perfect scale
     */
    this.perfectScale = function()
    {
	var xMin = null, xMax = null;
	var yMin = null, yMax = null;

	for (k in this.blocks) {
	    var block = this.blocks[k];
	    if (xMin == null) {
		xMin = xMax = block.x;
		yMin = yMax = block.y;
	    } else {
		xMin = Math.min(xMin, block.x);
		xMax = Math.max(xMax, block.x);
		yMin = Math.min(yMin, block.y);
		yMax = Math.max(yMax, block.y);
	    }
	}
	xMin -= 15;
	yMin -= 15;
	xMax += 200;
	yMax += 150;
	var scaleA = this.div.width()/(xMax-xMin);
	var scaleB = this.div.height()/(yMax-yMin);
	var scale = Math.min(scaleA, scaleB);

	this.scale = scale;
	this.center.x = this.div.width()/2 - scale*(xMin+xMax)/2.0;
	this.center.y = this.div.height()/2 - scale*(yMin+yMax)/2.0;

	this.redraw();
    }
};

