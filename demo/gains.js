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
            default: [1]
        },
        {
            name: "Input #",
            length: "Gains",
            attrs: "input"
        },
        {
            name: "Output #",
            length: "Gains",
            attrs: "output"
        }
    ]
});
