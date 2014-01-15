blocks.register({
    name: "Chrono",
    family: "Time",
    fields: [
        {
            name: "DeltaT",
            type: "number",
            default: 0.02,
            attrs: "editable input"
        },
        {
            card: "0-*",
            name: "Time",
            type: "number",
            attrs: "editable output"
        }
    ]
});
