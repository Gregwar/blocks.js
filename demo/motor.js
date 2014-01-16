blocks.register({
    name: "Motor",
    family: "Output",
    description: "This will be sent directly to the motor as goal direction and torque",
    fields: [
        {
            name: "Name",
            type: "text",
            asTitle: true,
            hideLabel: true,
            card: "0",
            attrs: "editable",
            default: "Motor"
        },
        {
            card: "0-1",
            name: "Angle",
            attrs: "input",
            type: "number"
        },
        {
            card: "0-1",
            name: "Torque",
            attrs: "input",
            type: "number"
        }
    ]
});
