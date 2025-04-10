/**
 * Modal Manager
 * Handles all modal interactions and ensures game is unresponsive when modals are open
 */

class ModalManager {
    constructor() {
        this.activeModals = [];
        this.init();
    }

    init() {
        console.log("Initializing Modal Manager");
        
        // Find all existing modals
        const modals = document.querySelectorAll('.modal-wrapper');
        
        // Set up listeners for each modal
        modals.forEach(modal => {
            this.setupModalListeners(modal);
        });
        
        // Create a global overlay if it doesn't exist
        this.ensureOverlayExists();
        
        // Set up a mutation observer to catch dynamically added modals
        this.setupModalObserver();
        
        // Check if any modals are already open
        this.checkForActiveModals();
    }
    
    setupModalListeners(modal) {
        if (!modal || modal._hasModalListeners) return;
        
        // Close button functionality
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideModal(modal);
            });
        }
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal(modal);
            }
        });
        
        // Mark this modal as having listeners
        modal._hasModalListeners = true;
    }
    
    ensureOverlayExists() {
        let overlay = document.getElementById('global-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'global-modal-overlay';
            overlay.className = 'global-modal-overlay';
            
            // Apply styles
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            overlay.style.zIndex = '9998'; // Just below modal z-index
            overlay.style.display = 'none';
            overlay.style.pointerEvents = 'all'; // Block all interactions
            
            document.body.appendChild(overlay);
        }
        return overlay;
    }
    
    setupModalObserver() {
        // Watch for dynamically added modals
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.classList && node.classList.contains('modal-wrapper')) {
                            console.log('New modal detected:', node.id);
                            this.setupModalListeners(node);
                            
                            // If modal is already active, update overlay
                            if (node.classList.contains('active')) {
                                this.showOverlay();
                                this.activeModals.push(node);
                            }
                        }
                    });
                }
                
                // Also check for removed nodes to clean up activeModals array
                if (mutation.removedNodes.length) {
                    mutation.removedNodes.forEach(node => {
                        if (node.classList && node.classList.contains('modal-wrapper')) {
                            this.activeModals = this.activeModals.filter(m => m !== node);
                            if (this.activeModals.length === 0) {
                                this.hideOverlay();
                            }
                        }
                    });
                }
                
                // Check for class changes on existing modals
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    mutation.target.classList.contains('modal-wrapper')) {
                    
                    const modal = mutation.target;
                    const isActive = modal.classList.contains('active');
                    const isTracked = this.activeModals.includes(modal);
                    
                    if (isActive && !isTracked) {
                        console.log('Modal activated:', modal.id);
                        this.activeModals.push(modal);
                        this.showOverlay();
                    } else if (!isActive && isTracked) {
                        console.log('Modal deactivated:', modal.id);
                        this.activeModals = this.activeModals.filter(m => m !== modal);
                        if (this.activeModals.length === 0) {
                            this.hideOverlay();
                        }
                    }
                }
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }
    
    checkForActiveModals() {
        const activeModals = document.querySelectorAll('.modal-wrapper.active');
        if (activeModals.length > 0) {
            console.log('Found active modals on init:', activeModals.length);
            this.activeModals = Array.from(activeModals);
            this.showOverlay();
        }
    }
    
    showModal(modalId) {
        const modal = typeof modalId === 'string' ? 
            document.getElementById(modalId) : 
            modalId;
            
        if (!modal) return;
        
        // Set up listeners if not already done
        this.setupModalListeners(modal);
        
        // Show the modal
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        modal.classList.add('active');
        
        // Add to active modals if not already there
        if (!this.activeModals.includes(modal)) {
            this.activeModals.push(modal);
        }
        
        // Show the overlay
        this.showOverlay();
        
        // Set global flag
        window.isModalOpen = true;
    }
    
    hideModal(modalId) {
        const modal = typeof modalId === 'string' ? 
            document.getElementById(modalId) : 
            modalId;
            
        if (!modal) return;
        
        // Hide the modal
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        modal.classList.remove('active');
        
        // Remove from active modals
        this.activeModals = this.activeModals.filter(m => m !== modal);
        
        // If no more active modals, hide overlay
        if (this.activeModals.length === 0) {
            this.hideOverlay();
            window.isModalOpen = false;
        }
    }
    
    closeAndRemoveModal(modalId) {
        const modal = typeof modalId === 'string' ? 
            document.getElementById(modalId) : 
            modalId;
            
        if (!modal) return;
        
        // Capture modal ID and class info before removing it for the custom event
        const modalInfo = {
            id: modal.id,
            classes: Array.from(modal.classList)
        };
        
        // Remove from active modals first
        this.activeModals = this.activeModals.filter(m => m !== modal);
        
        // If no more active modals, hide overlay
        if (this.activeModals.length === 0) {
            this.hideOverlay();
            window.isModalOpen = false;
        }
        
        // Remove the modal completely from DOM
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        
        // Dispatch a custom event that other components can listen for
        document.dispatchEvent(new CustomEvent('modalClosed', { 
            detail: modalInfo 
        }));
    }
    
    showOverlay() {
        const overlay = this.ensureOverlayExists();
        overlay.style.display = 'block';
        document.body.classList.add('modal-open');
    }
    
    hideOverlay() {
        const overlay = document.getElementById('global-modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        document.body.classList.remove('modal-open');
    }
    
    cleanupModals(modalClass) {
        // Remove any hidden modals with the specified class that aren't active
        const modals = document.querySelectorAll(`.modal-wrapper${modalClass ? '.' + modalClass : ''}`);
        modals.forEach(modal => {
            if (!modal.classList.contains('active') && this.activeModals.indexOf(modal) === -1) {
                if (modal.parentNode) {
                    console.log('Cleaning up inactive modal:', modal.id);
                    modal.parentNode.removeChild(modal);
                }
            }
        });
    }
}

// Initialize the modal manager when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modalManager = new ModalManager();
});

// Make the modal manager available globally
window.showModal = function(modalId) {
    if (window.modalManager) {
        window.modalManager.showModal(modalId);
    } else {
        console.error('Modal manager not initialized');
    }
};

window.hideModal = function(modalId) {
    if (window.modalManager) {
        window.modalManager.hideModal(modalId);
    } else {
        console.error('Modal manager not initialized');
    }
};

window.closeAndRemoveModal = function(modalId) {
    if (window.modalManager) {
        window.modalManager.closeAndRemoveModal(modalId);
    } else {
        console.error('Modal manager not initialized');
    }
};

// Emergency init to ensure it's available
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (!window.modalManager) {
        window.modalManager = new ModalManager();
    }
}
