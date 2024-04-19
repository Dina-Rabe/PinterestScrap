chrome.action.onClicked.addListener(async (tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scrapePage
    });
});
  
function scrapePage() {
    const links = document.querySelectorAll('a');
    const data = [];
    links.forEach(link => {
        data.push({
            title: link.innerText,
            url: link.href
        });
    });
    console.log("criptio")
}