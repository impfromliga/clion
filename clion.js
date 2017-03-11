"use strict";
var require = {};
(function f(r,c){
	console.log('require("'+r+'")');
	if(r in require) return c();
	
	var xhr	= new XMLHttpRequest();
	xhr.open('GET', r+'.js', true);
	xhr.onload = function (e) {
		if (xhr.readyState === 4)
			if (xhr.status === 200) {
				var re = /require\(['"]?([^*|\:;"'<>?/]*)['"]?\)/g;
				var str = xhr.responseText;
				var txt;
				var back = function(){
					if(--back.total)return;
					str=str.replace('module.exports','require["'+r+'"]');
					var scr = document.createElement('script');
					scr.innerHTML='(function(){'+str+'})();';
					console.log(r,"loaded");
					document.documentElement.appendChild(scr);
					c&&c();
				}
				back.total = 1;
				while(txt = re.exec(str)){
					str=str.slice(0,txt.index)+'require["'+txt[1]+'"]'+
						str.slice(txt.index+txt[0].length-str.length);
					back.total++;
					f(txt[1],back)
				}
				back();
			} else throw new Error(xhr)
	};
	xhr.send(null);
	return r;
})([].filter.call(document.getElementsByTagName('script'),s=>s.src.slice(s.src.lastIndexOf('/')+1)=='clion.js')[0].getAttribute('data-main'))