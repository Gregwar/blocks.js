/**
 * Creates an instance of a block
 */
Block = function(blocks, blockType, id)
{
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
    };

    /**
     * Init the function listeners
     */
    this.initListeners = function()
    {
        // Drag & drop the block
        self.div.find('h3').mousedown(function() {
            self.drag = [blocks.mouseX-self.x, blocks.mouseY-self.y];
        });
            
        $('html').mousemove(function(evt) {
            if (self.drag) {
                self.x = (blocks.mouseX-self.drag[0]);
                self.y = (blocks.mouseY-self.drag[1]);
                self.div.css('margin-left', self.x+'px');
                self.div.css('margin-top', self.y+'px');
                blocks.redraw();
            }
        });

        $('html').mouseup(function() {
            self.drag = null;
        });

        // Draw a link
        self.div.find('.input').mousedown(function(evt) {
            blocks.beginLink(self, $(this).attr('rel'));
            evt.preventDefault();
        });
        self.div.find('.output').mousedown(function(evt) {
            blocks.beginLink(self, $(this).attr('rel'));
            evt.preventDefault();
        });
        self.div.find('.input').mouseup(function() {
            blocks.endLink(self, $(this).attr('rel'));
        });
        self.div.find('.output').mouseup(function() {
            blocks.endLink(self, $(this).attr('rel'));
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
