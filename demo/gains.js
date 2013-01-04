blocks.register({
    name: "Gains",
    family: "Math",
    parameters: [
        {
            name: "Gains",
            hide: true,
            type: [
                {
                    name: "Gain",
                    type: "number",
                    default: [1]
                }
            ],
        },
    ],
    inputs: [
        {
            name: "Input #",
            length: "Gains[Gain]"
        }
    ],
    outputs: [
        {
            name: "Output #",
            length: "Gains[Gain]"
        }
    ],
    check: function(block) {
        for (k in block.outputs) {
            if (!block.inputs[k]) {
                return "The output "+k+" has no matching input";
            }

            if (!block.parameters.Gains[k]) {
                return "The output "+k+" has no gain value";
            }
        }
    }
});
