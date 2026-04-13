import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { contentPath, contentRoot } from './content-paths';
import { writeGz, progress } from './write-gz-util';

interface SourceItem {
  path: string;
  tier?: string;
  tags?: string[];
}

interface SourceCollection {
  id: string;
  label: string;
  status?: string;
  usage?: string[];
  doNotUseFor?: string[];
  items: SourceItem[];
}

interface SourceCollectionsFile {
  version?: number;
  collections: SourceCollection[];
}

function encodeRepoPath(repoPath: string): string {
  return repoPath
    .replace(/^\.?\//, '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function resolveRepo(repo: string): string {
  const trimmed = repo.trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');
      if (parts.length >= 2)
        return `${parts[0]}/${parts[1]}`;
    } catch {
      // Fall through to return the original value.
    }
  }

  return trimmed.replace(/\.git$/, '');
}

function getContentSha(root: string): string {
  try {
    return execSync(`git -C "${root}" rev-parse HEAD`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return process.env.CONTENT_REF || 'main';
  }
}

function buildImageCollections() {
  const sourceFile = contentPath('collections.json');
  const outputDir = path.join(process.cwd(), 'public');

  if (!fs.existsSync(outputDir))
    fs.mkdirSync(outputDir, { recursive: true });

  if (!fs.existsSync(sourceFile)) {
    console.warn('collections.json not found at content root, creating empty image-collections.json.gz');
    writeGz(outputDir, 'image-collections.json', JSON.stringify({
      version: 1,
      collections: [],
      source: { missing: true },
    }));
    return;
  }

  progress(`Reading image collections from ${sourceFile} (CONTENT_ROOT=${contentRoot()})...`);

  const repo = resolveRepo(process.env.CONTENT_REPO || 'Scottish-Hill-Runners/contents');
  const sha = getContentSha(contentRoot());
  const baseUrl = `https://raw.githubusercontent.com/${repo}/${sha}`;

  const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf-8')) as SourceCollectionsFile;
  const collections = (sourceData.collections || []).map((collection) => ({
    ...collection,
    items: (collection.items || []).map((item) => ({
      ...item,
      sourcePath: item.path,
      imageUrl: `${baseUrl}/${encodeRepoPath(item.path)}`,
    })),
  }));

  const payload = {
    version: sourceData.version || 1,
    generatedAt: new Date().toISOString(),
    source: {
      repo,
      sha,
      baseUrl,
    },
    collections,
  };

  writeGz(outputDir, 'image-collections.json', JSON.stringify(payload));
  progress(`✓ Built ${collections.length} image collection(s) with external links`);
}

buildImageCollections();