import openai
import pandas as pd
import tiktoken
import openai
import os

openai.api_key = "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"

 #embedding model parameters
 embedding_model = "text-embedding-ada-002"
 embedding_encoding = "cl100k_base"  # this the encoding for text-embedding-ada-002
 max_tokens = 8000  # the maximum for text-embedding-ada-002 is 8191

# Generate embeddings for a single sentence
# response = openai.Embedding.create(
#     input='Hello, world!',
#     model="text-embedding-ada-002"    
# )
# embeddings = response['data'][0]['embedding']
# print(embeddings)
