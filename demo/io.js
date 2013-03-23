blocks.register({
    name: "Output",
    family: "Output",
    description: "This is a standard output",
    parameters: [
        {
            name: "Index",
            type: "number",
            default: 0
        }
    ],
    inputs: [
        {
            card: "0-1",
            name: "Input"
        }
    ]
});
