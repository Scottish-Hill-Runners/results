import { NextResponse } from 'next/server';
import { RaceInfo } from '@/types/datatable';

/**
 * Decompresses gzipped data using the DecompressionStream API
 */
async function decompressGzip(buffer: ArrayBuffer): Promise<string> {
  const decompressionStream = new DecompressionStream('gzip');
  const writer = decompressionStream.writable.getWriter();
  writer.write(new Uint8Array(buffer));
  writer.close();

  const reader = decompressionStream.readable.getReader();
  const chunks: Uint8Array[] = [];

  let result = await reader.read();
  while (!result.done) {
    chunks.push(result.value);
    result = await reader.read();
  }

  const decompressedBuffer = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );
  let offset = 0;
  for (const chunk of chunks) {
    decompressedBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(decompressedBuffer);
}

export async function GET(request: Request) {
  try {
    // Construct the URL to the races.json.gz file
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const racesUrl = new URL('/results/races.json.gz', baseUrl);

    // Fetch the compressed races list
    const response = await fetch(racesUrl, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Races list not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch races list' },
        { status: 500 }
      );
    }

    // Decompress and parse the data
    const buffer = await response.arrayBuffer();
    const decompressedText = await decompressGzip(buffer);

    const raceInfos: RaceInfo[] = JSON.parse(decompressedText);

    // Sort the race infos by title or raceId
    raceInfos.sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json(raceInfos, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to fetch and parse races list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
