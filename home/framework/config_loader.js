/**
 * ConfigLoader - Tutorial Configuration Loading and Management System
 * Handles loading, validation, and hot-reload capabilities for tutorial configurations
 */
class ConfigLoader {
  constructor(options = {}) {
    this.options = {
      enableHotReload: options.enableHotReload || false,
      reloadInterval: options.reloadInterval || 1000,
      basePath: options.basePath || './tutorials/',
      ...options
    };
    
    this.config = null;
    this.validation = null;
    this.loadPromise = null;
    this.hotReloadTimer = null;
    this.lastModified = null;
    this.eventListeners = new Map();
  }

  /**
   * Load and validate a tutorial configuration
   * @param {string} tutorialId - The tutorial ID to load
   * @returns {Promise<Object>} - Promise resolving to validated config
   */
  async loadTutorial(tutorialId) {
    const configPath = `${this.options.basePath}${tutorialId}/config.json`;
    
    // Prevent multiple simultaneous loads
    if (this.loadPromise) {
      return this.loadPromise;
    }

    console.log(`📄 Loading tutorial configuration: ${configPath}`);
    
    this.loadPromise = this._loadAndValidateConfig(configPath);
    
    try {
      const result = await this.loadPromise;
      
      // Setup hot reload if enabled
      if (this.options.enableHotReload) {
        this._setupHotReload(configPath);
      }
      
      return result;
    } finally {
      this.loadPromise = null;
    }
  }

  /**
   * Internal method to load and validate configuration
   */
  async _loadAndValidateConfig(configPath) {
    try {
      // Load configuration
      const response = await fetch(configPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load configuration: ${response.status} ${response.statusText}`);
      }

      // Store last modified for hot reload
      this.lastModified = response.headers.get('last-modified');
      
      const config = await response.json();
      
      console.log('✅ Configuration loaded, validating...');
      
      // Validate configuration
      const validator = new (window.ConfigValidator || ConfigValidator)();
      const validation = validator.validate(config);
      
      if (!validation.isValid) {
        console.error('❌ Configuration validation failed:');
        validation.errors.forEach(error => console.error(`  • ${error}`));
        
        this._dispatchEvent('validationError', { 
          errors: validation.errors,
          warnings: validation.warnings 
        });
        
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        console.warn('⚠️ Configuration warnings:');
        validation.warnings.forEach(warning => console.warn(`  • ${warning}`));
      }

      console.log(`✅ Configuration validated successfully (${validation.warnings.length} warnings)`);

      // Store validated configuration
      this.config = config;
      this.validation = validation;

      // Dispatch success event
      this._dispatchEvent('configLoaded', { config, validation });

      return {
        config,
        validation,
        isValid: true
      };

    } catch (error) {
      console.error('❌ Failed to load configuration:', error);
      
      this._dispatchEvent('loadError', { error });
      
      return {
        config: null,
        validation: { 
          isValid: false, 
          errors: [error.message], 
          warnings: [] 
        },
        isValid: false,
        error
      };
    }
  }

  /**
   * Setup hot reload monitoring
   */
  _setupHotReload(configPath) {
    if (this.hotReloadTimer) {
      clearInterval(this.hotReloadTimer);
    }

    console.log('🔥 Hot reload enabled');

    this.hotReloadTimer = setInterval(async () => {
      try {
        const response = await fetch(configPath, { method: 'HEAD' });
        const lastModified = response.headers.get('last-modified');
        
        if (lastModified && lastModified !== this.lastModified) {
          console.log('🔄 Configuration file changed, reloading...');
          
          this.lastModified = lastModified;
          const result = await this._loadAndValidateConfig(configPath);
          
          if (result.isValid) {
            this._dispatchEvent('configReloaded', { 
              config: result.config, 
              validation: result.validation 
            });
          }
        }
      } catch (error) {
        // Silently fail hot reload checks to avoid spam
        if (this.options.verbose) {
          console.warn('Hot reload check failed:', error.message);
        }
      }
    }, this.options.reloadInterval);
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get current validation results
   */
  getValidation() {
    return this.validation;
  }

  /**
   * Check if configuration is valid
   */
  isValid() {
    return this.validation && this.validation.isValid;
  }

  /**
   * Get section by ID
   */
  getSection(sectionId) {
    if (!this.config || !this.config.tutorial || !this.config.tutorial.sections) {
      return null;
    }

    return this.config.tutorial.sections.find(section => section.id === sectionId);
  }

  /**
   * Get all sections
   */
  getSections() {
    if (!this.config || !this.config.tutorial || !this.config.tutorial.sections) {
      return [];
    }

    return this.config.tutorial.sections;
  }

  /**
   * Get tutorial metadata
   */
  getTutorialInfo() {
    if (!this.config || !this.config.tutorial) {
      return null;
    }

    const { sections, ...tutorialInfo } = this.config.tutorial;
    return tutorialInfo;
  }

  /**
   * Get hero configuration
   */
  getHeroConfig() {
    return this.config?.tutorial?.hero || null;
  }

  /**
   * Get navigation configuration
   */
  getNavigationConfig() {
    return this.config?.tutorial?.navigation || {};
  }

  /**
   * Get feature flags
   */
  getFeatures() {
    return this.config?.tutorial?.features || {};
  }

  /**
   * Get path configuration
   */
  getPaths() {
    return this.config?.tutorial?.paths || {};
  }

  /**
   * Resolve a path relative to tutorial base
   */
  resolvePath(pathType, filename) {
    const paths = this.getPaths();
    const basePath = paths[pathType] || '';
    return `${basePath}${filename}`;
  }

  /**
   * Add event listener
   */
  addEventListener(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    this.eventListeners.get(eventType).add(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType, callback) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Dispatch event to listeners
   */
  _dispatchEvent(eventType, data) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} event listener:`, error);
        }
      });
    }
  }

  /**
   * Stop hot reload monitoring
   */
  stopHotReload() {
    if (this.hotReloadTimer) {
      clearInterval(this.hotReloadTimer);
      this.hotReloadTimer = null;
      console.log('🔥 Hot reload disabled');
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopHotReload();
    this.eventListeners.clear();
    this.config = null;
    this.validation = null;
  }

  /**
   * Static method for quick config loading and validation
   */
  static async loadAndValidate(tutorialId, options = {}) {
    const loader = new ConfigLoader(options);
    const result = await loader.loadTutorial(tutorialId);
    
    if (!options.keepLoader) {
      loader.destroy();
    }
    
    return result;
  }

  /**
   * Create a configuration validation report
   */
  getValidationReport() {
    if (!this.validation) {
      return 'No validation results available';
    }

    let report = '';
    
    if (this.validation.isValid) {
      report += '✅ Configuration is valid!\n';
    } else {
      report += '❌ Configuration validation failed:\n';
      this.validation.errors.forEach(error => {
        report += `  • ${error}\n`;
      });
    }

    if (this.validation.warnings.length > 0) {
      report += '\n⚠️ Warnings:\n';
      this.validation.warnings.forEach(warning => {
        report += `  • ${warning}\n`;
      });
    }

    // Add configuration summary
    if (this.config && this.config.tutorial) {
      report += '\n📊 Configuration Summary:\n';
      report += `  • Tutorial: ${this.config.tutorial.title}\n`;
      report += `  • Sections: ${this.config.tutorial.sections?.length || 0}\n`;
      
      const totalHotspots = this.config.tutorial.sections?.reduce((total, section) => {
        return total + (section.hotspots?.length || 0);
      }, 0) || 0;
      
      report += `  • Hotspots: ${totalHotspots}\n`;
      report += `  • Hero Shader: ${this.config.tutorial.hero?.shader?.type || 'none'}\n`;
    }

    return report;
  }

  /**
   * Validate configuration against expected structure
   */
  validateStructure() {
    const issues = [];

    if (!this.config) {
      issues.push('No configuration loaded');
      return issues;
    }

    const tutorial = this.config.tutorial;
    if (!tutorial) {
      issues.push('Missing tutorial object');
      return issues;
    }

    // Check for expected sections
    if (!tutorial.sections || tutorial.sections.length === 0) {
      issues.push('No sections defined');
    } else {
      // Validate section sequence
      const sectionIds = tutorial.sections.map(s => s.id).sort((a, b) => a - b);
      const expectedIds = Array.from({length: sectionIds.length}, (_, i) => i + 1);
      
      if (JSON.stringify(sectionIds) !== JSON.stringify(expectedIds)) {
        issues.push(`Section IDs are not sequential: expected [${expectedIds.join(',')}], got [${sectionIds.join(',')}]`);
      }
    }

    // Check hero configuration
    if (!tutorial.hero) {
      issues.push('Missing hero configuration');
    }

    return issues;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigLoader;
} else if (typeof window !== 'undefined') {
  window.ConfigLoader = ConfigLoader;
}