function fetchImages() {
    const images = Array.from(document.getElementsByTagName("img"));
    const data = images.map((img) => ({ src: img.src }));
    return data;
  }
  
  function downloadCSV(data) {
    const csvContent = "data:text/csv;charset=utf-8," + data.map((row) => row.src).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "images.csv");
    document.body.appendChild(link);
    link.click();
  }
  
  function scrollPage() {
    window.scrollTo(0, document.body.scrollHeight);
  }
  
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "fetchImages") {
      const images = fetchImages();
      downloadCSV(images);
      scrollPage();
      sendResponse({ message: "Images fetched and CSV downloaded!" });
    }
  });
  
  chrome.runtime.sendMessage({ action: "fetchImages" });