/* ==========================================================================
   signup.js — Form Validation + Event Handling + backend Auth API
   ========================================================================== */
(function () {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const fullName = document.getElementById('fullName');
  const email = document.getElementById('signupEmail');
  const password = document.getElementById('signupPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  const terms = document.getElementById('terms');
  const success = document.getElementById('signupSuccess');

  function validateField(input, fieldId) {
    const field = document.getElementById(fieldId);
    const valid = input.checkValidity();
    field.classList.toggle('has-error', !valid);
    field.classList.toggle('is-valid', valid);
    return valid;
  }

  function validateConfirm() {
    const field = document.getElementById('confirmField');
    const valid = confirmPassword.value.length > 0 && confirmPassword.value === password.value;
    field.classList.toggle('has-error', !valid);
    field.classList.toggle('is-valid', valid);
    return valid;
  }

  [[fullName, 'nameField'], [email, 'emailField'], [password, 'passwordField']].forEach(([input, fieldId]) => {
    input.addEventListener('input', () => validateField(input, fieldId));
    input.addEventListener('blur', () => validateField(input, fieldId));
  });
  // Re-check the confirm field whenever either password field changes
  password.addEventListener('input', validateConfirm);
  confirmPassword.addEventListener('input', validateConfirm);
  confirmPassword.addEventListener('blur', validateConfirm);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameValid = validateField(fullName, 'nameField');
    const emailValid = validateField(email, 'emailField');
    const passwordValid = validateField(password, 'passwordField');
    const confirmValid = validateConfirm();
    const termsValid = terms.checkValidity();

    if (!nameValid || !emailValid || !passwordValid || !confirmValid || !termsValid) {
      const firstInvalid = [fullName, email, password, confirmPassword].find(i => !i.checkValidity() || (i === confirmPassword && !confirmValid));
      if (firstInvalid) firstInvalid.focus();
      if (!termsValid) showToast('Please agree to the Terms of Service', '⚠️');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.setAttribute('disabled', 'true');

    try {
      // Create the account on the Node.js/MongoDB backend
      const { token, user } = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: fullName.value.trim(),
          email: email.value.trim(),
          password: password.value
        })
      });

      localStorage.setItem('yummyshare_remembered_email', email.value.trim());
      setToken(token);
      setSession(user);

      success.classList.add('is-visible');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    } catch (err) {
      submitBtn.removeAttribute('disabled');

      if (err.status === 409) {
        const field = document.getElementById('emailField');
        field.classList.add('has-error');
        field.querySelector('.error-msg').textContent = 'An account with this email already exists — try logging in instead.';
        email.focus();
        showToast('Account already exists', '⚠️');
      } else {
        showToast(err.message || "Couldn't reach the server — please try again", '⚠️');
      }
    }
  });
})();
