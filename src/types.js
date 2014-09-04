"use strict";

/**
 * Manage the types compatibility
 */
var Types = function()
{
    this.types = {};
    this.compatibles = {};
};

/**
 * Normalize types
 */
Types.normalize = function(type)
{
    type = type.toLowerCase();

    if (type == 'check' || type == 'bool' || type == 'checkbox') {
        type = 'bool';
    }

    if (type == 'integer') {
        type = 'int';
    }

    if (type == 'float' || type == 'double') {
        type = 'number';
    }

    if (type == 'text') {
        type = 'string';
    }

    if (type == 'select' || type == 'choices' || type == 'combobox') {
        type = 'choice';
    }

    if (type == 'textarea') {
        type = 'longtext';
    }

    if (type == '*') {
        type = 'any';
    }

    return type;
}

/**
 * Checks if a type is compatible with another
 */
Types.prototype.isCompatible = function(typeA, typeB)
{
    typeA = Types.normalize(typeA);
    typeB = Types.normalize(typeB);

    if (typeA == typeB || typeA == 'any' || typeB == 'any') {
        return true;
    }

    if (typeA in this.compatibles) {
        for (var k in this.compatibles[typeA]) {
            if (typeB == this.compatibles[typeA][k]) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Get all the compatible types
 */
Types.prototype.getCompatibles = function(type)
{
    type = Types.normalize(type);
    
    if (type == 'any') {
        return this.allTypes();
    }

    var compatibles = ['any', type];

    if (type in this.compatibles) {
        for (var k in this.compatibles[type]) {
            compatibles.push(this.compatibles[type][k]);
        }
    }

    return compatibles;
};

/**
 * Get all the types compatibles with
 */
Types.prototype.getBackCompatibles = function(type)
{
    type = Types.normalize(type);

    if (type == 'any') {
        return this.allTypes();
    }

    var compatibles = ['any', type];

    for (var some_type in this.compatibles) {
        for (var index in this.compatibles[some_type]) {
            if (this.compatibles[some_type][index] == type) {
                compatibles.push(some_type);
                break;
            }
        }
    }

    return compatibles;
};

/**
 * Get all the registered types
 */
Types.prototype.allTypes = function()
{
    return Object.keys(this.types);
};

/**
 * Add compatibility (one way)
 */
Types.prototype.addCompatibilityOneWay = function(typeA, typeB)
{
    typeA = Types.normalize(typeA);
    typeB = Types.normalize(typeB);

    if (!(typeA in this.compatibles)) {
        this.compatibles[typeA] = [];
    }

    this.compatibles[typeA].push(typeB);
};

/**
 * Add a types compatibility
 */
Types.prototype.addCompatibility = function(typeA, typeB)
{
    typeA = Types.normalize(typeA);
    typeB = Types.normalize(typeB);

    this.addCompatibilityOneWay(typeA, typeB);
    this.addCompatibilityOneWay(typeB, typeA);
};

/**
 * Register a type to the list
 */
Types.prototype.register = function(type)
{
    this.types[type] = true;
};  
