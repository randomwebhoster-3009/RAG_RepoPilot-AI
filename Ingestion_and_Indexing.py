import os
import shutil
from git import Repo
from pinecone import Pinecone, ServerlessSpec
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv


#loading environment variables
load_dotenv()

#CONFIGURATION
INDEX_NAME = "repopilot-fastapi"
REPO_URL = "https://github.com/fastapi/fastapi"
LOCAL_PATH = "./fastapi_repo"

#Extensions to index
ALLOWED_EXTENSIONS = {'.py', '.md', '.yaml', '.toml', '.json'}


#shutil.rmtree(LOCAL_PATH)
#1. Clone the Repository
if os.path.exists(LOCAL_PATH):
    print("Already Exists")
else:  
    print(f"Cloning {REPO_URL}...")
    Repo.clone_from(REPO_URL, LOCAL_PATH)

# 2. Initialize Pinecone and Embedding Model
model = SentenceTransformer('all-MiniLM-L6-v2') # 384 dimensions
pc = Pinecone(api_key=os.environ.get('PINECONE_API_KEY'))
index_name = "fastapi-repo-index"


index = pc.Index(index_name)

# 3.Chunking 
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    separators=["\nclass ", "\ndef ", "\n\n", "\n", " "]
)

# 4. Iterate, Chunk, and Upload
print("Processing files...")
vectors_to_upsert = []

for root, dirs, files in os.walk(LOCAL_PATH):
    # Skip .git
    if '.git' in root:
        continue
        
    for file in files:
        if any(file.endswith(ext) for ext in ALLOWED_EXTENSIONS):
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, LOCAL_PATH)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Create chunks
                chunks = text_splitter.split_text(content)
                
                for i, chunk in enumerate(chunks):
                    chunk_id = f"{relative_path}#chunk{i}"
                    embedding = model.encode(chunk).tolist()
                    
                    vectors_to_upsert.append({
                        "id": chunk_id,
                        "values": embedding,
                        "metadata": {
                            "filename": relative_path,
                            "text": chunk,
                            "chunk_index": i,
                            "page_content":chunk
                        }
                    })
                    
                    # Batch upload every 100 vectors to avoid memory/API limits
                    if len(vectors_to_upsert) >= 100:
                        index.upsert(vectors=vectors_to_upsert)
                        vectors_to_upsert = []
                        print(f"Uploaded batch including: {relative_path}")
                        
            except Exception as e:
                print(f"Could not process {file_path}: {e}")

# Upload remaining vectors
if vectors_to_upsert:
    index.upsert(vectors=vectors_to_upsert)

print("Indexing complete!")
