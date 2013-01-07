/**
 * Draw messages on the screen
 */
function BlocksMessages(messages, width)
{
    var self = this;

    // Timer to hide
    this.hideTimer = null;

    messages.click(function() {
	self.hide();
    });

    /**
     * Show a message
     */
    this.show = function(text, options)
    {
	if (this.hideTimer != null) {
	    clearTimeout(this.hideTimer);
	}

	var classes = 'message';

	if (options['class'] != undefined) {
	    classes += ' '+options['class'];
	}

	html = '<div class="'+classes+'">'+text+'</div>';

	messages.html(html);
	messages.fadeIn();
	messages.css('margin-left', Math.round((width-350)/2.0)+'px');
	messages.css('margin-top', '20px');

	this.hideTimer = setTimeout(function() { self.hide(); }, 5000);
    };

    /**
     * Hide the message
     */
    this.hide = function()
    {
	messages.fadeOut();
	this.hideTimer = null;
    };
};
