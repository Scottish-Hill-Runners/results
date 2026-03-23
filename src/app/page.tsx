import Link from 'next/link';
import NewsList from '@/components/NewsList';
import { getRecentNewsItems } from '@/lib/news';

export default async function Home() {
  const newsItems = await getRecentNewsItems(10);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-slate-950">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-start justify-start bg-white px-4 py-12 dark:bg-slate-950 sm:px-6">
        <div className="flex flex-col items-start gap-6 w-full">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-slate-50">
            Scottish Hill Running
          </h1>

          <section className="w-full mt-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-50">
              Recent News
            </h2>
            <NewsList items={newsItems} />
            <div className="mt-6 text-right">
              <Link href="/news" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                Old news →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
