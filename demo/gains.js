blocks.register({
    name: "Gains",
    family: "Math",
    description: "Each <b>output[i]</b> will be <b>gain[i]*input[i]</b>",
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
            length: "Gains.length"
        }
    ],
    outputs: [
        {
            name: "Output #",
            length: "Gains.length"
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
