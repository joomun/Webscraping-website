

document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/deals')
        .then(response => response.json())
        .then(deals => {
            const dealsContainer = document.getElementById('deals-container');
            deals.forEach(deal => {
                const dealElement = document.createElement('div');
                dealElement.classList.add('deal');
                dealElement.innerHTML = `
                    <img src="${deal.image_url}" alt="${deal.title}">
                    <h5>${deal.title}</h5>
                    <p>$${deal.price}</p>
                `;
                dealsContainer.appendChild(dealElement);
            });
        })
        .catch(error => console.error('Error fetching deals:', error));
});

