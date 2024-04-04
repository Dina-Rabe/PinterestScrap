document.getElementById("printUrlBtn").addEventListener("click", function () {
    chrome.extension.getBackgroundPage().handleButtonClick();
    
  });