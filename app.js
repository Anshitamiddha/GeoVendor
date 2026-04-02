class GeoVendorApp {
  constructor() {
    this.vendors = this.getVendors();
    // Fallback: Shahabad Markanda center
    this.userLocation = { lat: 30.1627, lon: 76.8972 };
  }

  getVendors() {
    return [
      {
        name: "New Grain Market Shahabad",
        category: "Grocery",
        rating: 2.9,
        lat: 30.1680,
        lon: 76.9020,
        location: "Shahabad Markanda",
        topRated: true,
        image: "https://i.ytimg.com/vi/UsV5lQ9kVJY/hq720.jpg"
      },
      {
        name: "More Shopping Point",
        category: "Grocery",
        rating: 3.2,
        lat: 30.1590,
        lon: 76.8910,
        location: "Fauji Market,Shahabad Markanda",
        topRated: true,
        image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/13/eb/3b/caption.jpg?w=900&h=500&s=1"
      },
      {
        name: "Second Wife Restaurant",
        category: "Food",
        rating: 3.9,
        lat: 30.1550,
        lon: 76.9050,
        location: "Jagir Vihar, Shahabad",
        topRated: false,
        image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/71/47/c2/seafood-buffet-at-mezz.jpg"
      },
      {
        name: "Nandvanshi Dairy",
        category: "Dairy",
        rating: 3.5,
        lat: 30.1700,
        lon: 76.8950,
        location: "Near Shivji Mandir,Shahabad Markanda",
        topRated: true,
        image: "https://content.jdmagicbox.com/v2/comp/bhopal/y7/0755px755.x755.230310012019.m4y7/catalogue/nandvanshi-dairy-form-karond-bhopal-milk-dairy-wkzibstavs.jpg"
      },
      {
        name: "Gupta Medical Store",
        category: "Medical",
        rating: 4.1,
        lat: 30.1610,
        lon: 76.9080,
        location: "New Model Town,Shahabad Markanda",
        topRated: false,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu7S_t_q3F7uNwqIbfuJd01VtkJNZnI_OuCQ"
      },
      {
        name: "Fresh Basket Grocery",
        category: "Grocery",
        rating: 4.6,
        lat: 30.1720,
        lon: 76.9010,
        location: "Vikas Vihar",
        topRated: true,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e"
      },
      {
        name: "City Stationers",
        category: "Stationery",
        rating: 4.0,
        lat: 30.1570,
        lon: 76.8880,
        location: "Namaste Chowk,Shahabad Markanda",
        topRated: false,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKofmLQpHU4DOhNBqNw_ccgUxBia3NhjmyQw"
      }
    ];
  }

  getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  normalizeDistance(realDist, minReal, maxReal) {
    const MIN_DISPLAY = 1.0;
    const MAX_DISPLAY = 8.0;

    if (maxReal === minReal) {
      return MIN_DISPLAY + (Math.random() * (MAX_DISPLAY - MIN_DISPLAY));
    }

    const normalized = MIN_DISPLAY +
      ((realDist - minReal) / (maxReal - minReal)) * (MAX_DISPLAY - MIN_DISPLAY);

    const noise = Math.random() * 0.4 + 0.1;
    return Math.min(normalized + noise, MAX_DISPLAY);
  }

  getUserLocation() {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported, using default");
      this.calculateDistances();
      this.applyFilters();
      return;
    }

    const title = document.getElementById("dynamic-title");
    if (title) title.textContent = "📍 Getting your location...";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLocation = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        console.log("GPS location obtained:", this.userLocation);
        this.calculateDistances();
        this.applyFilters();
      },
      (err) => {
        console.log("Location denied, using Shahabad default:", err.message);
        this.calculateDistances();
        this.applyFilters();
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }

  calculateDistances() {
    // Step 1: Calculate all real distances
    this.vendors.forEach(v => {
      v._realDistance = this.getDistance(
        this.userLocation.lat,
        this.userLocation.lon,
        v.lat,
        v.lon
      );
    });

    // Step 2: Find min/max for normalization
    const realDistances = this.vendors.map(v => v._realDistance);
    const minReal = Math.min(...realDistances);
    const maxReal = Math.max(...realDistances);

    // Step 3: Normalize to 1–8 km display range
    this.vendors.forEach(v => {
      v.distance = this.normalizeDistance(v._realDistance, minReal, maxReal).toFixed(1);
    });

    // Step 4: Sort by display distance
    this.vendors.sort((a, b) => a.distance - b.distance);
  }

  renderVendors(list) {
    const container = document.getElementById("vendor-list");
    if (!container) return;

    container.innerHTML = list.map((v, i) => `
      <div class="vendor-card" style="animation-delay:${i * 0.08}s">
        <div class="vendor-image">
          <img src="${v.image}" alt="${v.name}">
        </div>

        <div class="vendor-info">
          <h3 class="vendor-title">${v.name}</h3>

          <div class="vendor-rating-row">
            <span class="rating-badge">${v.rating} ⭐</span>
            <span class="top-rated-badge">
              ${v.topRated ? "🥇 Top Rated" : "81+ Ratings"}
            </span>
          </div>

          <div class="vendor-location">
            📍 ${v.location} • ${v.distance} km
          </div>

          <div class="chips">
            <span class="chip rating-chip">${v.rating}</span>
            <span class="chip category-chip">${v.category}</span>
            ${v.topRated ? `<span class="chip top-chip">Featured</span>` : ""}
          </div>
        </div>
      </div>
    `).join("");
  }

  applyFilters() {
    let filtered = [...this.vendors];

    const locQuery = document.getElementById("input-loc")?.value.toLowerCase();
    if (locQuery) {
      filtered = filtered.filter(v =>
        v.location.toLowerCase().includes(locQuery)
      );
    }

    const itemQuery = document.getElementById("input-item")?.value.toLowerCase();
    if (itemQuery) {
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(itemQuery) ||
        v.category.toLowerCase().includes(itemQuery)
      );
    }

    const ratingFilter = parseFloat(document.getElementById("rating")?.value || 0);
    if (ratingFilter > 0) {
      filtered = filtered.filter(v => v.rating >= ratingFilter);
    }

    const categoryFilter = document.getElementById("categorySelect")?.value;
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(v => v.category === categoryFilter);
    }

    const sortFilter = document.getElementById("sort")?.value || "rating";

    filtered.sort((a, b) => {
      if (sortFilter === "distance") return a.distance - b.distance;
      if (sortFilter === "rating") return b.rating - a.rating;
      return 0;
    });

    this.renderVendors(filtered);

    const title = document.getElementById("dynamic-title");
    if (title) {
      title.textContent =
        filtered.length === 0
          ? "No vendors found"
          : `${filtered.length} Vendors Near You`;
    }
  }

  debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new GeoVendorApp();

  app.getUserLocation();

  const debouncedFilter = app.debounce(() => app.applyFilters(), 300);

  document.getElementById("input-loc")?.addEventListener("input", debouncedFilter);
  document.getElementById("input-item")?.addEventListener("input", debouncedFilter);

  ["rating", "sort", "categorySelect"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", () => app.applyFilters());
  });

  document.getElementById("topRatedBtn")?.addEventListener("click", () => {
    document.getElementById("rating").value = "4";
    app.applyFilters();
  });
});
