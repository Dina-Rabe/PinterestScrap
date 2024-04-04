function fetchImages() {
    const images = Array.from(document.querySelectorAll('img'));
    return images.map((img) => img.src);
  }
  
  const imageUrls = fetchImages();
  console.log(imageUrls);