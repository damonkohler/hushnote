/*

Q 1.0 for jQuery - 20 maj 2008 - http://www.sullof.com
(it substitutes jQuick adding Adobe AIR compatibility)

Copyright (c) 2008 Francesco Sullo
Dual licensed under the MIT (MIT-LICENSE.txt) 
and GPL (GPL-LICENSE.txt) licenses.

*/

	
jQuery.fn.extend({	
	
	Qattr: function (attr,tag) {
		if (document.all) {
			// fix events in IE if passed as attributes
			var ev = "blur change click dblclick error focus keydown keypress keyup load mousedown mousemove mouseout mouseover mouseup resize scroll select submit unload ";
			var re = new RegExp("^on","i");
			for (var k in attr) {
				try {
					if (re.test(k)) {
						var e = k.toLowerCase().substring(2);
						if (ev.indexOf(e) != -1) {
//							eval("jQuery.mom = function () { "+attr[k]+"; }");
							this.bind(e,function () { attr[k]() });
						}
						else this.attr(k,attr[k]);
					}
					else this.attr(k,attr[k]);
				}
				catch (e) { 
					this.attr(k,attr[k]);
				}
			}
		}
		else this.attr(attr);
	},
	
	Qappend: function (a) {
		if (typeof a == 'object') this.append(a);
		else {
			if (/</.test(a)) {
				var x;
				if (/^[^<]+</.test(a)) {
					x = a.split("<")[0];
					this.append(document.createTextNode(x));
				}
				x = a.replace(/^[^<]*/,'').replace(/>[^>]*$/,'');
				this.append(x);
				if (/>[^>]+$/.test(a)) {
					x = a.replace(/.*>([^>]*)$/,'$1');
					this.append(document.createTextNode(x));
				}
			}
			else this.append(document.createTextNode(a));
		}
	}
});



Q = function () {
	var tag = arguments[0].toLowerCase();
	var ex = "<a<abbr<acronym<address<b<base<bdo<big<cite<code<col<del<dfn<em<font<form<h1<h2<h3<h4<h5<h6<h7<i<iframe<img<ins<kbd<label<link<map<q<samp<small<span<strong<style<sub<sup<textarea<title<tt<var<";
	var attr = arguments[1]||{};
	var z = typeof attr == 'string' || typeof attr== 'number' ? 0: 1;
	var str = '<'+tag;
//fix readonly input type and readonly iframe name																									
	if (tag=='input') {
		 if (z)
		 	for (var j in attr)
			 	if (j.toLowerCase()=='type') {
				 	if (attr[j]) str += ' type="' + attr[j]+'"';
					delete attr[j];
					break;
				}
	}
	if (tag=='iframe'){
		if (z)
			for (var j in attr)
				if (j.toLowerCase()=='name') {
					if (attr[j]) str+=' name="'+attr[j]+'"';
					delete attr[j];
					break;
				}
	}
	// for fix in IE with jQuery 1.1.4
	str += (document.all && ex.indexOf("<"+tag+"<") > -1 ? "></"+tag.toLowerCase() : "/") + ">";
	var n = jQuery(str);
	if (z) n.Qattr(attr,tag);
	for (var i=z+1;i<arguments.length;i++) {
		var a = arguments[i];
		if (!a) continue;
		if (a.constructor != Array) n.Qappend(a);
		else for (var k=0;k<a.length;k++) n.Qappend(a[k]);
	}
	return n;
};
