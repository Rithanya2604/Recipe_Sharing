/* ==========================================================================
   login.js — Form Validation + Event Handling + backend Auth API
   ========================================================================== */
(function () {
  const form = document.getElementById('loginForm');
  if (!form) return;
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const remember = document.getElementById('remember');
  const success = document.getElementById('loginSuccess');

  // Pre-fill remembered email (Local Storage read)
  const savedEmail = localStorage.getItem('yummyshare_remembered_email');
  if (savedEmail) { email.value = savedEmail; remember.checked = true; }

  // Remember the default validation copy so we can restore it after a
  // login-specific error (e.g. "no account found") has overwritten it.
  const emailErrorEl = document.querySelector('#emailField .error-msg');
  const passwordErrorEl = document.querySelector('#passwordField .error-msg');
  const defaultEmailError = emailErrorEl.textContent;
  const defaultPasswordError = passwordErrorEl.textContent;
  email.addEventListener('input', () => { emailErrorEl.textContent = defaultEmailError; });
  password.addEventListener('input', () => { passwordErrorEl.textContent = defaultPasswordError; });

  function validateField(input, fieldId) {
    const field = document.getElementById(fieldId);
    const valid = input.checkValidity();
    field.classList.toggle('has-error', !valid);
    field.classList.toggle('is-valid', valid);
    return valid;
  }

  // Live validation as the user types (Event Handling)
  [[email, 'emailField'], [password, 'passwordField']].forEach(([input, fieldId]) => {
    input.addEventListener('input', () => validateField(input, fieldId));
    input.addEventListener('blur', () => validateField(input, fieldId));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailValid = validateField(email, 'emailField');
    const passwordValid = validateField(password, 'passwordField');
    if (!emailValid || !passwordValid) {
      (emailValid ? password : email).focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.setAttribute('disabled', 'true');

    try {
      // Check credentials against the Node.js/MongoDB backend
      const { token, user } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.value.trim(), password: password.value })
      });

      if (remember.checked) {
        localStorage.setItem('yummyshare_remembered_email', email.value);
      } else {
        localStorage.removeItem('yummyshare_remembered_email');
      }

      setToken(token);
      setSession(user);

      success.querySelector('span').textContent = 'Logged in! Redirecting you to your profile…';
      success.classList.add('is-visible');
      setTimeout(() => { window.location.href = 'profile.html'; }, 1200);
    } catch (err) {
      submitBtn.removeAttribute('disabled');

      if (err.status === 404) {
        const field = document.getElementById('emailField');
        field.classList.add('has-error');
        field.querySelector('.error-msg').textContent = "We couldn't find an account for that email. Redirecting you to sign up…";
        showToast("No account found — let's create one", '👋');
        setTimeout(() => { window.location.href = 'signup.html'; }, 1500);
      } else if (err.status === 401) {
        const field = document.getElementById('passwordField');
        field.classList.add('has-error');
        field.querySelector('.error-msg').textContent = 'Incorrect password. Please try again.';
        password.focus();
      } else {
        showToast(err.message || "Couldn't reach the server — please try again", '⚠️');
      }
    }
  });
})();
