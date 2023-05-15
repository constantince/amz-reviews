document.addEventListener('DOMContentLoaded', initialization);

// const URLs = window.location.href;
 // 界面数据保存成功之后的回调函数
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
   
    if (message.type === 'ajax') {
        if(message.content === "ok") { // 数据load 成功
            
            chrome.storage.sync.get(['collections'], function (items) {
                var new_collections = items.collections || [];
                new_collections.push(URLs);
                chrome.storage.sync.set({ collections: new_collections }, function (items) {
                    $(".ai-amz-init-btn").html("Done");
                })
            })
        } else { // 数据load失败
            $(".ai-amz-init-btn").html("Load")[0].disabled = false;
        }
    }
  });
  

// http send 
function sendDataToServer(type = "comments", data = {}) {
    return fetch( "https://www.amamiya.cc/amz/api/" + type, 
    {    
        method: 'post',
        body: JSON.stringify(data),
        headers: {
        'Content-Type': 'application/json'
    }
        
    }).then(function(response) { return response.json() }).catch(function(ex) { return {error: ex}})
}



var Collector, Creator = null;
// inti function
function initialization() {
    const pattern = /https?:\/\/(www\.)?amazon\.[a-z]{2,}\/[^\/]+(dp|gp\/product)?\/.+$/;
    if (!pattern.test(URLs)) {
        console.error("Not in the relevant product page")
        return;
    }
    ASIN = URLs.match(/\/(dp|gp\/product)\/(\w{10})/)[2];
	// code excute here;
    console.log("dom loaded")

    // const itemDescListBox = $("#prodDetails .prodDetSectionEntry");
    // console.log(itemDescListBox);

    // domInit();
    Collector = new ContentCollector();
    Creator = new DomCreator();
}


