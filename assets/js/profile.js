// ================= Profile Modal =================
const slideContainer = document.getElementById('slideContainer');
const profileSection = document.getElementById('profileSection');
const passwordSection = document.getElementById('passwordSection');
const modalTitle = document.getElementById('modalTitle');

// ---- Slide to Change Password ----
document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
  profileSection.classList.replace('visible-section', 'hidden-section');
  passwordSection.classList.replace('hidden-section', 'visible-section');
  slideContainer.classList.add('reversed');
  modalTitle.textContent = 'Change Password';
});

// ---- Slide Back to Profile ----
document.getElementById('backToProfile')?.addEventListener('click', () => {
  passwordSection.classList.replace('visible-section', 'hidden-section');
  profileSection.classList.replace('hidden-section', 'visible-section');
  slideContainer.classList.remove('reversed');
  modalTitle.textContent = 'Profile Details';
});

// ================= Load User Data into Profile Modal =================
document.getElementById('profileDetailsModal')?.addEventListener('shown.bs.modal', () => {
  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  console.log("🔹 Loaded User:", storedUser);

  if (storedUser) {
    // Example structure — adjust keys based on your backend data
    document.getElementById('profileName').textContent = storedUser.name || `${storedUser.firstName || ''} ${storedUser.lastName || ''}`.trim() || 'Unknown';
    document.getElementById('profileRole').textContent = storedUser.role || 'N/A';
    document.getElementById('firstName').textContent = storedUser.firstName || storedUser.name || '';
    document.getElementById('empId').textContent = storedUser.employeeId || storedUser.empId || '—';
    document.getElementById('emailId').textContent = storedUser.email || '—';
    document.getElementById('Designation').textContent = storedUser.designation || storedUser.Designation || '—';

    // Optional image
    if (storedUser.imageUrl) {
      document.getElementById('profileImage').src = storedUser.imageUrl;
    }
  } else {
    console.warn("⚠️ No user data found in sessionStorage");
  }
});

// ================= Password Change (Demo Only) =================
document.getElementById('passwordForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;

  if (newPass !== confirmPass) {
    alert('Passwords do not match!');
    return;
  }

  alert('✅ Password changed successfully (demo only)');
  document.getElementById('backToProfile').click();
  e.target.reset();
});