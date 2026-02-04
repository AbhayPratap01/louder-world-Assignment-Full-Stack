import axios from "axios";
import * as cheerio from "cheerio";

const extractJsonLd = ($) => {
  const scripts = $('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const json = JSON.parse($(script).contents().text());
      if (Array.isArray(json)) {
        const event = json.find((item) => item["@type"] === "Event");
        if (event) return event;
      }
      if (json["@type"] === "Event") {
        return json;
      }
    } catch (error) {
      continue;
    }
  }
  return null;
};

const scrapeDetail = async (url, detail) => {
  if (!detail) return {};
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const jsonLd = extractJsonLd($);

  const description =
    jsonLd?.description ||
    $(detail.descriptionSelector).map((_i, el) => $(el).text().trim()).get().join(" ");
  const venueName =
    jsonLd?.location?.name || $(detail.venueSelector).first().text().trim();
  const venueAddress =
    jsonLd?.location?.address?.streetAddress ||
    $(detail.addressSelector).first().text().trim();
  const categories =
    jsonLd?.keywords?.split(",").map((item) => item.trim()) ||
    $(detail.categorySelector)
      .map((_i, el) => $(el).text().trim())
      .get();
  const imageUrl =
    jsonLd?.image?.[0] || jsonLd?.image || $(detail.imageSelector).attr("src") || "";
  const dateText =
    jsonLd?.startDate || $(detail.dateSelector).first().text().trim();

  return {
    description,
    venueName,
    venueAddress,
    categories: categories.filter(Boolean),
    imageUrl,
    dateText,
  };
};

export const scrapeSource = async (source) => {
  const response = await axios.get(source.url);
  const $ = cheerio.load(response.data);
  const events = [];

  $(source.listSelector).each((_index, element) => {
    const root = $(element);
    const title = root.find(source.titleSelector).first().text().trim();
    const link = root.find(source.linkSelector).attr("href");
    const imageUrl = root.find(source.imageSelector).attr("src") || "";
    const dateText = root.find(source.dateSelector).first().text().trim();

    if (!title || !link) {
      return;
    }

    events.push({
      title,
      sourceName: source.name,
      sourceUrl: link.startsWith("http") ? link : new URL(link, source.url).toString(),
      imageUrl,
      city: source.city,
      dateText,
    });
  });

  const enriched = [];
  for (const event of events) {
    try {
      const detail = await scrapeDetail(event.sourceUrl, source.detail);
      enriched.push({ ...event, ...detail });
    } catch (error) {
      enriched.push(event);
    }
  }

  return enriched;
};
