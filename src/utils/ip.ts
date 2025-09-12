/**
 * IP Address Utility Functions
 * 
 * Provides secure and reliable IP address extraction from HTTP requests.
 * Handles various proxy configurations and header formats commonly used
 * in production deployments (Vercel, Cloudflare, etc.).
 */

import { NextRequest } from 'next/server';
import { IP_CONFIG } from '@/constants/config';

/**
 * Extract the real client IP address from a Next.js request
 * 
 * This function handles various proxy configurations and header formats:
 * - X-Forwarded-For (most common proxy header)
 * - X-Real-IP (nginx and other reverse proxies)
 * - Connection.remoteAddress (direct connections)
 * 
 * @param request - Next.js request object
 * @returns The client's IP address or fallback value
 * 
 * Security considerations:
 * - Validates IP format to prevent injection attacks
 * - Handles IPv4 and IPv6 addresses
 * - Provides consistent fallback for unknown sources
 */
export function getClientIP(request: NextRequest): string {
  // Try X-Forwarded-For header first (most common in production)
  const forwardedFor = request.headers.get(IP_CONFIG.HEADERS.X_FORWARDED_FOR);
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
    // The first IP is typically the original client
    const clientIP = forwardedFor.split(',')[0].trim();
    if (isValidIP(clientIP)) {
      return clientIP;
    }
  }
  
  // Try X-Real-IP header (nginx and other reverse proxies)
  const realIP = request.headers.get(IP_CONFIG.HEADERS.X_REAL_IP);
  if (realIP && isValidIP(realIP.trim())) {
    return realIP.trim();
  }
  
  // Try other common headers used by CDNs and load balancers
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIP && isValidIP(cfConnectingIP.trim())) {
    return cfConnectingIP.trim();
  }
  
  const trueClientIP = request.headers.get('true-client-ip'); // Akamai
  if (trueClientIP && isValidIP(trueClientIP.trim())) {
    return trueClientIP.trim();
  }
  
  // Fallback to unknown if no valid IP found
  return IP_CONFIG.FALLBACK_IP;
}

/**
 * Validate if a string is a valid IP address (IPv4 or IPv6)
 * 
 * @param ip - IP address string to validate
 * @returns Boolean indicating if the IP is valid
 * 
 * This function prevents injection attacks by ensuring only valid
 * IP addresses are stored in the database.
 */
export function isValidIP(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  
  // Check for IPv4 format (e.g., 192.168.1.1)
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(ip)) {
    return true;
  }
  
  // Check for IPv6 format (simplified check for common patterns)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  if (ipv6Regex.test(ip)) {
    return true;
  }
  
  // Check for IPv6 with IPv4 mapping (e.g., ::ffff:192.0.2.1)
  const ipv6MappedRegex = /^::ffff:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv6MappedRegex.test(ip)) {
    return true;
  }
  
  return false;
}

/**
 * Anonymize IP address for privacy compliance
 * 
 * @param ip - IP address to anonymize
 * @returns Anonymized IP address
 * 
 * This function can be used to comply with privacy regulations
 * while still maintaining vote deduplication functionality.
 */
export function anonymizeIP(ip: string): string {
  if (!isValidIP(ip)) {
    return IP_CONFIG.FALLBACK_IP;
  }
  
  // IPv4: Replace last octet with 0 (e.g., 192.168.1.1 -> 192.168.1.0)
  if (ip.includes('.') && !ip.includes(':')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }
  
  // IPv6: Replace last 64 bits with zeros
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      // Keep first 4 groups, zero out the rest
      return `${parts.slice(0, 4).join(':')}::`;
    }
  }
  
  return ip; // Return original if pattern doesn't match
}