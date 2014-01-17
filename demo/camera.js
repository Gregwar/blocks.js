blocks.register({
    name: "Camera",
    family: "Image",
    description: "A camera",
    fields: [
        {
            name: "Resolution",
            type: "resolution",
            choices: ["640x480","320x240"],
            defaultValue: "640x480",
            attrs: "editable"
        },
        {
            name: "Image",
            type: "image",
            attrs: "output"
        }
    ]
});
