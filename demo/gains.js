blocks.register({
    name: "Gains",
    family: "Math",
    description: "Each <b>output[i]</b> will be <b>gain[i]*input[i]</b>",
    fields: [
        {
            name: "Gains",
            hide: true,
            type: "number[]",
            attrs: "editable input"
        },
        {
            name: "Input #",
            length: "Gains.length",
            attrs: "input"
        },
        {
            name: "Output #",
            length: "Gains.length",
            attrs: "output"
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
