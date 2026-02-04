export const normalizeEvent = (rawEvent) => {
  const startsAt = rawEvent.dateText ? new Date(rawEvent.dateText) : null;
  const safeStartsAt = Number.isNaN(startsAt?.getTime()) ? null : startsAt;
  return {
    title: rawEvent.title,
    startsAt: safeStartsAt,
    dateText: rawEvent.dateText || "",
    venueName: rawEvent.venueName || "",
    venueAddress: rawEvent.venueAddress || "",
    city: rawEvent.city || "Sydney",
    description: rawEvent.description || "",
    categories: rawEvent.categories || [],
    imageUrl: rawEvent.imageUrl || "",
    sourceName: rawEvent.sourceName,
    sourceUrl: rawEvent.sourceUrl,
  };
};
