function fetchProducts(page = 1) {
  fetch(`/api/products?page=${page}`)
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(products => {
          renderProducts(products);
      })
      .catch(error => {
          console.error('Error:', error);
      });
}

function renderProducts(products) {
  const productsContainer = document.getElementById('productsContainer');
  productsContainer.innerHTML = '';

  products.forEach(product => {
      const priceText = product.price ? `$${product.price}` : 'Free';
      const discountLabel = product.price ? '' : 'FREE';
      const productHtml = `
          <div class="col-md-4">
              <div class="product py-4">
                  <span class="off bg-success">${discountLabel}</span>
                  <div class="text-center">
                      <img src="${product.image_url}" width="200" />
                  </div>
                  <div class="about text-center">
                      <h5>${product.title}</h5>
                      <span>${priceText}</span>
                  </div>
                  <div class="cart-button mt-3 px-2 d-flex justify-content-between align-items-center">
                      <button class="btn btn-primary text-uppercase">Add to cart</button>
                      <div class="add">
                          <span class="product_fav"><i class="fa fa-heart-o"></i></span>
                          <span class="product_fav"><i class="fa fa-opencart"></i></span>
                      </div>
                  </div>
              </div>
          </div>`;
      productsContainer.innerHTML += productHtml;
  });
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
      .then(products => {
          renderProducts(products);
      })
      .catch(error => console.error('Error:', error));
}
