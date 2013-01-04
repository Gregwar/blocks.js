blocks.register({
    name: "Constant",
    parameters: [
        {
            name: "Value",
            type: "number",
            default: 0
        }
    ],
    outputs: [
        {
            card: "0-*",
            name: "Value"
        }
    ]
});
