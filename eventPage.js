function getHiddenResults(){
    var fetchCompleted = new Boolean(false);
    chrome.storage.sync.get("hiddenResults", function(item){
	hiddenResults = item.hiddenResults;
	fetchCompleted = true;
    });

    while (!hiddenResults) {
	if (fetchCompleted) {
	    break;
	}
    }

    return hiddenResults;
}

function pushHiddenResult(id){
    chrome.storage.sync.get("hiddenResults", function(item){
	hiddenResults = item.hiddenResults;

	if (!hiddenResults) {
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
