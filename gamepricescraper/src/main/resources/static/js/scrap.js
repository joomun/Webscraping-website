// This function will run when the window loads
window.onload = function() {
    // Make an HTTP GET request to the compile-and-run endpoint
    fetch('/compile-and-run')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(text => {
            // Display the result in the output div
            document.getElementById('output').textContent = text;
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
};
