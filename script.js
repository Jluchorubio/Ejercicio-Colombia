        const API_URL = "https://api-colombia.com/api/v1";

        // Estados de paginación
        let deptPage = 1;
        let tourPage = 1;
        let deptMaxPages = 1;
        let tourMaxPages = 1;

        /**
         * Función genérica para realizar peticiones seguras
         */
        async function safeFetch(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error("Error en la petición:", error);
                return null;
            }
        }

        /**
         * Carga Departamentos: Obtiene lista paginada y luego detalles para Capital/Región
         */
        async function fetchDepartments(page) {
            const container = document.getElementById('container-dept');
            container.innerHTML = '<div class="loading">Cargando departamentos...</div>';

            const result = await safeFetch(`${API_URL}/Department/pagedList?page=${page}&pageSize=10`);

            if (result && result.data) {
                deptMaxPages = result.pageCount;
                document.getElementById('page-dept').textContent = `Página ${page} de ${deptMaxPages}`;

                // Obtenemos el detalle de cada uno para traer objetos anidados (Capital y Región)
                const detailedDepts = await Promise.all(
                    result.data.map(d => safeFetch(`${API_URL}/Department/${d.id}`))
                );

                container.innerHTML = "";
                detailedDepts.forEach(dept => {
                    if (!dept) return;

                    // Aseguramos que la región exista antes de mostrarla
                    const regionName = dept.region && dept.region.name ? dept.region.name : 'No disponible';
                    const capitalName = dept.cityCapital ? dept.cityCapital.name : 'N/A';
                    const description = dept.description ? dept.description.substring(0, 100) + '...' : 'Sin descripción.';

                    container.innerHTML += `
                        <div class="card">
                            <div class="card-body">
                                <h3>${dept.name}</h3>
                                <p><span class="tag">Capital:</span> ${capitalName}</p>
                                <p><span class="tag">Región:</span> ${regionName}</p>
                                <p>${description}</p>
                            </div>
                        </div>`;
                });
            } else {
                container.innerHTML = '<p class="error-msg">Error al cargar departamentos.</p>';
            }
            updateButtons();
        }

        /**
         * Carga Sitios Turísticos: Filtra por imagen y obtiene detalle para Ciudad/Departamento
         */
        async function fetchTouristicAttractions(page) {
            const container = document.getElementById('container-tour');
            container.innerHTML = '<div class="loading">Buscando sitios con imágenes...</div>';

            const result = await safeFetch(`${API_URL}/TouristicAttraction/pagedList?page=${page}&pageSize=25`);

            if (result && result.data) {
                tourMaxPages = result.pageCount;
                document.getElementById('page-tour').textContent = `Página ${page} de ${tourMaxPages}`;

                // 1. Filtrar solo los que tienen imágenes
                const filtered = result.data.filter(p => p.images && p.images.length > 0).slice(0, 10);

                // 2. Obtener detalle para traer Ciudad y su Departamento
                const detailedPlaces = await Promise.all(
                    filtered.map(p => safeFetch(`${API_URL}/TouristicAttraction/${p.id}`))
                );

                container.innerHTML = "";
                detailedPlaces.forEach(place => {
                    if (!place) return;
                    container.innerHTML += `
                        <div class="card">
                            <img src="${place.images[0]}" alt="${place.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+No+Disponible'">
                            <div class="card-body">
                                <h3>${place.name}</h3>
                                <p><span class="tag">Depto:</span> ${place.city?.department?.name || 'Colombia'}</p>
                                <p><span class="tag">Ciudad:</span> ${place.city?.name || 'N/A'}</p>
                                <p>${place.description ? place.description.substring(0, 100) + '...' : 'Sin descripción.'}</p>
                            </div>
                        </div>`;
                });
            } else {
                container.innerHTML = '<p class="error-msg">Error al cargar sitios turísticos.</p>';
            }
            updateButtons();
        }

        /**
         * Actualiza el estado de los botones de navegación
         */
        function updateButtons() {
            document.getElementById('btn-dept-prev').disabled = (deptPage <= 1);
            document.getElementById('btn-dept-next').disabled = (deptPage >= deptMaxPages);

            document.getElementById('btn-tour-prev').disabled = (tourPage <= 1);
            document.getElementById('btn-tour-next').disabled = (tourPage >= tourMaxPages);
        }

        /**
         * Maneja el cambio de página
         */
        function changePage(type, delta) {
            if (type === 'dept') {
                deptPage += delta;
                fetchDepartments(deptPage);
            } else {
                tourPage += delta;
                fetchTouristicAttractions(tourPage);
            }
        }

        // Carga inicial al abrir la página
        fetchDepartments(deptPage);
        fetchTouristicAttractions(tourPage);

        async function fetchMaps() {
    const container = document.getElementById('container-maps');
    container.innerHTML = '<p class="loading">Cargando mapas...</p>';

    // Consumimos el endpoint de mapas
    const maps = await safeFetch(`${API_URL}/Map`);

    if (maps) {
        container.innerHTML = "";
        // Mostraremos los primeros 3 mapas (ej: Político, Físico, etc.)
        maps.slice(0, 3).forEach(map => {
            // Tomamos la primera imagen del arreglo urlImages
            const mapImg = map.urlImages && map.urlImages.length > 0 ? map.urlImages[0] : '';
            
            container.innerHTML += `
                <div class="card">
                    <img src="${mapImg}" alt="${map.name}" style="height: 300px; object-fit: contain; background: #fff;">
                    <div class="card-body">
                        <h3>${map.name}</h3>
                        <p>${map.description || 'Mapa oficial de la República de Colombia.'}</p>
                        <a href="${mapImg}" target="_blank" class="tag" style="text-decoration:none">Ver en tamaño completo</a>
                    </div>
                </div>`;
        });
    } else {
        container.innerHTML = '<p class="error-msg">No se pudieron cargar los mapas.</p>';
    }
}

// No olvides llamar a la función al inicio
fetchMaps();