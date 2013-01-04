blocks.register({
    name: "Motor",
    family: "Output",
    description: "This will be sent directly to the motor as goal direction and torque",
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
