blocks.register({
    name: "BlobDetect",
    family: "Image",
    description: "Blob detection",
    fields: [
        {
            name: "Threshold",
            type: "number",
            default: 0.2,
            attrs: "editable"
        },
        {
            name: "Image",
            type: "image",
            attrs: "input"
        },
        {
            name: "X",
            type: "number",
            attrs: "output"
        },
        {
            name: "Y",
            type: "number",
            attrs: "output"
        }
    ]
});
