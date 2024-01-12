document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('searchBtn').addEventListener('click', function() {
      const searchTerm = document.getElementById('searchInput').value.trim();
      // Check if the search term is not empty
      if (searchTerm) {
          // Redirect to the search page with the search term as a query parameter
          window.location.href = `product.html?search=${encodeURIComponent(searchTerm)}`;

      } else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Please enter a game name before searching!",
          });
      }
  });

  // Optional: Trigger search when the user presses "Enter" key in the search input
  document.getElementById('searchInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          document.getElementById('searchBtn').click();
      }
  });
});
