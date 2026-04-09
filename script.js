// ============================================
// THE HOROLOGICAL MONOLITH — Interactivity
// ============================================

// Live Watch Hands
function updateWatchHands() {
  const now = new Date();
  const hours   = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourDeg   = (hours * 30) + (minutes * 0.5);
  const minuteDeg = (minutes * 6) + (seconds * 0.1);
  const secondDeg = seconds * 6;

  const hourHand   = document.querySelector('.hour-hand');
  const minuteHand = document.querySelector('.minute-hand');
  const secondHand = document.querySelector('.second-hand');

  if (hourHand)   hourHand.style.transform   = `translateX(-50%) rotate(${hourDeg}deg)`;
  if (minuteHand) minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
  if (secondHand) secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
}

setInterval(updateWatchHands, 1000);
updateWatchHands();

// Nav scroll effect
const nav = document.querySelector('.nav-glass');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.style.background = 'rgba(19, 19, 19, 0.85)';
  } else {
    nav.style.background = 'rgba(42, 40, 36, 0.6)';
  }
});

// Smooth reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .atelier-card, .stat, .heritage-content').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  observer.observe(el);
});

// Form submission
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-primary');
    btn.textContent = 'Enquiry Received';
    btn.style.opacity = '0.7';
    btn.disabled = true;
  });
}
