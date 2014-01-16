blocks.register({
    name: "Constant",
    family: "Math",
    description: "A simple input constant",
    fields: [
        {
            name: "Value",
            type: "number[]",
            default: [1,2,3],
            attrs: "editable output",
            dynamicLabel: function(block, x) {
                return block.getValue('value')[x];
            }
        }
    ]
});
