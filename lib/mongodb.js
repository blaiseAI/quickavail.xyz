import { MongoClient } from 'mongodb'

// Connection string from environment variables
const uri = process.env.MONGODB_URI

const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
}

let client
let clientPromise

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

// Helper function to get database
export async function getDatabase() {
  const client = await clientPromise
  const dbName = process.env.MONGODB_DB || 'quickavail'
  return client.db(dbName)
}

// Helper function to get specific collections
export async function getCollection(collectionName) {
  const db = await getDatabase()
  return db.collection(collectionName)
} 