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

    // Position
    this.x = 0;
    this.y = 0;

    // I/Os cardinality
    this.ios = {};

    // Edges
    this.edges = {};

    /**
     * Returns the render of the block
     */
    this.getHtml = function()
    {
        html = '<h3>' + blockType.name + '</h3>';

        // Handling inputs & outputs
        handle = function(key) {
            html += '<div class="inputs">';

            for (k in blockType[key+'s']) {
                var io = blockType[key+'s'][k];
                var ion = key + '_' + k;
                html += '<div class="'+key+' ' + ion + '" rel="' + ion + '">' + io.name + '</div>';

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
            html += '</div>';
        };

        handle('input');
        handle('output');

        return html;
    };

    /**
     * Creates and inject the div
     */
    this.create = function(div)
    {
        html = '<div id="block' + this.id + '" class="block">'
            + this.getHtml()
            + '</div>';

        div.append(html);
        this.div = div.find('#block' + this.id);
        this.initListeners();
        this.redraw();
    };

    /**
     * Sets the position of the block
     */
    this.redraw = function(selected)
    {
        self.div.css('margin-left', blocks.center.x+self.x*blocks.scale+'px');
        self.div.css('margin-top', blocks.center.y+self.y*blocks.scale+'px');

        self.div.css('font-size', Math.round(blocks.scale*defaultFont)+'px');
        self.div.css('width', Math.round(blocks.scale*defaultWidth)+'px');

        for (k in self.ios) {
            self.div.find('.' + k).removeClass('io_active');
            if (self.edges[k] != undefined && self.edges[k].length) {
                self.div.find('.' + k).addClass('io_active');
            }
        }

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
        self.div.find('h3').mousedown(function(event) {
            if (event.which == 1) {
                self.drag = [blocks.mouseX/blocks.scale-self.x, blocks.mouseY/blocks.scale-self.y];
            }
        });

        self.div.hover(function() {
            self.hasFocus = true;
        }, function() {
            self.hasFocus = false;
        });
            
        $('html').mousemove(function(evt) {
            if (self.drag) {
                self.x = (blocks.mouseX/blocks.scale-self.drag[0]);
                self.y = (blocks.mouseY/blocks.scale-self.drag[1]);
                blocks.redraw();
            }
        });

        $('html').mouseup(function() {
            self.drag = null;
        });

        // Draw a link
        self.div.find('.input').mousedown(function(event) {
            if (event.which == 1) {
                blocks.beginLink(self, $(this).attr('rel'));
                event.preventDefault();
            }
        });
        self.div.find('.output').mousedown(function(event) {
            if (event.which == 1) {
                blocks.beginLink(self, $(this).attr('rel'));
                event.preventDefault();
            }
        });
        self.div.find('.input').mouseup(function(event) {
            if (event.which == 1) {
                blocks.endLink(self, $(this).attr('rel'));
            }
        });
        self.div.find('.output').mouseup(function(event) {
            if (event.which == 1) {
                blocks.endLink(self, $(this).attr('rel'));
            }
        });
    };

    /**
     * Gets the link position for an input or output
     */
    this.linkPositionFor = function(io)
    {
        div = self.div.find('.' + io);

        if (div.hasClass('input')) {
            var x = (div.offset().left-blocks.div.offset().left)+10;
            var y = (div.offset().top-blocks.div.offset().top)+div.height()/2;
        } else {
            var x = (div.offset().left-blocks.div.offset().left)+div.width()+10;
            var y = (div.offset().top-blocks.div.offset().top)+div.height()/2;
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
};
