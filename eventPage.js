function getHiddenResults(){
    chrome.storage.sync.get("hiddenResults", function(item){
	hiddenResults = item.hiddenResults;
    });

    while (!hiddenResults) {}

    return hiddenResults;
}

function pushHiddenResult(id){
    chrome.storage.sync.get("hiddenResults", function(item){
	if (Object.prototype.toString.call( item.hiddenResults ) === '[object Array]') {
	    hiddenResults = item.hiddenResults;
	} else {
	    var hiddenResults = new Array;
	}

	hiddenResults.push("" + id + "");
	chrome.storage.sync.set({ "hiddenResults" : hiddenResults });
    });
}

chrome.extension.onMessage.addListener(
    function(data, sender, sendResponse){
	if (data.request) {
	    if (data.request == "hiddenResults") {
		sendResponse(getHiddenResults());
	    } else if (data.request == "hideResult") {
		pushHiddenResult(data.id);
	    }
	}
    });
