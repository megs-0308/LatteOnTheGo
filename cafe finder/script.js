// Initialize map (center: Bangalore)
const map = L.map('map').setView([12.9716, 77.5946], 13);

// Add OpenStreetMap tiles (Carto Voyager for coffee vibe)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors © CARTO',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

// --- STEP 2: Add Cafe Markers ---

// Custom coffee cup icon
const coffeeIcon = L.icon({
  iconUrl: 'image-coffee.png', // make sure this file exists in your project folder
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35]
});
let cafeMarkers = []; // store all cafe markers for search

fetch('cafes.json')
  .then(response => response.json())
  .then(cafes => {
    window.cafes = cafes; // store globally for search

    cafes.forEach((cafe, i) => {
      const marker = L.marker(cafe.location, { icon: coffeeIcon })
        .addTo(map)
        .bindPopup(`
          <div class="popup-card">
            <h3>${cafe.name}</h3>
            <p>${cafe.desc}</p>
            <p>⭐ ${cafe.rating} / 5</p>
          </div>
        `);

      // Store marker for search
      cafeMarkers.push({
        marker: marker,
        name: cafe.name.toLowerCase()
      });

      // --- Populate sidebar ---
      const li = document.createElement('li');
      li.textContent = `${cafe.name} ⭐ ${cafe.rating}`;
      li.addEventListener('click', () => {
  map.setView(cafe.location, 16, { animate: true }); // smooth zoom
  marker.openPopup(); // popup opens as before
});
;
      document.getElementById('cafe-list').appendChild(li);
    });
  })
  .catch(err => console.error('Error loading cafes.json:', err));


// --- User location ---
map.locate({ setView: true, maxZoom: 15 });

// Event when location found
map.on('locationfound', e => {
  const radius = e.accuracy / 2;

  // Add a circle to show user location
  L.circle(e.latlng, {
    radius: radius,
    color: '#6f4e37',       // coffee brown
    fillColor: '#d2b48c',   // light latte
    fillOpacity: 0.5
  }).addTo(map);

  // Optional: add a marker at user location
  L.marker(e.latlng)
    .addTo(map)
    .bindPopup("You are here ☕")
    .openPopup();
});

// Event if location not found (outside locationfound)
map.on('locationerror', e => {
  alert("Could not detect your location. Please allow location access.");
});

// search
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', e => {
  const query = e.target.value.toLowerCase();

  cafeMarkers.forEach(item => {
    if (item.name.includes(query)) {
      if (!map.hasLayer(item.marker)) item.marker.addTo(map);
    } else {
      if (map.hasLayer(item.marker)) map.removeLayer(item.marker);
    }
  });
});


// Assuming cafes are stored in window.cafes and markers in cafeMarkers
window.cafes.forEach((cafe, i) => {
  const li = document.createElement('li');
  li.textContent = `${cafe.name} ⭐ ${cafe.rating}`;
  li.addEventListener('click', () => {
    map.setView(cafe.location, 16); // zoom to marker
    cafeMarkers[i].marker.openPopup(); // open popup
  });
  document.getElementById('cafe-list').appendChild(li);
});


map.on('locationfound', e => {
  const radius = e.accuracy / 2;

  // Circle for user location
  L.circle(e.latlng, {
    radius: radius,
    color: '#6f4e37',
    fillColor: '#d2b48c',
    fillOpacity: 0.5
  }).addTo(map);

  // Smooth zoom + marker
  map.setView(e.latlng, 15, { animate: true });
  L.marker(e.latlng)
    .addTo(map)
    .bindPopup("You are here ☕")
    .openPopup();
});
