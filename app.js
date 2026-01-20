const { createApp, ref, computed, onMounted, watch } = Vue;

const TRANSLATIONS = {
    en: {
        code: 'EN',
        settings: 'Settings',
        high_contrast: 'High Contrast',
        large_text: 'Large Text',
        voice_guidance: 'Voice Guidance',
        close: 'Close',
        search_placeholder: 'Search bus number or destination...',
        announce: 'Announce Arrival',
        report_issue: 'Report Issue',
        call_support: 'Call Support',
        bus_delay: 'Bus is delayed',
        wrong_location: 'Wrong location',
        bus_not_running: 'Bus not running',
        access_issue: 'Accessibility Issue',
        arriving_in: 'arriving in',
        minutes: 'minutes',
        to: 'to',
        profile: 'Profile',
        your_name: 'Your Name',
        commuter_type: 'Commuter Type',
        save: 'Save',
        disclaimer: 'Data sourced from PRTC public information. Live tracking is community-assisted and predictive until official GPS hardware is installed.'
    },
    ta: {
        code: 'தமிழ்',
        settings: 'அமைப்புகள்',
        high_contrast: 'உயர் மாறுபாடு',
        large_text: 'பெரிய எழுத்து',
        voice_guidance: 'குரல் வழிகாட்டி',
        close: 'மூடு',
        search_placeholder: 'பேருந்து எண் அல்லது இடத்தை தேடுக...',
        announce: 'அறிவிப்பு',
        report_issue: 'புகார் அளிக்கவும்',
        call_support: 'உதவிக்கு அழைக்கவும்',
        bus_delay: 'தாமதம்',
        wrong_location: 'தவறான இடம்',
        bus_not_running: 'பேருந்து இயங்கவில்லை',
        access_issue: 'அணுகல் பிரச்சனை',
        arriving_in: 'இன்னும்',
        minutes: 'நிமிடங்களில் வரும்',
        to: 'செல்லும்',
        profile: 'சுயவிவரம்',
        your_name: 'உங்கள் பெயர்',
        commuter_type: 'பயணி வகை',
        save: 'சேமி',
        disclaimer: 'PRTC பொதுத் தகவல்களிலிருந்து தரவு பெறப்பட்டது. நேரலை கண்காணிப்பு சமூகம் சார்ந்தது மற்றும் அதிகாரப்பூர்வ GPS பொருத்தப்படும் வரை கணிக்கப்பட்டதாகும்.'
    },
    fr: {
        code: 'FR',
        settings: 'Paramètres',
        high_contrast: 'Contraste élevé',
        large_text: 'Grand texte',
        voice_guidance: 'Guidage vocal',
        close: 'Fermer',
        search_placeholder: 'Chercher bus ou destination...',
        announce: 'Annoncer',
        report_issue: 'Signaler un problème',
        call_support: 'Appeler le support',
        bus_delay: 'Bus en retard',
        wrong_location: 'Mauvais emplacement',
        bus_not_running: 'Bus ne circule pas',
        access_issue: 'Problème d\'accessibilité',
        arriving_in: 'arrive dans',
        minutes: 'minutes',
        to: 'vers',
        profile: 'Profil',
        your_name: 'Votre Nom',
        commuter_type: 'Type de navetteur',
        save: 'Sauvegarder',
        disclaimer: 'Données provenant des informations publiques du PRTC. Le suivi en direct est communautaire et prédictif jusqu\'à l\'installation du GPS officiel.'
    }
};

const BUS_ROUTES = [
    { id: '101', route: '10A', dest: 'White Town', start: [11.95, 79.81], end: [11.93, 79.83], electric: true },
    { id: '102', route: '5B', dest: 'Auroville', start: [11.93, 79.82], end: [11.98, 79.80], electric: true },
    { id: '103', route: '22', dest: 'JIPMER', start: [11.92, 79.83], end: [11.95, 79.79], electric: true },
    { id: '104', route: '7C', dest: 'Beach Rd', start: [11.96, 79.81], end: [11.91, 79.82], electric: true },
    { id: '105', route: '12', dest: 'Bus Stand', start: [11.98, 79.80], end: [11.93, 79.81], electric: false },
];

const STATIONS = [
    { name: 'New Bus Stand', lat: 11.936, lng: 79.815 },
    { name: 'JIPMER', lat: 11.954, lng: 79.796 },
    { name: 'White Town', lat: 11.932, lng: 79.834 },
    { name: 'Auroville', lat: 11.996, lng: 79.812 },
    { name: 'Beach Rd', lat: 11.922, lng: 79.838 }
];

createApp({
    setup() {
        const langCode = ref('en');
        const showSettings = ref(false);
        const showReport = ref(false);
        const showProfile = ref(false);
        const searchQuery = ref('');
        const selectedBus = ref(null);

        // User Profile
        const userProfile = ref(JSON.parse(localStorage.getItem('prtc_profile')) || {
            name: '',
            type: 'Daily Commuter'
        });

        // Persisted Settings
        const settings = ref(JSON.parse(localStorage.getItem('prtc_settings')) || {
            highContrast: false,
            largeText: false,
            voiceGuidance: true
        });

        const reportOptions = ['bus_delay', 'wrong_location', 'bus_not_running', 'access_issue'];

        // Reactive Bus Data
        const buses = ref([]);
        let map = null;
        let markers = {};

        // Computed
        const currentLang = computed(() => TRANSLATIONS[langCode.value]);

        const filteredBuses = computed(() => {
            if (!searchQuery.value) return buses.value;
            const q = searchQuery.value.toLowerCase();
            return buses.value.filter(b =>
                b.route.toLowerCase().includes(q) ||
                b.destination.toLowerCase().includes(q)
            );
        });

        // Methods
        const t = (key) => currentLang.value[key] || key;

        const toggleLang = () => {
            const codes = Object.keys(TRANSLATIONS);
            const idx = codes.indexOf(langCode.value);
            langCode.value = codes[(idx + 1) % codes.length];
            speak(currentLang.value.code); // Announce language change
        };

        const toggleSettings = () => showSettings.value = !showSettings.value;
        const toggleProfile = () => showProfile.value = !showProfile.value;

        const saveProfile = () => {
            localStorage.setItem('prtc_profile', JSON.stringify(userProfile.value));
            showProfile.value = false;
        };

        // Watch settings content changes
        watch(settings, (newVal) => {
            localStorage.setItem('prtc_settings', JSON.stringify(newVal));
        }, { deep: true });

        const speak = (text) => {
            if (!settings.value.voiceGuidance || !window.speechSynthesis) return;
            // Cancel current speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            // Try to set language
            if (langCode.value === 'ta') utterance.lang = 'ta-IN';
            else if (langCode.value === 'fr') utterance.lang = 'fr-FR';
            else utterance.lang = 'en-US';

            window.speechSynthesis.speak(utterance);
        };

        const announceBus = (bus) => {
            // E.g. "Bus 10A to White Town arriving in 5 minutes"
            let text = '';
            if (langCode.value === 'en') {
                text = `Bus ${bus.route} to ${bus.destination} arriving in ${bus.eta} minutes`;
            } else if (langCode.value === 'ta') {
                text = `${bus.route} பேருந்து ${bus.destination} நோக்கி செல்கிறது, ${bus.eta} நிமிடங்களில் வரும்`;
            } else {
                text = `Bus ${bus.route} vers ${bus.destination} arrive dans ${bus.eta} minutes`;
            }
            speak(text);
        };

        const selectBus = (bus) => {
            selectedBus.value = bus;
            // Pan map to bus
            if (map && bus.lat && bus.lng) {
                map.flyTo([bus.lat, bus.lng], 15, { animate: true, duration: 1.5 });

                // Highlight marker
                updateMarkers();
            }
            // Auto announce
            announceBus(bus);
        };

        const submitReport = (type) => {
            alert(`Report submitted: ${t(type)}`);
            showReport.value = false;
        };

        // Initialize Data
        const initBuses = () => {
            buses.value = BUS_ROUTES.map(r => ({
                id: r.id,
                route: r.route,
                destination: r.dest,
                isElectric: r.electric,
                lat: r.start[0],
                lng: r.start[1],
                targetLat: r.end[0],
                targetLng: r.end[1],
                eta: Math.floor(Math.random() * 15) + 2,
                crowdLevel: ['Low', 'Med', 'High'][Math.floor(Math.random() * 3)],
                distance: (Math.random() * 5).toFixed(1),
                status: 'On Time',
                progress: 0
            }));
        };

        // Map Logic
        const initMap = () => {
            // Pondicherry Center
            map = L.map('map', {
                zoomControl: false,
                attributionControl: false
            }).setView([11.935, 79.812], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            L.control.zoom({
                position: 'bottomright'
            }).addTo(map);

            // Add Markers
            updateMarkers();
            initStations();
        };

        const initStations = () => {
            STATIONS.forEach(station => {
                const icon = L.divIcon({
                    className: 'station-marker',
                    html: '<div class="station-dot"></div>',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                });
                const marker = L.marker([station.lat, station.lng], { icon: icon }).addTo(map);
                marker.bindPopup(`<b>${station.name}</b>`);
            });
        };

        const updateMarkers = () => {
            buses.value.forEach(bus => {
                let marker = markers[bus.id];

                // Create custom icon
                const isSelected = selectedBus.value && selectedBus.value.id === bus.id;
                const iconClass = `bus-marker-container ${bus.isElectric ? 'electric' : ''} ${isSelected ? 'selected' : ''}`;

                const customIcon = L.divIcon({
                    className: iconClass,
                    html: `<div class="bus-marker-icon"><i class="ph-fill ph-${bus.isElectric ? 'lightning' : 'bus'}"></i></div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                });

                if (!marker) {
                    marker = L.marker([bus.lat, bus.lng], { icon: customIcon }).addTo(map);
                    marker.on('click', () => selectBus(bus));
                    markers[bus.id] = marker;
                } else {
                    marker.setIcon(customIcon);
                    // Smooth move
                    const oldLatLng = marker.getLatLng();
                    // Just direct set for now, usually would use plugin for animation or interpolated updates
                    marker.setLatLng([bus.lat, bus.lng]);

                    // Simple "slide" simulation handled by high frequency updates
                    // Or we could use CSS transition on the marker element itself if we weren't rebuilding it.
                    // Leaflet marker sliding is complex without plugins, so we update frequently.
                }

                // Set z-index high for selected
                if (isSelected) marker.setZIndexOffset(1000);
                else marker.setZIndexOffset(0);
            });
        };

        // Movement Simulation
        const startSimulation = () => {
            setInterval(() => {
                buses.value = buses.value.map(bus => {
                    // Move bus towards target
                    // Simple lerp (Linear Interpolation)
                    const speed = 0.005;
                    let dirLat = bus.targetLat - bus.lat;
                    let dirLng = bus.targetLng - bus.lng;

                    // Normalize (rough)
                    const len = Math.sqrt(dirLat * dirLat + dirLng * dirLng);
                    if (len < 0.001) {
                        // Reached target, swap
                        const tempLat = bus.targetLat;
                        const tempLng = bus.targetLng;
                        // Actually in a real app check routes, but here swap start/end
                        bus.targetLat = bus.lat - (dirLat * 10); // Go back somewhere?
                        bus.targetLng = bus.lng - (dirLng * 10);
                        // Just toggle for simplicity to original start
                        if (Math.abs(bus.lat - 11.95) < 0.01) { // rough check
                            // Just bounce back and forth
                        }
                        // Actually let's just reverse direction when close
                        dirLat = -dirLat;
                        dirLng = -dirLng;
                    }

                    // Move 1% of distance each tick? No, specific step
                    const step = 0.005; // ~500m per tick if lat/lng were meters (they aren't)

                    // Creating a "wandering" effect around Pondy
                    // Just simple brownian motion + bias to target
                    const jitter = 0.0002 * (Math.random() - 0.5);

                    bus.lat += (dirLat * 0.05) + jitter;
                    bus.lng += (dirLng * 0.05) + jitter;

                    // Simulate ETA drop
                    if (Math.random() > 0.95 && bus.eta > 0) bus.eta--;

                    return bus;
                });

                updateMarkers();
            }, 1000);
        };

        onMounted(() => {
            initBuses();
            initMap();
            startSimulation();
        });

        watch(selectedBus, (newVal) => {
            updateMarkers(); // Refresh to highlight selected
        });

        return {
            t,
            settings,
            currentLang,
            toggleLang,
            toggleSettings,

            showSettings,
            showReport,
            showProfile,
            toggleProfile,
            userProfile,
            saveProfile,
            searchQuery,
            filteredBuses,
            selectedBus,
            selectBus,
            announceBus,
            submitReport,
            reportOptions
        };
    }
}).mount('#app');
