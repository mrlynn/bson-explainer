/**
 * Different chunking strategies for document text
 */

// No chunking - return the entire document as a single chunk
export function noChunking(text) {
  return [text];
}

// Fixed-size chunking with overlap
export function fixedSizeChunking(text, chunkSize = 200, overlap = 50) {
  const chunks = [];
  let i = 0;
  
  while (i < text.length) {
    // Get chunk of specified size or to the end of text
    let chunk = text.substring(i, i + chunkSize);
    
    // Move to next position, considering overlap
    i += (chunkSize - overlap);
    
    // Only add if chunk has content
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

// Delimiter-based chunking (paragraphs, sentences, etc.)
export function delimiterChunking(text, delimiter = '\n\n') {
  // Split by delimiter and filter out empty chunks
  return text.split(delimiter)
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 0);
}

// Recursive chunking - divides text in a hierarchical manner
export function recursiveChunking(text, maxChunkSize = 200) {
  const chunks = [];
  
  function splitRecursively(text) {
    if (text.length <= maxChunkSize) {
      chunks.push(text);
      return;
    }
    
    // Try to split at paragraph first
    const paragraphs = text.split('\n\n');
    if (paragraphs.length > 1) {
      paragraphs.forEach(p => splitRecursively(p));
      return;
    }
    
    // If no paragraphs, try sentences
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length > 1) {
      sentences.forEach(s => splitRecursively(s));
      return;
    }
    
    // If still too large, just do a fixed-size chunk
    if (text.length > maxChunkSize) {
      const midpoint = Math.floor(text.length / 2);
      // Try to split at a space near the midpoint
      let splitPoint = text.lastIndexOf(' ', midpoint);
      if (splitPoint === -1 || splitPoint < maxChunkSize * 0.25) {
        splitPoint = text.indexOf(' ', midpoint);
      }
      if (splitPoint === -1) {
        splitPoint = midpoint;  // Just split at midpoint if no spaces
      }
      
      splitRecursively(text.substring(0, splitPoint));
      splitRecursively(text.substring(splitPoint).trim());
    } else {
      chunks.push(text);
    }
  }
  
  splitRecursively(text);
  return chunks;
}

// Semantic chunking (simplified version without actual semantic analysis)
// Note: Real semantic chunking would use embeddings to determine boundaries
export function semanticChunking(text, maxChunkSize = 200) {
  // This is a simplified approximation of semantic chunking
  // In a real implementation, you would use embeddings to find natural semantic boundaries
  
  // First break by paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  const chunks = [];
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph exceeds our max size and we already have content,
    // save the current chunk and start a new one
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      // Otherwise add to current chunk with a separator if needed
      if (currentChunk.length > 0) {
        currentChunk += '\n\n';
      }
      currentChunk += paragraph;
    }
  }
  
  // Add the final chunk if there's anything left
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}