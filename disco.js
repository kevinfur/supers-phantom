var page = require('webpage').create();

function getProductsFromCurrentPage(){
	var cantProductosEnPagina = page.evaluate(function() {
	    return $(".filaListaDetalle").length;
	});
	for (var j=0; j<cantProductosEnPagina;j++){	
		var nombre = page.evaluate(function(indice) {
		    return $(".link-lista2", $(".filaListaDetalle")[indice]).text().replace(/(?:\r\n|\r|\n)/g, '');
		}, j);
		var precio = page.evaluate(function(indice) {
			var n = $($(".filaListaDetalle")[indice]).text();
		    return n.substring(n.lastIndexOf('$'), n.length).substring(0, n.indexOf(' ')).replace(/	/g,'').replace(/(?:\r\n|\r|\n)/g, '');
		}, j);	
		console.log("Nombre: " + nombre + " | Precio: " + precio);
	}		
}

function isNextLinkEnabled(){
	return page.evaluate(function() {
	    return $('a:contains(">>")').length > 0;
	});	
}

page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    // uncomment to log into the console 
    // console.error(msgStack.join('\n'));
};

console.log(new Date().toString());

console.log("Abro pagina");
page.open('https://www3.discovirtual.com.ar/Login/PreHome.aspx');

console.log("Espero que cargue");
do { phantom.page.sendEvent('mousemove'); } while (page.loading);

console.log("Click entrar invitado");
page.evaluate(function() {$("img[name='invitado']").click()});

console.log("Espero que cargue");
do { phantom.page.sendEvent('mousemove'); } while (page.loading);

/*
var categories = page.evaluate(function() {
	return document.querySelectorAll("#divGrupo1 .tM");
});
var cat = categories[0];
*/

//Obtengo links de todas las gondolas
var links = page.evaluate(function() {
    return [].map.call(document.querySelectorAll("a[href^='javascript:VerGon']"), function(link) {
        return link.getAttribute('href');
    });
});
//console.log(links.join('\n'));

// HTML del primer producto
var resultadoCategoria = page.evaluate(function() {
    return $($(".filaListaDetalle")[0]).text().replace(/	/g,'').replace(/(?:\r\n|\r|\n)/g, '');
});

if (links){
	for (var i=0; i<links.length;i++){	
		//console.log(links[i]);

		// Click del link, si no obtengo el link de nuevo no funca
		page.evaluate(function(l) {
			//window.location.href=links[i]

			var linkPart = l.substring(0,l.indexOf("'"));

			var element = [].map.call(document.querySelectorAll("a[href^='"+linkPart+"']"), function(link) {
		        return link;
		    })[0];
 
		    // create a mouse click event
		    var event = document.createEvent( 'MouseEvents' );
		    event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );
		 
		    // send click to element
		    element.dispatchEvent( event );		

		}, links[i]);

		// Espero que carguen los resultados		
		do { phantom.page.sendEvent('mousemove');  } while (
			page.evaluate(function() {return $("#ctl00_hlLogoDiscoVirtual img").attr("src") == "https://www3.discovirtual.com.ar/_Imgs/logo_home_animado.gif" }) 
			||
			page.evaluate(function(str) {return $($(".filaListaDetalle")[0]).text().replace(/	/g,'').replace(/(?:\r\n|\r|\n)/g, '') == str}, resultadoCategoria)
		);
		resultadoCategoria = page.evaluate(function() {
		    return $($(".filaListaDetalle")[0]).text().replace(/	/g,'').replace(/(?:\r\n|\r|\n)/g, '');
		});

		// Hace click al next hasta que no aparezca mas habilitado
		getProductsFromCurrentPage();
		while (isNextLinkEnabled()){
			page.evaluate(function() {
			    $('a:contains(">>")')[0].click();
			});

			// Espero que carguen los resultados		
			do { phantom.page.sendEvent('mousemove');  } while (
				page.evaluate(function() {return $("#ctl00_hlLogoDiscoVirtual img").attr("src") == "https://www3.discovirtual.com.ar/_Imgs/logo_home_animado.gif" }) 
				||
				page.evaluate(function(str) {return $($(".filaListaDetalle")[0]).text().replace(/	/g,'').replace(/(?:\r\n|\r|\n)/g, '') == str}, resultadoCategoria)
			);
			resultadoCategoria = page.evaluate(function() {
			    return $($(".filaListaDetalle")[0]).text().replace(/	/g,'').replace(/(?:\r\n|\r|\n)/g, '');
			});

			getProductsFromCurrentPage();
		}		

	}
}else {
	console.log("links es null");
}

console.log(new Date().toString());
phantom.exit();


