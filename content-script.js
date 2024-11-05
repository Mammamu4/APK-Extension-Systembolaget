console.log("Hello from Extension");
const mutationObserver = new MutationObserver((entries, observer) => {
  const gridElement = document.querySelector("div.css-1fgrh1r.e1ixmn8z0");
  if (gridElement) {
    const products = gridElement.children;
    console.log(Array.from(products));
    Array.from(products).forEach((product) => {
      const elements = product.querySelectorAll("p.css-e42h23.e1g7jmpl0");
      const volume = elements[1]; // First matched element
      const alcoholPercentage = elements[2]; // Second matched element
      const price = product.querySelector("p.css-1k0oafj.eap2jzp0");
      if (!volume || !alcoholPercentage || !price) {
        return;
      } else {
        observer.disconnect();
      }
      const formattedVolume = parseFloat(
        volume.textContent.split(" ml ")[0].replace(" ", "")
      );
      const formattedAlcoholPercentage = parseFloat(
        alcoholPercentage.textContent.split(" % ")[0].replace(",", ".")
      );
      const regexMatch = price.textContent.match(/(\d+):?(\d+)?/);
      if (regexMatch) {
        const formattedPrice = parseFloat(
          `${regexMatch[1]}.${regexMatch[2]}`
        ).toPrecision(5);
        const apk = Number(
          ((formattedAlcoholPercentage / 100) * formattedVolume) /
            formattedPrice
        ).toPrecision(3);
        console.log(apk);
      } else {
        console.log("Price format not as expected.");
      }
    });
  } else {
    //console.log("Element not found");
  }
});

// const getProductDetails = (product) => {
//     product =
// }

const body = document.getElementsByTagName("body")[0];

mutationObserver.observe(body, { childList: true, subtree: true });
