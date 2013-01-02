blocks.register({
    name: "Gains",
    family: "Math",
    parameters: [
        {
            name: "Gains",
            type: [
                {
                    name: "Gain",
                    type: "number"
                }
            ],
            default: [1]
        },
    ],
    inputs: [
        {
            variadic: true,
            name: "Value #"
        }
    ],
    outputs: [
        {
            variadic: true,
            name: "Output #",
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
