const queryParams = new URLSearchParams(window.location.search);
const productId = queryParams.get('productId');

fetch(`/api/product/${productId}`)
    .then(response => response.json())
    .then(product => {
        updateProductDetails(product);

        if (product.comparisons) {
            updateComparisonSection(product.comparisons);
        }
    })
    .catch(error => console.error('Error:', error));



function updateProductDetails(responseData) {
    const product = responseData.product;

    // Update image
    const imageElement = document.querySelector('.card-img-top');
    imageElement.src = product.image_url || 'default-image.jpg';

    // Update title
    const titleElement = document.querySelector('.display-5.fw-bolder');
    titleElement.textContent = product.title || 'Default Title';

    // Update price
    const priceElement = document.querySelector('.fs-5.mb-5 span');
    if (product.price !== null && product.price !== undefined && !isNaN(Number(product.price))) {
        const price = Number(product.price).toFixed(2);
        priceElement.textContent = `$${price}`;
    } else {
        priceElement.textContent = 'Free';
    }

    // Update game requirements
    const requirementsElement = document.querySelector('.lead');
    requirementsElement.innerHTML = responseData.requirements ? createRequirementsTable(responseData.requirements) : 'No minimum requirements.';
}
    
    
    
function createRequirementsTable(requirements) {
    let tableHtml = '<table class="table">';
    const defaultRequirementText = 'No requirements'; // Set the default text for missing requirements
    const keys = ['os', 'processor', 'memory', 'graphics', 'directx', 'network', 'storage']; // List all possible keys

    keys.forEach(key => {
        const value = requirements[key] || defaultRequirementText;
        const icon = getIconForRequirement(key);
        tableHtml += `<tr><th><i class="${icon}"></i> ${key.toUpperCase()}</th><td>${value}</td></tr>`;
    });

    tableHtml += '</table>';
    return tableHtml;
}


function getIconForRequirement(key) {
    const icons = {
        os: 'fas fa-server',
        processor: 'fas fa-microchip',
        memory: 'fas fa-memory',
        graphics: 'fas fa-video',
        directx: 'fas fa-gamepad',
        network: 'fas fa-network-wired',
        storage: 'fas fa-hdd'
    };
    return icons[key.toLowerCase()] || 'fas fa-question-circle';
}

function updateComparisonSection(comparisons) {
    const comparisonContainer = document.getElementById('comparison-container'); // make sure this container exists in your HTML
    const displayedGameNames = new Set(); // Create a set to track displayed game names
    comparisons.forEach(comp => {
        const originalGameName = comp.original_game_name;
        const matchedGameName = comp.matched_game_name;

        // Check if the original game name is not a duplicate and display it
        if (!displayedGameNames.has(originalGameName)) {
            const originalCompElement = createComparisonElement(originalGameName, originalGameName, comp.original_platform, comp.original_price, comp.original_url);
            comparisonContainer.appendChild(originalCompElement);
            displayedGameNames.add(originalGameName); // Add the original game name to the set
        }

        // Check if the matched game name is not a duplicate and display it
        if (!displayedGameNames.has(matchedGameName)) {
            const matchedCompElement = createComparisonElement(matchedGameName, matchedGameName, comp.matched_platform, comp.matched_price, comp.matched_url);
            comparisonContainer.appendChild(matchedCompElement);
            displayedGameNames.add(matchedGameName); // Add the matched game name to the set
        }
    });
}

// Helper function to create a comparison element
function createComparisonElement(gameName, gameDisplayName, platform, price, url) {
    const compElement = document.createElement('div');
    compElement.className = 'comparison-item';

    // Define platform-specific logos based on platform name
    let platformLogo = '';
    if (platform === 'Steam') {
        platformLogo = '/image/steam.png'; // Replace with the actual Steam logo URL
    } else if (platform === 'GOG') {
        platformLogo = '/image/GOG.com_Logo.png'; // Replace with the actual GOG logo URL
    } else if (platform === 'K4G') {
        platformLogo = '/image/K4G.jpg'; // Replace with the actual K4G logo URL
    } else {
        platformLogo = 'default-logo.png'; // Replace with a default logo URL
    }

    compElement.innerHTML = `
        <div class="comparison-content">
            <div class="comparison-left">
                <p><strong>${gameDisplayName}</strong></p>
                <p>Platform: ${platform}</p>
                <p>Price: $${parseFloat(price).toFixed(2)}</p>
            </div>
            <div class="comparison-right">
                <img src="${platformLogo}" alt="${platform} Logo" style="width: 40px; height: 40px;">
                <a href="${url}" target="_blank" class="btn btn-primary">View this version</a> <!-- Use the URL from the 'url' parameter -->
            </div>
        </div>
    `;

    return compElement;
}






