export const normalizeEvent = (rawEvent) => {
  return {
    title: rawEvent.title,
    startsAt: rawEvent.dateText ? new Date(rawEvent.dateText) : null,
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
