blocks.register({
    name: "Multiplexer",
    family: "Math",
    description: "The output is the nth input",
    fields: [
        {
            name: "Inputs",
            type: "integer",
            default: 2,
            attrs: "editable"
        },
        {
            name: "Address",
            type: "integer",
            attrs: "input"
        },
        {
            name: "Input #",
            length: "Inputs.value",
            attrs: "input"
        },
        {
            name: "Output",
            attrs: "output"
        }
    ]
});
