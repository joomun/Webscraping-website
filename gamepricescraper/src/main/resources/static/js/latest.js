document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/deals')
        .then(response => response.json())
        .then(deals => {
            const dealsContainer = document.getElementById('deals-container');
            deals.forEach((deal, index) => {
                const dealElement = document.createElement('div');
                dealElement.classList.add('carousel-item', 'text-center');
                if (index === 0) dealElement.classList.add('active'); // First item must be active

                // Check if price is null or undefined and set priceDisplay accordingly
                const priceDisplay = deal.price === null || deal.price === undefined ? 'FREE' : `$${deal.price}`;

                dealElement.innerHTML = `
                    <img src="${deal.image_url}" class="d-block w-100" alt="${deal.title}">
                    <div class="carousel-caption d-none d-md-block">
                        <h5>${deal.title}</h5>
                        <p>${priceDisplay}</p> <!-- Use priceDisplay here -->
                    </div>
                `;
                dealsContainer.appendChild(dealElement);
            });

            // Initialize the carousel (if not using data attributes)
            $('#dealsCarousel').carousel();
        })
        .catch(error => console.error('Error fetching deals:', error));
});
