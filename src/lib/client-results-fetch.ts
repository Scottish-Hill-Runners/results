type FetchJsonResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'not-found' }
  | { status: 'error'; error: Error };

async function parseGzipJsonResponse<T>(response: Response): Promise<T> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('This browser does not support gzip decompression streams');
  }

  if (!response.body) {
    throw new Error('Response body is empty');
  }

  const decompressedStream = response.body.pipeThrough(new DecompressionStream('gzip'));
  const text = await new Response(decompressedStream).text();
  return JSON.parse(text) as T;
}

export async function fetchJsonWithApiFallback<T>(
  apiUrl: string,
  gzipFallbackUrl: string,
): Promise<FetchJsonResult<T>> {
  try {
    const apiResponse = await fetch(apiUrl, { cache: 'force-cache' });

    if (apiResponse.ok) {
      return { status: 'ok', data: (await apiResponse.json()) as T };
    }

    if (apiResponse.status === 404) {
      return { status: 'not-found' };
    }

    // Surge returns 410 for /api/* static paths. Fall back to raw .json.gz files.
    if (apiResponse.status !== 410) {
      return { status: 'error', error: new Error(`Request failed with status ${apiResponse.status}`) };
    }

    const gzipResponse = await fetch(gzipFallbackUrl, { cache: 'force-cache' });
    if (gzipResponse.status === 404) {
      return { status: 'not-found' };
    }
    if (!gzipResponse.ok) {
      return { status: 'error', error: new Error(`Fallback request failed with status ${gzipResponse.status}`) };
    }

    return { status: 'ok', data: await parseGzipJsonResponse<T>(gzipResponse) };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error : new Error('Unknown fetch error'),
    };
  }
}

export async function fetchGzipJson<T>(gzipUrl: string): Promise<FetchJsonResult<T>> {
  try {
    const response = await fetch(gzipUrl, { cache: 'force-cache' });

    if (response.status === 404) {
      return { status: 'not-found' };
    }

    if (!response.ok) {
      return { status: 'error', error: new Error(`Request failed with status ${response.status}`) };
    }

    return { status: 'ok', data: await parseGzipJsonResponse<T>(response) };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error : new Error('Unknown fetch error'),
    };
  }
}
