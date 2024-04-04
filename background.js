let imageIndex = 0;
let imageUrls = [];

function fetchImages() {
  const images = Array.from(document.querySelectorAll('img'));
  return images.map((img) => img.src);
}

function printNextUrl() {
  if (imageIndex < imageUrls.length) {
    console.log(imageUrls[imageIndex]);
    imageIndex++;
  } else {
    console.log("No more images to print.");
  }
}

function handleButtonClick() {
    console.log("Eto pory");
  if (imageUrls.length === 0) {
    imageUrls = fetchImages();
  }
  printNextUrl();
}

chrome.browserAction.onClicked.addListener(handleButtonClick);