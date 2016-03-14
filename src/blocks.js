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
    this.scale = 1.3;
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

    var compatibles;
    if (connector.type == 'output') {
        compatibles = this.types.getCompatibles(type);
    } else {
        compatibles = this.types.getBackCompatibles(type);
    }

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
            if (this.selectedLink != null && (this.selectedLink in this.edges)) {
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
        try {
            var errors = [];
            self.id = 1;
            self.edgeId = 1;

            if (typeof(scene)!='object' || (scene instanceof Array)) {
                throw 'Scene is not an object';
            }
            if (!('blocks' in scene) || !(scene.blocks instanceof Array)) {
                throw 'Scene has no blocks section';
            }
            if (!('edges' in scene) || !(scene.edges instanceof Array)) {
                throw 'Scene has no blocks section';
            }

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
        } catch (error) {
            self.messages.show('Unable to create this edge :' + "\n" + error, {'class': 'error'});
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
