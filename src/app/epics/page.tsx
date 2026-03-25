import InfoAccordion from '@/app/info/info-accordion';
import { getEpicItems } from '@/lib/epics';

export default async function EpicsPage() {
  const epicItems = await getEpicItems();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-slate-50">Epics</h1>
      {epicItems.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-300">No epics available.</p>
      ) : (
        <InfoAccordion items={epicItems} />
      )}
    </div>
  );
}
