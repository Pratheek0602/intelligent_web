// Sorting Calculations
document.addEventListener('DOMContentLoaded', function() {
    const sortDateAscBtn = document.getElementById('sort-date-asc');
    const sortDateDescBtn = document.getElementById('sort-date-desc');
    const sortDistanceBtn = document.getElementById('sort-distance');
    const plantCardsContainer = document.querySelector('.plant-cards-container');
    let plantCards = Array.from(plantCardsContainer.children);
  
    sortDateAscBtn.addEventListener('click', function() {
      plantCards.sort((a, b) => new Date(a.dataset.date) - new Date(b.dataset.date));
      plantCards.forEach(card => plantCardsContainer.appendChild(card));
    });
  
    sortDateDescBtn.addEventListener('click', function() {
      plantCards.sort((a, b) => new Date(b.dataset.date) - new Date(a.dataset.date));
      plantCards.forEach(card => plantCardsContainer.appendChild(card));
    });
  
    sortDistanceBtn.addEventListener('click', function() {
      plantCards.sort((a, b) => a.dataset.distance - b.dataset.distance);
      plantCards.forEach(card => plantCardsContainer.appendChild(card));
    });
  });