import InfoAccordion from '@/app/info/info-accordion';
import { getInfoItems } from '@/lib/info';

export default async function InfoPage() {
  const infoItems = await getInfoItems();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Information</h1>
      {infoItems.length === 0 ? (
        <p className="text-slate-600">No information available.</p>
      ) : (
        <InfoAccordion items={infoItems} />
      )}
    </div>
  );
}