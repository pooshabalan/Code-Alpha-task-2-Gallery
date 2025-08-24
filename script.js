class ImageGallery {
    constructor() {
        this.modal = document.getElementById('modal');
        this.modalImage = document.getElementById('modal-image');
        this.modalCategory = document.getElementById('modal-category');
        this.modalCounter = document.getElementById('modal-counter');
        this.modalClose = document.getElementById('modal-close');
        this.modalPrev = document.getElementById('modal-prev');
        this.modalNext = document.getElementById('modal-next');
        this.gallery = document.getElementById('gallery');
        this.navButtons = document.querySelectorAll('.nav-btn');
        
        this.currentImageIndex = 0;
        this.currentCategory = 'all';
        this.visibleImages = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateVisibleImages();
        this.preloadImages();
    }
    
    bindEvents() {
        // Gallery item clicks
        this.gallery.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const index = parseInt(galleryItem.dataset.index);
                this.openModal(index);
            }
        });
        
        // Modal navigation
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modalPrev.addEventListener('click', () => this.previousImage());
        this.modalNext.addEventListener('click', () => this.nextImage());
        
        // Category filtering
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterCategory(e.target.dataset.category);
                this.setActiveNavButton(e.target);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.modal.classList.contains('active')) {
                switch(e.key) {
                    case 'Escape':
                        this.closeModal();
                        break;
                    case 'ArrowLeft':
                        this.previousImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                }
            }
        });
        
        // Close modal on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Prevent image dragging
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });
        
        // Handle image loading
        const images = this.gallery.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            
            img.addEventListener('error', () => {
                console.warn('Failed to load image:', img.src);
                img.closest('.gallery-item').style.display = 'none';
            });
        });
    }
    
    preloadImages() {
        const images = this.gallery.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete) {
                img.style.opacity = '0';
            }
        });
    }
    
    updateVisibleImages() {
        const allItems = Array.from(this.gallery.querySelectorAll('.gallery-item'));
        
        if (this.currentCategory === 'all') {
            this.visibleImages = allItems;
        } else {
            this.visibleImages = allItems.filter(item => 
                item.dataset.category === this.currentCategory
            );
        }
    }
    
    filterCategory(category) {
        this.currentCategory = category;
        const allItems = this.gallery.querySelectorAll('.gallery-item');
        
        // Add filtering animation class
        allItems.forEach(item => {
            item.classList.add('filtering');
        });
        
        setTimeout(() => {
            allItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
                item.classList.remove('filtering');
            });
            
            this.updateVisibleImages();
        }, 150);
    }
    
    setActiveNavButton(activeBtn) {
        this.navButtons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }
    
    openModal(globalIndex) {
        // Find the image in the visible images array
        const targetItem = this.gallery.querySelector(`[data-index="${globalIndex}"]`);
        const visibleIndex = this.visibleImages.indexOf(targetItem);
        
        if (visibleIndex === -1) return; // Image not visible in current filter
        
        this.currentImageIndex = visibleIndex;
        this.updateModalContent();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    previousImage() {
        if (this.visibleImages.length === 0) return;
        
        this.currentImageIndex = (this.currentImageIndex - 1 + this.visibleImages.length) % this.visibleImages.length;
        this.updateModalContent();
    }
    
    nextImage() {
        if (this.visibleImages.length === 0) return;
        
        this.currentImageIndex = (this.currentImageIndex + 1) % this.visibleImages.length;
        this.updateModalContent();
    }
    
    updateModalContent() {
        if (!this.visibleImages[this.currentImageIndex]) return;
        
        const currentItem = this.visibleImages[this.currentImageIndex];
        const img = currentItem.querySelector('img');
        const category = currentItem.dataset.category;
        
        // Update modal image with loading state
        this.modalImage.style.opacity = '0';
        
        const newImage = new Image();
        newImage.onload = () => {
            this.modalImage.src = newImage.src;
            this.modalImage.alt = img.alt;
            this.modalImage.style.opacity = '1';
        };
        newImage.src = img.src;
        
        // Update category tag
        this.modalCategory.textContent = this.capitalize(category);
        
        // Update counter
        this.modalCounter.textContent = `${this.currentImageIndex + 1} / ${this.visibleImages.length}`;
        
        // Update navigation button states
        this.modalPrev.style.opacity = this.visibleImages.length > 1 ? '1' : '0.5';
        this.modalNext.style.opacity = this.visibleImages.length > 1 ? '1' : '0.5';
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize the gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageGallery();
});

// Add smooth scrolling for any anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add intersection observer for lazy loading enhancement
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (!img.src && img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
        }
    });
}, {
    rootMargin: '50px'
});

// Observe all images for lazy loading
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => imageObserver.observe(img));
});
