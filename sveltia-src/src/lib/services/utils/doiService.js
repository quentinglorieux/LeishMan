export async function fetchPublicationFromDOI(doi) {
    try {
      const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
      if (!response.ok) {
        return { error: "Invalid DOI or no data found." };
      }
  
      const data = await response.json();
      return { data: data.message }; // Ensure it's a plain object
    } catch (error) {
      return { error: "Failed to fetch DOI data." };
    }
  }