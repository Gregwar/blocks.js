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
            type: [
                {
                    name: "Curves",
                    defaultValue: [1,2,3]
                }
            ],
            attrs: "editable"
        },
        {
            card: "0-1",
            name: "Input #",
            dimension: "Data.Curves",
            attrs: "intput"
        },
        {
            card: "0-1",
            name: "Output #",
            dimension: "Data.Curves",
            attrs: "output"
        }
    ],
});
