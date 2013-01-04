blocks.register({
    name: "Chrono",
    family: "Time",
    parameters: [
        {
            name: "Factor",
            type: "number",
            default: 1
        }
    ],
    outputs: [
        {
            card: "0-*",
            name: "Time"
        }
    ]
});
