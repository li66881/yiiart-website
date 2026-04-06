/**
 * YiiArt 易艺术 - World-Class Art E-Commerce Prototype
 * Core Application JavaScript
 */

// ========================================
// DOM Ready Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initToast();
  initAnimations();
  initMobileNav();

  // Page-aware init (avoid running page logic everywhere)
  if (document.querySelector('.filter-sidebar') || document.querySelector('.category-pill')) {
    initFilters();
  }
  if (document.querySelector('.gallery-main__image')) {
    initGallery();
  }
  if (document.querySelector('.ar-preview-btn')) {
    initARCamera();
  }

  // Delegated interactions (works with dynamically added cards)
  initDelegatedActions();

  // Newsletter
  document.querySelector('.newsletter__form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('.newsletter__input');
    if (input?.value) {
      showToast('Thank you for subscribing!');
      input.value = '';
    }
  });
});

// ========================================
// Header Scroll Behavior
// ========================================
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  let lastScroll = 0;
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        
        // Add shadow on scroll
        if (currentScroll > 50) {
          header.classList.add('header--scrolled');
        } else {
          header.classList.remove('header--scrolled');
        }
        
        // Hide/show on scroll direction
        if (currentScroll > lastScroll && currentScroll > 200) {
          header.classList.add('header--hidden');
        } else {
          header.classList.remove('header--hidden');
        }
        
        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ========================================
// Mobile nav
// ========================================
function initMobileNav() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.nav--mobile');
  if (!toggle || !mobileNav) return;

  const setExpanded = (expanded) => {
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    mobileNav.classList.toggle('nav--open', expanded);
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  });

  // Close after navigation
  mobileNav.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) setExpanded(false);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setExpanded(false);
  });
}

// ========================================
// Filter System
// ========================================
function initFilters() {
  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const parent = swatch.closest('.color-swatches');
      parent?.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('color-swatch--selected'));
      swatch.classList.add('color-swatch--selected');
      applyFilters();
    });
  });
  
  // Filter options
  document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', () => {
      option.classList.toggle('filter-option--selected');
      applyFilters();
    });
  });
  
  // Category pills
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('category-pill--active'));
      pill.classList.add('category-pill--active');
      applyFilters();
    });
  });
}

function applyFilters() {
  // Simulate filtering - in real app would call API
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 50);
  });
}

// ========================================
// Gallery Viewer
// ========================================
function initGallery() {
  const mainImage = document.querySelector('.gallery-main__image');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  
  if (!mainImage || !thumbs.length) return;
  
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('gallery-thumb--active'));
      thumb.classList.add('gallery-thumb--active');
      
      const newSrc = thumb.querySelector('img').src.replace('thumb', 'main');
      mainImage.src = newSrc;
    });
  });
}

// ========================================
// AR Room Preview (touch-ready)
// ========================================
function initARCamera() {
  const arBtn = document.querySelector('.ar-preview-btn');
  const modal = document.querySelector('.modal');
  const closeBtn = document.querySelector('.modal__close');
  
  if (!arBtn || !modal) return;
  
  arBtn.addEventListener('click', () => {
    modal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';
    initARScene();
  });
  
  closeBtn?.addEventListener('click', closeARModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeARModal();
  });
}

function closeARModal() {
  const modal = document.querySelector('.modal');
  if (!modal) return;
  modal.classList.remove('modal--active');
  document.body.style.overflow = '';
}

function initARScene() {
  const artwork = document.querySelector('.ar-room__artwork');
  if (!artwork) return;

  artwork.style.left = '50%';
  artwork.style.top = '40%';
  artwork.style.transform = 'translate(-50%, -50%)';
  artwork.style.width = '300px';

  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  const onPointerDown = (e) => {
    isDragging = true;
    artwork.setPointerCapture?.(e.pointerId);
    startX = e.clientX;
    startY = e.clientY;
    const rect = artwork.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    artwork.style.cursor = 'grabbing';
    e.preventDefault();
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    artwork.style.left = `${initialLeft + dx}px`;
    artwork.style.top = `${initialTop + dy}px`;
    artwork.style.transform = 'translate(0, 0)';
  };

  const onPointerUp = () => {
    isDragging = false;
    artwork.style.cursor = 'grab';
  };

  artwork.addEventListener('pointerdown', onPointerDown);
  artwork.addEventListener('pointermove', onPointerMove);
  artwork.addEventListener('pointerup', onPointerUp);
  artwork.addEventListener('pointercancel', onPointerUp);
}

// ========================================
// Toast Notifications
// ========================================
let toastTimeout;
function initToast() {}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span class="toast__message">${message}</span>
    `;
    document.body.appendChild(toast);
  }

  toast.querySelector('.toast__message').textContent = message;
  toast.classList.add('toast--active');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('toast--active'), 3000);
}

// ========================================
// Scroll Animations
// ========================================
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.section-header, .card, .collection-card, .artist-card--large').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  const style = document.createElement('style');
  style.textContent = `.animate-in{opacity:1!important;transform:translateY(0)!important;}`;
  document.head.appendChild(style);
}

// ========================================
// Delegated interactions
// ========================================
function initDelegatedActions() {
  document.addEventListener('click', (e) => {
    const wishlistBtn = e.target.closest('.card__actions .btn--icon[aria-label="Add to wishlist"]');
    if (wishlistBtn) {
      e.preventDefault();
      e.stopPropagation();

      const icon = wishlistBtn.querySelector('svg');
      const isFilled = icon?.getAttribute('fill') === 'currentColor';

      if (icon) {
        icon.setAttribute('fill', isFilled ? 'none' : 'currentColor');
      }
      showToast(isFilled ? 'Removed from wishlist' : 'Added to wishlist');
      return;
    }

    const quickView = e.target.closest('[data-quick-view]');
    if (quickView) {
      e.preventDefault();
      showToast('Quick view coming soon');
    }
  });
}

// Export for other scripts
window.Artelys = { showToast };
