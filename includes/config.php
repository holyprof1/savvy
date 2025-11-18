<?php
/**
 * Savvy Media Africa - Site Configuration
 * Developer: Tobi (Holyprof)
 * Portfolio: https://tobi.holyprofweb.com
 */

class SiteConfig {
    // Site Information
    const SITE_NAME = 'Savvy Media Africa';
    const SITE_TAGLINE = 'Where Creativity Lives, Results Matter';
    const LOGO_URL = 'https://demoo.savvymediaafrica.com/wp-content/uploads/2025/10/Savvy-Media-Africa-Logo-1.png';
    
    // Brand Colors
    const DEEP_NAVY = '#001d3d';
    const NAVY = '#002855';
    const BRIGHT_CYAN = '#00D4FF';
    const CYAN = '#00A8E8';
    const BRIGHT_GREEN = '#00FF88';
    const GREEN = '#00E676';
    const ORANGE = '#FF6B35';
    const YELLOW = '#FFB800';
    const WHITE = '#FFFFFF';
    
    // Contact Information
    const EMAIL = 'hello@savvymediaafrica.com';
    const PHONE = '+234 813 473 7798';
    const ADDRESS = 'Impact Hub, Ikoyi, Lagos';
    
    // Social Media
    const FACEBOOK = 'https://facebook.com/savvymediaafrica';
    const TWITTER = 'https://twitter.com/savvymediaafrica';
    const INSTAGRAM = 'https://instagram.com/savvymediaafrica';
    const LINKEDIN = 'https://linkedin.com/company/savvymediaafrica';
    
    // Base URL
    public static function getBaseUrl() {
        // Change this when deploying to production
        return 'http://localhost/savvy/savvy-media-theme';
    }
    
    public static function asset($path) {
        return self::getBaseUrl() . '/assets/' . $path;
    }
}
?>