export function encodeHotelSlug(hotel: string): string {
  return encodeURIComponent(hotel.trim());
}

export function decodeHotelSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function hotelLearningPath(hotel: string): string {
  return `/admin/platform/hotel/${encodeHotelSlug(hotel)}`;
}
