(function(){
    function include(file) {
        $('head').append('<script type="text/javascript" src="demo/'+file+'"></script>');
    }

    blocks = new Blocks;
    include('sin.js');
    include('gains.js');
    include('const.js');
    blocks.run('#blocks');
})();
