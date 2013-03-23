blocks.register({
    name: "Chrono",
    family: "Time",
    parameters: [
        {
            name: "DeltaT",
            type: "number",
            default: 0.02
        }
    ],
    outputs: [
        {
            card: "0-*",
            name: "Time"
        }
    ]
});
