/**
 * Handles the menu for creating blocks
 */
function BlocksMenu(blocks)
{
    var self = this;

    // Is the menu visible ?
    this.visible = false;

    // Position on the scene
    this.position = {};

    // Menu div
    this.menu = blocks.div.find('.contextmenu');

    /**
     * Hide the menu
     */
    this.hide = function()
    {
        self.menu.hide();
        self.visible = false;
    };

    /**
     * Show the menu
     */
    this.show = function()
    {
        self.menu.css('margin-left', (10+blocks.mouseX)+'px');
        self.menu.css('margin-top', (10+blocks.mouseY)+'px');
        self.menu.show();
        self.visible = true;
    };

    /**
     * Initialisation
     */
    blocks.div.bind('contextmenu', function() {
        if (self.visible) {
            self.hide();
        } else {
            self.position.x = (blocks.mouseX-blocks.center.x)/blocks.scale;
            self.position.y = (blocks.mouseY-blocks.center.y)/blocks.scale;

            html = '';
            for (k in blocks.blockTypes) {
                var type = blocks.blockTypes[k];
                html += '<div class="type" rel="'+type.name+'">'+type.name+'</div>';
            }

            self.menu.find('.types').html(html);
            self.show();

            self.menu.find('.type').click(function() {
                blocks.addBlock($(this).attr('rel'), self.position.x, self.position.y);
                self.hide();
            });
        }
        
        return false;
    });
}
