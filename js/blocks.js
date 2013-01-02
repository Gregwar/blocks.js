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

    // Mouse
    this.mouseX = 0;
    this.mouseY = 0;

    // Linking ?
    this.linking = null;

    /**
     * Selected link
     */
    this.selectedLink = null;

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
     * Errors
     */
    this.error = function(message)
    {
        throw 'Blocks: ' + message;
    };

    /**
     * Runs the blocks editor
     */
    this.run = function(selector)
    {
        $(document).ready(function() {
            self.div = $(selector);

            if (!self.div.size()) {
                this.error('Unable to find ' + selector);
            }

            // Inject the initial editor
            self.div.html(
                  '<div class="blocks_js_editor">'
                + '<canvas></canvas>'
                + '<div class="menubar">'
                + '<div class="add">'
                + '<span>Add a block</span>'
                + '<div class="types"></div>'
                + '</div>'
                + '</div>'
                + '<div class="blocks"></div>'
                + '</div>'
            );

            self.div.find('canvas').attr('width',(self.div.width()));
            self.div.find('canvas').attr('height',(self.div.height()));
            self.context = self.div.find('canvas')[0].getContext('2d');

            // Setting up default viewer center
            self.center.x = self.div.width()/2;
            self.center.y = self.div.height()/2;

            // Add a block
            self.div.find('.add').hover(function() {
                html = '';
                for (k in self.blockTypes) {
                    var type = self.blockTypes[k];
                    html += '<div class="type" rel="'+type.name+'">'+type.name+'</div>';
                }

                $(this).find('.types').html(html);
                $(this).find('.types').show();
                $(this).find('.type').click(function() {
                    self.addBlock($(this).attr('rel'));
                });
            }, function() {
                $(this).find('.types').hide();
            });

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
            self.div.click(function() {
                self.canvasClicked();
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
            self.context.clearRect(0, 0, self.div.width(), self.div.height());
            self.context.strokeStyle = 'rgb(0, 0, 0)';
            self.context.beginPath();
            self.context.stroke();

            // Detecting key press
            $(document).keydown(function(e){
                if ($('input').is(':focus')) {
                    return;
                }   

                // "del" will delete a selected link
                if (e.keyCode == 46) {
                    self.deleteLink();
                }

                // Temp: using "p" and "m" for the zoom
                if (e.keyCode == 80) {
                    self.scale *= 1.1;
                    self.redraw();
                }
                if (e.keyCode == 77) {
                    self.scale /= 1.1;
                    self.redraw();
                }
            });
        });
    };

    /**
     * Adds a block
     */
    this.addBlock = function(name)
    {
        for (k in self.blockTypes) {
            var type = self.blockTypes[k];

            if (type.name == name) {
                var block = new Block(self, self.blockTypes[k], this.id);
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
    this.move = function(evt)
    {
        if (self.linking) {
            var position = this.linking[0].linkPositionFor(this.linking[1]);
            self.doRedraw();
            self.context.lineWidth = 3;
            self.context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            self.context.beginPath();
            self.context.moveTo(position.x, position.y);
            self.context.lineTo(self.mouseX, self.mouseY);
            self.context.stroke();
        }

        if (self.moving) {
            self.center.x += (self.mouseX-self.moving[0]);
            self.center.y += (self.mouseY-self.moving[1]);
            self.moving = [self.mouseX, self.mouseY];
            self.redraw();
        }
    };

    /**
     * Clicks the canvas
     */
    this.canvasClicked = function()
    {
        this.selectedLink = null;

        for (k in this.edges) {
            if (this.edges[k].collide(this.mouseX, this.mouseY)) {
                this.selectedLink = k;
                break;
            }
        }
                
        this.redraw();
    };

    /**
     * Delete the current link
     */
    this.deleteLink = function()
    {
        if (this.selectedLink != null) {
            this.edges[this.selectedLink].erase();
            arrayRemove(this.edges, this.selectedLink);
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
            self.blocks[k].redraw();
        }

        // Redraw edges
        self.context.clearRect(0, 0, self.div.width(), self.div.height());

        for (k in self.edges) {
            self.edges[k].draw(self.context, self.selectedLink == k);
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
        self.linking = null;
        self.redraw();
    };

    /**
     * End drawing an edge
     */
    this.endLink = function(block, io)
    {
        if (this.linking) {
            try {
                var edge = new Edge(this.linking[0], this.linking[1], block, io, self);

                for (k in self.edges) {
                    var other = self.edges[k];
                    if (other.same(edge)) {
                        throw 'This edge already exists';
                    }
                }
                edge.create();
                this.edges.push(edge);
            } catch (error) {
                alert('Unable to create this edge :' + "\n" + error);
            }
            this.linking = null;
            this.redraw();
        }
    };
};

