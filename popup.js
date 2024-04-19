async function getstatus(){
    return chrome.storage.local.get(["status"])
}
function setstatus(status){
    chrome.storage.local.set({"status": status})
}
async function injectionpromise(element){
    const maPromesse = new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
            let tab = tabs[0];
            chrome.tabs.update(tab.id, {url: "https://www.pinterest.fr/search/pins/?q="+element+"&rs=typed"});
            chrome.tabs.onUpdated.addListener(async function listener(tabId, changeInfo) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    let donndata = await chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        func: injectScript,
                        args : [ element ]
                    })
                    resolve(donndata);
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            });
        });
    })
    return maPromesse
}
function downloadJSONAsCSV(jsonData, filename) {
    let csvData = jsonToCsv(jsonData);
    let blob = new Blob([csvData], { type: 'text/csv' });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = filename+'.csv';
    document.body.appendChild(a);
    a.click();
}
function jsonToCsv(jsonData) {
    let csv = '';
    let headers = ["imageURL", "pageURL"];
    csv += headers.join(',') + '\n';
    for (let index = 0; index < jsonData.length; index++) {
        const element = jsonData[index];
        let data = [element.image, element.url].join(',')
        csv += data + '\n';
    }
    return csv;
}
function injectScript(cle) {
    const maPromesse = new Promise((resolve, reject) => {
        setTimeout(async () => {
            var dataexistant = await chrome.storage.local.get(["tempdata" + cle])
            console.log(dataexistant)
            var listurlimage = []
            var srcappingdata = []
            if(dataexistant){
                dataexistant = dataexistant["tempdata" + cle]
                if(dataexistant){
                    for (let index = 0; index < dataexistant.length; index++) {
                        const element = dataexistant[index];
                        listurlimage.push(element.image)
                        srcappingdata.push(element)
                        
                    }
                }
                
            }
            let trieattemp = 0
            let maxattempt = 5
            var lastelement = null
            while (trieattemp < maxattempt){
                let status = await chrome.storage.local.get(["status"])
                if(status.status == "pause"){break}
                if(status.status == "stop"){
                    var obj = {}
                    obj["tempdata" + cle] = []
                    await chrome.storage.local.set(obj)
                    obj = {}
                    obj["data" + cle] = srcappingdata
                    console.log(obj)
                    await chrome.storage.local.set(obj)
                    break
                }
                await new Promise(r => setTimeout(r, 2000));
                var data = document.querySelectorAll('[data-test-id="pinRepPresentation"]')
                if(data.length > 0){
                    var dos = document.querySelectorAll('img.hCL.kVc.L4E.MIw');
                    const event = document.createEvent('Event');
                    event.initEvent('mouseover', true, true);
                    
                    for(var i=0; i<dos.length; i++){dos[i].dispatchEvent(event)}
                    await new Promise(r => setTimeout(r, 2000));
                    for (let index = 0; index < data.length; index++) {
                        const element = data[index];
                        $img = element.querySelector("img")
                        if ($img){
                            let url = $img.getAttribute("src")
                            var ahref = element.querySelector("a.Wk9.xQ4.CCY.S9z.ho-.kVc.e8F.BG7")
                            let pageurl = ""
                            if(ahref){
                                pageurl = ahref.getAttribute("href")
                            }
                            if (url != "") {
                                if(url.indexOf("/236x/") !== -1){
                                    url = url.replace("/236x/", "/736x/")
                                    if(listurlimage.indexOf(url) == -1){
                                        listurlimage.push(url)
                                        srcappingdata.push({"image": url, "url": pageurl})
                                    }
                                }
                            }
                        }
                    }
                    if(dos.length == 0){
                        trieattemp++;
                    }
                    if(lastelement == data[data.length -1]){
                        trieattemp++;
                    }
                    lastelement = data[data.length -1];
                    let obj = {}
                    obj["tempdata" + cle] = srcappingdata
                    await chrome.storage.local.set(obj)
                }
                window.scrollTo(0, document.body.scrollHeight);
            }
            let status = await chrome.storage.local.get(["status"])
            if(status.status == "play"){
                var obj = {}
                obj["tempdata" + cle] = []
                await chrome.storage.local.set(obj)
                obj = {}
                obj["data" + cle] = srcappingdata
                await chrome.storage.local.set(obj)
            }
            resolve({url: listurlimage, data: srcappingdata});
        }, 5000);
    });
    return maPromesse
}

document.addEventListener('DOMContentLoaded', async function() {
    $save = document.querySelector("#savekeyword")
    let status = await getstatus()
    if (status.status == "play") {
        setstatus("pause")
        $("#pausescrap .rond").addClass("active")
        $("#playscrap .rond").removeClass("active")
        $("#stopsrcap .rond").removeClass("active")
    }
    if (status.status == "pause") {
        $("#pausescrap .rond").addClass("active")
    }
    if (status.status == "stop") {
        $("#stopsrcap .rond").addClass("active")
    }
    $save.addEventListener("click", function(e){
        $textareakeyword = document.querySelector("#keywordlist");
        let valeur = $textareakeyword.value;
        valeur = valeur.split(",")
        chrome.storage.local.set({"keyword": valeur}, function() {
            $componentalert = document.querySelector("#alertdata")
            if (chrome.runtime.lastError) {
                $componentalert.innerHTML=`
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    Error while saving data: Unable to save the data. Please try again later.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
            } else {
                $componentalert.innerHTML=`
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    Data saved successfully!
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
            }
        });
        $textareakeyword.value = ""
    })
    $play = document.querySelector("#playscrap")
    $play.addEventListener("click", function(e){
        chrome.storage.local.get(["keyword"]).then(async (result) => {
            setstatus("play")
            $("#playscrap .rond").addClass("active")
            $("#pausescrap .rond").removeClass("active")
            $("#stopsrcap .rond").removeClass("active")
            listkey = result.keyword
            if (listkey){
                for (let index = 0; index < listkey.length; index++) {
                    const element = listkey[index];
                    chrome.storage.local.set({"srappingencour": element})
                    var myInterval = setInterval(function(){
                        chrome.storage.local.get(["tempdata"+element]).then(function(lenthdata){
                            lenthdata = lenthdata["tempdata"+element]
                            if(lenthdata){
                                $componentalert = document.querySelector("#alertdataerrot")
                                $componentalert.innerHTML=`
                                <div class="alert alert-info alert-dismissible fade show" role="alert">
                                    Scrapping ${element}. <br> ${lenthdata.length}
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`
                            }
                        })
                        
                    }, 2000);
                    const donne = await injectionpromise(element)
                    let status = await getstatus()
                    let availabledownloadkey = await chrome.storage.local.get(["availabledownloadkey"])
                    availabledownloadkey = availabledownloadkey.availabledownloadkey
                    if(availabledownloadkey){
                        availabledownloadkey.push("data"+element)
                    } else {
                        availabledownloadkey = ["data"+element]
                    }
                    chrome.storage.local.set({"availabledownloadkey": availabledownloadkey})
                    clearInterval(myInterval)
                    $componentalert = document.querySelector("#alertdataerrot")
                    $componentalert.innerHTML=""
                    if (status.status != "play") {
                        break
                    }
                    var resteatraiter = listkey.filter(da=>{if(da == element){return false}return true})
                    chrome.storage.local.set({"keyword": resteatraiter})                    
                }
                if (status.status == "play") {
                    setstatus("None")
                }
            } else {
                $componentalert = document.querySelector("#alertdataerrot")
                $componentalert.innerHTML=`
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    No keyword saved yet.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
            }
            
            $("#playscrap .rond").removeClass("active")
        });
    })
    $pause = document.querySelector("#pausescrap")
    $pause.addEventListener("click", function(e){
        setstatus("pause")
        $("#pausescrap .rond").addClass("active")
        $("#playscrap .rond").removeClass("active")
        $("#stopsrcap .rond").removeClass("active")
    })
    $stop = document.querySelector("#stopsrcap")
    $stop.addEventListener("click", function(e){
        setstatus("stop")
        $("#stopsrcap .rond").addClass("active")
        $("#playscrap .rond").removeClass("active")
        $("#pausescrap .rond").removeClass("active")
    })
    $Download = document.querySelector("#Download")
    $Download.addEventListener("click", async function(e){
        let data = await chrome.storage.local.get(["availabledownloadkey"])
        data = data.availabledownloadkey
        if (data){
            data = [...new Set(data)];
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                let csv = await chrome.storage.local.get([element])
                csv = csv[element]
                if(csv){
                    downloadJSONAsCSV(csv, element)
                }
            }
        } else {
            $componentalert = document.querySelector("#alertdataerrot")
            $componentalert.innerHTML=`
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                No data saved yet.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`
        }
        
    })
    
});
