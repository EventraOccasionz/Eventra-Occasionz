// Admin Dashboard JavaScript
import { auth, db, storage, COLLECTIONS } from './firebase-config.js';
import { 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    collection, 
    query, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc,
    getDoc,
    setDoc,
    where
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'admin.html';
    } else {
        document.getElementById('adminEmail').textContent = user.email;
        loadDashboardData();
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin.html';
});

// Navigation
document.querySelectorAll('.sidebar-menu a[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        switchSection(section);
        link.classList.add('active');
    });
});

function switchSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}-section`).classList.add('active');
    document.getElementById('sectionTitle').textContent = getSectionTitle(section);
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'guests':
            loadGuests();
            break;
        case 'rsvp':
            loadRSVPData();
            break;
        case 'photos':
            loadPhotos();
            break;
        case 'couples':
            loadCouples();
            break;
        case 'events':
            loadEvents();
            break;
    }
}

function getSectionTitle(section) {
    const titles = {
        dashboard: 'Dashboard Overview',
        guests: 'Guest Management',
        rsvp: 'RSVP Tracking',
        photos: 'Photo Management',
        couples: 'Couple Management',
        events: 'Event Management',
        website: 'Website Control'
    };
    return titles[section] || 'Dashboard';
}

// Load Dashboard Stats
async function loadDashboardData() {
    try {
        const guestsSnapshot = await getDocs(collection(db, COLLECTIONS.GUESTS));
        const guests = guestsSnapshot.docs.map(doc => doc.data());
        
        const total = guests.length;
        const attending = guests.filter(g => g.RSVPStatus === 'attending').length;
        const notAttending = guests.filter(g => g.RSVPStatus === 'not-attending').length;
        const pending = guests.filter(g => !g.RSVPStatus || g.RSVPStatus === 'pending').length;
        
        document.getElementById('totalGuests').textContent = total;
        document.getElementById('attendingCount').textContent = attending;
        document.getElementById('notAttendingCount').textContent = notAttending;
        document.getElementById('pendingCount').textContent = pending;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load Guests
async function loadGuests() {
    const tbody = document.getElementById('guestsTableBody');
    tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
    
    try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.GUESTS));
        const guests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (guests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No guests found</td></tr>';
            return;
        }
        
        tbody.innerHTML = guests.map(guest => `
            <tr>
                <td>${guest.guestName || ''}</td>
                <td>${guest.mobileNumber || ''}</td>
                <td><span class="status ${guest.RSVPStatus || 'pending'}">${guest.RSVPStatus || 'Pending'}</span></td>
                <td>${guest.guestCount || 0}</td>
                <td>
                    <button class="icon-btn edit-guest" data-id="${guest.id}"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn delete-guest" data-id="${guest.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners
        document.querySelectorAll('.edit-guest').forEach(btn => {
            btn.addEventListener('click', () => editGuest(btn.dataset.id));
        });
        document.querySelectorAll('.delete-guest').forEach(btn => {
            btn.addEventListener('click', () => deleteGuest(btn.dataset.id));
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5">Error loading guests</td></tr>';
    }
}

// Load RSVP Data
async function loadRSVPData() {
    const tbody = document.getElementById('rsvpTableBody');
    tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
    
    try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.GUESTS));
        const guests = snapshot.docs.map(doc => doc.data());
        
        tbody.innerHTML = guests.map(guest => `
            <tr>
                <td>${guest.guestName || ''}</td>
                <td><span class="status ${guest.RSVPStatus || 'pending'}">${guest.RSVPStatus || 'Pending'}</span></td>
                <td>${guest.guestCount || 0}</td>
                <td>${guest.foodPreference || '-'}</td>
                <td>${guest.arrivalDate || '-'}</td>
                <td>${guest.departureDate || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6">Error loading RSVP data</td></tr>';
    }
}

// Load Photos
async function loadPhotos() {
    const grid = document.getElementById('photoGrid');
    grid.innerHTML = '<p>Loading photos...</p>';
    
    try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.GUESTS));
        const guests = snapshot.docs.map(doc => doc.data()).filter(g => g.photoURL);
        
        if (guests.length === 0) {
            grid.innerHTML = '<p>No photos uploaded yet</p>';
            return;
        }
        
        grid.innerHTML = guests.map(guest => `
            <div class="photo-item">
                <img src="${guest.photoURL}" alt="${guest.guestName}">
                <p>${guest.guestName}</p>
            </div>
        `).join('');
    } catch (error) {
        grid.innerHTML = '<p>Error loading photos</p>';
    }
}

// Load Couples
async function loadCouples() {
    const tbody = document.getElementById('couplesTableBody');
    tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
    
    try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.COUPLES));
        const couples = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        tbody.innerHTML = couples.map(couple => `
            <tr>
                <td>${couple.coupleName || ''}</td>
                <td>${couple.eventDate || ''}</td>
                <td>
                    <button class="icon-btn edit-couple" data-id="${couple.id}"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn delete-couple" data-id="${couple.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="3">Error loading couples</td></tr>';
    }
}

// Load Events
async function loadEvents() {
    const tbody = document.getElementById('eventsTableBody');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    
    try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.EVENTS));
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        tbody.innerHTML = events.map(event => `
            <tr>
                <td>${event.eventName || ''}</td>
                <td>${event.date || ''} ${event.time || ''}</td>
                <td>${event.venue || ''}</td>
                <td>
                    <button class="icon-btn edit-event" data-id="${event.id}"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn delete-event" data-id="${event.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4">Error loading events</td></tr>';
    }
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Add Guest
document.getElementById('addGuestBtn').addEventListener('click', () => {
    document.getElementById('guestForm').reset();
    document.getElementById('guestId').value = '';
    openModal('guestModal');
});

// Add Couple
document.getElementById('addCoupleBtn').addEventListener('click', () => {
    document.getElementById('coupleForm').reset();
    document.getElementById('coupleId').value = '';
    openModal('coupleModal');
});

// Add Event
document.getElementById('addEventBtn').addEventListener('click', () => {
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    openModal('eventModal');
});

// Bulk Upload
document.getElementById('bulkUploadBtn').addEventListener('click', () => {
    openModal('bulkUploadModal');
});

// Close modals
document.querySelectorAll('.modal-close, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    });
});

// Guest Form Submit
document.getElementById('guestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const guestId = document.getElementById('guestId').value;
    const guestData = {
        guestName: document.getElementById('guestName').value,
        mobileNumber: document.getElementById('guestMobile').value,
        coupleId: document.getElementById('guestCouple').value,
        password: document.getElementById('guestMobile').value.slice(-4),
        uniqueSlug: `${document.getElementById('guestCouple').value}-${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    
    try {
        if (guestId) {
            await updateDoc(doc(db, COLLECTIONS.GUESTS, guestId), guestData);
        } else {
            await addDoc(collection(db, COLLECTIONS.GUESTS), guestData);
        }
        closeModal('guestModal');
        loadGuests();
    } catch (error) {
        alert('Error saving guest');
    }
});

// Couple Form Submit
document.getElementById('coupleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const coupleId = document.getElementById('coupleId').value;
    const file = document.getElementById('coupleCoverImage').files[0];
    
    let coverImageUrl = '';
    if (file) {
        const storageRef = ref(storage, `couples/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        coverImageUrl = await getDownloadURL(storageRef);
    }
    
    const coupleData = {
        coupleName: document.getElementById('coupleName').value,
        eventDate: document.getElementById('coupleEventDate').value,
        coverImage: coverImageUrl,
        story: document.getElementById('coupleStory').value,
        createdAt: new Date().toISOString()
    };
    
    try {
        if (coupleId) {
            await updateDoc(doc(db, COLLECTIONS.COUPLES, coupleId), coupleData);
        } else {
            await addDoc(collection(db, COLLECTIONS.COUPLES), coupleData);
        }
        closeModal('coupleModal');
        loadCouples();
    } catch (error) {
        alert('Error saving couple');
    }
});

// Event Form Submit
document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventId = document.getElementById('eventId').value;
    
    const eventData = {
        coupleId: document.getElementById('eventCouple').value,
        eventName: document.getElementById('eventName').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        venue: document.getElementById('eventVenue').value,
        mapLink: document.getElementById('eventMapLink').value
    };
    
    try {
        if (eventId) {
            await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), eventData);
        } else {
            await addDoc(collection(db, COLLECTIONS.EVENTS), eventData);
        }
        closeModal('eventModal');
        loadEvents();
    } catch (error) {
        alert('Error saving event');
    }
});

// Bulk Upload Form Submit
document.getElementById('bulkUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('csvFile').files[0];
    const coupleId = document.getElementById('bulkCouple').value;
    
    if (!file || !coupleId) return;
    
    const text = await file.text();
    const lines = text.split('\n').slice(1); // Skip header
    
    for (const line of lines) {
        if (!line.trim()) continue;
        const [guestName, mobileNumber, guestCount, foodPreference] = line.split(',');
        
        await addDoc(collection(db, COLLECTIONS.GUESTS), {
            guestName,
            mobileNumber,
            coupleId,
            password: mobileNumber.slice(-4),
            uniqueSlug: `${coupleId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            guestCount: parseInt(guestCount) || 1,
            foodPreference: foodPreference || '',
            RSVPStatus: 'pending',
            createdAt: new Date().toISOString()
        });
    }
    
    closeModal('bulkUploadModal');
    loadGuests();
    alert('Guests uploaded successfully!');
});

// Delete functions
async function deleteGuest(id) {
    if (confirm('Are you sure you want to delete this guest?')) {
        await deleteDoc(doc(db, COLLECTIONS.GUESTS, id));
        loadGuests();
    }
}

async function deleteCouple(id) {
    if (confirm('Are you sure you want to delete this couple?')) {
        await deleteDoc(doc(db, COLLECTIONS.COUPLES, id));
        loadCouples();
    }
}

async function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        await deleteDoc(doc(db, COLLECTIONS.EVENTS, id));
        loadEvents();
    }
}

// Edit functions
async function editGuest(id) {
    const docSnap = await getDoc(doc(db, COLLECTIONS.GUESTS, id));
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('guestId').value = id;
        document.getElementById('guestName').value = data.guestName || '';
        document.getElementById('guestMobile').value = data.mobileNumber || '';
        document.getElementById('guestCouple').value = data.coupleId || '';
        openModal('guestModal');
    }
}

// RSVP Filter
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Filter logic would go here
    });
});