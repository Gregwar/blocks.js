"use strict";

/**
 * Remove an item from an array
 */
function arrayRemove(array, index)
{
    index = parseInt(index);
    var last = array[array.length-1];
    array[array.length-1] = array[index];
    array[index] = last;
    array.pop();
};
