const DATA_ROOT = "data/";

const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));

function formatScore(value) {
  return Number(value).toFixed(2);
}



function radarSVG(sensory = {}) {
  const entries = Object.entries(sensory);
  if (!entries.length) return "";

  const size = 320;
  const center = size / 2;
  const radius = 100; // Radio máximo del gráfico
  const total = entries.length;

  // Escala fija estándar de 0 a 10
  const maxVal = 10;

  // Puntos para la forma del polígono
  const points = entries.map(([_, val], i) => {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    // Normalización real de 0 a 10
    const norm = Math.max(0, Math.min(1, val / maxVal));
    const r = norm * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  // Generación de los 5 anillos concéntricos (valores 2, 4, 6, 8, 10)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridLevels.map(level => {
    const levelPoints = entries.map((_, i) => {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const r = level * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
    return `<polygon points="${levelPoints}" fill="none" stroke="rgba(243,236,218,0.15)" stroke-width="1"/>`;
  }).join("");

  // Ejes radiales (líneas desde el centro hacia afuera)
  const axes = entries.map((_, i) => {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const x2 = center + radius * Math.cos(angle);
    const y2 = center + radius * Math.sin(angle);
    return `<line x1="${center}" y1="${center}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="rgba(243,236,218,0.15)" stroke-width="1"/>`;
  }).join("");

  // Etiquetas de los textos y puntos con valores
  const labels = entries.map(([key, val], i) => {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    
    // Posición del punto de valor
    const norm = Math.max(0, Math.min(1, val / maxVal));
    const pointR = norm * radius;
    const px = center + pointR * Math.cos(angle);
    const py = center + pointR * Math.sin(angle);

    // Posición del texto (un poco más alejado del borde)
    const labelR = radius + 25;
    const lx = center + labelR * Math.cos(angle);
    const ly = center + labelR * Math.sin(angle);

    let anchor = "middle";
    if (Math.cos(angle) > 0.2) anchor = "start";
    if (Math.cos(angle) < -0.2) anchor = "end";

    return `
      <circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="3.5" fill="#F0C55E" />
      <text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="${anchor}" dominant-baseline="central" fill="#F3ECDA" font-size="10" font-family="'Space Mono', monospace">
        <tspan x="${lx.toFixed(2)}" dy="-0.6em">${key}</tspan>
        <tspan x="${lx.toFixed(2)}" dy="1.2em" font-weight="bold" fill="#F0C55E">${val.toFixed(2)}</tspan>
      </text>
    `;
  }).join("");

  return `
    <svg class="radar" viewBox="0 0 ${size} ${size}" width="100%" height="auto">
      ${gridPolygons}
      ${axes}
      <polygon points="${points}" fill="rgba(240, 197, 94, 0.25)" stroke="#F0C55E" stroke-width="2"/>
      ${labels}
    </svg>
  `;
}



// function radarSVG(sensory) {
//   const data = Object.entries(sensory || {})
//     .filter(([, value]) => typeof value === "number" && Number.isFinite(value));

//   if (data.length < 3) {
//     return `<p class="radar-empty">Se necesitan al menos 3 puntuaciones para generar la gráfica.</p>`;
//   }

//   const width = 440, height = 440, cx = 220, cy = 220;
//   const maxR = 150, minVal = 6, maxVal = 10;
//   const n = data.length;

//   const angleFor = i => (Math.PI * 2 * i / n) - Math.PI / 2;
//   const radiusFor = value => Math.max(0, Math.min(maxR,
//     ((value - minVal) / (maxVal - minVal)) * maxR
//   ));

//   const point = (i, radius) => {
//     const a = angleFor(i);
//     return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
//   };

//   let svg = `<svg class="radar" viewBox="0 0 ${width} ${height}" role="img" aria-label="Perfil sensorial">`;

//   [0.25, 0.5, 0.75, 1].forEach(f => {
//     const points = data.map(([,], i) => point(i, maxR * f).join(",")).join(" ");
//     svg += `<polygon points="${points}" fill="none" stroke="rgba(243,236,218,.16)" stroke-width="1"/>`;
//   });

//   data.forEach(([,], i) => {
//     const [x, y] = point(i, maxR);
//     svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(243,236,218,.16)" stroke-width="1"/>`;
//   });

//   const dataPoints = data.map(([, value], i) =>
//     point(i, radiusFor(value)).join(",")
//   ).join(" ");

//   svg += `<polygon points="${dataPoints}" fill="rgba(217,174,85,.30)" stroke="#F0C55E" stroke-width="2"/>`;

//   data.forEach(([, value], i) => {
//     const [x, y] = point(i, radiusFor(value));
//     svg += `<circle cx="${x}" cy="${y}" r="3.5" fill="#F0C55E"/>`;
//   });

//   data.forEach(([label, value], i) => {
//     const [x, y] = point(i, maxR + 29);
//     let anchor = "middle";
//     if (x < cx - 8) anchor = "end";
//     if (x > cx + 8) anchor = "start";
//     svg += `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Space Mono, monospace" font-size="10" fill="#F3ECDA">${escapeHTML(label)}</text>`;
//     svg += `<text x="${x}" y="${y + 13}" text-anchor="${anchor}" font-family="Space Mono, monospace" font-size="10" fill="#F0C55E" font-weight="700">${formatScore(value)}</text>`;
//   });

//   svg += "</svg>";
//   return svg;
// }

function sensoryRows(sensory) {
  return Object.entries(sensory || {})
    .filter(([, value]) => typeof value === "number" && Number.isFinite(value))
    .map(([label, value]) => `
      <div class="sens-row">
        <span class="lbl">${escapeHTML(label)}</span>
        <span class="sens-bar-bg"><span class="sens-bar-fill" style="width:${Math.max(0, Math.min(100, value * 10))}%"></span></span>
        <span class="sens-val">${formatScore(value)}</span>
      </div>
    `).join("");
}

function metaRows(coffee) {
  const fields = [
    ["País", coffee.country],
    ["Región", coffee.region],
    ["Variedad", coffee.variety],
    ["Altura de cultivo", coffee.altitude],
    ["Proceso", coffee.process],
    ["Productor", coffee.producer],
    ["Finca", coffee.farm]
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  return fields.map(([label, value]) => `
    <div class="kv-row">
      <span class="k">${escapeHTML(label)}</span>
      <span class="v">${escapeHTML(value)}</span>
    </div>
  `).join("");
}

function priceHTML(prices) {
  if (!Array.isArray(prices) || !prices.length) return "";
  return `
    <div class="price-section">
      <div class="price-title">
        Precios mayoristas
        <span>Valores no incluyen IVA</span>
      </div>
      <div class="price-table">
        ${prices.map(price => `
          <div class="price-cell">
            <span class="qty">${escapeHTML(price.from || "")}</span>
            <span class="amt">${escapeHTML(price.price || "")}</span>
            <span class="unit">${escapeHTML(price.unit || "")}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// function coffeeHTML(coffee, index) {
//   const attrs = Array.isArray(coffee.attributes)
//     ? coffee.attributes.map(a => `<span class="attr-chip">${escapeHTML(a)}</span>`).join("")
//     : "";

//   const image = coffee.image || "images/coffee-placeholder.jpg";
//   const reverse = index % 2 === 1 ? " reverse" : "";

//   return `
//     <section class="coffee-section${reverse}" id="coffee-${escapeHTML(coffee.id)}">
//       <div class="coffee-grid">
//         <div class="coffee-visual">
//           <span class="coffee-index">${String(index + 1).padStart(2, "0")} / CAFÉ</span>
//           <img class="coffee-image" src="${escapeHTML(image)}" alt="${escapeHTML(coffee.name)}">
//         </div>

//         <div class="coffee-info">
//           <div class="coffee-origin">${escapeHTML(coffee.country || "")}${coffee.region ? " · " + escapeHTML(coffee.region) : ""}</div>
//           <h2 class="coffee-name">${escapeHTML(coffee.name || "Café")}</h2>

//           ${coffee.score !== undefined ? `
//             <div class="score-line">
//               <span class="score-num">${formatScore(coffee.score)}</span>
//               <span class="score-label">Puntaje SCA</span>
//             </div>
//           ` : ""}

//           <div class="coffee-meta">${metaRows(coffee)}</div>

//           ${attrs ? `<div class="attrs">${attrs}</div>` : ""}

//           ${coffee.description ? `<p class="coffee-description">${escapeHTML(coffee.description)}</p>` : ""}

//           <div class="coffee-analysis">
//             <div>
//               <div class="info-title">Análisis sensorial</div>
//               ${sensoryRows(coffee.sensory)}
//             </div>
//             <div class="radar-wrap">
//               ${radarSVG(coffee.sensory)}
//             </div>
//           </div>

//           ${priceHTML(coffee.prices)}
//         </div>
//       </div>
//     </section>
//   `;
// }





function coffeeHTML(coffee, index) {
  const attrs = Array.isArray(coffee.attributes)
    ? coffee.attributes.map(a => `<span class="attr-chip">${escapeHTML(a)}</span>`).join("")
    : "";

  // Genera la URL de la bandera pequeña según el countryCode (ej: CO -> Colombia)
  const flagUrl = coffee.countryCode 
    ? `https://flagcdn.com/w40/${coffee.countryCode.toLowerCase()}.png` 
    : "";

  return `
    <section class="coffee-section" id="coffee-${escapeHTML(coffee.id)}">
      <div class="coffee-grid">
        <div class="coffee-info">
          <div class="coffee-origin">
            <span class="coffee-index">${String(index + 1).padStart(2, "0")} / CAFÉ</span>
            ${flagUrl ? `<img class="country-flag" src="${flagUrl}" alt="${escapeHTML(coffee.country)}">` : ""}
            <span>${escapeHTML(coffee.country 
              || "")}${coffee.region ? " · " + escapeHTML(coffee.region) : ""}</span>
          </div>

          <h2 class="coffee-name">${escapeHTML(coffee.name || "Café")}</h2>

          ${coffee.score !== undefined ? `
            <div class="score-line">
              <span class="score-num">${formatScore(coffee.score)}</span>
              <span class="score-label">Puntaje SCA</span>
            </div>
          ` : ""}

          <div class="coffee-meta">${metaRows(coffee)}</div>

          ${attrs ? `<div class="attrs">${attrs}</div>` : ""}

          ${coffee.description ? `<p class="coffee-description">${escapeHTML(coffee.description)}</p>` : ""}

          <div class="coffee-analysis">
            <div>
              <div class="info-title">Análisis sensorial</div>
              ${sensoryRows(coffee.sensory)}
            </div>
            <div class="radar-wrap">
              ${radarSVG(coffee.sensory)}
            </div>
          </div>

          ${priceHTML(coffee.prices)}
        </div>
      </div>
    </section>
  `;
}



async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
  return response.json();
}

// async function init() {
//   try {
//     const index = await loadJSON(`${DATA_ROOT}coffees.json`);
// const coffees = await Promise.all(index.map(path => loadJSON(`${DATA_ROOT}${path}`)));    document.getElementById("coffees-container").innerHTML =
//       coffees.map(coffeeHTML).join("");

//     const about = await loadJSON(`${DATA_ROOT}about.json`);
//     document.getElementById("about-title").textContent = about.title || "";
//     document.getElementById("about-text").textContent = about.text || "";
//     document.getElementById("about-facts").innerHTML =
//       (about.facts || []).map(f => `<div class="fact">${escapeHTML(f)}</div>`).join("");

//     const catire = await loadJSON(`${DATA_ROOT}catire.json`);
//     document.getElementById("catire-title").textContent = catire.title || "";
//     document.getElementById("catire-text").textContent = catire.text || "";
//     document.getElementById("catire-image").src = catire.image || "";

//     const shop = await loadJSON(`${DATA_ROOT}products.json`);
//     document.getElementById("products-container").innerHTML =
//       (shop.products || []).map(product => `
//         <article class="product-card">
//           <img src="${escapeHTML(product.image || "images/product-placeholder.jpg")}" alt="${escapeHTML(product.name || "Café Rubio")}">
//           <div class="product-card-body">
//             <h3>${escapeHTML(product.name || "")}</h3>
//             <p>${escapeHTML(product.size || "")}</p>
//             <div class="product-price">${escapeHTML(product.price || "")}</div>
//           </div>
//         </article>
//       `).join("");

//     const contact = await loadJSON(`${DATA_ROOT}contact.json`);
//     document.getElementById("contact-info").innerHTML = `
//       <div class="contact-details">
//         ${contact.instagram ? `<div class="contact-item"><small>Instagram</small><a href="${escapeHTML(contact.instagramUrl || "#")}" target="_blank" rel="noopener">${escapeHTML(contact.instagram)}</a></div>` : ""}
//         ${contact.whatsapp ? `<div class="contact-item"><small>WhatsApp</small><a href="${escapeHTML(contact.whatsappUrl || "#")}" target="_blank" rel="noopener">${escapeHTML(contact.whatsapp)}</a></div>` : ""}
//         ${contact.email ? `<div class="contact-item"><small>Email</small><a href="mailto:${escapeHTML(contact.email)}">${escapeHTML(contact.email)}</a></div>` : ""}
//         ${contact.website ? `<div class="contact-item"><small>Web</small><a href="${escapeHTML(contact.website)}" target="_blank" rel="noopener">${escapeHTML(contact.website.replace(/^https?:\/\//,""))}</a></div>` : ""}
//       </div>
//     `;
//   } catch (error) {
//     console.error(error);
//     document.getElementById("coffees-container").innerHTML =
//       `<div style="padding:80px 7vw;color:#F0C55E;font-family:monospace">Error cargando el contenido. Revisá la consola del navegador.</div>`;
//   }
// }




async function init() {
  try {
    // 1. Cargar el índice de cafés
    const index = await loadJSON(`${DATA_ROOT}coffees.json`);

    // 2. Cargar individualmente asegurando que un fallo no rompa el resto
    const coffeesResults = await Promise.allSettled(
      index.map(async (path) => {
        // Soporta si en coffees.json pusiste "colombia-gesha" o "colombia-gesha.json"
        const fullPath = path.endsWith(".json") ? path : `${path}.json`;
        return await loadJSON(`${DATA_ROOT}${fullPath}`);
      })
    );

    // Filtrar solo los cafés que se cargaron con éxito
    const coffees = coffeesResults
      .filter(res => res.status === "fulfilled")
      .map(res => res.value);

    // Renderizar la lista de cafés si hay válidos
    const container = document.getElementById("coffees-container");
    if (coffees.length > 0 && container) {
      container.innerHTML = coffees.map(coffeeHTML).join("");
    } else if (container) {
      container.innerHTML = `<div style="padding:40px 7vw;color:#F0C55E">No se encontraron cafés disponibles.</div>`;
    }

    // 3. Cargar el resto de las secciones
    const about = await loadJSON(`${DATA_ROOT}about.json`).catch(() => null);
    if (about) {
      document.getElementById("about-title").textContent = about.title || "";
      document.getElementById("about-text").textContent = about.text || "";
      document.getElementById("about-facts").innerHTML =
        (about.facts || []).map(f => `<div class="fact">${escapeHTML(f)}</div>`).join("");
    }

    const catire = await loadJSON(`${DATA_ROOT}catire.json`).catch(() => null);
    if (catire) {
      document.getElementById("catire-title").textContent = catire.title || "";
      document.getElementById("catire-text").textContent = catire.text || "";
      document.getElementById("catire-image").src = catire.image || "";
    }

    const shop = await loadJSON(`${DATA_ROOT}products.json`).catch(() => null);
    if (shop) {
      document.getElementById("products-container").innerHTML =
        (shop.products || []).map(product => `
          <article class="product-card">
            <img src="${escapeHTML(product.image || "images/product-placeholder.jpg")}" alt="${escapeHTML(product.name || "Café Rubio")}">
            <div class="product-card-body">
              <h3>${escapeHTML(product.name || "")}</h3>
              <p>${escapeHTML(product.size || "")}</p>
              <div class="product-price">${escapeHTML(product.price || "")}</div>
            </div>
          </article>
        `).join("");
    }

    const contact = await loadJSON(`${DATA_ROOT}contact.json`).catch(() => null);
    if (contact) {
      document.getElementById("contact-info").innerHTML = `
        <div class="contact-details">
          ${contact.instagram ? `<div class="contact-item"><small>Instagram</small><a href="${escapeHTML(contact.instagramUrl || "#")}" target="_blank" rel="noopener">${escapeHTML(contact.instagram)}</a></div>` : ""}
          ${contact.whatsapp ? `<div class="contact-item"><small>WhatsApp</small><a href="${escapeHTML(contact.whatsappUrl || "#")}" target="_blank" rel="noopener">${escapeHTML(contact.whatsapp)}</a></div>` : ""}
          ${contact.email ? `<div class="contact-item"><small>Email</small><a href="mailto:${escapeHTML(contact.email)}">${escapeHTML(contact.email)}</a></div>` : ""}
          ${contact.website ? `<div class="contact-item"><small>Web</small><a href="${escapeHTML(contact.website)}" target="_blank" rel="noopener">${escapeHTML(contact.website.replace(/^https?:\/\//,""))}</a></div>` : ""}
        </div>
      `;
    }
  } catch (error) {
    console.error("Error inicializando la app:", error);
  }
}





document.querySelector(".menu-toggle").addEventListener("click", event => {
  const nav = document.querySelector(".nav");
  const open = nav.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", open);
});

document.addEventListener("click", event => {
  if (event.target.matches(".nav a")) {
    document.querySelector(".nav").classList.remove("open");
    document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
  }
});

const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    document.getElementById("form-note").textContent =
      "Formulario visual listo. Para recibir mensajes hay que conectarlo a un servicio de formularios o backend.";
  });
}

init();
