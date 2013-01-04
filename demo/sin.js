blocks.register({
    name: "Sinus",
    family: "Math",
    parameters: [
        {
            name: "Amplitude",
            type: "number",
            default: 1
        },
        {
            name: "Frequency",
            type: "number",
            unit: "Hz",
            default: 10
        },
        {
            name: "Phase",
            type: "number",
            unit: "°",
            default: 0
        },
        {
            name: "Invert",
            type: "bool",
            default: false
        }
    ],
    inputs: [
        {
            card: "1",
            name: "T"
        }
    ],
    outputs: [
        {
            name: "Wave"
        }
    ]
});
