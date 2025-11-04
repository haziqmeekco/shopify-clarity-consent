/**
 * Shopify Clarity Cookie Consent Integration
 *
 * This script integrates Shopify's Customer Privacy API with Microsoft Clarity,
 * ensuring that consent preferences are properly communicated to the analytics tool.
 *
 * @version 1.0.0
 * @license MIT
 */

(function() {
  'use strict';

  /**
   * Sends consent preferences to Microsoft Clarity
   * @returns {boolean} True if consent was successfully sent, false otherwise
   */
  function sendConsentToClarity() {
    // Check if Shopify Customer Privacy API is available
    if (!window.Shopify || !window.Shopify.customerPrivacy) {
      return false;
    }

    // Get current visitor consent from Shopify
    var consent = window.Shopify.customerPrivacy.currentVisitorConsent();

    // Default to granted (will be overridden if consent exists)
    var clarityConsent = {
      ad_storage: 'granted',
      analytics_storage: 'granted'
    };

    // Apply actual consent preferences if available
    if (consent) {
      clarityConsent.ad_storage = consent.marketing === 'yes' ? 'granted' : 'denied';
      clarityConsent.analytics_storage = consent.analytics === 'yes' ? 'granted' : 'denied';
    }

    // Send consent to Clarity if available
    if (window.clarity) {
      window.clarity('consentv2', clarityConsent);
    }

    return true;
  }

  /**
   * Initialize consent tracking with retry mechanism
   * Polls for Shopify Customer Privacy API availability for up to 5 seconds
   */
  function initializeConsentTracking() {
    // Try immediately
    if (sendConsentToClarity()) {
      return;
    }

    // Poll every 100ms for up to 5 seconds if not immediately available
    var attempts = 0;
    var maxAttempts = 50;
    var pollInterval = 100; // milliseconds

    var checkInterval = setInterval(function() {
      attempts++;

      if (sendConsentToClarity()) {
        clearInterval(checkInterval);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.warn('Clarity Consent: Shopify Customer Privacy API not found after ' + (maxAttempts * pollInterval / 1000) + ' seconds');
      }
    }, pollInterval);
  }

  // Start initialization when script loads
  initializeConsentTracking();
})();
