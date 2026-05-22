const API_URL = "http://localhost:5000/api/leads";
// Local State Array Engines
let leadsCollection = [];

let dynamicSources = JSON.parse(localStorage.getItem('miniCrmSources')) || [
    "Website", "Social Media", "Referral", "Cold Call"
];

let adminCredentials = JSON.parse(localStorage.getItem('miniCrmAdmin')) || {
    email: "admin@crm.com", pass: "admin123"
};

// Sync Initial State Arrays directly to Local Browser Space
function syncDefaults() {
    localStorage.setItem('miniCrmLeads', JSON.stringify(leadsCollection));
    localStorage.setItem('miniCrmSources', JSON.stringify(dynamicSources));
    localStorage.setItem('miniCrmAdmin', JSON.stringify(adminCredentials));
}
syncDefaults();

// NEW HANDLER: PASSWORD INLINE EYE TOGGLE REVEALER
document.getElementById('password-toggle-btn').addEventListener('click', function() {
    const passwordInput = document.getElementById('login-pass');
    
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        this.innerText = "🙈"; // Switch to masking icon
    } else {
        passwordInput.type = "password";
        this.innerText = "👁️"; // Switch to scanning icon
    }
});

// AUTH SYSTEM LOG CONTROLLER
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const emailField = document.getElementById('login-email').value;
    const passField = document.getElementById('login-pass').value;

    if(emailField === adminCredentials.email && passField === adminCredentials.pass) {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('app-layout').classList.remove('hidden');
        fetchLeads();
		populateSourceDropdowns();
    } else {
        alert("Authentication failure. Check default login data values.");
    }
});

function handleLogout() {
    document.getElementById('app-layout').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
    
    // Reset password field element states back to default values upon exiting
    document.getElementById('login-pass').type = "password";
    document.getElementById('password-toggle-btn').innerText = "👁️";
}

// DASHBOARD APP MULTI-VIEW CONTEXTUAL ROUTER
function switchPage(targetSectionId, menuItemElement) {
    document.querySelectorAll('.content-section').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    document.getElementById(targetSectionId).classList.remove('hidden');
    menuItemElement.classList.add('active');

    // Auto-scroll the view canvas container context to top layout coordinates upon view mutation
    document.querySelector('.content-view-scroller').scrollTop = 0;

    if(targetSectionId === 'dashboard-section') calculateDashboardMetrics();
    if(targetSectionId === 'view-leads-section') buildLeadsTable();
    if(targetSectionId === 'notes-archive-section') renderNotesArchive();
    if(targetSectionId === 'settings-section') renderSettingsPanel();
}

// DASHBOARD METRIC PIPELINES
function calculateDashboardMetrics() {
    const total = leadsCollection.length;
    const countNew = leadsCollection.filter(l => l.status === 'New').length;
    const countContacted = leadsCollection.filter(l => l.status === 'Contacted').length;
    const countConverted = leadsCollection.filter(l => l.status === 'Converted').length;

    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-new').innerText = countNew;
    document.getElementById('stat-contacted').innerText = countContacted;
    document.getElementById('stat-converted').innerText = countConverted;
}

// DROPDOWN OPTION BUILDERS
function populateSourceDropdowns() {
    const dropdown = document.getElementById('lead-source');
    dropdown.innerHTML = '';
    dynamicSources.forEach(source => {
        let opt = document.createElement('option');
        opt.value = source;
        opt.innerText = source;
        dropdown.appendChild(opt);
    });
}

// ENTRY CREATION HANDLERS
// ENTRY CREATION HANDLERS
document.getElementById('lead-form').addEventListener('submit', async function(e) {

    e.preventDefault();

    const targetId = document.getElementById('lead-id').value;

    const recordPayload = {
        name: document.getElementById('lead-name').value,
        email: document.getElementById('lead-email').value,
        phone: document.getElementById('lead-phone').value,
        source: document.getElementById('lead-source').value,
        status: document.getElementById('lead-status').value,
        notes: document.getElementById('lead-notes').value
    };

    try {

        // UPDATE lead
        if(targetId) {

            await fetch(`${API_URL}/${targetId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(recordPayload)
            });

        } 
        
        // ADD new lead
        else {

            await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(recordPayload)
            });
        }

        resetLeadForm();

        fetchLeads();

        switchPage(
            'view-leads-section',
            document.querySelectorAll('.nav-item')[2]
        );

    } catch(error) {
        console.log(error);
    }
});

function resetLeadForm() {
    document.getElementById('lead-form').reset();
    document.getElementById('lead-id').value = '';
    document.getElementById('form-title').innerText = "Add New Lead";
    document.getElementById('save-btn').innerText = "Save Lead Data";
}

// INLINE MATRIX ACTIONS
function buildLeadsTable() {
    const tableBody = document.getElementById('leads-data-target');
    tableBody.innerHTML = '';

    if(leadsCollection.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b;">No client logs found.</td></tr>`;
        return;
    }

    leadsCollection.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${lead.name}</strong></td>
            <td>${lead.email}</td>
            <td>${lead.phone}</td>
            <td>${lead.source}</td>
            <td>
                <button class="status-pill ${lead.status.toLowerCase()}" onclick="cycleLeadStatus('${lead.id}')">
                    ${lead.status} 🔄
                </button>
            </td>
            <td><span class="note-block-text" title="${lead.notes}">${lead.notes || '<em>None</em>'}</span></td>
            <td>
                <div class="action-row">
                    <button class="action-btn" title="Edit Profile Details" onclick="triggerEditPipeline('${lead.id}')">✏️</button>
                    <button class="action-btn" title="Delete Client Lead" onclick="triggerDeletePipeline('${lead.id}')">🗑️</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function cycleLeadStatus(id) {
    const index = leadsCollection.findIndex(l => l.id === id);
    if(index !== -1) {
        const current = leadsCollection[index].status;
        leadsCollection[index].status = current === "New" ? "Contacted" : current === "Contacted" ? "Converted" : "New";
        localStorage.setItem('miniCrmLeads', JSON.stringify(leadsCollection));
        buildLeadsTable();
    }
}

function triggerEditPipeline(id) {
    const match = leadsCollection.find(l => l.id === id);
    if(match) {
        populateSourceDropdowns();
        document.getElementById('lead-id').value = match.id;
        document.getElementById('lead-name').value = match.name;
        document.getElementById('lead-email').value = match.email;
        document.getElementById('lead-phone').value = match.phone;
        document.getElementById('lead-source').value = match.source;
        document.getElementById('lead-status').value = match.status;
        document.getElementById('lead-notes').value = match.notes;

        document.getElementById('form-title').innerText = "Update Lead Parameters & Notes";
        document.getElementById('save-btn').innerText = "Apply Record Update";
        switchPage('add-lead-section', document.querySelectorAll('.nav-item')[1]);
    }
}

async function triggerDeletePipeline(id) {

    if(confirm("Confirm delete?")) {

        try {

            await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            fetchLeads();

        } catch(error) {
            console.log(error);
        }
    }
}

// ENGINE DATA SEARCH FILTERS
function searchLeads() {
    const text = document.getElementById('table-search').value.toLowerCase();
    document.querySelectorAll('#leads-data-target tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(text) ? "" : "none";
    });
}

function searchNotes() {
    const val = document.getElementById('notes-search').value.toLowerCase();
    document.querySelectorAll('.note-card').forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(val) ? "" : "none";
    });
}

// FEED LOG DISPLAY PROCESSORS
function renderNotesArchive() {
    const target = document.getElementById('notes-log-target');
    target.innerHTML = '';

    const leadsWithNotes = leadsCollection.filter(l => l.notes.trim() !== '');

    if(leadsWithNotes.length === 0) {
        target.innerHTML = `<p style="color:var(--muted-neutral); text-align:center; padding:20px;">No interaction notes found.</p>`;
        return;
    }

    leadsWithNotes.forEach(lead => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            <h3>${lead.name} <span class="badge status-pill ${lead.status.toLowerCase()}">${lead.status}</span></h3>
            <p>"${lead.notes}"</p>
        `;
        target.appendChild(card);
    });
}

// CUSTOM MANAGEMENT SYSTEM PROFILES
function renderSettingsPanel() {
    const container = document.getElementById('source-list-target');
    container.innerHTML = '';

    dynamicSources.forEach((source, index) => {
        const item = document.createElement('li');
        item.className = 'settings-list-item';
        item.innerHTML = `
            <span>${source}</span>
            <button onclick="removeSource(${index})">Remove</button>
        `;
        container.appendChild(item);
    });
}

document.getElementById('add-source-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('new-source-input');
    const value = input.value.trim();

    if(value && !dynamicSources.includes(value)) {
        dynamicSources.push(value);
        localStorage.setItem('miniCrmSources', JSON.stringify(dynamicSources));
        input.value = '';
        renderSettingsPanel();
    }
});

function removeSource(index) {
    if(confirm(`Delete channel choice "${dynamicSources[index]}"?`)) {
        dynamicSources.splice(index, 1);
        localStorage.setItem('miniCrmSources', JSON.stringify(dynamicSources));
        renderSettingsPanel();
    }
}

document.getElementById('change-pass-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const newPass = document.getElementById('settings-new-pass').value;
    adminCredentials.pass = newPass;
    localStorage.setItem('miniCrmAdmin', JSON.stringify(adminCredentials));
    alert("System profile updates applied successfully!");
    document.getElementById('settings-new-pass').value = '';
});

async function fetchLeads() {

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        leadsCollection = data;

        calculateDashboardMetrics();
        buildLeadsTable();
        renderNotesArchive();

    } catch (error) {
        console.log("Error fetching leads", error);
    }
}