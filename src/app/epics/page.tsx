import Link from 'next/link';
import { getEpicItems } from '@/lib/epics';

export { getEpicItems };

export default async function EpicsPage() {
  const epicItems = await getEpicItems();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        <ol role="list" className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-slate-900 dark:text-slate-100" aria-current="page">
            Epics
          </li>
        </ol>
      </nav>
      <h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-slate-50">Epics</h1>
      {epicItems.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-300">No epics available.</p>
      ) : (
        <ul className="space-y-2">
          {epicItems.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/epics/${item.slug}`}
                className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
