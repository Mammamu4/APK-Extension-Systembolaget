// Use a debounce function to limit how often we process mutations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Cache selectors and create a Set to track processed products with their content hash
const SELECTORS = {
  grid: "div.css-1fgrh1r",
  product: {
    details: "p.e1fb4th00",
    price: "p.css-a2frwy",
    container: "div.css-1n1rld4",
  },
};

// Store product states using WeakMap to avoid memory leaks
const productStates = new WeakMap();

// Function to generate a content hash for a product
function getProductContentHash(product) {
  const elements = product.querySelectorAll(SELECTORS.product.details);
  const price = product.querySelector(SELECTORS.product.price);
  return `${elements[1]?.textContent || ""}-${elements[2]?.textContent || ""}-${
    price?.textContent || ""
  }`;
}

const processProducts = debounce(() => {
  const gridElement = document.querySelector(SELECTORS.grid);
  if (!gridElement) return;

  const products = Array.from(gridElement.children);
  let needsSort = false;

  products.forEach((product) => {
    const currentHash = getProductContentHash(product);
    const previousHash = productStates.get(product);

    // Process if product is new or content has changed
    if (currentHash !== previousHash) {
      const elements = product.querySelectorAll(SELECTORS.product.details);
      if (elements.length < 3) return;

      // Remove existing APK container if content has changed
      const existingAPK = product.querySelector("div.apk-container");
      if (existingAPK) {
        existingAPK.remove();
      }

      const [volume, alcoholPercentage] = [elements[1], elements[2]];
      const price = product.querySelector(SELECTORS.product.price);

      const productDetails = formatProductDetails(
        volume,
        alcoholPercentage,
        price
      );
      if (!productDetails) return;

      const { formattedVolume, formattedAlcoholPercentage, formattedPrice } =
        productDetails;
      const apk = calculateAPK(
        formattedVolume,
        formattedAlcoholPercentage,
        formattedPrice
      );

      const productDiv = product.querySelector(SELECTORS.product.container);
      const apkAdded = appendAPKToProduct(productDiv, apk);

      if (apkAdded) {
        productStates.set(product, currentHash);
        needsSort = true;
      }
    }
  });

  // Only check storage and sort if new APK values were added
  if (needsSort) {
    chrome.storage.local.get(["autoSort"], function (result) {
      if (result.autoSort) {
        sortProducts();
      }
    });
  }
}, 100); // Debounce delay of 100ms

const mutationObserver = new MutationObserver(processProducts);

const sortProducts = debounce(() => {
  const gridElement = document.querySelector(SELECTORS.grid);
  if (!gridElement) return;

  const products = Array.from(gridElement.children);
  const sortedProducts = products.sort((a, b) => {
    const getAPK = (productElement) =>
      parseFloat(
        productElement.querySelector("div.apk-container")?.getAttribute("apk-value") || "0"
      );
    return getAPK(b) - getAPK(a);
  });

  const fragment = document.createDocumentFragment();
  sortedProducts.forEach((product) => fragment.appendChild(product));
  gridElement.appendChild(fragment);
}, 250); // Debounce delay of 250ms

// Initialize observer with expanded options
const body = document.body;
mutationObserver.observe(body, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  characterDataOldValue: true,
});

// Message listener
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "sortProducts") {
    sortProducts();
  }
});

// Storage change listener
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.autoSort?.newValue) {
    sortProducts();
  }
});