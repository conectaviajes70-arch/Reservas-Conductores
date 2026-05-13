// ====================== js/conductor.js ======================

const API_URL = "https://script.google.com/macros/s/AKfycbxjszK1c_tq1Ijpxdgyxz7LMWqlmFYKJUQK-3aC-wjqSInqMbEXqGtWyfr0AuzJP-MnCw/exec";
mapboxgl.accessToken = "pk.eyJ1IjoiMzkxODM2IiwiYSI6ImNtbXl4dWZoNzAyamwycm9pZHBoYjNpNzEifQ.ryQd-8yPv1gX6BkNsToW";

let currentUser = null;
let currentTrip = null;
let mapDetail = null;
let mapActive = null;
let isOnline = false;

// ==================== NAVEGACIÓN ====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');

    // Inicializar mapas cuando se muestre la pantalla correspondiente
    if (screenId === 'tripDetail' && !mapDetail) initMapDetail();
    if (screenId === 'activeTrip' && !mapActive) initMapActive();
}

// ==================== LOGIN Y REGISTRO ====================
async function loginConductor() {
    const tel = document.getElementById('telLogin').value.trim();
    const clave = document.getElementById('claveLogin').value.trim();

    if (!tel || !clave) return alert("Ingresa teléfono y clave");

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                tipo: "loginConductor",
                telefono: tel,
                clave: clave
            })
        });
        const data = await res.json();

        if (data.status === "ok") {
            currentUser = { telefono: tel, nombre: data.nombre || "Conductor" };
            localStorage.setItem("conductorTel", tel);
            showScreen('dashboard');
            loadViajesDisponibles();
        } else {
            alert("Datos incorrectos");
        }
    } catch (e) {
        alert("Error de conexión");
    }
}

async function registrarConductor() {
    const nombre = document.getElementById('nombreConductor').value.trim();
    const tel = document.getElementById('telConductor').value.trim();
    const placas = document.getElementById('placas').value.trim();
    const modelo = document.getElementById('modelo').value.trim();

    if (!nombre || !tel || !placas || !modelo) {
        return alert("Completa todos los campos");
    }

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                tipo: "registroConductor",
                nombre,
                telefono: tel,
                placas,
                modelo
            })
        });
        const data = await res.json();

        if (data.status === "ok") {
            alert("Registro exitoso. Tu clave es: " + data.clave);
            currentUser = { telefono: tel, nombre };
            localStorage.setItem("conductorTel", tel);
            showScreen('dashboard');
        } else {
            alert(data.message || "Error al registrar");
        }
    } catch (e) {
        alert("Error de conexión");
    }
}

// ==================== ESTADO ONLINE ====================
function toggleOnline() {
    isOnline = document.getElementById('toggleOnline').checked;
    const statusText = document.getElementById('statusText');
    
    statusText.textContent = isOnline ? "Online" : "Offline";
    statusText.style.color = isOnline ? "#00e5ff" : "#ff3b3b";

    if (isOnline) {
        loadViajesDisponibles();
    }
}

// ==================== CARGAR VIAJES DISPONIBLES ====================
async function loadViajesDisponibles() {
    const container = document.getElementById('viajesList');
    container.innerHTML = '<p style="text-align:center; padding:20px;">Buscando viajes cercanos...</p>';

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                tipo: "getViajesDisponibles",
                conductorTel: currentUser ? currentUser.telefono : ""
            })
        });
        const data = await res.json();

        if (data.status === "ok" && data.viajes && data.viajes.length > 0) {
            renderViajes(data.viajes);
        } else {
            container.innerHTML = `
                <p style="text-align:center; padding:40px; color:#888;">
                    No hay viajes disponibles en este momento<br><br>
                    Mantente Online
                </p>`;
        }
    } catch (e) {
        // Datos de prueba mientras el backend no esté listo
        const viajesMock = [
            {
                id: 1,
                pasajero: "María López",
                origen: "Polanco, CDMX",
                destino: "Aeropuerto Benito Juárez",
                parada: "",
                km: 18.5,
                precio: 320,
                fecha: "2026-05-13 16:30"
            },
            {
                id: 2,
                pasajero: "Carlos Ramírez",
                origen: "Roma Norte",
                destino: "Santa Fe",
                parada: "Reforma",
                km: 12.3,
                precio: 245,
                fecha: "2026-05-13 17:00"
            }
        ];
        renderViajes(viajesMock);
    }
}

function renderViajes(viajes) {
    const container = document.getElementById('viajesList');
    container.innerHTML = '';

    viajes.forEach(viaje => {
        const card = document.createElement('div');
        card.className = 'trip-card';
        card.innerHTML = `
            <strong>${viaje.fecha}</strong><br>
            <b>${viaje.pasajero}</b><br>
            📍 ${viaje.origen} → ${viaje.destino}<br>
            ${viaje.parada ? `🛑 Parada: ${viaje.parada}<br>` : ''}
            <span class="price">$${viaje.precio}</span> • ${viaje.km} km
            <button onclick="verDetalleViaje(${viaje.id})" style="margin-top:10px; background:#00e5ff; color:#000;">
                Ver Detalles
            </button>
        `;
        container.appendChild(card);
    });
}

// ==================== DETALLE DE VIAJE ====================
let selectedTripId = null;

function verDetalleViaje(id) {
    selectedTripId = id;
    // Aquí normalmente cargarías los datos completos del viaje
    // Por ahora usamos datos mock
    currentTrip = {
        id: id,
        pasajero: "María López",
        origen: "Polanco, CDMX",
        destino: "Aeropuerto Benito Juárez",
        parada: "",
        km: 18.5,
        precio: 320,
        fecha: "2026-05-13 16:30"
    };

    document.getElementById('pasajeroNombre').textContent = currentTrip.pasajero;
    document.getElementById('origenText').textContent = currentTrip.origen;
    document.getElementById('destinoText').textContent = currentTrip.destino;
    document.getElementById('paradaText').textContent = currentTrip.parada || "Sin parada";
    document.getElementById('kmText').textContent = currentTrip.km;
    document.getElementById('precioText').textContent = "$" + currentTrip.precio;

    showScreen('tripDetail');
}

function initMapDetail() {
    mapDetail = new mapboxgl.Map({
        container: 'mapDetail',
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: [-99.13, 19.43],
        zoom: 12
    });
}

// ==================== ACCIONES DE VIAJE ====================
function aceptarViaje() {
    if (!currentTrip) return;
    alert("¡Viaje aceptado! Ahora eres el conductor asignado.");
    showScreen('activeTrip');
}

function rechazarViaje() {
    if (confirm("¿Estás seguro de rechazar este viaje?")) {
        showScreen('dashboard');
        loadViajesDisponibles();
    }
}

function initMapActive() {
    mapActive = new mapboxgl.Map({
        container: 'mapActive',
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: [-99.13, 19.43],
        zoom: 13
    });
}

function llegueAlOrigen() {
    document.getElementById('tripStatus').textContent = "✅ En el origen - Esperando pasajero";
    alert("Estado actualizado: Llegaste al origen");
}

function iniciarViaje() {
    document.getElementById('tripStatus').textContent = "🛣️ Viaje en curso";
    alert("Viaje iniciado correctamente");
}

function finalizarViaje() {
    if (confirm("¿Finalizar este viaje?")) {
        alert("¡Viaje finalizado! +$" + (currentTrip ? currentTrip.precio : 300) + " a tus ganancias.");
        showScreen('dashboard');
        loadViajesDisponibles();
    }
}

function cerrarSesion() {
    if (confirm("¿Cerrar sesión?")) {
        localStorage.removeItem("conductorTel");
        currentUser = null;
        showScreen('home');
    }
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    const savedTel = localStorage.getItem("conductorTel");
    if (savedTel) {
        currentUser = { telefono: savedTel };
        showScreen('dashboard');
        loadViajesDisponibles();
    } else {
        showScreen('home');
    }
});
