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

  // Load employees
  fetch(`${baseUrl}/internLeave/getemployees`)
    .then((r) => r.json())
    .then((staffList) => {
      staffList.employees.forEach((staff) => {
        $(".userName").append(
          $("<option>", {
            value: `${staff.id} - ${staff.name}`,
            text: `${staff.id} - ${staff.name}`,
          })
        );
      });

      $(".userName").select2({
        placeholder: "Select Employee Name",
        allowClear: true,
        width: "100%",
      });
    });

  $(".userName").on("change", function () {
    const value = $(this).val();
    if (!value || !value.includes("-")) {
      $("#ManagerName").val("");
      return;
    }

    const employeeId = value.split("-")[0].trim();

    fetch(`${baseUrl}/internLeave/getemployees/${employeeId}/manager`)
      .then((r) => r.json())
      .then((data) => {
        $("#ManagerName").val(data.manager || "No manager assigned");
      });
  });
});

// ---------- DATE HANDLING LOGIC ----------
function getTodayDateString() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(t.getDate()).padStart(2, "0")}`;
}

function isWeekend(dateString) {
  const day = new Date(dateString).getDay();
  return day === 0 || day === 6;
}

document.addEventListener("DOMContentLoaded", () => {
  const today = getTodayDateString();
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  startDateInput.min = today;
  endDateInput.min = today;
});

// ---------- GLOBAL ELEMENTS ----------
const form = document.getElementById("internshipForm");
const submitBtn = document.getElementById("submitBtn");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const totalDaysInput = document.getElementById("totalDays");

const requestHalfDayCheckbox = document.getElementById("requestHalfDay");
const halfDayCheckboxContainer = document.getElementById(
  "halfDayCheckboxContainer"
);
const halfDayOptionContainer = document.getElementById(
  "halfDayOptionContainer"
);
const halfDayHiddenInput = document.getElementById("halfDayHiddenInput");
const halfDayButtons = document.querySelectorAll(
  "#halfDayOptionContainer .btn"
);

// ---------- FIXED TOTAL DAYS LOGIC ----------
function calculateTotalDays() {
  const startValue = startDateInput.value;
  const endValue = endDateInput.value;

  // No start → reset
  if (!startValue) {
    totalDaysInput.value = "";
    return;
  }

  // Auto-correct end date if needed
  if (!endValue || new Date(endValue) < new Date(startValue)) {
    endDateInput.value = startValue;
  }

  const startDate = new Date(startValue);
  const endDate = new Date(endDateInput.value);

  // Block weekends
  if (isWeekend(startValue)) {
    alert("Start date cannot be a weekend");
    startDateInput.value = "";
    totalDaysInput.value = "";
    return;
  }

  if (isWeekend(endDateInput.value)) {
    alert("End date cannot be a weekend");
    endDateInput.value = startValue;
    return;
  }

  // Same date → enable Half-Day controls
  toggleHalfDayCheckbox();

  // If half-day selected and only 1 date
  if (requestHalfDayCheckbox.checked && startValue === endValue) {
    totalDaysInput.value = 0.5;
    return;
  }

  // ---- Full days calculation ----
  let count = 0;
  let current = new Date(startDate);

  while (current <= endDate) {
    if (current.getDay() !== 0 && current.getDay() !== 6) count++;
    current.setDate(current.getDate() + 1);
  }

  totalDaysInput.value = count;
}

// ---------- HALF DAY UI ----------
function toggleHalfDayCheckbox() {
  if (startDateInput.value === endDateInput.value) {
    halfDayCheckboxContainer.style.display = "block";
  } else {
    halfDayCheckboxContainer.style.display = "none";
    requestHalfDayCheckbox.checked = false;
    toggleHalfDayUI();
  }
}

function toggleHalfDayUI() {
  if (requestHalfDayCheckbox.checked) {
    halfDayOptionContainer.style.display = "block";
    halfDayHiddenInput.required = true;
  } else {
    halfDayOptionContainer.style.display = "none";
    halfDayHiddenInput.required = false;
    halfDayHiddenInput.value = "";
    halfDayButtons.forEach((b) =>
      b.classList.remove("active-toggle", "btn-primary")
    );
  }
}

// Half-Day button selection
halfDayButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    halfDayButtons.forEach((b) => {
      b.classList.remove("active-toggle", "btn-primary");
      b.classList.add("btn-outline-primary");
    });

    btn.classList.add("active-toggle", "btn-primary");
    btn.classList.remove("btn-outline-primary");

    halfDayHiddenInput.value = btn.getAttribute("data-value");
  });
});

// ---------- EVENT LISTENERS ----------
startDateInput.addEventListener("change", calculateTotalDays);
endDateInput.addEventListener("change", calculateTotalDays);
requestHalfDayCheckbox.addEventListener("change", () => {
  toggleHalfDayUI();
  calculateTotalDays();
});

// ---------- FORM SUBMISSION ----------
document.addEventListener("DOMContentLoaded", function () {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Submitting...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);

      const selectedValue = $(".userName").val();
      const [employeeId, employeeName] = selectedValue
        .split("-")
        .map((x) => x.trim());

      const payload = new FormData();
      payload.append("employeeId", employeeId);
      payload.append("employeeName", employeeName);
      payload.append("ManagerName", formData.get("ManagerName"));
      payload.append("leaveType", formData.get("leaveType"));
      payload.append("startDate", formData.get("startDate"));
      payload.append("endDate", formData.get("endDate"));
      payload.append("totalDays", formData.get("totalDays"));
      payload.append("halfDayOption", formData.get("halfDayOption"));
      payload.append("leaveReason", formData.get("reason"));
      if (document.getElementById("documentUpload").files[0]) {
        payload.append(
          "documentUpload",
          document.getElementById("documentUpload").files[0]
        );
      }

      const baseUrl = getbaseurl();

      const response = await fetch(`${baseUrl}/internLeave/request`, {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (response.ok) {
        document.querySelector(".container.shadow-lg").innerHTML = `
          <div class="text-center p-5">
            <i class="fas fa-calendar-check fa-5x text-success mb-4"></i>
            <h2 class="text-success mb-3">Leave Application Submitted Successfully!</h2>
            <p>${result.message}</p>
            <button class="btn btn-primary mt-3" onclick="location.reload()">
              Submit Another Request
            </button>
          </div>`;
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Error submitting form: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Submit";
    }
  });
});
