// ==UserScript==
// @name archified
// @namespace http://www.archify.com
// @description adds new features to archify
// @match http://archify.com/*
// @match https://archify.com/*
// @match http://www.archify.com/*
// @match https://www.archify.com/*
// ==/UserScript==

////////////////////////////////////////////////////////////////////////////////
// Load libraries
////////////////////////////////////////////////////////////////////////////////

var libraries = new Array();

var loadedLibraries = document.createElement('script');
loadedLibraries.textContent = "var loadedLibrariesList = new Array();"

libraries.push('//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js');
libraries.push('//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.2/jquery.cookie.min.js');

for (var i = 0; i < libraries.length; i++) {
    loadedLibraries.textContent = loadedLibraries.textContent + "loadedLibrariesList.push(false);";
}

for (var i = 0; i < libraries.length; i++) {
    var scriptToAdd = document.createElement('script');
    scriptToAdd.src = libraries[i];
    scriptToAdd.addEventListener('load', function(){
	loadedScript = document.createElement('script');
	loadedScript.textContent = "loadedLibrariesList.shift(); loadedLibrariesList.push(true);";
	document.getElementsByTagName('head')[0].appendChild(loadedScript);
    });

    document.getElementsByTagName('head')[0].appendChild(scriptToAdd);
}

document.getElementsByTagName('head')[0].appendChild(loadedLibraries);

function checkLibraries(){
    for (var i = 0; i < loadedLibrariesList.length; i++) {
	if (loadedLibrariesList[i] == false) {
	    return;
	}
    }

    window.jQ = jQuery.noConflict();
    window.clearInterval(checkLibrariesInterval);
    readyToInit = true;
}

////////////////////////////////////////////////////////////////////////////////
// UserScript Functions
////////////////////////////////////////////////////////////////////////////////

function hideResult(resultId){
    var result = jQ("#" + resultId + "");
    result.find('section').first().css('display', 'none');
    result.find('nav').first().css('display', 'none');
    result.find('article').first().find('h3').first().find('a').css('color', '#D7D7D7');

    window.postMessage({ request : "hideResult", id : resultId }, "*");
}

function showResult(resultId){
}

function main(){
    // Add hide onclick function
    jQ("ol#resultset").find("li[id^=div]").each(function(index){
	jQ(this).find('ul.options').append("<li><a href=\"#\" onclick=\"hideResult('" + jQ(this).attr("id") + "');\"><i class=\"icon-remove\"><\/i>Hide<\/a></li>");
    });
}

function init(){
    if (!readyToInit) {
	return;
    }

    // Enable messaging
    window.addEventListener("message", function(event){
	if (event.source != window) {
	    return;
	}
	
	if (event.data.type) {
	    if (event.data.type == "hiddenResults") {
		hiddenResults = event.data.content;

		for (var i = 0; i < hiddenResults.length; i++) {
		    hideResult(hiddenResults[i]);
		}
	    }
	}
    });
    
    window.postMessage({ request : "hiddenResults" }, "*");

    // It's hard to tell when all ajax functions are completed,
    // therefore, we check for when there are a certain number
    // of results present.
    jQ(document).ready(function(){
	if (jQ("ol#resultset").find("li[id^=div]").length == 18) {
	    window.clearInterval(initAttempt);
	    main();
	}
    });
}

////////////////////////////////////////////////////////////////////////////////
// Load Functions
////////////////////////////////////////////////////////////////////////////////

function loadFunctions(){
    var userFunctions = new Array();
    userFunctions.push(checkLibraries);
    userFunctions.push(init);
    userFunctions.push(main);
    userFunctions.push(hideResult);

    var userScript = document.createElement('script');
    var userScriptContent = "";

    for (var i = 0; i < userFunctions.length; i++) {
	userScriptContent = userScriptContent + userFunctions[i].toString();
    }

    var globals = "";
    globals = globals + "var hiddenResults;";

    var boot = "";
    boot = boot + globals;
    boot = boot + "var readyToInit = new Boolean(false);";
    boot = boot + "var checkLibrariesInterval = setInterval(checkLibraries, 10);";
    boot = boot + "var initAttempt = setInterval(init, 500);"

    userScript.textContent = userScriptContent + boot;
    document.getElementsByTagName('head')[0].appendChild(userScript);
}

loadFunctions();

////////////////////////////////////////////////////////////////////////////////
// Messaging
////////////////////////////////////////////////////////////////////////////////

window.addEventListener("message", function(event){
    if (event.source != window) {
	return;
    }

    if (event.data.request) {
	if (event.data.request == "hiddenResults") {
	    chrome.extension.sendMessage({ request : "hiddenResults" }, function(response){
		window.postMessage({ type : "hiddenResults", content : response }, "*");
	    });
	} else if (event.data.request == "hideResult") {
	    chrome.extension.sendMessage({ request : "hideResult", id : event.data.id });
	}
    }
});
