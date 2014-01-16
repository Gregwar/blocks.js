blocks.register({
    name: "Gains",
    family: "Math",
    description: "Each <b>output[i]</b> will be <b>gain[i]*input[i]</b>",
    fields: [
        {
            name: "Gains",
            hide: true,
            type: "number[]",
            attrs: "editable",
            default: [1, 2]
        },
        {
            name: "input",
            prettyName: "Input #",
            dimension: "Gains",
            attrs: "input"
        },
        {
            name: "output",
            prettyName: "Output #",
            dimension: "Gains",
            attrs: "output"
        }
    ]
});
