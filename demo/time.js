blocks.register({
    name: "Chrono",
    family: "Time",
    fields: [
        {
            name: "Factor",
            type: "number",
            defaultValue: 1.0,
            attrs: "editable input"
        },
        {
            card: "0-*",
            name: "Time",
            type: "number",
            defaultValue: 0,
            attrs: "editable output"
        }
    ]
});
