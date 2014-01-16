blocks.register({
    name: "Chrono",
    family: "Time",
    fields: [
        {
            name: "Factor",
            type: "number",
            default: 1.0,
            attrs: "editable input"
        },
        {
            card: "0-*",
            name: "Time",
            type: "number",
            default: 0,
            attrs: "editable output"
        }
    ]
});
