import NewsList from '@/components/NewsList';
import { getRecentNewsItems } from '@/lib/news';

export default async function Home() {
  const newsItems = await getRecentNewsItems(10);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-start justify-start py-12 px-4 sm:px-6 bg-white dark:bg-black">
        <div className="flex flex-col items-start gap-6 w-full">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Scottish Hill Running
          </h1>

          <section className="w-full mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 mb-6">
              Recent News
            </h2>
            <NewsList items={newsItems} />
          </section>
        </div>
      </main>
    </div>
  );
}
