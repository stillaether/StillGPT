# 🌀 StillGPT



## 💬 Project Overview

**StillGPT** is a modern and familiar **client-side AI chat PWA** using **Hugging Face Transformers.js** and **WebGPU/WASM**.

StillGPT has **persistent conversational memory** implemented entirely client-side using **vector embeddings** and **localStorage**. This allows the AI to recall information from previous chat sessions to augment its responses, all without needing an account or even internet (once the app is loaded).

### 🔥 Key Features

* **100% Client-Side (100% private):** The entire application, including the LLM (Granite-350M) and the embedding model (MiniLM), runs locally in the user's browser.
* **Conversational Memory:** Uses a tiny vector store (stored in `localStorage`) and **cosine similarity** for fast, client-side Retrieval-Augmented Generation.
* **Real-time Streaming:** Messages are streamed token-by-token using `TextStreamer` for a fast, responsive user experience.
* **Persistence:** Uses `localStorage` to save chat history and the vector store across sessions.
* **Browser-Optimized:** Utilizes **WebGPU** (when available) for accelerated inference, falling back to WebAssembly (WASM).

## 🛠️ Technology Stack

* **Frontend:** HTML, CSS, JavaScript (Pure/Vanilla JS)
* **Core AI Engine:** **Hugging Face Transformers.js**
    * **LLM:** `onnx-community/granite-4.0-350m-ONNX-web`
    * **Embedding Model:** `Xenova/all-MiniLM-L12-v2`
* **Vector Store/Persistence:** Custom implementation using **JavaScript `localStorage`**

## 💻 Using the StillGPT PWA

  To use StillGPT open your browser and navigate to:
  
    https://stillaether.github.io/StillGPT

  Or [CLICK HERE!](https://stillaether.github.io/StillGPT)


## 🧠 How StillGPT's Memory Works

1.  When a user sends a message, the user query is immediately embedded into a vector using the **all-MiniLM-L12-v2** model.
2.  The vector is compared against all previously stored conversation vectors using **cosine similarity**.
3.  The top **3 most similar** historical conversation snippets (memories) are retrieved.
4.  These memories are prepended to the user's prompt before being sent to the **Granite-350M** LLM.
5.  After the AI responds, both the user's query and the AI's response are added to the persistent vector store in `localStorage` for future recall.
