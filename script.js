        // Mantener el script original exactamente igual
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
            container.innerHTML = '<div class="col-span-full flex justify-center py-12"><div class="text-center"><div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-colombia-green/10 mb-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-colombia-green animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div><p class="text-gray-500 font-medium">Cargando departamentos...</p></div></div>';
            
            const result = await safeFetch(`${API_URL}/Department/pagedList?page=${page}&pageSize=10`);
            
            if (result && result.data) {
                deptMaxPages = result.pageCount;
                document.getElementById('page-dept').textContent = `Página ${page} de ${deptMaxPages}`;
                
                // Actualizar indicadores de página
                updatePageIndicators('dept', page, deptMaxPages);
                
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
                    
                    // Generar color aleatorio para la tarjeta
                    const colors = ['from-green-400 to-emerald-600', 'from-blue-400 to-cyan-600', 'from-amber-400 to-orange-600', 'from-purple-400 to-indigo-600'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    container.innerHTML += `
                    <div class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-colombia-green/30 flex flex-col h-full">
                        <div class="h-3 bg-gradient-to-r ${randomColor}"></div>
                        <div class="p-6 flex-grow">
                            <div class="flex justify-between items-start mb-4">
                                <h3 class="text-xl font-bold text-gray-800 group-hover:text-colombia-green transition-colors">${dept.name}</h3>
                                <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-colombia-green/10 text-colombia-green font-bold text-sm">
                                    ${dept.id}
                                </span>
                            </div>
                            
                            <div class="space-y-3 mb-6">
                                <div class="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-colombia-blue mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div>
                                        <span class="text-sm font-medium text-gray-500">Capital:</span>
                                        <p class="font-medium text-gray-800">${capitalName}</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-colombia-yellow mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                                    </svg>
                                    <div>
                                        <span class="text-sm font-medium text-gray-500">Región:</span>
                                        <p class="font-medium text-gray-800">${regionName}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">${description}</p>
                        </div>
                        
                        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-gray-500">Departamento de Colombia</span>
                                <span class="inline-flex items-center text-colombia-green text-sm font-medium">
                                    Explorar
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>`;
                });
            } else {
                container.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p class="text-red-500 font-medium">Error al cargar departamentos.</p></div>';
            }
            
            updateButtons();
        }

        /**
         * Carga Sitios Turísticos: Filtra por imagen y obtiene detalle para Ciudad/Departamento
         */
        async function fetchTouristicAttractions(page) {
            const container = document.getElementById('container-tour');
            container.innerHTML = '<div class="col-span-full flex justify-center py-12"><div class="text-center"><div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-colombia-yellow/10 mb-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-colombia-yellow animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div><p class="text-gray-500 font-medium">Buscando sitios con imágenes...</p></div></div>';
            
            const result = await safeFetch(`${API_URL}/TouristicAttraction/pagedList?page=${page}&pageSize=25`);
            
            if (result && result.data) {
                tourMaxPages = result.pageCount;
                document.getElementById('page-tour').textContent = `Página ${page} de ${tourMaxPages}`;
                
                // Actualizar indicadores de página
                updatePageIndicators('tour', page, tourMaxPages);
                
                // 1. Filtrar solo los que tienen imágenes
                const filtered = result.data.filter(p => p.images && p.images.length > 0).slice(0, 10);
                
                // 2. Obtener detalle para traer Ciudad y su Departamento
                const detailedPlaces = await Promise.all(
                    filtered.map(p => safeFetch(`${API_URL}/TouristicAttraction/${p.id}`))
                );
                
                container.innerHTML = "";
                
                detailedPlaces.forEach(place => {
                    if (!place) return;
                    
                    const cityName = place.city?.name || 'N/A';
                    const deptName = place.city?.department?.name || 'Colombia';
                    const description = place.description ? place.description.substring(0, 100) + '...' : 'Sin descripción.';
                    
                    container.innerHTML += `
                    <div class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-colombia-yellow/30 flex flex-col h-full">
                        <div class="h-48 overflow-hidden relative">
                            <img src="${place.images[0]}" alt="${place.name}" 
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; this.className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'">
                            <div class="absolute top-4 right-4">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    Destacado
                                </span>
                            </div>
                        </div>
                        
                        <div class="p-6 flex-grow">
                            <h3 class="text-xl font-bold text-gray-800 group-hover:text-colombia-yellow transition-colors mb-3 line-clamp-1">${place.name}</h3>
                            
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-colombia-blue/10 text-colombia-blue">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    ${deptName}
                                </span>
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-colombia-green/10 text-colombia-green">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    ${cityName}
                                </span>
                            </div>
                            
                            <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">${description}</p>
                        </div>
                        
                        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-gray-500">Sitio turístico</span>
                                <span class="inline-flex items-center text-colombia-yellow text-sm font-medium">
                                    Visitar
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>`;
                });
            } else {
                container.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p class="text-red-500 font-medium">Error al cargar sitios turísticos.</p></div>';
            }
            
            updateButtons();
        }

        /**
         * Actualiza los indicadores visuales de página
         */
        function updatePageIndicators(type, currentPage, maxPages) {
            const indicators = document.querySelectorAll(`.${type}-indicator`);
            
            indicators.forEach((indicator, index) => {
                // Calcular qué página representa este indicador
                const pageNumber = index + 1;
                
                if (pageNumber === currentPage) {
                    indicator.className = `w-2 h-2 rounded-full ${type === 'dept' ? 'bg-colombia-green' : 'bg-colombia-yellow'}`;
                } else if (pageNumber <= maxPages) {
                    indicator.className = `w-2 h-2 rounded-full ${type === 'dept' ? 'bg-colombia-green/30' : 'bg-colombia-yellow/30'}`;
                } else {
                    indicator.className = 'w-2 h-2 rounded-full bg-gray-300';
                }
            });
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

        /**
         * Carga los mapas de Colombia
         */
        async function fetchMaps() {
            const container = document.getElementById('container-maps');
            container.innerHTML = '<div class="col-span-full flex justify-center py-12"><div class="text-center"><div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-colombia-red/10 mb-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-colombia-red animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div><p class="text-gray-500 font-medium">Cargando mapas...</p></div></div>';
            
            const maps = await safeFetch(`${API_URL}/Map`);
            
            if (maps) {
                container.innerHTML = "";
                
                maps.slice(0, 3).forEach(map => {
                    const mapImg = map.urlImages && map.urlImages.length > 0 ? map.urlImages[0] : 'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    const description = map.description || 'Mapa oficial de la República de Colombia.';
                    
                    container.innerHTML += `
                    <div class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-colombia-red/30 flex flex-col h-full">
                        <div class="h-64 overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <img src="${mapImg}" alt="${map.name}" 
                                 class="max-h-full max-w-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; this.className='max-h-full max-w-full object-contain p-4 group-hover:scale-105 transition-transform duration-500'">
                        </div>
                        
                        <div class="p-6 flex-grow">
                            <h3 class="text-xl font-bold text-gray-800 group-hover:text-colombia-red transition-colors mb-3">${map.name}</h3>
                            
                            <p class="text-gray-600 text-sm leading-relaxed mb-6">${description}</p>
                        </div>
                        
                        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-gray-500">Mapa de Colombia</span>
                                <a href="${mapImg}" target="_blank" class="inline-flex items-center px-4 py-2 bg-colombia-red text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                    </svg>
                                    Ver en tamaño completo
                                </a>
                            </div>
                        </div>
                    </div>`;
                });
            } else {
                container.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p class="text-red-500 font-medium">No se pudieron cargar los mapas.</p></div>';
            }
        }

        // Carga inicial al abrir la página
        fetchDepartments(deptPage);
        fetchTouristicAttractions(tourPage);
        fetchMaps();
        
        // Efecto de scroll para el header
        window.addEventListener('scroll', function() {
            const header = document.querySelector('header');
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });

    // Animación de revelado al hacer scroll
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal-on-scroll');
        
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('revealed');
            }
        });
    }
    
    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('load', revealOnScroll);
    
    // Animación para los contadores
    function animateCounters() {
        const counters = document.querySelectorAll('.counter-animate');
        
        counters.forEach(counter => {
            const elementTop = counter.getBoundingClientRect().top;
            
            if (elementTop < window.innerHeight - 100 && !counter.classList.contains('animate')) {
                counter.classList.add('animate');
                
                // Si el contador tiene un número para animar
                const target = counter.getAttribute('data-target');
                if (target) {
                    animateValue(counter, 0, target, 2000);
                }
            }
        });
    }
    
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.textContent = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    window.addEventListener('scroll', animateCounters);
    
    // Efecto de partículas para botones importantes
    document.querySelectorAll('.particle-effect').forEach(button => {
        button.addEventListener('click', function(e) {
            // Crear efecto de partículas
            for(let i = 0; i < 10; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '4px';
                particle.style.height = '4px';
                particle.style.backgroundColor = '#F9C80E';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                
                const rect = this.getBoundingClientRect();
                particle.style.left = (e.clientX - rect.left) + 'px';
                particle.style.top = (e.clientY - rect.top) + 'px';
                
                this.appendChild(particle);
                
                // Animación de la partícula
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 3;
                const duration = 500 + Math.random() * 500;
                
                const animation = particle.animate([
                    { 
                        transform: 'translate(0, 0) scale(1)',
                        opacity: 1
                    },
                    { 
                        transform: `translate(${Math.cos(angle) * speed * 50}px, ${Math.sin(angle) * speed * 50}px) scale(0)`,
                        opacity: 0
                    }
                ], {
                    duration: duration,
                    easing: 'cubic-bezier(0.1, 0.7, 0.2, 1)'
                });
                
                animation.onfinish = () => particle.remove();
            }
        });
    });
    
    // Animación de carga para imágenes
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
        
        // Agregar clase de carga
        if (!img.complete) {
            img.classList.add('loading');
        }
    });
    
    // Efecto hover para las tarjetas de departamentos
    document.addEventListener('DOMContentLoaded', function() {
        const cards = document.querySelectorAll('#container-dept > div, #container-tour > div, #container-maps > div');
        
        cards.forEach((card, index) => {
            // Agregar animación escalonada
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-fade-in-up');
            
            // Agregar efecto hover 3D
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = (x - centerX) / 25;
                const rotateX = (centerY - y) / 25;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
                this.style.transition = 'transform 0.5s ease';
            });
        });
    });
    
    // Inicializar animaciones al cargar la página
    window.addEventListener('load', function() {
        // Animar elementos del hero
        const heroTitle = document.querySelector('header h1');
        const heroSubtitle = document.querySelector('header p');
        const heroButtons = document.querySelector('header .flex.flex-wrap.gap-4');
        
        if (heroTitle) heroTitle.classList.add('hero-text-animate');
        if (heroSubtitle) heroSubtitle.classList.add('hero-subtitle-animate');
        if (heroButtons) heroButtons.classList.add('hero-buttons-animate');
        
        // Forzar animación de scroll al cargar
        revealOnScroll();
        animateCounters();
    });

