blocks.register({
    name: "Motor",
    family: "Output",
    parameters: [
        {
            name: "Name",
            type: "text",
        }
    ],
    inputs: [
        {
            card: "0-*",
            name: "Angle"
        },
        {
            card: "0-*",
            name: "Torque"
        }
    ]
});
