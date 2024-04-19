var init = null
function addtimeout(){
    init = setTimeout(async () => {
        var listurlimage = []
        var srcappingdata = []
        let trieattemp = 0
        let maxattempt = 5
        var lastdata = []
        while (trieattemp < maxattempt){
            $data = document.querySelectorAll('[data-test-id="pincard-image-with-link"]')
            if (lastdata == $data){
                trieattemp++;
            } else {
                lastdata = $data
            }
            if($data.length > 0){
                var dos = document.querySelectorAll('img.hCL.kVc.L4E.MIw');
                const event = document.createEvent('Event');
                event.initEvent('mouseover', true, true);
                for(var i=0; i<dos.length; i++){dos[i].dispatchEvent(event)}
                for (let index = 0; index < $data.length; index++) {
                    const element = $data[index];
                    $img = element.querySelector("img")
                    let url = $img.getAttribute("src")
                    $ahref = element.querySelector("a")
                    let pageurl = ""
                    if($ahref){
                        pageurl = $ahref.getAttribute("href")
                    }
                    if (pageurl != "") {
                        if(pageurl.indexOf("/236x/") !== -1){
                            pageurl = pageurl.replace("/236x/", "/736x/")
                            if(listurlimage.indexOf(pageurl) == -1){
                                listurlimage.append(pageurl)
                                srcappingdata.append({"image": url, "url": pageurl})
                            }
                        }
                    }
                }
            }
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 2000));
        }
        console.log("stop")
    }, 5000);
}
function removetimeout(){
    console.log(init)
    console.log("stop")
    clearTimeout(init);
}