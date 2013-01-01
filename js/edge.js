/**
 * An edge linking two blocks
 */
function Edge(block1, io1, block2, io2)
{
    var position1 = block1.linkPositionFor(io1);
    var position2 = block2.linkPositionFor(io2);
    this.segment = new Segment(position1.x, position1.y, position2.x-position1.x, position2.y-position1.y);

    /**
     * Draws the edge
     */
    this.draw = function(context)
    {
        context.lineWidth = 3;
        context.strokeStyle = 'rgba(0, 0, 0, 1)';
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

        if (x < Math.min(position1.x, position2.x)-5) {
            return false;
        }
        if (x > Math.max(position1.x, position2.x)-5) {
            return false;
        }
        if (y < Math.min(position1.y, position2.y)-5) {
            return false;
        }
        if (y > Math.max(position1.y, position2.y)-5) {
            return false;
        }


        return false;
    };
};
