/**
* Define the namespace.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.init = function () {
	BOARDFUL.urlparam = BOARDFUL.ENGINE.parseUrl();
	BOARDFUL.ENGINE.getFilesInHtml();
};
