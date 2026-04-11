import { getJoiningItems, JoiningPageContent } from '@/app/joining/page';

interface JoiningSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await getJoiningItems();
  return items
    .filter((item) => item.slug !== 'index')
    .map((item) => ({ slug: item.slug }));
}

export default async function JoiningSlugPage({ params }: JoiningSlugPageProps) {
  const { slug } = await params;
  return <JoiningPageContent slug={slug} />;
}