blocks.register({
    name: "Spline",
    family: "Math",
    description: "This is a spline",
    parametersEditor: function(parameters, setter) {
        var how = parameters['Data.Curves'].length;
        how = parseInt(prompt("How many curves?", how));
        var values = [];
        for (n=0; n<how; n++) {
            values.push(1);
        }
        parameters['Data.Curves'] = values;
        setter(parameters);
    },
    parameters: [
        {
            name: "Data",
            hide: true,
            type: [
                {
                    name: "Curves",
                    default: [1,2,3]
                }
            ]
        }
    ],
    inputs: [
        {
            card: "0-1",
            name: "Input #",
            length: "Data.Curves"
        }
    ],
    outputs: [
        {
            card: "0-1",
            name: "Output #",
            length: "Data.Curves"
        }
    ],
});
