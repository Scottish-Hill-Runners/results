import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface InfoItem {
  slug: string;
  title: string;
  content: string;
}

function buildInfo() {
  const infoDir = path.join(process.cwd(), 'info');
  const outputFile = path.join(process.cwd(), 'public', 'info.json');

  try {
    // Check if info directory exists
    if (!fs.existsSync(infoDir)) {
      console.warn('Info directory not found, creating empty info.json');
      fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
      return;
    }

    console.log(`Reading info from ${infoDir}...`);

    // Get all markdown files
    const files = fs.readdirSync(infoDir).filter((file) => file.endsWith('.md'));
    console.log(`Found ${files.length} info files`);

    // Parse files
    const infoItems: InfoItem[] = files.map((file) => {
      const filePath = path.join(infoDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      return {
        slug: file.replace('.md', ''),
        title: (data.title as string) || 'Untitled',
        content: content.replace(/\u00a0/g, ' '),
      };
    });

    // Write to JSON file
    fs.writeFileSync(outputFile, JSON.stringify(infoItems, null, 2));
    console.log(`✓ Built ${infoItems.length} info items to ${outputFile}`);
  } catch (error) {
    console.error('Error building info:', error);
    process.exit(1);
  }
}

buildInfo();