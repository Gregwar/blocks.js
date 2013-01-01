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
            units: "Hz",
            default: 1
        },
        {
            name: "Phase",
            type: "number",
            units: "°",
            default: 0
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
            card: "0-*",
            name: "Wave"
        }
    ]
});
