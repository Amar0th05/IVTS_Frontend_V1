let decidedPermission;
let email;
let employeeId;

let username=document.getElementById("fullName");
let Managername=document.getElementById("ManagerName");

document.addEventListener("DOMContentLoaded", async () => {
  roles = await axiosInstance.get("/roles/role/perms");
  roles = roles.data.roles;

  // console.log(roles);
  window.roles = roles;
  decidedPermission = handlePermission("#username");
    let storedUser = JSON.parse(sessionStorage.getItem('user'));

      if (storedUser) {
    email=storedUser.mail;
       }
   const result=await api.getEmployees(email);
   console.log(result);
  username.value=result.FullName;
  employeeId=result.id;
  Managername.value=result.ManagerName;
});

if (decidedPermission !== "") {
  decidedPermission = "editElement";
  // alert(decidedPermission)
}



// Function to get today's date in 'YYYY-MM-DD' format
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Function to check if a date is a weekend
function isWeekend(dateString) {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
}

document.addEventListener("DOMContentLoaded", () => {
  const todayDate = getTodayDateString();
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  // Set the minimum selectable date to today
  if (startDateInput) {
    startDateInput.setAttribute("min", todayDate);
    // Add listener to clear if weekend
    startDateInput.addEventListener("change", (e) => {
      if (isWeekend(e.target.value)) {
        showWarningPopupFadeInDown(
          "Weekends are not allowed. Please select a weekday."
        );
        e.target.value = "";
      }
    });
  }

  if (endDateInput) {
    endDateInput.setAttribute("min", todayDate);
    // Add listener to clear if weekend
    endDateInput.addEventListener("change", (e) => {
      if (isWeekend(e.target.value)) {
        showWarningPopupFadeInDown(
          "Weekends are not allowed. Please select a weekday."
        );
        e.target.value = "";
      }
    });
  }
});

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
const halfDayOptionContainer = document.getElementById(
  "halfDayOptionContainer"
);
const halfDayButtons = document.querySelectorAll(".half-day-options .btn");
const halfDayHiddenInput = document.getElementById("halfDayOption");

// --- Form Validation and Logic Functions ---

// This function validates a specific input field.
function validateInput(input) {
  let isValid = true;
  let message = "";
  input.classList.remove("is-invalid", "is-valid");

  if (input.required && input.value.trim() === "") {
    isValid = false;
    message = "This field is required.";
  } else if (
    input.id === "ManagerName" &&
    input.value &&
    !/^[A-Za-z\s]+$/.test(input.value)
  ) {
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
    feedbackElem =
      input.parentElement.parentElement.querySelector(".invalid-feedback");
  }
  if (feedbackElem) {
    feedbackElem.textContent = message;
  }
}

// Function to validate all fields in the current step.
function validateStep() {
  let isValid = true;
  const inputs = form.querySelectorAll(
    "input[required], select[required], textarea[required]"
  );
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
    totalDaysInput.value = "";
    return;
  }

  const startDate = new Date(startValue);
  const endDate = new Date(endValue);

  // Validation 1: End date cannot be before start date
  if (endDate < startDate) {
    showWarningPopupFadeInDown(
      "❌ End Date cannot be earlier than Start Date!"
    );
    endDateInput.value = "";
    totalDaysInput.value = "";
    return;
  }

  // Validation 2: If start or end date is weekend → reset and show message
  const startDay = startDate.getDay();
  const endDay = endDate.getDay();
  if (startDay === 0 || startDay === 6) {
    showWarningPopupFadeInDown("⚠️ Leave Start Date cannot be on a weekend!");
    startDateInput.value = "";
    totalDaysInput.value = "";
    return;
  }
  if (endDay === 0 || endDay === 6) {
    showWarningPopupFadeInDown("⚠️ Leave End Date cannot be on a weekend!");
    endDateInput.value = "";
    totalDaysInput.value = "";
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

  totalDaysInput.value = count;
}

// Recalculate whenever start or end date changes
startDateInput.addEventListener("change", calculateTotalDays);
endDateInput.addEventListener("change", calculateTotalDays);

const requestHalfDayCheckbox = document.getElementById("requestHalfDay");
const halfDayCheckboxContainer = document.getElementById(
  "halfDayCheckboxContainer"
);

// 1. Show/hide checkbox when dates change
function toggleHalfDayCheckbox() {
  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  if (
    startDateInput.value &&
    endDateInput.value &&
    startDate.getTime() === endDate.getTime()
  ) {
    halfDayCheckboxContainer.style.display = "block";
  } else {http://localhost:5506/staffs.html
    // Hide checkbox + reset
    halfDayCheckboxContainer.style.display = "none";
    requestHalfDayCheckbox.checked = false;
    toggleHalfDayUI(); // also reset options
  }
}

// 2. Show/hide options only when checkbox is ticked
function toggleHalfDayUI() {
  if (requestHalfDayCheckbox.checked) {
    halfDayOptionContainer.style.display = "block";
    halfDayHiddenInput.setAttribute("required", "required");
  } else {
    halfDayOptionContainer.style.display = "none";
    halfDayHiddenInput.removeAttribute("required");
    halfDayHiddenInput.value = "";
    halfDayButtons.forEach((btn) => btn.classList.remove("active-toggle"));
  }
}

// 3. Half-day option button selection
halfDayButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    halfDayButtons.forEach((b) => b.classList.remove("active-toggle"));
    btn.classList.add("active-toggle");
    halfDayHiddenInput.value = btn.dataset.value;
  });
});

// Event listeners
startDateInput.addEventListener("change", toggleHalfDayCheckbox);
endDateInput.addEventListener("change", toggleHalfDayCheckbox);
requestHalfDayCheckbox.addEventListener("change", toggleHalfDayUI);

document.querySelectorAll("input, select, textarea").forEach((input) => {
  input.addEventListener("input", () => validateInput(input));
  input.addEventListener("change", () => validateInput(input));
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("internshipForm");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // --- Validate form before submission ---
    if (typeof validateStep === "function" && !validateStep()) {
      showErrorPopupFadeInDown("Please correct the errors before submitting.");
      return;
    }

    // --- Disable button with spinner ---
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Submitting...
    `;
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);

      // --- Get selected employee ---
      const selectedValue = $(".fullName").val();
      if (!selectedValue) {
        showWarningPopupFadeInDown(
          "Please select a valid employee from the dropdown."
        );
        resetSubmitButton();
        return;
      }


      // --- Validate date range ---
      const startDate = formData.get("startDate");
      const endDate = formData.get("endDate");
      if (new Date(endDate) < new Date(startDate)) {
        showWarningPopupFadeInDown(
          "End date must be on or after the start date."
        );
        resetSubmitButton();
        return;
      }

      // --- Calculate total days ---
      let totalDays = parseInt(formData.get("totalDays"), 10);
      if (!totalDays || totalDays < 1) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        totalDays = Math.floor((end - start) / (1000 * 3600 * 24)) + 1;
      }

      // --- Build payload ---
      const payload = {
        employeeId,
        employeeName:formData.get("fullName")?.trim() || "",
        managerName: formData.get("ManagerName")?.trim() || "",
        leaveType: formData.get("leaveType")?.trim() || "",
        startDate,
        endDate,
        totalDays,
        halfDayOption: formData.get("halfDayOption") || null,
        leaveReason: formData.get("reason")?.trim() || "",
        supportingDocument: null, // will add file logic later
      };

      console.log("Submitting Leave Payload:", payload);

      // --- API Call ---
      const result = await api.submitLeave(payload);
      console.log(" Server Response:", result);

      if (result?.message?.toLowerCase().includes("success")) {
        showSucessPopupFadeInDownLong("Leave submitted successfully!");
        form.reset();
        $("#ManagerName").val("");
        $(".userName").val("").trigger("change");
      } else {
        showErrorPopupFadeInDown(
          `Failed to submit leave: ${result?.message || "Unknown error"}`
        );
      }
    } catch (err) {
      console.error("Error submitting leave:", err);
      showErrorPopupFadeInDown(
        `Submission failed: ${err.response?.data?.message || err.message}`
      );
    } finally {
      resetSubmitButton();
    }
  });

  // --- Utility to restore button state ---
  function resetSubmitButton() {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane me-1"></i> Submit Leave`;
  }
});
