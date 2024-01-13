const queryParams = new URLSearchParams(window.location.search);
const productId = queryParams.get('productId');

fetch(`/api/product/${productId}`)
    .then(response => response.json())
    .then(product => {
        updateProductDetails(product);
    })
    .catch(error => console.error('Error:', error));



function updateProductDetails(responseData) {
    // Assuming responseData is the entire response object from the API
    const product = responseData.product;
    const requirements = responseData.requirements;

    // Update image
    const imageElement = document.querySelector('.card-img-top');
    // Assuming you add an image URL in your database and API response
    imageElement.src = product.image_url || 'default-image.jpg'; // Fallback to a default image if undefined
    // Update price
    const priceElement = document.querySelector('.fs-5.mb-5 span');
    priceElement.textContent = product.price ? `$${product.price.toFixed(2)}` : 'Free';

    // Update title
    const titleElement = document.querySelector('.display-5.fw-bolder');
    titleElement.textContent = product.title || 'Default Title'; // Fallback to a default title if undefined

    // Update game requirements
    const requirementsElement = document.querySelector('.lead');
    requirementsElement.innerHTML = requirements ? createRequirementsTable(requirements) : 'No requirements available.';
}
    
function createRequirementsTable(requirements) {
    let tableHtml = '<table class="table">';
    for (const key in requirements) {
        if (requirements.hasOwnProperty(key)) {
            const value = requirements[key] ? requirements[key] : 'No minimum requirements';
            const icon = getIconForRequirement(key);
            tableHtml += `<tr><th><i class="${icon}"></i> ${key.toUpperCase()}</th><td>${value}</td></tr>`;
        }
    }
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
