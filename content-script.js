let isSortingNeeded = false;
let lastSortTime = 0;
const sortDelay = 50;
/**
 * A MutationObserver observes DOM mutations and processes product information when new elements are added.
 * This is necessary because Systembolaget.se loads content asynchronously after the initial DOM is rendered.
 */
const mutationObserver = new MutationObserver((entries, observer) => {
  const gridElement = document.querySelector("div.css-1fgrh1r");
  if (gridElement) {
    const products = gridElement.children;

    Array.from(products).forEach((product) => {
      //const elements = product.querySelectorAll("div.css-1dtnjt5")[0].children; past method using css selector
      const elements = product.querySelectorAll("div#stock_scrollcontainer")[0].children; // using the id instead, maybe better im no pro pls help ._.
      console.log(elements);
      const [volume, alcoholPercentage] = [elements[1], elements[2]];
      const price = product.querySelector("p.css-a2frwy");
      console.log(price);
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
        // console.log(formattedVolume);
        // console.log(formattedAlcoholPercentage);
        // console.log(formattedPrice);
        const productDiv = product.querySelector("div.css-1n1rld4");
        const bool = appendAPKToProduct(productDiv, apk);
        console.log(bool);
        if (bool) {
          chrome.storage.local.get(["autoSort"], function (result) {
            if (result.autoSort && !isSortingNeeded) {
              // Throttle the sort function to run only once every `sortDelay` milliseconds
              const now = Date.now();
              if (now - lastSortTime > sortDelay) {
                isSortingNeeded = true;
                lastSortTime = now;

                sortProducts();

                // Optionally, you could disconnect the observer here if necessary:
                // observer.disconnect();
              }
            }
          });
        }

        // Disconnect the observer as all necessary information has been processed
      }
    });
  } else {
    console.log("Grid element not found.");
  }
});
// Start observing the body for child additions and subtree changes
const body = document.getElementsByTagName("body")[0];
mutationObserver.observe(body, { childList: true, subtree: true }); // The 'childList' option combined with 'subtree' observes all child elements and their descendants.

// Function to sort the products
function sortProducts() {
  isSortingNeeded = false;
  const gridElement = document.querySelector("div.css-1fgrh1r");
  console.log(gridElement);
  if (gridElement) {
    // Remove the first div if it exists
    const firstDiv = gridElement.querySelector("div.css-131707k");
    if (firstDiv) {
      firstDiv.remove();
    }

    // Collect all products into an array
    const products = Array.from(gridElement.children);

    // Log each product's APK value for debugging
    // products.forEach((product) => {
    //   console.log(
    //     product.querySelector("div.apk-container").getAttribute("apk-value")
    //   );
    // });

    // Sort products by APK value
    products.sort((a, b) => {
      const apkA = parseFloat(
        a.querySelector("div.apk-container").getAttribute("apk-value")
      );
      const apkB = parseFloat(
        b.querySelector("div.apk-container").getAttribute("apk-value")
      );
      return apkB - apkA;
    });

    // Clear the grid element and re-append sorted products
    gridElement.innerHTML = "";
    products.forEach((product) => gridElement.append(product));
  } else {
    console.log("Grid element not found.");
  }
}

// Listener for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sortProducts") {
    sortProducts();
  }
});

// Listener to monitor changes in chrome.storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.autoSort) {
    let newBooleanValue = changes.autoSort.newValue;

    // If autoSort is true, automatically trigger the sort function
    if (newBooleanValue) {
      sortProducts();
    }
  }
});

// Listen for URL changes due to browser navigation (back/forward)
window.addEventListener("popstate", function () {
  console.log("URL changed (popstate):", window.location.href);
});
