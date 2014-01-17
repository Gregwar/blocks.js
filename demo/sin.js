blocks.register({
    name: "Sinus",
    family: "Math",
    description: "Outputs <b>sin(T+phase)*amplitude</b>",
    fields: [
        {
            name: "Amplitude",
            type: "number",
            defaultValue: 1,
            attrs: "editable input"
        },
        {
            name: "Frequency",
            type: "number",
            unit: "Hz",
            defaultValue: 10,
            attrs: "editable input"
        },
        {
            name: "Phase",
            type: "number",
            unit: "°",
            defaultValue: 0,
            attrs: "editable input"
        },
        {
            name: "Invert",
            type: "bool",
            defaultValue: false,
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
