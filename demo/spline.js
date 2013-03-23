blocks.register({
    name: "Spline",
    family: "Math",
    description: "This is a spline",
    parametersEditor: function(parameters, setter) {
        var v = prompt("Entrez une nouvelle valeur", parameters.Data);
        parameters.Data = v;
        setter(parameters);
    },
    parameters: [
        {
            name: "Data",
            default: "Default data"
        }
    ],
    inputs: [
        {
            card: "0-1",
            name: "Input"
        }
    ],
    outputs: [
        {
            card: "0-1",
            name: "Output"
        }
    ],
});
