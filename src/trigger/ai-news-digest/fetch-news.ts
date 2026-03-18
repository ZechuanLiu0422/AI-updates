import { task } from "@trigger.dev/sdk/v3";
import Parser from "rss-parser";

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
  category?: string;
}

export const fetchNews = task({
  id: "fetch-ai-news",
  run: async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const allNews: NewsItem[] = [];

    // Fetch from HackerNews
    const hnNews = await fetchHackerNews(sevenDaysAgo);
    allNews.push(...hnNews);

    // Fetch from RSS feeds
    const rssNews = await fetchRSSFeeds(sevenDaysAgo);
    allNews.push(...rssNews);

    // Categorize and deduplicate
    const categorized = categorizeNews(allNews);
    const deduplicated = deduplicateNews(categorized);

    return deduplicated;
  },
});

async function fetchHackerNews(since: Date): Promise<NewsItem[]> {
  const keywords = ["AI", "LLM", "agent", "GPT", "Claude", "Gemini", "machine learning", "automation"];
  const news: NewsItem[] = [];

  try {
    const response = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
    const storyIds = await response.json() as number[];

    // Fetch first 100 stories
    for (const id of storyIds.slice(0, 100)) {
      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      const story = await storyResponse.json() as any;

      if (!story || !story.title || !story.url) continue;

      const publishedAt = new Date(story.time * 1000);
      if (publishedAt < since) continue;

      const title = story.title.toLowerCase();
      const hasKeyword = keywords.some(kw => title.includes(kw.toLowerCase()));

      if (hasKeyword) {
        news.push({
          title: story.title,
          url: story.url,
          source: "HackerNews",
          publishedAt: publishedAt.toISOString(),
        });
      }
    }
  } catch (error) {
    console.error("Error fetching HackerNews:", error);
  }

  return news;
}

async function fetchRSSFeeds(since: Date): Promise<NewsItem[]> {
  const parser = new Parser();
  const feeds = [
    { url: "https://www.theverge.com/rss/index.xml", source: "The Verge" },
    { url: "https://techcrunch.com/feed/", source: "TechCrunch" },
  ];

  const news: NewsItem[] = [];
  const keywords = ["ai", "llm", "agent", "gpt", "claude", "gemini", "machine learning", "automation"];

  for (const { url, source } of feeds) {
    try {
      const feed = await parser.parseURL(url);

      for (const item of feed.items) {
        if (!item.title || !item.link) continue;

        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
        if (publishedAt < since) continue;

        const title = item.title.toLowerCase();
        const content = (item.contentSnippet || "").toLowerCase();
        const hasKeyword = keywords.some(kw => title.includes(kw) || content.includes(kw));

        if (hasKeyword) {
          news.push({
            title: item.title,
            url: item.link,
            source,
            publishedAt: publishedAt.toISOString(),
            summary: item.contentSnippet?.substring(0, 200),
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching RSS from ${source}:`, error);
    }
  }

  return news;
}

function categorizeNews(news: NewsItem[]): NewsItem[] {
  const agentKeywords = ["agent", "automation", "workflow", "rpa"];
  const llmKeywords = ["llm", "gpt", "claude", "gemini", "model", "language model"];
  const toolKeywords = ["tool", "app", "product", "launch", "release"];

  return news.map(item => {
    const text = (item.title + " " + (item.summary || "")).toLowerCase();

    if (agentKeywords.some(kw => text.includes(kw))) {
      return { ...item, category: "AI Agent & 自动化" };
    } else if (llmKeywords.some(kw => text.includes(kw))) {
      return { ...item, category: "大语言模型(LLM)" };
    } else if (toolKeywords.some(kw => text.includes(kw))) {
      return { ...item, category: "AI工具与应用" };
    }

    return { ...item, category: "AI工具与应用" };
  });
}

function deduplicateNews(news: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return news.filter(item => {
    const key = item.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
