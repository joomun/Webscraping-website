document.addEventListener('DOMContentLoaded', function() {
    fetchProducts(1); // Fetch page 1 as default
  });
  
  function fetchProducts(pageNumber) {
    fetch(`/api/products?page=${pageNumber}`)
      .then(response => response.json())
      .then(products => {
        renderProducts(products);
        // Add pagination buttons and set up event listeners for them
      })
      .catch(error => console.error('Error:', error));
  }
  
  function renderProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = ''; // Clear previous contents
    products.forEach(product => {
      const productElement = document.createElement('div');
      // Add class, innerHTML, etc, for productElement based on your product data
      container.appendChild(productElement);
    });
  }
  
  // Setup search event listener
  document.getElementById('searchBtn').addEventListener('click', function() {
    const searchTerm = document.getElementById('searchInput').value;
    fetch(`/api/search?term=${encodeURIComponent(searchTerm)}`)
      .then(response => response.json())
      .then(products => {
        renderProducts(products);
      })
      .catch(error => console.error('Error:', error));
  });
  