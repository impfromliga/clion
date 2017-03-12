"use strict";
(function f(r,c){
var require = {};
if(r in require) return c();
	
function ModuleIframe(id,back){
	console.log(r,"module onload");
	var iframe = document.createElement('iframe');
	iframe.style.display='none';
	iframe.onload = function(){
		console.log(id+' iframe onload');
		var iwin = iframe.contentWindow;
		iwin.require = function(id){return f[id]}
		iwin.module = {};
		Object.defineProperty(iwin.module,'exports',{
			set: function(val){
				console.log(id,'exports',val);
				back(val);
			}
		});
		var idoc = iwin.document;
		var iscript = idoc.createElement('script');
		iscript.onload = function(){console.log(id+' script onload');}
		iscript.src = id+'.js';
		idoc.documentElement.appendChild(iscript);
	}
	document.documentElement.appendChild(iframe);
}

var xhr	= new XMLHttpRequest();
xhr.open('GET', r+'.js', true);
xhr.onload = function (e) {//async parse
	if (xhr.status === 200) {
		var back = function(){
			console.log(r,'deps:',back.total);
			if(!~--back.total)
				ModuleIframe(r,function(val){c&&c();f[r]=val});
		}
		back.total = 0;
		var re = /require\(['"]?([^*|\:;"'<>?/]*)['"]?\)/g;
		var str = xhr.responseText;
		var txt;
		while(txt = re.exec(str)){
			console.log(r, 'require("'+txt[1]+'")')
			back.total++;
			f(txt[1],back)
		}
		back();
	} else throw new Error(xhr)
};
xhr.send(null);
return r;
})([].filter.call(document.getElementsByTagName('script'),s=>s.src.slice(s.src.lastIndexOf('/')+1)=='clion.js')[0].getAttribute('data-main'))