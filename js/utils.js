/**
 * Remove an item from an array
 */
function arrayRemove(array, index)
{
    var rest = array.slice(index +1);
    array.length = index;
    return array.push.apply(array, rest);
};
