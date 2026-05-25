import os
import chromadb
from chromadb.config import Settings
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import tempfile

# Initialize ChromaDB client — stores embeddings locally
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Initialize sentence transformer for embeddings
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Get or create collection
collection = chroma_client.get_or_create_collection(
    name="api_docs",
    metadata={"hnsw:space": "cosine"}
)

def load_and_chunk_document(file_path: str, file_type: str) -> list:
    """
    Loads a document and splits it into chunks.
    Supports PDF and TXT files.
    """
    if file_type == "pdf":
        loader = PyPDFLoader(file_path)
    else:
        loader = TextLoader(file_path)
    
    documents = loader.load()
    
    # Split into chunks of 500 characters with 50 overlap
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    
    chunks = splitter.split_documents(documents)
    return chunks

def store_document(doc_id: str, file_path: str, file_type: str) -> int:
    """
    Chunks a document and stores embeddings in ChromaDB.
    Returns number of chunks stored.
    """
    chunks = load_and_chunk_document(file_path, file_type)
    
    texts = [chunk.page_content for chunk in chunks]
    embeddings = embedding_model.encode(texts).tolist()
    ids = [f"{doc_id}-chunk-{i}" for i in range(len(texts))]
    metadatas = [{"doc_id": doc_id, "chunk_index": i} for i in range(len(texts))]
    
    collection.add(
        documents=texts,
        embeddings=embeddings,
        ids=ids,
        metadatas=metadatas
    )
    
    return len(texts)

def retrieve_relevant_context(query: str, n_results: int = 5) -> str:
    """
    Takes a query (API URL + description) and retrieves
    the most relevant chunks from ChromaDB.
    Returns them as a single context string.
    """
    if collection.count() == 0:
        return ""
    
    query_embedding = embedding_model.encode([query]).tolist()
    
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=min(n_results, collection.count())
    )
    
    if not results["documents"] or not results["documents"][0]:
        return ""
    
    # Join all retrieved chunks into one context string
    context = "\n\n".join(results["documents"][0])
    return context

def clear_collection():
    """
    Clears all documents from the collection.
    Useful for testing.
    """
    global collection
    chroma_client.delete_collection("api_docs")
    collection = chroma_client.get_or_create_collection(
        name="api_docs",
        metadata={"hnsw:space": "cosine"}
    )