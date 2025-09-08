document.getElementById('newVendorPAN').addEventListener('change', (event) => {
  const input = event.target;
  const panValue = input.value.toUpperCase().trim();
  input.value = panValue; // auto convert to uppercase

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (panRegex.test(panValue)) {
    event.target.classList.remove("validate");
    // showErrorPopupFadeInDown("Check Pan Number");
  } else {
    
    showErrorPopupFadeInDown("Check Pan Number");
      event.target.classList.add("validate");

  }
});

document.getElementById('newVendorGST').addEventListener('change', (event) => {
  const input = event.target;
  const gstValue = input.value.toUpperCase().trim();
  input.value = gstValue;

  // GSTIN format: 2 digits + PAN (10 chars) + 1 alphanumeric + Z + 1 alphanumeric
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (gstRegex.test(gstValue)) {
    event.target.classList.remove("validate");
  } else {
        showErrorPopupFadeInDown("Check GST Number");
      event.target.classList.add("validate");
  }
});
document.getElementById('newVendorEmail').addEventListener('change', (event) => {
  const input = event.target;
  const emailValue = input.value.trim();

  // Basic email pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (emailRegex.test(emailValue)) {
    
    event.target.classList.remove("validate");
  } else {
           showErrorPopupFadeInDown("Check Email");
      event.target.classList.add("validate");
  }
});

