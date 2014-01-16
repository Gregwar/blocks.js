blocks.register({
    name: "Camera",
    family: "Devices",
    description: "A camera",
    fields: [
        {
            name: "Resolution",
            type: "select",
            choices: ["640x480","320x240"],
            default: "640x480",
            attrs: "editable"
        },
        {
            name: "Image",
            type: "image",
            attrs: "output"
        }
    ]
});
