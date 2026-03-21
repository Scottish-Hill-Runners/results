import { NextResponse } from 'next/server';
import { DataRow } from '@/types/datatable';

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

/**
 * GET /api/race-results?race=<race-name>
 * Returns race result data for the specified race with caching enabled
 * @query race - The name of the race results to return (required)
 */
export async function GET(request: Request) {
  try {
    // Extract the race query parameter
    const url = new URL(request.url);
    const raceName = url.searchParams.get('race');

    // Validate race parameter
    if (!raceName) {
      return NextResponse.json(
        { error: 'Missing required query parameter: race' },
        { status: 400 }
      );
    }

    // Sanitize the race name to prevent directory traversal
    const sanitizedRaceName = raceName.replace(/[^a-zA-Z0-9_-]/g, '');
    
    if (!sanitizedRaceName) {
      return NextResponse.json(
        { error: 'Invalid race name format' },
        { status: 400 }
      );
    }

    // Construct the full URL to the data file
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    
    // Check if client accepts gzip encoding
    const acceptEncoding = request.headers.get('Accept-Encoding') || '';
    const supportsGzip = acceptEncoding.includes('gzip');
    
    // Try gzip file first if supported, otherwise fall back to json
    const fileExt = supportsGzip ? '.json.gz' : '.json';
    const dataUrl = new URL(`/results/${sanitizedRaceName}-results${fileExt}`, baseUrl);

    // Fetch the data file
    const response = await fetch(dataUrl.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour (ISR)
    });

    if (!response.ok) {
      // If gzip file not found, try regular json file as fallback
      if (supportsGzip && response.status === 404) {
        const jsonUrl = new URL(`/results/${sanitizedRaceName}.json`, baseUrl);
        const jsonResponse = await fetch(jsonUrl.toString(), {
          next: { revalidate: 3600 },
        });

        if (!jsonResponse.ok) {
          if (jsonResponse.status === 404) {
            return NextResponse.json(
              { error: `Race results not found: ${sanitizedRaceName}` },
              { status: 404 }
            );
          }
          return NextResponse.json(
            { error: 'Failed to fetch data file' },
            { status: 500 }
          );
        }

        const data: DataRow[] = await jsonResponse.json();
        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            'Content-Type': 'application/json',
          },
        });
      }

      if (response.status === 404) {
        return NextResponse.json(
          { error: `Race results not found: ${sanitizedRaceName}` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch data file' },
        { status: 500 }
      );
    }

    // Parse the data
    let data: DataRow[];
    if (supportsGzip && fileExt === '.json.gz') {
      // Decompress gzipped data
      const buffer = await response.arrayBuffer();
      const decompressedText = await decompressGzip(buffer);
      data = JSON.parse(decompressedText) as DataRow[];
    } else {
      // Regular JSON parsing
      data = await response.json();
    }

    // Return with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: HEAD request for cache validation
export async function HEAD() {
  return new NextResponse(null, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
