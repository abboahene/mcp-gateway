export interface MarketServer {
  name: string;
  description: string;
  url?: string;
  command?: string;
  image?: string;
  category: string;
}

export async function fetchMarketplaceServers(): Promise<MarketServer[]> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/modelcontextprotocol/servers/refs/heads/main/README.md');
    const text = await response.text();
    
    const servers: MarketServer[] = [];
    const lines = text.split('\n');
    let currentCategory = 'Core';
    
    // Regex for server items: - [Name](url) - Description
    // Handles optional image and bold markers
    const itemRegex = /^- (?:<img[^>]*src="([^"]*)"[^>]*>\s*)?(?:\*\*)?\[(.*?)\]\((.*?)\)(?:\*\*)? - (.*)/;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for headers
      if (trimmedLine.startsWith('## ')) {
        // Remove emoji and extra spaces
        currentCategory = trimmedLine.substring(3).replace(/^[^\w\s]+/, '').trim();
        continue;
      } else if (trimmedLine.startsWith('### ')) {
        currentCategory = trimmedLine.substring(4).replace(/^[^\w\s]+/, '').trim();
        continue;
      }
      
      const match = itemRegex.exec(trimmedLine);
      if (match) {
        servers.push({
          image: match[1],
          name: match[2],
          url: match[3],
          description: match[4],
          category: currentCategory
        });
      }
    }
    
    return servers;
  } catch (error) {
    console.error('Failed to fetch marketplace', error);
    return [];
  }
}
