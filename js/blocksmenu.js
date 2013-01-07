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

    // Menu items
    this.actions = [
	{
	    label: 'Compact',
	    action: function(blocks) {
		blocks.toggleCompact();
	    }
	},
	{
	    label: 'Scale',
	    action: function(blocks) {
		var xMin = null, xMax = null;
		var yMin = null, yMax = null;

		for (k in blocks.blocks) {
		    var block = blocks.blocks[k];
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
		var scaleA = blocks.div.width()/(xMax-xMin);
		var scaleB = blocks.div.height()/(yMax-yMin);
		var scale = Math.min(scaleA, scaleB);

		blocks.scale = scale;
		blocks.center.x = blocks.div.width()/2 - scale*(xMin+xMax)/2.0;
		blocks.center.y = blocks.div.height()/2 - scale*(yMin+yMax)/2.0;

		blocks.redraw();
	    }
	}
    ];

    /**
     * Adds an action
     */
    this.addAction = function(name, action)
    {
	this.actions.push({label: name, action: action});
    };

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

	    for (action in self.actions) {
		html += '<div rel="'+action+'" class="menuentry menu_action_'+action+'">'+self.actions[action].label+'</div>';
	    }

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

	    for (k in self.actions) {
		self.menu.find('.menu_action_'+k).click(function() {
		    var action = self.actions[$(this).attr('rel')];
		    action.action(blocks);
		    self.hide();
		});
	    }

            $(this).find('.types > .type').hover(function() {
                self.menu.find('.childs').hide();
            });
        }
        
        return false;
    });
}
