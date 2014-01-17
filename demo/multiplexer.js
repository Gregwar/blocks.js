blocks.register({
    name: "Multiplexer",
    family: "Math",
    description: "The output is the nth input",
    fields: [
        {
            name: "Inputs",
            type: "integer",
            defaultValue: 2,
            hide: true,
            attrs: "editable"
        },
        {
            name: "Address",
            type: "integer",
            attrs: "input",
            dynamicLabel: function(block) {
                return 'Address (1 to '+block.getValue('inputs')+')';
            }
        },
        {
            name: "input",
            label: "Input #",
            dimension: "Inputs",
            attrs: "input"
        },
        {
            name: "output",
            label: "Output",
            attrs: "output"
        }
    ]
});
