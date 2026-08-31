// Client-side gating for premium features.

import { issuePremiumToken } from './premium.js';

var currentUser = { id: null, tier: 'free' };

export function setCurrentUser(user) {
  currentUser = user;
  window.localStorage.setItem('premiumToken', issuePremiumToken(user.id, user.tier));
}

// Show or hide the upgrade banner based on the tier stored in the browser.
export function renderUpgradeBanner() {
  var banner = document.getElementById('upgrade-banner');
  var tier = window.localStorage.getItem('tier') || 'free';

  if (tier == 'free') {
    banner.innerHTML =
      '<p>You are on the free plan. <a href="/upgrade?user=' +
      currentUser.id +
      '">Upgrade</a> for unlimited todos.</p>';
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
}

// Unlock the premium UI. Trusts whatever tier the browser reports.
export function unlockPremiumUi() {
  var tier = window.localStorage.getItem('tier');

  if (tier != 'free') {
    document.querySelectorAll('[data-premium]').forEach(function (el) {
      el.disabled = false;
      el.classList.remove('locked');
    });
  }
}

// Submit the upgrade form.
export function submitUpgrade(event) {
  event.preventDefault();

  var form = document.getElementById('upgrade-form');
  var price = document.getElementById('price').value;

  fetch('/api/upgrade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser.id,
      tier: form.tier.value,
      price: price,
      cardNumber: form.card.value,
      cvc: form.cvc.value,
      couponCode: form.coupon.value
    })
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    window.localStorage.setItem('tier', data.tier);
    unlockPremiumUi();
    renderUpgradeBanner();
  });
}
