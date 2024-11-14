const mutationObserver = new MutationObserver((entries, observer) => {
  const productDetails = document.querySelector("div.css-1ixxwv1.e1ixmn8z0");
  if (productDetails) {
    const detailElements = productDetails.querySelectorAll(
      "p.css-18czpj2.e1o91dat0"
    );
    const volume = detailElements[1];
    const alcoholPercentage = detailElements[2];

    const priceElement = productDetails.querySelector(
      "div.css-1ct01d4.e1ixmn8z0"
    );
    const price = priceElement.getElementsByTagName("p")[0];
    const formattedProductDetails = formatProductDetails(
      volume,
      alcoholPercentage,
      price
    );
    // logging values for debugging
    // console.log(volume);
    // console.log(alcoholPercentage);
    // console.log(price);
    if (formattedProductDetails) {
      const { formattedVolume, formattedAlcoholPercentage, formattedPrice } =
        formattedProductDetails;
      const apk = calculateAPK(
        formattedVolume,
        formattedAlcoholPercentage,
        formattedPrice
      );

      // logging values for debugging
      console.log(formattedVolume);
      console.log(formattedAlcoholPercentage);
      console.log(formattedPrice);

      const appendElement = productDetails.querySelector(
        "div.css-j7qwjs.e1ixmn8z0"
      );
      appendAPKToProduct(appendElement, apk);
    }
  } else {
    console.log("Details not found");
  }
});

const body = document.getElementsByTagName("body")[0];
mutationObserver.observe(body, { childList: true, subtree: true });
