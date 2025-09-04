// Configuration for different environments
class Config {
    constructor() {
        this.isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        this.isDevelopment = !this.isProduction;
        
        // API base URL - Netlify Functions will handle /api routes automatically
        this.apiBaseUrl = this.isProduction ? '' : '';
        
        console.log('Environment:', this.isProduction ? 'Production' : 'Development');
        console.log('API Base URL:', this.apiBaseUrl || 'Relative paths');
    }

    getApiUrl(endpoint) {
        return `${this.apiBaseUrl}${endpoint}`;
    }

    // Configuration for different features
    get features() {
        return {
            enableLogging: this.isDevelopment,
            enableDebugMode: this.isDevelopment,
            sessionTimeout: this.isProduction ? 30 * 60 * 1000 : 60 * 60 * 1000, // 30 min prod, 60 min dev
            autoSaveInterval: 5000 // 5 seconds
        };
    }
}

// Global configuration instance
window.config = new Config();
