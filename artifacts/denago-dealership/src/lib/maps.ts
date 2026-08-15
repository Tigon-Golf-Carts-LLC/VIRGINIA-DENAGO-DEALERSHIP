/**
 * Returns the appropriate maps URL for the user's platform.
 * - iOS devices (iPhone, iPad, iPod): Apple Maps
 * - All other devices: Google Maps
 */
export function getMapsUrl(address: string): string {
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iP(hone|ad|od)/i.test(navigator.userAgent);

  if (isIOS) {
    return `https://maps.apple.com/?daddr=${encodeURIComponent(address)}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}
