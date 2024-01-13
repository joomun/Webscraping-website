const queryParams = new URLSearchParams(window.location.search);
const productId = queryParams.get('productId');

fetch(`/api/product/${productId}`)
    .then(response => response.json())
    .then(product => {
        updateProductDetails(product);
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
        priceElement.textContent = 'Default Price';
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
    comparisons.forEach(comp => {
        const compElement = document.createElement('div');
        compElement.className = 'comparison-item';
        compElement.innerHTML = `
            <p><strong>${comp.matched_game_name}</strong> - ${comp.matched_platform}</p>
            <p>Price: $${comp.matched_price.toFixed(2)}</p>
            <a href="/product-detail.html?productId=${comp.matched_game_id}">View this version</a>
        `;
        comparisonContainer.appendChild(compElement);
    });
}
