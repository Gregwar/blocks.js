/**
 * Handles the history
 */
function History(blocks)
{
    var self = this;
    var historySize = 30;

    this.history = [];
    this.historyPos = 0;
    this.ctrlDown = false;
    
    $(document).keydown(function(evt) {
        if (evt.keyCode == 17) {
            self.ctrlDown = true;
        } 

        // Ctrl+Z
        if (evt.keyCode == 90 && self.ctrlDown) {
            self.restoreLast();
        }
    });

    $(document).keyup(function(evt) {
        if (evt.keyCode == 17) {
            self.ctrlDown = false;
        }
    });

    /**
     * Save the current situation to the history
     */
    this.save = function()
    {
        this.history.push(blocks.exportData());

        if (this.history.length > historySize) {
            this.history.shift();
        }
    };

    /**
     * Restores the last saved situation
     */
    this.restoreLast = function()
    {
        if (this.history.length) {
            var last = this.history.pop();
            blocks.importData(last);
        } else {
            alert('Nothing to get');
        }
    };
};
