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
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-slate-50">
              Browse
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/races" className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-slate-50">Races</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Explore hill races</p>
              </Link>
              <Link href="/championships" className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-slate-50">Championships</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Championship series</p>
              </Link>
              <Link href="/calendar" className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-slate-50">Calendar</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Upcoming race calendar</p>
              </Link>
              <Link href="/info" className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-slate-50">Info</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Membership and guidance</p>
              </Link>
              <Link href="/epics" className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-slate-50">Epics</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Long distance challenges</p>
              </Link>
              <Link href="/safety" className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-slate-50">Safety</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Safety rules and guidelines</p>
              </Link>
            </div>
          </section>

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
