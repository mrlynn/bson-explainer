import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import openai from '@/lib/openai';

export async function POST(request) {
  try {
    const data = await request.json();
    const { query } = data;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' }, 
        { status: 400 }
      );
    }
    
    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      dimensions: 1536
    });
    
    const queryVector = embeddingResponse.data[0].embedding;
    
    // Connect to MongoDB and perform vector search
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // First, let's check what indexes are available
    const indexes = await db.collection('embeddings').indexes();
    console.log('Available indexes:', indexes);
    
    // Perform vector search
    const searchResults = await db.collection('embeddings').aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // This should match the name in MongoDB Atlas
          path: "embeddings", // Changed from "embedding" to "embeddings" to match the index configuration
          queryVector: queryVector,
          numCandidates: 100,
          limit: 10
        }
      },
      {
        $project: {
          _id: 1,
          chunkId: 1,
          text: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]).toArray();
    
    return NextResponse.json({ results: searchResults });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Failed to perform search', details: error.message }, 
      { status: 500 }
    );
  }
}