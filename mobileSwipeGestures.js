/**
 * Mobile Swipe Gesture System for Tesseract Tutorial
 * Handles left/right swipe navigation between tutorial sections
 */
class MobileSwipeGestures {
  constructor() {
    this.isActive = false;
    this.touchData = {
      startX: 0,
      startY: 0,
      startTime: 0,
      currentX: 0,
      currentY: 0,
      isTracking: false
    };
    
    this.config = {
      minDistance: 50,
      maxVerticalDrift: 30,
      minVelocity: 0.3,
      minDuration: 50,
      maxDuration: 800,
      debounceTime: 300
    };
    
    this.lastSwipeTime = 0;
    this.isTransitioning = false;
    
    this.init();
  }
  
  init() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;
    
    console.log('🎯 Initializing mobile swipe gestures');
    
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }
  
  shouldIgnoreTouch(touch) {
    // Get global state - these should be defined in main script
    const tutorialOpen = window.tutorialOpen || false;
    const currentSection = window.currentSection || 0;
    
    if (!tutorialOpen || currentSection < 1 || currentSection > 14) {
      return true;
    }
    
    if (document.querySelector('.widget-fullscreen.active')) {
      return true;
    }
    
    if (document.querySelector('.parameter-dialog.active')) {
      return true;
    }
    
    const buttonAreas = [
      '.tutorial-nav',
      '.progress-bar',
      '.nav-btn',
      '.widget-btn',
      '.close-btn',
      '.settings-toggle',
      '.controls-panel'
    ];
    
    for (const selector of buttonAreas) {
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element && element.closest(selector)) {
        return true;
      }
    }
    
    return false;
  }
  
  handleTouchStart(event) {
    const touch = event.touches[0];
    
    if (this.shouldIgnoreTouch(touch)) {
      return;
    }
    
    this.touchData = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      isTracking: true
    };
    
    console.log('📱 Swipe tracking started');
  }
  
  handleTouchMove(event) {
    if (!this.touchData.isTracking) return;
    
    const touch = event.touches[0];
    this.touchData.currentX = touch.clientX;
    this.touchData.currentY = touch.clientY;
    
    const deltaX = this.touchData.currentX - this.touchData.startX;
    const deltaY = this.touchData.currentY - this.touchData.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    if (absDeltaX > 30 && absDeltaX > absDeltaY * 2 && absDeltaY < this.config.maxVerticalDrift) {
      event.preventDefault();
      
      if (absDeltaX > 20) {
        this.showSwipePreview(deltaX);
      }
    }
  }
  
  handleTouchEnd(event) {
    if (!this.touchData.isTracking) return;
    
    const touch = event.changedTouches[0];
    const endTime = Date.now();
    const duration = endTime - this.touchData.startTime;
    
    const deltaX = touch.clientX - this.touchData.startX;
    const deltaY = Math.abs(touch.clientY - this.touchData.startY);
    const distance = Math.abs(deltaX);
    const velocity = distance / duration;
    
    this.hideSwipePreview();
    
    const isValidGesture = this.validateGesture(deltaX, deltaY, distance, velocity, duration);
    
    if (isValidGesture) {
      this.processSwipe(deltaX);
    }
    
    this.touchData.isTracking = false;
    
    console.log('📱 Swipe ended: deltaX=' + deltaX + ', deltaY=' + deltaY + ', velocity=' + velocity.toFixed(2) + ', valid=' + isValidGesture);
  }
  
  validateGesture(deltaX, deltaY, distance, velocity, duration) {
    if (Date.now() - this.lastSwipeTime < this.config.debounceTime) {
      console.log('❌ Swipe ignored: too soon after last swipe');
      return false;
    }
    
    if (this.isTransitioning) {
      console.log('❌ Swipe ignored: transition in progress');
      return false;
    }
    
    if (distance < this.config.minDistance) {
      console.log('❌ Swipe ignored: distance ' + distance + ' < ' + this.config.minDistance);
      return false;
    }
    
    if (deltaY > this.config.maxVerticalDrift) {
      console.log('❌ Swipe ignored: vertical drift ' + deltaY + ' > ' + this.config.maxVerticalDrift);
      return false;
    }
    
    if (velocity < this.config.minVelocity) {
      console.log('❌ Swipe ignored: velocity ' + velocity.toFixed(2) + ' < ' + this.config.minVelocity);
      return false;
    }
    
    if (duration < this.config.minDuration || duration > this.config.maxDuration) {
      console.log('❌ Swipe ignored: duration ' + duration + ' outside bounds [' + this.config.minDuration + ', ' + this.config.maxDuration + ']');
      return false;
    }
    
    return true;
  }
  
  processSwipe(deltaX) {
    const direction = deltaX > 0 ? 'right' : 'left';
    const currentSection = window.currentSection || 0;
    let targetSection;
    let canSwipe = false;
    
    if (direction === 'right') {
      targetSection = currentSection - 1;
      canSwipe = currentSection > 1;
    } else {
      targetSection = currentSection + 1;
      canSwipe = currentSection < 14;
    }
    
    console.log('📱 Processing ' + direction + ' swipe: ' + currentSection + ' → ' + targetSection + ', canSwipe: ' + canSwipe);
    
    if (canSwipe) {
      this.executeSwipeNavigation(targetSection);
    } else {
      this.showBoundaryFeedback(direction);
    }
  }
  
  executeSwipeNavigation(targetSection) {
    this.isTransitioning = true;
    this.lastSwipeTime = Date.now();
    
    const currentSection = window.currentSection || 0;
    this.showSwipeSuccess(targetSection > currentSection ? 'left' : 'right');
    
    // Call global navigation function
    if (typeof window.transitionToSection === 'function') {
      window.transitionToSection(targetSection);
    }
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 800);
  }
  
  showSwipePreview(deltaX) {
    // Could add subtle visual preview here if desired
  }
  
  hideSwipePreview() {
    // Reset any preview states
  }
  
  showSwipeSuccess(direction) {
    const indicatorId = 'swipeIndicator' + (direction === 'left' ? 'Left' : 'Right');
    const indicator = document.getElementById(indicatorId);
    if (indicator) {
      indicator.classList.remove('boundary');
      indicator.classList.add('show');
      setTimeout(() => {
        indicator.classList.remove('show');
      }, 600);
    }
  }
  
  showBoundaryFeedback(direction) {
    const indicatorId = direction === 'right' ? 'swipeIndicatorLeft' : 'swipeIndicatorRight';
    const indicator = document.getElementById(indicatorId);
    
    if (indicator) {
      indicator.classList.add('boundary');
      indicator.textContent = direction === 'right' ? 'Start of tutorial' : 'End of tutorial';
      indicator.classList.add('show');
      
      setTimeout(() => {
        indicator.classList.remove('show');
        setTimeout(() => {
          indicator.classList.remove('boundary');
          indicator.textContent = direction === 'right' ? '← Previous' : 'Next →';
        }, 200);
      }, 1000);
    }
  }
  
  destroy() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;
    
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileSwipeGestures;
} else if (typeof window !== 'undefined') {
  window.MobileSwipeGestures = MobileSwipeGestures;
}
