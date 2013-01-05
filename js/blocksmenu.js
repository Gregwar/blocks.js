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
        self.menu.css('margin-left', (5+blocks.mouseX)+'px');
        self.menu.css('margin-top', (5+blocks.mouseY)+'px');
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
            self.position = blocks.getPosition();

            // Sorting types by family
            var families = {};
            for (k in blocks.blockTypes) {
                var type = blocks.blockTypes[k];

                if (families[type.family] == undefined) {
                    families[type.family] = [type];
                } else {
                    families[type.family].push(type);
                }
            }

            html = '';

            html += '<div class="menuentry compactmode">Compact</div>';

            for (family in families) {
                if (family) {
                    html += '<div class="family">';
                    html += '<div class="familyName">'+family+' <span>&raquo;</span></div>';
                    html += '<div class="childs">';
                }
                for (k in families[family]) {
                    var type = families[family][k];
                    html += '<div class="type" rel="'+type.name+'">'+type.name+'</div>';
                }
                if (family) {
                    html += '</div>';
                    html += '</div>';
                }
            }

            self.menu.find('.types').html(html);
            self.show();

            self.menu.find('.type').click(function() {
                blocks.addBlock($(this).attr('rel'), self.position.x, self.position.y);
                self.hide();
            });

            self.menu.find('.family').each(function() {
                var family = $(this);
                $(this).find('.familyName').hover(function() {
                    self.menu.find('.childs').hide();
                    family.find('.childs').show();
                });
            });

            self.menu.find('.compactmode').click(function() {
                blocks.toggleCompact();
                self.hide();
            });

            $(this).find('.types > .type').hover(function() {
                self.menu.find('.childs').hide();
            });
        }
        
        return false;
    });
}
