/*
 * jQuick 1.3.6 - 29 september 2007 - http://jquick.sullof.com
 * Copyright (c) 2007 Francesco Sullo
 * Dual licensed under the MIT (MIT-LICENSE.txt) 
 * and GPL (GPL-LICENSE.txt) licenses.
 * jQuick requires jQuery (http://www.jquery.com)
 * Inspired by DOM Creation by Michael Geary (http://mg.to)
 */
 
 
 
 

jQuery.fn.extend({

	jQuickAttr: function (attr,tag) {
		if (document.all) {
			// fix events in IE if passed as attributes
			var ev = "blur change click dblclick error focus keydown keypress keyup load mousedown mousemove mouseout mouseover mouseup resize scroll select submit unload ";
			var re = new RegExp("^on","i");
			for (var k in attr) {
				try {
					if (re.test(k)) {
						var e = k.toLowerCase().substring(2);
						if (ev.indexOf(e) != -1) {
							eval("jQuery.mom = function () { "+attr[k]+"; }");
							this.bind(e,jQuery.mom);
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
		var n = navigator.userAgent;
		if (jQuery.browser.safari && !/version\/3/i.test(navigator.userAgent) && tag == 'LABEL') {
			// add LABEL support in Safari 2
			for (var j in attr) {
				if (j.toLowerCase()=='for') {
					this.bind("click", function () {
						var input = jQuery("#"+attr[j]);
						switch (input.attr("type")) {
							case "checkbox":
							case "radio":
								input[0].click();
								break;
							default:
								input[0].focus();
						}					  
					});
					break;
				}
			}
		}
	},
	
	jQuickAppend: function (a) {
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


(function() {
	var ok = "BLOCKQUOTE<BR<BUTTON<CAPTION<COLGROUP<DD<DIV<DL<DT<EMBED<FIELDSET<HR<INPUT<LEGEND<LI<META<OBJECT<OL<OPTGROUP<OPTION<P<PARAM<PRE<SELECT<TABLE<TBODY<TD<TFOOT<TH<THEAD<TR<UL";
	var ex = "<A<ABBR<ACRONYM<ADDRESS<B<BASE<BDO<BIG<CITE<CODE<COL<DEL<DFN<EM<FONT<FORM<H1<H2<H3<H4<H5<H6<H7<I<IFRAME<IMG<INS<KBD<LABEL<LINK<MAP<Q<SAMP<SMALL<SPAN<STRONG<STYLE<SUB<SUP<TEXTAREA<TITLE<TT<VAR<";
    var t = (ok+ex).split("<");
	for (var j=0;j<t.length;j++) {
		if (t[j]) eval(
			 "jQuery."+t[j]+" = function() { return (function (args) {var attr = args[0]||{};var z = typeof attr == 'string' || typeof attr== 'number' ? 0: 1; var str = '<"+t[j].toLowerCase()+"';"+
			 //fix readonly input type, readonly iframe name, readonly link (in IE)
			(t[j]=='INPUT' ? "if (z) for (var j in attr) if (j.toLowerCase()=='type') { if (attr[j]) str+=' type=\"'+attr[j]+'\"'; delete attr[j]; break; }":"")+
			(t[j]=='IFRAME' ? "if (z) for (var j in attr) if (j.toLowerCase()=='name') { if (attr[j]) str+=' name=\"'+attr[j]+'\"'; delete attr[j]; break; }":"")+
			(t[j]=='LINK' && $.browser.msie ? "if (z) for (var j in attr) { str+=' '+j.toLowerCase()+'=\"'+attr[j]+'\"'; } attr=[];":"")+
			"str+=" +
			(document.all && ex.indexOf("<"+t[j]+"<") > -1 ? "'></"+t[j].toLowerCase() : "'/") + // for fix in IE with jQuery 1.1.4
			">';var n = jQuery(str); if (z) n.jQuickAttr(attr,'"+t[j]+"'); for (var i=z;i<args.length;i++) { var a = args[i]; if (!a) continue; if (a.constructor != Array) n.jQuickAppend(a); else for (var k=0;k<a.length;k++) n.jQuickAppend(a[k]); } return n;})(arguments); }"
		)
	}
})();

