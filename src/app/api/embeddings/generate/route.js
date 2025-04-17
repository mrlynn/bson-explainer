import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import openai from '@/lib/openai';
import * as UMAP from 'umap-js';

export async function POST(request) {
  try {
    const data = await request.json();
    const { chunks } = data;
    
    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json(
        { error: 'Valid chunks array is required' }, 
        { status: 400 }
      );
    }
    
    // Generate embeddings for all chunks
    const texts = chunks.map(chunk => chunk.text);
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
      dimensions: 1536
    });
    
    // Process the embeddings and prepare for storage and visualization
    const rawEmbeddings = embeddingResponse.data.map((item, index) => ({
      chunkId: chunks[index].id,
      embedding: item.embedding
    }));
    
    // Use UMAP to reduce dimensionality for visualization
    const umap = new UMAP.UMAP({
      nComponents: 2,
      nNeighbors: Math.min(5, chunks.length),
      minDist: 0.1
    });
    
    // Extract just the embedding vectors for UMAP
    const vectors = rawEmbeddings.map(item => item.embedding);
    
    // Only run UMAP if we have enough data points
    let projectedEmbeddings = [];
    if (vectors.length >= 2) {
      const projection = umap.fit(vectors);
      
      // Combine the original embedding data with the 2D projection
      projectedEmbeddings = rawEmbeddings.map((item, i) => ({
        ...item,
        x: projection[i][0],
        y: projection[i][1]
      }));
    } else {
      // For single point, just place it at the origin
      projectedEmbeddings = rawEmbeddings.map(item => ({
        ...item,
        x: 0,
        y: 0
      }));
    }
    
    // Store embeddings in MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Clear existing embeddings for these chunks
    await db.collection('embeddings').deleteMany({
      chunkId: { $in: chunks.map(chunk => chunk.id) }
    });
    
    // Insert new embeddings
    const embeddingsToInsert = projectedEmbeddings.map((embedding, index) => ({
      chunkId: embedding.chunkId,
      text: chunks[index].text,
      embeddings: embedding.embedding,
      umap: embedding.x + ',' + embedding.y
    }));
    
    if (embeddingsToInsert.length > 0) {
      await db.collection('embeddings').insertMany(embeddingsToInsert);
    }
    
    // Return just the visualization data (not the full embeddings)
    const visualizationData = projectedEmbeddings.map((item, index) => ({
      id: item.chunkId,
      x: item.x,
      y: item.y,
      text: chunks[index].text
    }));
    
    return NextResponse.json({ embeddings: visualizationData });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return NextResponse.json(
      { error: 'Failed to generate embeddings' }, 
      { status: 500 }
    );
  }
}