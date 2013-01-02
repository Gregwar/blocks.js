/**
 * An edge linking two blocks
 */
function Edge(block1, io1, block2, io2, blocks)
{
    var defaultSize = 3;
    var position1 = block1.linkPositionFor(io1);
    var position2 = block2.linkPositionFor(io2);
    var segment = new Segment(
            position1.x, position1.y, 
            position2.x-position1.x, position2.y-position1.y
    );

    /**
     * Draws the edge
     */
    this.draw = function(context, selected)
    {
        position1 = block1.linkPositionFor(io1);
        position2 = block2.linkPositionFor(io2);
        
        segment = new Segment(
                position1.x, position1.y, 
                position2.x-position1.x, position2.y-position1.y
                );

        context.lineWidth = defaultSize*blocks.scale;

        if (selected) {
            context.strokeStyle = 'rgba(200, 200, 0, 1)';
        } else {
            context.strokeStyle = 'rgba(0, 0, 0, 1)';
        }
        context.beginPath();
        context.moveTo(position1.x, position1.y);
        context.lineTo(position2.x, position2.y);
        context.stroke();
    };

    /**
     * Does the position collide the line ?
     */
    this.collide = function(x, y)
    {
        var dp = segment.distanceP({x: x, y: y});

        if (dp[0] >= 0 && dp[0] <= 1) {
            return dp[1] < (defaultSize*blocks.scale)*1.3;
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
        if (io1[0] == io2[0]) {
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
};
