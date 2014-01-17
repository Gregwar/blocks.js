blocks.register({
    name: "Output",
    family: "Output",
    description: "This is a standard output",
    fields: [
        {
            name: "Index",
            type: "number",
            defaultValue: 0,
            attrs: "editable inpût"
        },
        {
            card: "0-1",
            name: "Input",
            attrs: "input"
        }
    ]
});
