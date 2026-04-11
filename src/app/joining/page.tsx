import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getJoiningItems } from '@/lib/joining';

export { getJoiningItems };

export async function JoiningPageContent({ slug = 'index' }: { slug?: string }) {
  const joiningItems = await getJoiningItems();
  const joiningPage = joiningItems.find((item) => item.slug === slug) ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        <ol role="list" className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/joining" className="text-blue-600 hover:text-blue-800">Joining</Link>
          </li>
          {slug !== 'index' && (
            <>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-slate-900 dark:text-slate-100" aria-current="page">
                {joiningPage?.title ?? slug}
              </li>
            </>
          )}
          {slug === 'index' && (
            <>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-slate-900 dark:text-slate-100" aria-current="page">
                Joining
              </li>
            </>
          )}
        </ol>
      </nav>

      {joiningPage === null ? (
        <p className="text-slate-600 dark:text-slate-300">No joining information available.</p>
      ) : (
        <article className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-slate-50">{joiningPage.title}</h1>
          <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-li:marker:text-slate-500 dark:prose-invert dark:prose-headings:text-slate-50 dark:prose-li:marker:text-slate-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {joiningPage.content.replace(/\u00a0/g, ' ')}
            </ReactMarkdown>
          </div>
        </article>
      )}
    </div>
  );
}

export default async function JoiningPage() {
  return <JoiningPageContent />;
}