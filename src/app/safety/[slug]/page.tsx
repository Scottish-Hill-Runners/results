import { getSafetyItems, SafetyPageContent } from '@/app/safety/page';

interface SafetySlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await getSafetyItems();
  return items.map((item) => ({ slug: item.slug }));
}

export default async function SafetySlugPage({ params }: SafetySlugPageProps) {
  const { slug } = await params;
  return <SafetyPageContent activeSlug={slug} />;
}
