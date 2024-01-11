function fetchProducts(page = 1) {

  fetch(`/api/products?page=${page}`)
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(products => {
        renderProducts(products, page); // Pass 'page' to 'renderProducts'
      })
      .catch(error => {
          hideLoading(); // Also hide the loading indicator in case of error
          console.error('Error:', error);
      });
}


function renderProducts(products,page) {
  const productsContainer = document.getElementById('productsContainer');
  productsContainer.innerHTML = '';

  products.forEach(product => {
      const priceText = product.price ? `$${product.price}` : 'Free';
      const discountLabel = product.price ? '' : 'FREE';
      const productHtml = `
          <div class="col-md-4">
              <div class="product py-4">
                  <div class="text-center">
                      <img src="${product.image_url}" width="200" />
                  </div>
                  <div class="about text-center">
                      <h5>${product.title}</h5>
                      <span>${priceText}</span>
                  </div>
                  <div class="cart-button" >
                      <button class="btn btn-primary text-uppercase">Compare</button>
                  </div>
              </div>
          </div>`;
      productsContainer.innerHTML += productHtml;
      
  });
  const totalPages = Math.ceil(products.total / 12); // Assuming 'total' is the total number of products
  renderPagination(totalPages, page);
}

function renderPagination(totalPages, currentPage) {
  const paginationContainer = document.getElementById('paginationContainer');
  paginationContainer.innerHTML = ''; // Clear existing pagination buttons

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.innerText = i;
    pageButton.className = currentPage === i ? 'active' : 'page-item';
    pageButton.addEventListener('click', function() {
      fetchProducts(i); // Fetch products for the clicked page number
    });

    paginationContainer.appendChild(pageButton);
  }
}


document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('search');
  if (searchTerm) {
      fetchSearchResults(searchTerm);
  } else {
      fetchProducts(1);
  }
});

function fetchSearchResults(searchTerm) {
  fetch(`/search?term=${encodeURIComponent(searchTerm)}`)
    .then(response => response.json())
    .then(data => {
      const currentPage = 1; // Assuming the search results always return the first page
      renderProducts(data, currentPage); // Assuming 'data' is the array of products
      // If 'data' contains 'products' and pagination info, use data.products and data.currentPage
    })
    .catch(error => console.error('Error:', error));
}