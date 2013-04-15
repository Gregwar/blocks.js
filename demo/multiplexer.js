blocks.register({
    name: "Multiplexer",
    family: "Math",
    description: "The output is the nth input",
    parameters: [
        {
            name: "Inputs",
            type: "integer",
            default: 2,
            card: 0
        },
    ],
    inputs: [
        {
            name: "Address",
            type: "integer"
        },
        {
            name: "Input #",
            length: "Inputs.value"
        }
    ],
    outputs: [
        {
            name: "Output"
        }
    ]
});
