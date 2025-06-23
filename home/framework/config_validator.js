/**
 * ConfigValidator - Tutorial Configuration Validation System
 * Validates tutorial configuration files against schema and provides helpful error messages
 */
class ConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate a complete tutorial configuration
   * @param {Object} config - The tutorial configuration object
   * @returns {Object} - Validation result with errors and warnings
   */
  validate(config) {
    this.errors = [];
    this.warnings = [];

    // Basic structure validation
    this.validateBasicStructure(config);
    
    // Tutorial metadata validation
    if (config.tutorial) {
      this.validateTutorialMetadata(config.tutorial);
      
      // Sections validation
      if (config.tutorial.sections) {
        this.validateSections(config.tutorial.sections);
      }
      
      // Hero section validation
      if (config.tutorial.hero) {
        this.validateHeroSection(config.tutorial.hero);
      }
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Validate basic configuration structure
   */
  validateBasicStructure(config) {
    if (!config || typeof config !== 'object') {
      this.addError('Configuration must be a valid object');
      return;
    }

    if (!config.tutorial) {
      this.addError('Configuration must contain a "tutorial" property');
      return;
    }

    if (typeof config.tutorial !== 'object') {
      this.addError('Tutorial property must be an object');
    }
  }

  /**
   * Validate tutorial metadata
   */
  validateTutorialMetadata(tutorial) {
    // Required fields
    const requiredFields = ['id', 'title', 'sections'];
    requiredFields.forEach(field => {
      if (!tutorial[field]) {
        this.addError(`Tutorial must contain "${field}" property`);
      }
    });

    // Validate ID format
    if (tutorial.id && typeof tutorial.id !== 'string') {
      this.addError('Tutorial ID must be a string');
    }

    // Validate title
    if (tutorial.title && typeof tutorial.title !== 'string') {
      this.addError('Tutorial title must be a string');
    }

    // Validate sections array
    if (tutorial.sections && !Array.isArray(tutorial.sections)) {
      this.addError('Tutorial sections must be an array');
    }
  }

  /**
   * Validate tutorial sections
   */
  validateSections(sections) {
    if (!Array.isArray(sections)) {
      this.addError('Sections must be an array');
      return;
    }

    if (sections.length === 0) {
      this.addError('Tutorial must contain at least one section');
      return;
    }

    // Validate each section
    sections.forEach((section, index) => {
      this.validateSection(section, index + 1);
    });

    // Check for sequential IDs
    const ids = sections.map(s => s.id).filter(id => typeof id === 'number');
    const expectedIds = Array.from({length: ids.length}, (_, i) => i + 1);
    
    if (JSON.stringify(ids.sort()) !== JSON.stringify(expectedIds)) {
      this.addWarning('Section IDs should be sequential numbers starting from 1');
    }
  }

  /**
   * Validate individual section
   */
  validateSection(section, sectionNumber) {
    const prefix = `Section ${sectionNumber}`;

    // Required fields
    if (typeof section.id !== 'number') {
      this.addError(`${prefix}: ID must be a number`);
    }

    if (!section.title || typeof section.title !== 'string') {
      this.addError(`${prefix}: Must have a title string`);
    }

    if (!section.layout || typeof section.layout !== 'string') {
      this.addError(`${prefix}: Must have a layout string`);
    }

    // Validate layout types
    const validLayouts = ['split', 'full', 'triple'];
    if (section.layout && !validLayouts.includes(section.layout)) {
      this.addError(`${prefix}: Layout must be one of: ${validLayouts.join(', ')}`);
    }

    // Validate content structure
    if (section.content) {
      this.validateSectionContent(section.content, prefix);
    }

    // Validate background
    if (section.background) {
      this.validateSectionBackground(section.background, prefix);
    }

    // Validate hotspots
    if (section.hotspots) {
      this.validateSectionHotspots(section.hotspots, prefix);
    }
  }

  /**
   * Validate section content structure
   */
  validateSectionContent(content, prefix) {
    if (typeof content !== 'object') {
      this.addError(`${prefix}: Content must be an object`);
      return;
    }

    // Validate content blocks
    ['left', 'right', 'full'].forEach(position => {
      if (content[position]) {
        this.validateContentBlock(content[position], `${prefix} ${position} content`);
      }
    });
  }

  /**
   * Validate individual content block
   */
  validateContentBlock(block, prefix) {
    if (!block.type) {
      this.addError(`${prefix}: Must specify content type`);
      return;
    }

    const validTypes = ['markdown', 'html', 'widget', 'image'];
    if (!validTypes.includes(block.type)) {
      this.addError(`${prefix}: Type must be one of: ${validTypes.join(', ')}`);
    }

    // Validate source for content types that need it
    if (['markdown', 'html', 'image'].includes(block.type) && !block.source) {
      this.addError(`${prefix}: Must specify source path for ${block.type} content`);
    }

    // Validate widget-specific properties
    if (block.type === 'widget' && !block.widget) {
      this.addError(`${prefix}: Widget content must specify widget configuration`);
    }
  }

  /**
   * Validate section background
   */
  validateSectionBackground(background, prefix) {
    if (!background.image) {
      this.addError(`${prefix}: Background must specify image path`);
    }

    if (!background.aspectRatio) {
      this.addError(`${prefix}: Background must specify aspectRatio`);
    }

    // Validate aspect ratio format
    if (background.aspectRatio && !background.aspectRatio.match(/^\d+:\d+$/)) {
      this.addError(`${prefix}: aspectRatio must be in format "width:height" (e.g., "16:9")`);
    }

    // Validate transition
    if (background.transition) {
      this.validateTransition(background.transition, prefix);
    }
  }

  /**
   * Validate transition configuration
   */
  validateTransition(transition, prefix) {
    const validTypes = ['slideLeft', 'slideRight', 'slideUp', 'slideDown', 'fade'];
    
    if (transition.type && !validTypes.includes(transition.type)) {
      this.addError(`${prefix}: Transition type must be one of: ${validTypes.join(', ')}`);
    }

    if (transition.offset && !Array.isArray(transition.offset)) {
      this.addError(`${prefix}: Transition offset must be an array [x, y]`);
    }

    if (transition.offset && transition.offset.length !== 2) {
      this.addError(`${prefix}: Transition offset must contain exactly 2 values [x, y]`);
    }
  }

  /**
   * Validate section hotspots
   */
  validateSectionHotspots(hotspots, prefix) {
    if (!Array.isArray(hotspots)) {
      this.addError(`${prefix}: Hotspots must be an array`);
      return;
    }

    hotspots.forEach((hotspot, index) => {
      this.validateHotspot(hotspot, `${prefix} hotspot ${index + 1}`);
    });
  }

  /**
   * Validate individual hotspot
   */
  validateHotspot(hotspot, prefix) {
    // Required fields
    if (!hotspot.id) {
      this.addError(`${prefix}: Must have an ID`);
    }

    if (!hotspot.position) {
      this.addError(`${prefix}: Must have position coordinates`);
    }

    // Validate position
    if (hotspot.position) {
      if (typeof hotspot.position.x !== 'number' || typeof hotspot.position.y !== 'number') {
        this.addError(`${prefix}: Position must have numeric x and y coordinates`);
      }

      if (hotspot.position.x < 0 || hotspot.position.x > 1) {
        this.addError(`${prefix}: Position x coordinate must be between 0 and 1`);
      }

      if (hotspot.position.y < 0 || hotspot.position.y > 1) {
        this.addError(`${prefix}: Position y coordinate must be between 0 and 1`);
      }
    }

    // Validate content
    if (hotspot.content) {
      this.validateHotspotContent(hotspot.content, prefix);
    }

    // Validate behavior
    if (hotspot.behavior) {
      this.validateHotspotBehavior(hotspot.behavior, prefix);
    }
  }

  /**
   * Validate hotspot content
   */
  validateHotspotContent(content, prefix) {
    const validTypes = ['image', 'html', 'markdown'];
    
    if (!content.type) {
      this.addError(`${prefix}: Content must specify type`);
    }

    if (content.type && !validTypes.includes(content.type)) {
      this.addError(`${prefix}: Content type must be one of: ${validTypes.join(', ')}`);
    }

    if (!content.source) {
      this.addError(`${prefix}: Content must specify source`);
    }
  }

  /**
   * Validate hotspot behavior
   */
  validateHotspotBehavior(behavior, prefix) {
    const validTriggers = ['hover', 'click', 'both'];
    
    if (behavior.trigger && !validTriggers.includes(behavior.trigger)) {
      this.addError(`${prefix}: Behavior trigger must be one of: ${validTriggers.join(', ')}`);
    }

    if (behavior.sticky !== undefined && typeof behavior.sticky !== 'boolean') {
      this.addError(`${prefix}: Behavior sticky must be a boolean`);
    }

    if (behavior.mobileHidden !== undefined && typeof behavior.mobileHidden !== 'boolean') {
      this.addError(`${prefix}: Behavior mobileHidden must be a boolean`);
    }
  }

  /**
   * Validate hero section configuration
   */
  validateHeroSection(hero) {
    if (hero.shader) {
      this.validateShaderConfig(hero.shader);
    }

    if (hero.title && typeof hero.title !== 'string') {
      this.addError('Hero title must be a string');
    }

    if (hero.subtitle && !Array.isArray(hero.subtitle)) {
      this.addError('Hero subtitle must be an array of strings');
    }
  }

  /**
   * Validate shader configuration
   */
  validateShaderConfig(shader) {
    if (!shader.type) {
      this.addError('Shader must specify type');
    }

    if (!shader.file) {
      this.addError('Shader must specify file path');
    }

    if (shader.parameters) {
      Object.keys(shader.parameters).forEach(paramName => {
        this.validateShaderParameter(shader.parameters[paramName], `Shader parameter "${paramName}"`);
      });
    }
  }

  /**
   * Validate shader parameter
   */
  validateShaderParameter(param, prefix) {
    if (typeof param.default !== 'number') {
      this.addError(`${prefix}: Must have numeric default value`);
    }

    if (param.min !== undefined && typeof param.min !== 'number') {
      this.addError(`${prefix}: Min value must be numeric`);
    }

    if (param.max !== undefined && typeof param.max !== 'number') {
      this.addError(`${prefix}: Max value must be numeric`);
    }

    if (param.min !== undefined && param.max !== undefined && param.min >= param.max) {
      this.addError(`${prefix}: Min value must be less than max value`);
    }
  }

  /**
   * Add validation error
   */
  addError(message) {
    this.errors.push(message);
  }

  /**
   * Add validation warning
   */
  addWarning(message) {
    this.warnings.push(message);
  }

  /**
   * Get formatted validation report
   */
  getReport(validation) {
    let report = '';
    
    if (validation.isValid) {
      report += '✅ Configuration is valid!\n';
    } else {
      report += '❌ Configuration validation failed:\n';
      validation.errors.forEach(error => {
        report += `  • ${error}\n`;
      });
    }

    if (validation.warnings.length > 0) {
      report += '\n⚠️ Warnings:\n';
      validation.warnings.forEach(warning => {
        report += `  • ${warning}\n`;
      });
    }

    return report;
  }

  /**
   * Validate configuration from URL or object
   */
  static async validateConfig(configSource) {
    const validator = new ConfigValidator();
    
    try {
      let config;
      
      if (typeof configSource === 'string') {
        // Load from URL
        const response = await fetch(configSource);
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
        }
        config = await response.json();
      } else {
        // Use provided object
        config = configSource;
      }

      const validation = validator.validate(config);
      
      return {
        config,
        validation,
        report: validator.getReport(validation)
      };
    } catch (error) {
      return {
        config: null,
        validation: {
          isValid: false,
          errors: [`Failed to load or parse configuration: ${error.message}`],
          warnings: []
        },
        report: `❌ Configuration error: ${error.message}`
      };
    }
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigValidator;
} else if (typeof window !== 'undefined') {
  window.ConfigValidator = ConfigValidator;
}