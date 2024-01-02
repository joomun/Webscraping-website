// javascript.js
document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchInput').value;
    fetch(`/search?term=${encodeURIComponent(searchTerm)}`)
      .then(response => response.json())
      .then(data => {
        displayResults(data);
      })
      .catch(error => {
        console.error('Error fetching search results:', error);
      });
  });
  
  function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results
    results.forEach(result => {
      // Create and append the result element
      const resultElement = document.createElement('div');
      resultElement.textContent = `Game: ${result.gameName}`; // Modify this line to match your actual data structure
      resultsContainer.appendChild(resultElement);
    });
  }
  