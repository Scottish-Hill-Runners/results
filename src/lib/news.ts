export interface NewsItem {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

let cachedNewsItems: NewsItem[] | null = null;

export async function getRecentNewsItems(limit: number = 10): Promise<NewsItem[]> {
  try {
    if (cachedNewsItems !== null) {
      return cachedNewsItems.slice(0, limit);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/news.json`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn('Could not fetch prebuilt news.json', response.status);
      return [];
    }

    const newsItems = (await response.json()) as NewsItem[];

    if (!Array.isArray(newsItems)) {
      console.warn('news.json format is invalid');
      return [];
    }

    cachedNewsItems = newsItems;

    return newsItems.slice(0, limit);
  } catch (error) {
    console.warn('Could not load news data:', error);
    return [];
  }
}
