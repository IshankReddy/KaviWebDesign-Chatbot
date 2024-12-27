import time
import os
import glob
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
DB_NAME = "vector_db"

class DocumentHandler(FileSystemEventHandler):
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
        self.text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        self.vectorstore = None
        self.initialize_vectorstore()

    def initialize_vectorstore(self):
        """Initialize or load the vector store"""
        try:
            print("Initializing vector store...")
            documents = self.load_all_documents()
            chunks = self.text_splitter.split_documents(documents)
            
            # Create new vectorstore
            self.vectorstore = Chroma.from_documents(
                documents=chunks,
                embedding=self.embeddings,
                persist_directory=DB_NAME
            )
            print("Vector store initialized successfully")
        except Exception as e:
            print(f"Error initializing vector store: {str(e)}")

    def load_all_documents(self):
        """Load all documents from the DB directory"""
        documents = []
        folders = glob.glob("../DB/*")
        
        for folder in folders:
            doc_type = os.path.basename(folder)
            try:
                loader = DirectoryLoader(
                    folder,
                    glob="**/*.md",
                    loader_cls=TextLoader,
                    loader_kwargs={'encoding': 'utf-8'}
                )
                folder_docs = loader.load()
                for doc in folder_docs:
                    doc.metadata["doc_type"] = doc_type
                documents.extend(folder_docs)
            except Exception as e:
                print(f"Error loading documents from {folder}: {str(e)}")
        
        return documents

    def update_vectorstore(self, file_path):
        """Update the vector store with a new or modified document"""
        try:
            print(f"Processing file: {file_path}")
            
            # Load the single document
            loader = TextLoader(file_path, encoding='utf-8')
            documents = loader.load()
            
            # Add metadata
            doc_type = os.path.basename(os.path.dirname(file_path))
            for doc in documents:
                doc.metadata["doc_type"] = doc_type
            
            # Split into chunks
            chunks = self.text_splitter.split_documents(documents)
            
            # Add to vector store
            self.vectorstore.add_documents(chunks)
            self.vectorstore.persist()
            
            print(f"Successfully processed {file_path}")
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")

    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            print(f"File modified: {event.src_path}")
            self.update_vectorstore(event.src_path)

    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            print(f"File created: {event.src_path}")
            self.update_vectorstore(event.src_path)

def start_monitoring():
    """Start monitoring the DB directory for changes"""
    event_handler = DocumentHandler()
    observer = Observer()
    
    # Monitor the DB directory
    db_path = os.path.abspath("../DB")
    observer.schedule(event_handler, db_path, recursive=True)
    observer.start()
    
    print(f"Started monitoring {db_path}")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\nStopped monitoring")
    
    observer.join()

if __name__ == "__main__":
    start_monitoring() 