/**
 * Creates an instance of a block
 */
Block = function(blocks, blockType, id)
{
    var defaultFont = 13;
    var defaultWidth = 170;
    var self = this;

    this.id = id;
    this.div = null;
    this.drag = null;
    this.x = 0;
    this.y = 0;

    /**
     * Returns the render of the block
     */
    this.getHtml = function()
    {
        html = '<h3>' + blockType.name + '</h3>';

        // Adding inputs
        html += '<div class="inputs">';
        for (k in blockType.inputs) {
            var input = blockType.inputs[k];
            html += '<div class="input input_' + k + '" rel="input_' + k + '">' + input.name + '</div>';
        }
        html += '</div>';
        
        // Adding outputs
        html += '<div class="outputs">';
        for (k in blockType.outputs) {
            var output = blockType.outputs[k];
            html += '<div class="output output_'+ k +'" rel="output_' + k + '">' + output.name + '</div>';
        }
        html += '</div>';

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
    this.redraw = function()
    {
        self.div.css('margin-left', blocks.center.x+self.x*blocks.scale+'px');
        self.div.css('margin-top', blocks.center.y+self.y*blocks.scale+'px');

        self.div.css('font-size', Math.round(blocks.scale*defaultFont)+'px');
        self.div.css('width', Math.round(blocks.scale*defaultWidth)+'px');
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
                evt.preventDefault();
            }
        });
        self.div.find('.output').mousedown(function(event) {
            if (event.which == 1) {
                blocks.beginLink(self, $(this).attr('rel'));
                evt.preventDefault();
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
};
