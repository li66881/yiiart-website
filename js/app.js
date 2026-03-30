/**
 * ARTÈLYS - World-Class Art E-Commerce Prototype
 * Core Application JavaScript
 */

// ========================================
// DOM Ready Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initFilters();
  initGallery();
  initARCamera();
  initToast();
  initAnimations();
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
// Filter System
// ========================================
function initFilters() {
  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const parent = swatch.closest('.color-swatches');
      parent.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('color-swatch--selected'));
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
  
  // Frame options
  document.querySelectorAll('.frame-option').forEach(option => {
    option.addEventListener('click', () => {
      const parent = option.closest('.frame-options');
      parent.querySelectorAll('.frame-option').forEach(o => o.classList.remove('frame-option--selected'));
      option.classList.add('frame-option--selected');
      updateFramePrice();
    });
  });
  
  // Size presets for AR
  document.querySelectorAll('.size-preset').forEach(preset => {
    preset.addEventListener('click', () => {
      const parent = preset.closest('.size-presets');
      parent.querySelectorAll('.size-preset').forEach(p => p.classList.remove('size-preset--active'));
      preset.classList.add('size-preset--active');
      updateARSize();
    });
  });
  
  // Room presets
  document.querySelectorAll('.room-preset').forEach(preset => {
    preset.addEventListener('click', () => {
      document.querySelectorAll('.room-preset').forEach(p => p.classList.remove('room-preset--active'));
      preset.classList.add('room-preset--active');
      changeRoom(preset.dataset.room);
    });
  });
}

function applyFilters() {
  // Simulate filtering - in real app would call API
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    // Simulate staggered animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 50);
  });
}

function updateFramePrice() {
  const selected = document.querySelector('.frame-option--selected');
  if (selected) {
    const price = selected.querySelector('.frame-option__price')?.textContent || '';
    console.log('Frame selected:', price);
  }
}

// ========================================
// Gallery Viewer
// ========================================
function initGallery() {
  const mainImage = document.querySelector('.gallery-main__image');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  
  if (!mainImage || !thumbs.length) return;
  
  // Thumbnail clicks
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('gallery-thumb--active'));
      thumb.classList.add('gallery-thumb--active');
      
      const newSrc = thumb.querySelector('img').src.replace('thumb', 'main');
      mainImage.src = newSrc;
    });
  });
  
  // Zoom on hover
  mainImage.addEventListener('mousemove', (e) => {
    const rect = mainImage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    mainImage.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    mainImage.style.transform = 'scale(1.5)';
  });
  
  mainImage.addEventListener('mouseleave', () => {
    mainImage.style.transform = 'scale(1)';
  });
  
  // Quantity buttons
  document.querySelectorAll('.add-to-cart__qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('.add-to-cart__qty-value');
      let value = parseInt(input.textContent);
      
      if (btn.textContent === '+') {
        value = Math.min(value + 1, 10);
      } else {
        value = Math.max(value - 1, 1);
      }
      
      input.textContent = value;
    });
  });
  
  // Add to cart
  const addToCartBtn = document.querySelector('.add-to-cart__submit');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      showToast('Artwork added to your collection');
      updateCartBadge();
    });
  }
}

// ========================================
// AR Room Preview
// ========================================
function initARCamera() {
  const arBtn = document.querySelector('.ar-preview-btn');
  const modal = document.querySelector('.modal');
  const closeBtn = document.querySelector('.modal__close');
  
  if (!arBtn || !modal) return;
  
  // Open AR modal
  arBtn.addEventListener('click', () => {
    modal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';
    initARScene();
  });
  
  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener('click', closeARModal);
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeARModal();
    }
  });
  
  // AR Controls
  document.querySelectorAll('.ar-room__control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'zoom-in') zoomAR(1.1);
      if (action === 'zoom-out') zoomAR(0.9);
      if (action === 'rotate') rotateAR();
      if (action === 'reset') resetAR();
    });
  });
}

function closeARModal() {
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.classList.remove('modal--active');
    document.body.style.overflow = '';
  }
}

function initARScene() {
  const artwork = document.querySelector('.ar-room__artwork');
  if (!artwork) return;
  
  // Center the artwork initially
  artwork.style.left = '50%';
  artwork.style.top = '40%';
  artwork.style.transform = 'translate(-50%, -50%)';
  artwork.style.width = '300px';
  
  // Make artwork draggable
  let isDragging = false;
  let startX, startY, initialX, initialY;
  
  artwork.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = artwork.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    artwork.style.cursor = 'grabbing';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    artwork.style.left = `${initialX + dx}px`;
    artwork.style.top = `${initialY + dy}px`;
    artwork.style.transform = 'translate(0, 0)';
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    artwork.style.cursor = 'grab';
  });
}

function zoomAR(factor) {
  const artwork = document.querySelector('.ar-room__artwork');
  if (!artwork) return;
  
  const currentWidth = parseInt(artwork.style.width) || 300;
  const newWidth = Math.max(100, Math.min(600, currentWidth * factor));
  artwork.style.width = `${newWidth}px`;
}

function rotateAR() {
  const artwork = document.querySelector('.ar-room__artwork');
  if (!artwork) return;
  
  const currentRotation = parseInt(artwork.dataset.rotation) || 0;
  artwork.dataset.rotation = currentRotation + 90;
  artwork.style.transform = `rotate(${artwork.dataset.rotation}deg)`;
}

function resetAR() {
  const artwork = document.querySelector('.ar-room__artwork');
  if (!artwork) return;
  
  artwork.style.left = '50%';
  artwork.style.top = '40%';
  artwork.style.transform = 'translate(-50%, -50%)';
  artwork.style.width = '300px';
  artwork.dataset.rotation = 0;
}

function changeRoom(roomType) {
  const room = document.querySelector('.ar-room');
  if (!room) return;
  
  // In a real app, would change the room background
  console.log('Changing room to:', roomType);
  
  // Simulate room change with different gradients
  const roomStyles = {
    'living': 'linear-gradient(135deg, #E8E4DF 0%, #D4CFC8 100%)',
    'bedroom': 'linear-gradient(135deg, #E5E0DB 0%, #D8D3CE 100%)',
    'office': 'linear-gradient(135deg, #F0F0F0 0%, #E0E0E0 100%)',
    'dining': 'linear-gradient(135deg, #E8E0D8 0%, #D4C8C0 100%)'
  };
  
  room.style.background = roomStyles[roomType] || roomStyles['living'];
}

function updateARSize() {
  const selected = document.querySelector('.size-preset--active');
  if (selected) {
    const size = selected.querySelector('.size-preset__size')?.textContent || '';
    const artwork = document.querySelector('.ar-room__artwork');
    if (artwork) {
      const sizeMap = {
        'S': '150px',
        'M': '300px',
        'L': '450px',
        'XL': '600px'
      };
      artwork.style.width = sizeMap[size] || '300px';
    }
  }
}

// ========================================
// Toast Notifications
// ========================================
let toastTimeout;
function initToast() {
  // Toast is already in HTML, just need to manage it
}

function showToast(message, type = 'success') {
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
  toastTimeout = setTimeout(() => {
    toast.classList.remove('toast--active');
  }, 3000);
}

function updateCartBadge() {
  const badge = document.querySelector('.icon-btn__badge');
  if (badge) {
    const current = parseInt(badge.textContent) || 0;
    badge.textContent = current + 1;
    badge.style.transform = 'scale(1.3)';
    setTimeout(() => {
      badge.style.transform = 'scale(1)';
    }, 200);
  }
}

// ========================================
// Scroll Animations
// ========================================
function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.section-header, .card, .collection-card, .artist-card--large').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
  
  // Add CSS for animation
  const style = document.createElement('style');
  style.textContent = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
}

// ========================================
// Wishlist Functionality
// ========================================
document.querySelectorAll('.card__actions .btn--icon').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const icon = btn.querySelector('svg');
    const isFilled = icon.getAttribute('fill') === 'currentColor';
    
    if (isFilled) {
      icon.setAttribute('fill', 'none');
      showToast('Removed from wishlist');
    } else {
      icon.setAttribute('fill', 'currentColor');
      showToast('Added to wishlist');
    }
  });
});

// ========================================
// Quick View Modal
// ========================================
document.querySelectorAll('[data-quick-view]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    // In real app, would open quick view modal
    showToast('Quick view coming soon');
  });
});

// ========================================
// Newsletter Form
// ========================================
document.querySelector('.newsletter__form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = e.target.querySelector('.newsletter__input');
  if (input.value) {
    showToast('Thank you for subscribing!');
    input.value = '';
  }
});

// ========================================
// Mobile Menu Toggle
// ========================================
document.querySelector('.mobile-menu-toggle')?.addEventListener('click', () => {
  const nav = document.querySelector('.nav');
  if (nav) {
    nav.classList.toggle('nav--open');
  }
});

// ========================================
// Lazy Loading Images
// ========================================
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ========================================
// Utility Functions
// ========================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

// Export for use in other scripts
window.Artelys = {
  showToast,
  updateCartBadge,
  formatPrice,
  debounce
};
