"use strict";

/**
 * Draw messages on the screen
 */
var BlocksMessages = function(messages, width)
{
    var self = this;

    // Timer to hide
    this.hideTimer = null;

    // Messages
    this.messages = messages;

    // Width
    this.width = width;

    messages.click(function() {
	self.hide();
    });
};

/**
 * Show a message
 */
BlocksMessages.prototype.show = function(text, options)
{
    var self = this;

    if (this.hideTimer != null) {
        clearTimeout(this.hideTimer);
    }

    var classes = 'message';

    if (options['class'] != undefined) {
        classes += ' '+options['class'];
    }

    var html = '<div class="'+classes+'">'+text+'</div>';

    this.messages.html(html);
    this.messages.fadeIn();
    this.messages.css('margin-left', Math.round((this.width-350)/2.0)+'px');
    this.messages.css('margin-top', '20px');

    this.hideTimer = setTimeout(function() { self.hide(); }, 5000);
};

/**
 * Hide the message
 */
BlocksMessages.prototype.hide = function()
{
    this.messages.fadeOut();
    this.hideTimer = null;
};
