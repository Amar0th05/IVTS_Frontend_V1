

function getbaseurl() {
  const { hostname } = location;
  const environments = {
    dev: { host: "localhost", baseUrl: "http://localhost:5500" },
    prod: { host: "ntcpwcit.in", baseUrl: "https://ntcpwcit.in/worksphere/api" },
  };

  for (let env in environments) {
    if (environments[env].host === hostname) {
      return environments[env].baseUrl;
    }
  }

  return "http://localhost:5500";
}
        $(document).ready(function () {
              const baseUrl = getbaseurl();
            // Load staff and populate dropdown
            fetch(`${baseUrl}/internLeave/getemployees`)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    return response.json();
                })
                .then(staffList => {
                    console.log('Fetched staff:', staffList); // Debug log
                    staffList.employees.forEach(staff => {
                        $('.userName').append(
                            $('<option>', {
                                value: `${staff.id} - ${staff.name}`, // value now includes ID and Name
                                text: `${staff.id} - ${staff.name}`
                            })
                        );
                    });

                    // Initialize Select2
                    $('.userName').select2({
                        placeholder: 'Select Employee Name',
                        allowClear: true,
                        width: '100%' // important to fit inside input group
                    });
                })
                .catch(error => console.error('Error loading staff:', error));

            // Prevent Select2 dropdown clicks from bubbling
            $('.userName').on('select2:open select2:closing click', function (event) {
                event.stopPropagation();
            });

            // Fetch manager name when an employee is selected
            $('.userName').on('change', function () {
                const value = $(this).val(); // value is now "ID - Name"
                if (!value || !value.includes('-')) {
                    $('#ManagerName').val('');
                    return;
                }

                const employeeId = value.split('-')[0].trim(); // extract only ID
              const baseUrl = getbaseurl();

                fetch(`${baseUrl}/internLeave/getemployees/${employeeId}/manager`)
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                        return response.json();
                    })
                    .then(data => {
                        console.log('Fetched manager:', data); // Debug log
                        $('#ManagerName').val(data.manager || 'No manager assigned');
                    })
                    .catch(error => {
                        console.error('Error fetching manager:', error);
                        $('#ManagerName').val('Error fetching manager');
                    });
            });
        });
    // Function to get today's date in 'YYYY-MM-DD' format
    function getTodayDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Function to check if a date is a weekend
    function isWeekend(dateString) {
        const date = new Date(dateString);
        const day = date.getDay(); // 0 = Sunday, 6 = Saturday
        return day === 0 || day === 6;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const todayDate = getTodayDateString();
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');

        // Set the minimum selectable date to today
        if (startDateInput) {
            startDateInput.setAttribute('min', todayDate);
            // Add listener to clear if weekend
            startDateInput.addEventListener('change', (e) => {
                if (isWeekend(e.target.value)) {
                    alert('Weekends are not allowed. Please select a weekday.');
                    e.target.value = '';
                }
            });
        }

        if (endDateInput) {
            endDateInput.setAttribute('min', todayDate);
            // Add listener to clear if weekend
            endDateInput.addEventListener('change', (e) => {
                if (isWeekend(e.target.value)) {
                    alert('Weekends are not allowed. Please select a weekday.');
                    e.target.value = '';
                }
            });
        }
    });


// Function to determine the base URL for API calls based on the environment.


// Global variables for form state.
let currentStep = 1;
const totalSteps = 1; // The leave form has only one step.

// Get form elements
const form = document.getElementById("internshipForm");
const submitBtn = document.getElementById("submitBtn");
const leaveTypeDropdown = document.getElementById("leaveType");
const otherReasonContainer = document.getElementById("otherReasonContainer");
const otherReasonInput = document.getElementById("otherReason");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const totalDaysInput = document.getElementById("totalDays");
const halfDayOptionContainer = document.getElementById("halfDayOptionContainer");

// --- Form Validation and Logic Functions ---

// This function validates a specific input field.
function validateInput(input) {
    let isValid = true;
    let message = "";
    input.classList.remove("is-invalid", "is-valid");
      // 🧩 NEW: Skip validation for hidden fields (not visible on screen)
  const style = window.getComputedStyle(input);
  const isHidden = style.display === "none" || style.visibility === "hidden" || input.type === "hidden";
  if (isHidden) return true;

    if (input.required && input.value.trim() === "") {
        isValid = false;
        message = "This field is required.";
    } else if (input.id === "ManagerName" && input.value && !/^[A-Za-z\s]+$/.test(input.value)) {
        isValid = false;
        message = "Manager Name must contain only letters and spaces.";
    } else if (input.id === "endDate" && input.value) {
        const startDate = document.getElementById("startDate").value;
        if (startDate && new Date(input.value) < new Date(startDate)) {
            isValid = false;
            message = "End date must be on or after the start date.";
        }
    }

    if (isValid) {
        setFeedback(input, "", false);
    } else {
        input.classList.add("is-invalid");
        setFeedback(input, message, true);
    }
    return isValid;
}

// Function to set validation feedback messages.
function setFeedback(input, message, isInvalid) {
    let feedbackElem = input.parentElement.querySelector(".invalid-feedback");
    if (!feedbackElem) {
        feedbackElem = input.parentElement.parentElement.querySelector(".invalid-feedback");
    }
    if (feedbackElem) {
        feedbackElem.textContent = message;
    }
}

// Function to validate all fields in the current step.
function validateStep() {
    let isValid = true;
    const inputs = form.querySelectorAll("input[required], select[required], textarea[required]");
    inputs.forEach((input) => {
        if (!validateInput(input)) isValid = false;
    });
    return isValid;
}

// --- Event Listeners for Dynamic Form Behavior ---

function calculateTotalDays() {
    const startValue = startDateInput.value;
    const endValue = endDateInput.value;

    // Clear total unless both fields have valid values
    if (!startValue || !endValue) {
        totalDaysInput.value = '';
        return;
    }

    const startDate = new Date(startValue);
    const endDate = new Date(endValue);

    // Validation 1: End date cannot be before start date
    if (endDate < startDate) {
        alert("❌ End Date cannot be earlier than Start Date!");
        endDateInput.value = '';
        totalDaysInput.value = '';
        return;
    }

    // Validation 2: If start or end date is weekend → reset and show message
    const startDay = startDate.getDay();
    const endDay = endDate.getDay();
    if (startDay === 0 || startDay === 6) {
        alert("⚠️ Leave Start Date cannot be on a weekend!");
        startDateInput.value = '';
        totalDaysInput.value = '';
        return;
    }
    if (endDay === 0 || endDay === 6) {
        alert("⚠️ Leave End Date cannot be on a weekend!");
        endDateInput.value = '';
        totalDaysInput.value = '';
        return;
    }

    // Count weekdays only (exclude weekends in between)
    let count = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const day = currentDate.getDay();
        if (day !== 0 && day !== 6) count++; // Exclude Sat (6) & Sun (0)
        currentDate.setDate(currentDate.getDate() + 1);
    }

   if (requestHalfDayCheckbox.checked) {
    totalDaysInput.value = 0.5;
  } else {
    totalDaysInput.value = count;
  }
}

// Recalculate whenever start or end date changes
startDateInput.addEventListener('change', calculateTotalDays);
endDateInput.addEventListener('change', calculateTotalDays);

const requestHalfDayCheckbox = document.getElementById('requestHalfDay');
const halfDayCheckboxContainer = document.getElementById('halfDayCheckboxContainer');


// 1. Show/hide checkbox when dates change
function toggleHalfDayCheckbox() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (startDateInput.value && endDateInput.value && startDate.getTime() === endDate.getTime()) {
        halfDayCheckboxContainer.style.display = 'block';
    } else {
        // Hide checkbox + reset
        halfDayCheckboxContainer.style.display = 'none';
        requestHalfDayCheckbox.checked = false;
        toggleHalfDayUI(); // also reset options
    }
}

// 2. Show/hide options only when checkbox is ticked
function toggleHalfDayUI() {
    if (requestHalfDayCheckbox.checked) {
        halfDayOptionContainer.style.display = 'block';
        halfDayHiddenInput.setAttribute('required', 'required');
    } else {
        halfDayOptionContainer.style.display = 'none';
        halfDayHiddenInput.removeAttribute('required');
        halfDayHiddenInput.value = '';
        halfDayButtons.forEach(btn => btn.classList.remove('active-toggle'));
    }
}

// ✅ FINAL WORKING Half-Day Option Logic (active style + backend value)
const halfDayButtons = document.querySelectorAll("#halfDayOptionContainer .btn");
const halfDayHiddenInput = document.getElementById("halfDayHiddenInput");


// Add click listeners for First Half / Second Half buttons
halfDayButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active style from all buttons first
    halfDayButtons.forEach((b) => {
      b.classList.remove("active-toggle", "btn-primary");
      b.classList.add("btn-outline-primary");
    });

    // Add active style to the selected button
    btn.classList.add("active-toggle", "btn-primary");
    btn.classList.remove("btn-outline-primary");

    // ✅ Update the hidden input value so backend receives it
    const selectedValue = btn.getAttribute("data-value");
    halfDayHiddenInput.value = selectedValue;
    halfDayHiddenInput.name = "halfDayOption"; // ensure correct name

    console.log("✅ Selected Half-Day Option:", selectedValue);
  });
});

// Event listeners
startDateInput.addEventListener('change', toggleHalfDayCheckbox);
endDateInput.addEventListener('change', toggleHalfDayCheckbox);
requestHalfDayCheckbox.addEventListener('change', toggleHalfDayUI);
requestHalfDayCheckbox.addEventListener("change", calculateTotalDays);


document.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("input", () => validateInput(input));
    input.addEventListener("change", () => validateInput(input));
});

// --- Form Submission Logic ---
// Leave.js or inside a <script> after the form
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('internshipForm');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // --- Validate Step Before Submission ---
        if (typeof validateStep === 'function' && !validateStep()) {
            alert("Please correct the errors before submitting.");
            return;
        }

        // --- Disable submit button and show spinner ---
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...`;
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);

            // --- Get selected employee from Select2 ---
            const selectedValue = $('.userName').val(); // safer with Select2
            if (!selectedValue || !selectedValue.includes('-')) {
                alert("Please select a valid employee from the dropdown.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Submit";
                return;
            }

            const parts = selectedValue.split('-');
            const employeeId = parts[0]?.trim();
            const employeeName = parts[1]?.trim();

            if (!employeeId || !employeeName) {
                alert("Invalid employee selection.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Submit";
                return;
            }

            // --- Validate dates ---
            const startDate = formData.get('startDate');
            const endDate = formData.get('endDate');
            if (new Date(endDate) < new Date(startDate)) {
                alert("End date must be on or after the start date.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Submit";
                return;
            }

            // --- Calculate total days if not already calculated ---
           let totalDays = parseFloat(formData.get("totalDays"));
      if (!totalDays || totalDays < 0.5) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        totalDays = Math.floor((end - start) / (1000 * 3600 * 24)) + 1;
      }

            // --- Build payload for backend ---
            const payload = {
                
                    employeeId,
                    employeeName,
                    ManagerName: formData.get('ManagerName')?.trim() || "",
                    leaveType: formData.get('leaveType')?.trim() || "",
                    startDate,
                    endDate,
                    totalDays,
                    halfDayOption: formData.get('halfDayOption') || null,
                    leaveReason: formData.get('reason')?.trim() || "",
                    supportingDocument: null // Add file handling if needed
                
            };

              const baseUrl = getbaseurl();
            // --- POST request to backend ---
            const response = await fetch(`${baseUrl}/internLeave/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
});

            const result = await response.json();
            if (response.ok) {
                const container = document.querySelector(".container.shadow-lg");
                container.innerHTML = `
                    <div class="text-center p-5" style="animation: fadeIn 0.5s ease-in-out;">
                        <i class="fas fa-calendar-check fa-5x text-success mb-4"></i>
                        <h2 class="text-success mb-3">Leave Application Submitted Successfully!</h2>
                        <p class="lead">${result.message}</p>
                        <p>You will be notified once your leave request has been reviewed.</p>
                        <button class="btn btn-primary mt-3" onclick="location.reload()">
                            <i class="fas fa-plus me-2"></i>Submit Another Request
                        </button>
                    </div>
                `;
            } else {
                throw new Error(result.message || "Submission failed.");
            }

        } catch (err) {
            console.error("Error submitting leave:", err);
            alert(`Submission failed: ${err.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Submit";
        }
    });
});









