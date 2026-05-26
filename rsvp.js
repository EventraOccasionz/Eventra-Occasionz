// RSVP JavaScript
import { auth, db, storage, COLLECTIONS } from './firebase-config.js';
import { 
    doc, 
    getDoc, 
    updateDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const pathParts = window.location.pathname.split('/').filter(p => p);
const coupleSlug = pathParts[0] || urlParams.get('couple');
const guestSlug = pathParts[1] || urlParams.get('guest');

// DOM Elements
const loader = document.getElementById('loader');
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('guestLoginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');

// Current guest data
let currentGuest = null;
let currentCouple = null;

// Initialize
window.addEventListener('load', () => {
    loader.classList.add('hidden');
    loadCoupleInfo();
});

// Load couple info
async function loadCoupleInfo() {
    try {
        const q = query(collection(db, COLLECTIONS.COUPLES), where('coupleId', '==', coupleSlug));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            currentCouple = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            document.getElementById('coupleName').textContent = currentCouple.coupleName;
            document.getElementById('coupleImage').src = currentCouple.coverImage || 'image/hero-banner.png';
            startCountdown(currentCouple.eventDate);
            loadEvents();
        } else {
            loginError.textContent = 'Invalid invitation link';
        }
    } catch (error) {
        loginError.textContent = 'Error loading invitation';
    }
}

// Load events for the couple
async function loadEvents() {
    try {
        const q = query(collection(db, COLLECTIONS.EVENTS), where('coupleId', '==', coupleSlug));
        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(doc => doc.data());
        
        const timeline = document.getElementById('eventsTimeline');
        if (events.length === 0) {
            timeline.innerHTML = '<p>No events scheduled yet</p>';
        } else {
            timeline.innerHTML = events.map(event => `
                <div class="event-item">
                    <h3>${event.eventName}</h3>
                    <p><i class="fas fa-calendar"></i> ${event.date}</p>
                    <p><i class="fas fa-clock"></i> ${event.time}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.venue}</p>
                </div>
            `).join('');
            
            // Set venue info from first event
            const firstEvent = events[0];
            document.getElementById('venueInfo').innerHTML = `
                <h3>${firstEvent.venue}</h3>
                <p>${firstEvent.date} at ${firstEvent.time}</p>
            `;
            document.getElementById('mapBtn').style.display = firstEvent.mapLink ? 'block' : 'none';
            document.getElementById('mapBtn').onclick = () => window.open(firstEvent.mapLink, '_blank');
        }
    } catch (error) {
        document.getElementById('eventsTimeline').innerHTML = '<p>Error loading events</p>';
    }
}

// Countdown Timer
function startCountdown(eventDate) {
    const countdown = () => {
        const eventTime = new Date(eventDate).getTime();
        const now = new Date().getTime();
        const diff = eventTime - now;
        
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        }
    };
    
    countdown();
    setInterval(countdown, 1000);
}

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('guestPassword').value;
    
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span>Verifying...</span><i class="fas fa-spinner fa-spin"></i>';
    
    try {
        // Find guest by uniqueSlug
        const q = query(collection(db, COLLECTIONS.GUESTS), where('uniqueSlug', '==', guestSlug));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            throw new Error('Invalid invitation link');
        }
        
        const guestDoc = snapshot.docs[0];
        const guestData = guestDoc.data();
        
        // Verify password (last 4 digits of mobile)
        if (guestData.password !== password) {
            throw new Error('Invalid password');
        }
        
        currentGuest = { id: guestDoc.id, ...guestData };
        
        // Store session
        sessionStorage.setItem('guestLoggedIn', 'true');
        sessionStorage.setItem('guestId', guestDoc.id);
        
        // Show dashboard
        showDashboard();
    } catch (error) {
        loginError.textContent = error.message;
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>Access Invitation</span><i class="fas fa-arrow-right"></i>';
    }
});

// Show Dashboard
function showDashboard() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    
    // Set welcome message
    const guestName = currentGuest.guestName || 'Guest';
    const lastName = guestName.split(' ').pop() || guestName;
    document.getElementById('welcomeMessage').textContent = `Welcome ${lastName} Family!`;
    
    // Check if already RSVP'd
    if (currentGuest.RSVPStatus && currentGuest.RSVPStatus !== 'pending') {
        document.getElementById('rsvpButtons').style.display = 'none';
        document.getElementById('rsvpDetailsSection').style.display = 'block';
        document.getElementById('photoUploadSection').style.display = 'block';
        document.getElementById('qrSection').style.display = 'block';
        
        // Load existing data
        document.getElementById('guestCount').value = currentGuest.guestCount || 1;
        document.getElementById('foodPreference').value = currentGuest.foodPreference || 'veg';
        document.getElementById('arrivalDate').value = currentGuest.arrivalDate || '';
        document.getElementById('departureDate').value = currentGuest.departureDate || '';
        document.getElementById('pickupRequired').checked = currentGuest.pickupRequired || false;
        
        if (currentGuest.photoURL) {
            document.getElementById('photoPreview').innerHTML = `<img src="${currentGuest.photoURL}" alt="Your Photo">`;
        }
        
        if (currentGuest.qrCode) {
            document.getElementById('qrCode').src = currentGuest.qrCode;
        }
    }
}

// RSVP Buttons
document.querySelectorAll('.rsvp-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const status = btn.dataset.status;
        handleRSVP(status);
    });
});

// Handle RSVP
async function handleRSVP(status) {
    try {
        await updateDoc(doc(db, COLLECTIONS.GUESTS, currentGuest.id), {
            RSVPStatus: status
        });
        
        currentGuest.RSVPStatus = status;
        
        if (status === 'attending') {
            document.getElementById('rsvpButtons').style.display = 'none';
            document.getElementById('rsvpDetailsSection').style.display = 'block';
            document.getElementById('photoUploadSection').style.display = 'block';
        } else {
            alert('Thank you for your response. We hope to see you next time!');
            document.getElementById('rsvpButtons').style.display = 'none';
        }
    } catch (error) {
        alert('Error submitting RSVP');
    }
}

// RSVP Details Form
document.getElementById('rsvpDetailsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const details = {
        guestCount: parseInt(document.getElementById('guestCount').value),
        foodPreference: document.getElementById('foodPreference').value,
        arrivalDate: document.getElementById('arrivalDate').value,
        departureDate: document.getElementById('departureDate').value,
        pickupRequired: document.getElementById('pickupRequired').checked
    };
    
    try {
        await updateDoc(doc(db, COLLECTIONS.GUESTS, currentGuest.id), details);
        currentGuest = { ...currentGuest, ...details };
        
        // Generate QR Code
        generateQRCode();
        
        document.getElementById('qrSection').style.display = 'block';
        alert('RSVP submitted successfully!');
    } catch (error) {
        alert('Error submitting details');
    }
});

// Generate QR Code
function generateQRCode() {
    const qrData = `GUEST:${currentGuest.id}|NAME:${currentGuest.guestName}|COUPLE:${coupleSlug}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    document.getElementById('qrCode').src = qrUrl;
    
    // Save to database
    updateDoc(doc(db, COLLECTIONS.GUESTS, currentGuest.id), {
        qrCode: qrUrl
    });
}

// Photo Upload
document.getElementById('cameraBtn').addEventListener('click', () => {
    document.getElementById('photoInput').setAttribute('capture', 'environment');
    document.getElementById('photoInput').click();
});

document.getElementById('galleryBtn').addEventListener('click', () => {
    document.getElementById('photoInput').removeAttribute('capture');
    document.getElementById('photoInput').click();
});

document.getElementById('photoInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
    try {
        const storageRef = ref(storage, `guest-photos/${currentGuest.id}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        
        preview.innerHTML = `<img src="${url}" alt="Your Photo">`;
        
        // Save to database
        await updateDoc(doc(db, COLLECTIONS.GUESTS, currentGuest.id), {
            photoURL: url
        });
        
        currentGuest.photoURL = url;
    } catch (error) {
        preview.innerHTML = '<p>Error uploading photo</p>';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('guestLoggedIn');
    sessionStorage.removeItem('guestId');
    window.location.reload();
});