import { cachedRequest } from "../utils/cache";

const FREEAPI_BASE = "https://prod-main-api-704464-00tre1p1erm.compute.instacloud-edge.com/api/v1";

/**
 * FreeAPI (https://freeapi.app, MIT) random quote. Cached for two hours so the
 * footer does not hit the network on every render or navigation.
 */
export const fetchDailyQuote = () =>
  cachedRequest("freeapi:quote:random", 2 * 60 * 60 * 1000, async () => {
    const response = await fetch(`${FREEAPI_BASE}/public/quotes/quote/random`);
    if (!response.ok) throw new Error("Could not fetch a quote");
    const payload = await response.json();
    const quote = payload?.data;
    if (!quote?.content) throw new Error("Quote payload was empty");
    return {
      content: String(quote.content).trim(),
      author: quote.author ? String(quote.author).trim() : "Unknown",
    };
  });
