import axios from "axios";
import * as cheerio from "cheerio";

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

  return events;
};
