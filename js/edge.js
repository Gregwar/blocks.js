/**
 * An edge linking two blocks
 */
function Edge(block1, io1, block2, io2)
{
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

        context.lineWidth = 3;
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
        var size = 5;
        var dp = segment.distanceP({x: x, y: y});

        if (dp[0] >= 0 && dp[0] <= 1) {
            return dp[1] < size;
        }

        return false;
    };
};
