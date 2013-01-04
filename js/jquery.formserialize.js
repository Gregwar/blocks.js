$.fn.serializeForm = function()
{
   var o = {};
   var a = this.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};

$.fn.unserializeForm = function(data)
{
    var setValue = function(input, value) {
        if (input.attr('type') == 'checkbox') {
            value = !!value;
            input.attr('checked', value);
        } else {
            input.val(value);
        }
    };

    for (key in data) {
        var value = data[key];
        var input = $('*[name="'+key+'"]');

        if (value instanceof Array) {
            for (k in value) {
                setValue($(input[k]), value[k]);
            }
        } else {
            setValue(input, value);
        }
    }
};
