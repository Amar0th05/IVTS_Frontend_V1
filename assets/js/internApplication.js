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

let currentStep = 1;
const totalSteps = 5;

// Gender field handling
const genderSelect = document.getElementById("gender");
const otherGenderContainer = document.getElementById("otherGenderContainer");
const otherGenderInput = document.getElementById("otherGender");

genderSelect.addEventListener("change", function () {
  if (this.value === "other") {
    otherGenderContainer.style.display = "block";
    otherGenderInput.required = true;
  } else {
    otherGenderContainer.style.display = "none";
    otherGenderInput.required = false;
    otherGenderInput.value = "";
    validateInput(otherGenderInput);
  }
});

// Step navigation
function changeStep(direction) {
  if (direction === 1 && currentStep < totalSteps) {
    if (!validateStep(currentStep)) return;
  }
  const currentFormStep = document.getElementById(`form-step-${currentStep}`);
  currentFormStep.classList.remove("active");
  currentStep += direction;
  const nextFormStep = document.getElementById(`form-step-${currentStep}`);
  nextFormStep.classList.add("active");
  updateUI();
}

function updateUI() {
  for (let i = 1; i <= totalSteps; i++) {
    const step = document.getElementById(`step-${i}`);
    if (i < currentStep) {
      step.classList.add("completed");
      step.classList.remove("active");
    } else if (i === currentStep) {
      step.classList.add("active");
      step.classList.remove("completed");
    } else {
      step.classList.remove("active", "completed");
    }
  }
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
  document.getElementById("prevBtn").style.display =
    currentStep === 1 ? "none" : "inline-block";
  document.getElementById("nextBtn").style.display =
    currentStep === totalSteps ? "none" : "inline-block";
  document.getElementById("submitBtn").style.display =
    currentStep === totalSteps ? "inline-block" : "none";
}

// Validation
function validateStep(step) {
  let isValid = true;
  const formStep = document.getElementById(`form-step-${step}`);
  const inputs = formStep.querySelectorAll("input[required], select[required]");
  inputs.forEach((input) => {
    if (!validateInput(input)) isValid = false;
  });
  return isValid;
}

let endDate=document.getElementById("endDate");

document.getElementById("startDate").addEventListener("change",()=>{
  endDate.setAttribute("min", startDate.value);
})

function validateInput(input) {
  let isValid = true;
  let message = "";
  input.classList.remove("is-invalid", "is-valid");


  if (input.required && input.value.trim() === "") {
    isValid = false;
    message = "This field is required.";
  } else if (
    input.type === "file" &&
    input.required &&
    input.files.length === 0
  ) {
    isValid = false;
    message = "Please upload the required document.";
  } else if (
    input.type === "email" &&
    input.value &&
    !/^\S+@\S+\.\S+$/.test(input.value)
  ) {
    isValid = false;
    message = "Please enter a valid email address.";
  } else if (
    input.type === "tel" &&
    input.value &&
    !/^\+?[0-9\s-]{10,15}$/.test(input.value)
  ) {
    isValid = false;
    message = "Please enter a valid phone number.";
  } else if (
    input.type === "url" &&
    input.value &&
    !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(input.value)
  ) {
    isValid = false;
    message = "Please enter a valid URL.";
  } else if (input.id === "dob" && input.value) {
    const sixteenYearsAgo = new Date();
    sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);
    if (new Date(input.value) > sixteenYearsAgo) {
      isValid = false;
      message = "You must be at least 16 years old to apply.";
    }
  }

  if (isValid) {
    if (input.required || input.value.trim() !== "") {
      input.classList.add("is-valid");
    }
    setFeedback(input, "", false);
  } else {
    input.classList.add("is-invalid");
    setFeedback(input, message, true);
  }
  return isValid;
}

function setFeedback(input, message, isInvalid) {
  let feedbackElem;
  if (input.parentElement.classList.contains("input-group")) {
    feedbackElem =
      input.parentElement.parentElement.querySelector(".invalid-feedback");
  } else if (input.parentElement.classList.contains("file-upload")) {
    feedbackElem = input.parentElement.nextElementSibling;
  } else {
    feedbackElem = input.parentElement.querySelector(".invalid-feedback");
  }
  if (feedbackElem) {
    feedbackElem.textContent = message;
  }
}

// Input live validation
document.querySelectorAll("input, select").forEach((input) => {
  input.addEventListener("input", () => validateInput(input));
  input.addEventListener("change", () => validateInput(input));
});

// File upload preview + validation
document.querySelectorAll('input[type="file"]').forEach((input) => {
  input.addEventListener("change", function () {
    validateInput(this);
    const label = this.nextElementSibling;
    if (this.files.length > 0) {
      label.innerHTML = `<i class="fas fa-check-circle fa-2x mb-2 text-success"></i>
        <div class="text-truncate">${this.files[0].name}</div>
        <small class="text-muted">Click to change</small>`;
    } else {
      const originalText =
        this.id === "photo"
          ? "Upload JPG/PNG (Max 10MB)"
          : "Upload PDF (Max 10MB)";
      const iconClass =
        this.id === "photo" ? "fa-image" : "fa-cloud-upload-alt";
      label.innerHTML = `<i class="fas ${iconClass} fa-2x mb-2 text-primary"></i>
        <div>${originalText}</div>`;
    }
  });
});

// --- Final Submit Logic ---
document
  .getElementById("internshipForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      alert("Please correct the errors before submitting.");
      return;
    }

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...`;

    const formData = new FormData(this);

    try {
      const baseUrl = getbaseurl();
      const response = await fetch(`${baseUrl}/internship/apply`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      const formContainer = document.querySelector(".container.shadow-lg");

      if (response.ok) {
        formContainer.innerHTML = `
          <div class="text-center p-5" style="animation: fadeIn 0.5s ease-in-out;">
            <i class="fas fa-paper-plane fa-5x text-success mb-4"></i>
            <h2 class="text-success mb-3">Application Submitted Successfully!</h2>
            <h3 class="text-success mb-4">Thank you!</h3>
          </div>`;
      } else {
        throw new Error(result.message || "An unknown error occurred.");
      }
    } catch (error) {
      alert(`Submission failed: ${error.message}`);
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fas fa-paper-plane me-2"></i>Submit Application`;
    }
  });

// --- Initial Call ---
updateUI();
