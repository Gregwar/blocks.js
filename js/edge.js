/**
 * An edge linking two blocks
 */
function Edge(id, block1, io1, block2, io2, blocks)
{
    this.label = null;
    this.id = parseInt(id);
    this.block1 = block1;
    this.io1 = io1;
    this.block2 = block2;
    this.io2 = io2;
    var defaultSize = 3;
    var defaultFontSize = 10;
    var position1 = block1.linkPositionFor(io1);
    var position2 = block2.linkPositionFor(io2);
    var segment = new Segment(
            position1.x, position1.y, 
            position2.x-position1.x, position2.y-position1.y
    );

    /**
     * Should this edge be ignored in loop analysis ?
     */
    this.isLoopable = function()
    {
        return (block1.isLoopable() || block2.isLoopable());
    }

    /**
     * Returns an array with the blocks ordered
     */
    this.fromTo = function()
    {
        return [block1, block2];
    };

    /**
     * Sets the label of the edge
     */
    this.setLabel = function(label)
    {
        this.label = label;
    };

    /**
     * Draws the edge
     */
    this.draw = function(svg, selected)
    {
        position1 = block1.linkPositionFor(io1);
        position2 = block2.linkPositionFor(io2);
        
        segment = new Segment(
                position1.x, position1.y, 
                position2.x-position1.x, position2.y-position1.y
                );

        var lineWidth = defaultSize*blocks.scale;

        if (selected) {
            var strokeStyle = 'rgba(0, 200, 0, 1)';
        } else {
            var strokeStyle = 'rgba(200, 200, 0, 1)';
        }
        svg.line(position1.x, position1.y, position2.x, position2.y, {
            stroke: strokeStyle, strokeWidth: lineWidth
        });
        
        var xM = ((position1.x+position2.x)/2.0);
        var yM = ((position1.y+position2.y)/2.0);
        var norm = Math.sqrt(Math.pow(position1.x-position2.x,2)+Math.pow(position1.y-position2.y,2));
        var alpha = 30;
        alpha = (alpha*Math.PI/180.0);
        var cos = Math.cos(alpha);
        var sin = Math.sin(alpha);
        var cosB = Math.cos(-alpha);
        var sinB = Math.sin(-alpha);

        // Drawing the arrow
        if (blocks.getOption('orientation', true)) {
            var xA = (position1.x-xM)*blocks.scale*10/(norm/2);
            var yA = (position1.y-yM)*blocks.scale*10/(norm/2);
            var lineWidth = defaultSize*blocks.scale/3.0;
            svg.line(xM, yM, xM+(xA*cos-yA*sin), yM+(yA*cos+xA*sin), {
                stroke: strokeStyle, strokeWidth: lineWidth
            });
            svg.line(xM, yM, xM+(xA*cosB-yA*sinB), yM+(yA*cosB+xA*sinB), {
                stroke: strokeStyle, strokeWidth: lineWidth
            });
        }

        if (this.label != null) {
            var fontSize = Math.round(defaultFontSize*blocks.scale);

            svg.text(xM-2*fontSize, yM+fontSize/3, this.label, {
                fontSize: fontSize+'px',
                fill: '#3a3b01',
                stroke: '#fff',
                strokeWidth: 2
            });
            svg.text(xM-2*fontSize, yM+fontSize/3, this.label, {
                fontSize: fontSize+'px',
                fill: '#3a3b01',
            });
        }
    };

    /**
     * Does the position collide the line ?
     */
    this.collide = function(x, y)
    {
        var dp = segment.distanceP({x: x, y: y});

        if (dp[0] >= 0 && dp[0] <= 1) {
            if (dp[1] < (defaultSize*blocks.scale)*2) {
                return dp[0];
            }
        }

        return false;
    };

    /**
     * Initializes the edge and do some tests
     */ 
    this.create = function()
    {
        // You can't link a block to itself
        if (block1 == block2) {
            throw 'You can\'t link a block to itself';
        }

        // You have to link an input with an output
        if (!blocks.getOption('canLinkInputs', false) && io1[0] == io2[0]) {
            throw 'You have to link an input with an output';
        }

        // The cards have to be okay
        if ((!block1.canLink(io1)) || (!block2.canLink(io2))) {
            throw 'Can\'t create such an edge because of the cardinalities';
        }

        block1.addEdge(io1, this);
        block2.addEdge(io2, this);
    };

    /**
     * Erase an edge
     */
    this.erase = function()
    {
        block1.eraseEdge(io1, this);
        block2.eraseEdge(io2, this);
    };

    /**
     * Test if this edge is the same than another
     */
    this.same = function(other)
    {
        if (block1 == other.block1 && block2 == other.block2 
                && io1 == other.io1 && io2 == other.io2) {
            return true;
        }
        
        if (block1 == other.block2 && block2 == other.block1
                && io1 == other.io2 && io2 == other.io1) {
            return true;
        }

        return false;
    };

    /**
     * Exports the edge to JSON
     */
    this.exportData = function()
    {
	return {
            id: this.id,
	    block1: block1.id,
	    io1: io1,
	    block2: block2.id,
	    io2: io2
	};
    };
};

/**
 * Imports JSON data into an edge
 */
function EdgeImport(blocks, data)
{
    if (!'id' in data) {
        throw "An edge does not have id";
    }

    var block1 = blocks.getBlockById(data.block1);
    var block2 = blocks.getBlockById(data.block2);

    if (!block1 || !block2) {
	throw "Error while importing an edge, a block did not exists";
    }

    return new Edge(data.id, block1, data.io1, block2, data.io2, blocks);
};
