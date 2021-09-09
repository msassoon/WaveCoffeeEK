/*

// Demo custom code
let customCode = (function ($){
	'use strict';
	
    $_gxpData.customDemoInit = function(){  // runs bofore platform.init() - to customize demo/widgets cfg
			// gxpTools.chatPreprocessor = function(oMessage){return oMessage};
    };

    $_gxpData.customPageInit = function(pageCfg){};  // runs after page change (for first page - before customDemoInit() )

	var _execute = function () {};  // runs after widgets activation

	return {
		execute: _execute
	};

})(jQuery);

$(document).on('widgets-activated', ()=> {
	customCode.execute();
});

*/






