"use strict";
(function f(r,c){
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
		iscript.onload = function(){
			console.log(id+' script onload');
		}
		iscript.src = id+'.js';
		idoc.documentElement.appendChild(iscript);
	}
	document.documentElement.appendChild(iframe);
}

/*
function sleep15(x){x = new XMLHttpRequest();x.open('GET','0.0.0.0',false);x.send(null)}

console.log('iscript require('+val+')');
		//console.log('this',this);
		//console.log('compare require',require === window.top.require);
		console.log('check "'+val+'" in require',val in require);
		if(val in require){
			console.log('typeof', typeof require[val] );
			var t0 = window.performance.now();
			while( typeof require[val] === 'undefined' ){
				var t = window.performance.now();
				sleep15()
				console.log(window.performance.now()-t|0);
				if(window.performance.now()-t0>1000)break;
			}
			console.log('iscript return require('+val+') await '+(window.performance.now()-t0)+'ms');
			return require[val];
		}
*/


var require = {};
//console.log('require("'+r+'")');
if(r in require) return c();

var xhr	= new XMLHttpRequest();
xhr.open('GET', r+'.js', true);
xhr.onload = function (e) {//async parse
	if (xhr.status === 200) {
		var re = /require\(['"]?([^*|\:;"'<>?/]*)['"]?\)/g;
		var str = xhr.responseText;
		var txt;
		var back = function(){
			console.log(r,'deps:',back.total);
			if(!~--back.total)
				ModuleIframe(r,function(val){c&&c();f[r]=val});
		}
		back.total = 0;
		while(txt = re.exec(str)){
			console.log(r, 'require("'+txt[1]+'")')
			//str=str.slice(0,txt.index)+'require["'+txt[1]+'"]'+str.slice(txt.index+txt[0].length-str.length);
			back.total++;
			f(txt[1],back)
		}
		back();
	} else throw new Error(xhr)
};
xhr.send(null);
return r;
})([].filter.call(document.getElementsByTagName('script'),s=>s.src.slice(s.src.lastIndexOf('/')+1)=='clion.js')[0].getAttribute('data-main'))