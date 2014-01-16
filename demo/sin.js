blocks.register({
    name: "Sinus",
    family: "Math",
    description: "Outputs <b>sin(T+phase)*amplitude</b>",
    fields: [
        {
            name: "Amplitude",
            type: "number",
            default: 1,
            attrs: "editable input"
        },
        {
            name: "Frequency",
            type: "number",
            unit: "Hz",
            default: 10,
            attrs: "editable input"
        },
        {
            name: "Phase",
            type: "number",
            unit: "°",
            default: 0,
            attrs: "editable input"
        },
        {
            name: "Invert",
            type: "bool",
            default: false,
            attrs: "editable input"
        },
        {
            card: "1",
            name: "T",
            attrs: "input"
        },
        {
            name: "Wave",
            attrs: "output",
            type: "number"
        }
    ]
});
