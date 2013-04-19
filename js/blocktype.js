/**
 * Manage one block type
 */
BlockType = function(type)
{
    var self = this;

    this.name = type.name;

    this.loopable = ('loopable' in type && type['loopable']);

    // Checking for parameters, inputs and outputs
    var keys = ['parametersEditor', 'parameters', 'inputs', 'outputs'];

    for (k in keys) {
        var key = keys[k];
        if (type[key] != undefined) {
            this[key] = type[key];
        } else {
            this[key] = [];
        }
    }

    // Checking the family
    if (type.family == undefined) {
        this.family = ''; // Root family
    } else {
        this.family = type.family;
    }

    // Style
    if (type['class'] != undefined) {
        this['class'] = type['class'];
    } else {
        this['class'] = '';
    }

    // Description
    this.description = null;
    if (type.description != undefined) {
        this.description = type.description;
    }
}

