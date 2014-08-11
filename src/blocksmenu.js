"use strict";

/**
 * Handles the menu for creating blocks
 */
var BlocksMenu = function(blocks)
{
    var self = this;

    // Is the menu visible ?
    this.visible = false;

    // Position on the scene
    this.position = {};

    // Blocks
    this.blocks = blocks;

    // Menu div
    this.menu = blocks.div.find('.contextmenu');

    // Menu items
    this.actions = [
	{
	    label: 'Compact',
	    action: function(blocks) {
		blocks.toggleCompact();
	    },
            icon: 'compact'
	},
	{
	    label: 'Scale',
	    action: function(blocks) {
		blocks.perfectScale();
	    },
            icon: 'scale'
	}
    ];

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
            for (var k in blocks.metas) {
                var meta = blocks.metas[k];

                if (meta.family in families) {
                    families[meta.family].push(meta);
                } else {
                    families[meta.family] = [meta];
                }
            }

            var html = '';

	    for (var action in self.actions) {
                var icon = 'none';
                if ('icon' in self.actions[action]) {
                    icon = self.actions[action].icon;
                }
		html += '<div rel="'+action+'" class="menuentry menu_action_'+action+'"><div class="menu_icon menu_icon_'+icon+'"></div>'+self.actions[action].label+'</div>';
	    }

            for (var family in families) {
                if (family) {
                    var className = family.replace(/[^a-zA-Z]/g,'');
                    html += '<div class="family">';
                    html += '<div class="familyName family_'+family+'"><div class="menu_icon menu_icon_family_'+className+'"></div>'+family+' <span>&raquo;</span></div>';
                    html += '<div class="childs">';
                }
                for (var k in families[family]) {
                    var type = families[family][k];
                    html += '<div class="type type_'+type.name+'" rel="'+type.name+'">'+type.name+'</div>';
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

	    for (var k in self.actions) {
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

/**
 * Adds an action
 */
BlocksMenu.prototype.addAction = function(name, action, icon)
{
    this.actions.push({label: name, action: action, icon: icon});
};

/**
 * Hide the menu
 */
BlocksMenu.prototype.hide = function()
{
    this.menu.hide();
    this.visible = false;
};

/**
 * Show the menu
 */
BlocksMenu.prototype.show = function()
{
    this.menu.css('margin-left', (5+this.blocks.mouseX)+'px');
    this.menu.css('margin-top', (5+this.blocks.mouseY)+'px');
    this.menu.show();
    this.visible = true;
};

