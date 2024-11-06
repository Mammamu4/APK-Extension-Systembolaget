/**
 * Formats the volume, alcohol percentage, and price from their respective elements.
 * @param {HTMLElement} volumeElement - The element containing the volume.
 * @param {HTMLElement} alcoholElement - The element containing the alcohol percentage.
 * @param {HTMLElement} priceElement - The element containing the price.
 * @returns {Object|null} - An object containing formatted values or null if any element is missing.
 */
const formatProductDetails = (volumeElement, alcoholElement, priceElement) => {
  if (!volumeElement || !alcoholElement || !priceElement) {
    return null; // Return null if any element is missing
  }

  const formattedVolume = parseFloat(
    volumeElement.textContent.split(" ml ")[0].replace(" ", "")
  ); //String.prototype.replace() is used to account for volumes containing white space like 3 000 ml
  const formattedAlcoholPercentage = parseFloat(
    alcoholElement.textContent.split(" % ")[0].replace(",", ".")
  );

  const regexMatch = priceElement.textContent.match(/(\d+):?(\d+)?/); // Matches one or more digits, optionally followed by a colon and another set of digits (exemple: 15:90).
  if (!regexMatch) {
    console.log("Price format not as expected.");
    return null; // Return null if price format is invalid
  }

  const formattedPrice = parseFloat(`${regexMatch[1]}.${regexMatch[2]}`);
  return { formattedVolume, formattedAlcoholPercentage, formattedPrice };
};

/**
 * Calculates the APK (Alcohol Per Krona(SEK)) based on volume, alcohol percentage, and price.
 * @param {number} volume - The volume of the product.
 * @param {number} alcoholPercentage - The alcohol percentage of the product.
 * @param {number} price - The price of the product.
 * @returns {number} - The calculated APK value.
 */
const calculateAPK = (volume, alcoholPercentage, price) => {
  return Number(((alcoholPercentage / 100) * volume) / price).toFixed(2);
};

/**
 * Appends a div element displaying the APK value to a product container with a dynamic background color.
 * The color transitions from red to green, passing through yellow and orange, based on the APK value.
 *
 * @param {HTMLElement} productDiv - The container div of the product where the APK will be displayed.
 * @param {number} apk - The APK value that determines the background color.
 */
const appendAPKToProduct = (productDiv, apk) => {
  // Check if the container already exists
  let apkContainer = productDiv.querySelector(".apk-container");

  // If apkCotnainer doesn't exists, create a new one
  if (!apkContainer) {
    apkContainer = document.createElement("div");
    apkContainer.className = "apk-container";
    productDiv.appendChild(apkContainer);
  }

  apkContainer.textContent = `APK: ${apk}`;

  // Calculate color based on APK value
  const color = calculateColor(apk);
  apkContainer.style.backgroundColor = color;
  apkContainer.style.borderRadius = "5px";
  apkContainer.style.textAlign = "center";
  apkContainer.style.fontWeight = "bold";
  apkContainer.style.marginTop = "10px";
};

/**
 * Calculates the background color for the APK value.
 * The color is determined based on the APK value, transitioning smoothly from:
 * - Red for APK values <= 0.5,
 * - Orange for values between 0.5 and 0.8,
 * - Yellow for values between 0.8 and 1.5,
 * - Green for APK values between 1.5 and 2.2.
 * Values beyond 2.2 remain green.
 *
 * @param {number} apkValue - The APK value that determines the color.
 * @returns {string} - The computed RGB color value as a string.
 */
const calculateColor = (apkValue) => {
  // Ensure the value is within the expected range (0 to 2.3)
  value = Math.min(Math.max(apkValue, 0), 2.3);

  // Normalize the value to a range of 0 to 1
  const ratio = apkValue / 2.3;

  let red, green, blue;

  if (ratio <= 0.333) {
    // Red to Orange
    red = 255;
    green = Math.round(165 * ratio); // Increase green
    blue = 0;
  } else if (ratio <= 0.666) {
    // Orange to Yellow
    red = Math.round(255 - 90 * (ratio - 0.333) * 3); // Decrease red to yellow
    green = 165 + Math.round(90 * (ratio - 0.333) * 3); // Increase green
    blue = 0;
  } else {
    // Yellow to Green
    red = Math.round(255 - 255 * (ratio - 0.666) * 3); // Decrease red
    green = Math.round(255); // Keep green at maximum
    blue = 0; // Keep blue at 0
  }

  return `rgb(${red}, ${green}, ${blue})`;
};

/**
 * A MutationObserver observes DOM mutations and processes product information when new elements are added.
 * This is necessary because Systembolaget.se loads content asynchronously after the initial DOM is rendered.
 */
const mutationObserver = new MutationObserver((entries, observer) => {
  const gridElement = document.querySelector("div.css-1fgrh1r.e1ixmn8z0");
  if (gridElement) {
    const products = gridElement.children;

    Array.from(products).forEach((product) => {
      const elements = product.querySelectorAll("p.css-e42h23.e1g7jmpl0");
      const [volume, alcoholPercentage] = [elements[1], elements[2]];
      const price = product.querySelector("p.css-1k0oafj.eap2jzp0");

      const productDetails = formatProductDetails(
        volume,
        alcoholPercentage,
        price
      );
      if (productDetails) {
        const { formattedVolume, formattedAlcoholPercentage, formattedPrice } =
          productDetails;
        const apk = calculateAPK(
          formattedVolume,
          formattedAlcoholPercentage,
          formattedPrice
        );

        const productDiv = product.querySelector("div.css-1n1rld4.e1ixmn8z0");
        appendAPKToProduct(productDiv, apk);

        // Disconnect the observer as all necessary information has been processed
        //observer.disconnect();
      }
    });
  } else {
    console.log("Grid element not found.");
  }
});

// Start observing the body for child additions and subtree changes
const body = document.getElementsByTagName("body")[0];
mutationObserver.observe(body, { childList: true, subtree: true }); // The 'childList' option combined with 'subtree' observes all child elements and their descendants.
