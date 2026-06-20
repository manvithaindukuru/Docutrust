import os
from typing import List, Dict
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


class LLMService:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set.")
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile"
        self.max_context_length = 6000

    def generate_answer(self, query: str, context_chunks: List[Dict]) -> str:
        context = self._build_context(context_chunks)
        system_prompt = self._build_system_prompt()
        user_prompt = self._build_user_prompt(query, context)

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=1024,
            top_p=0.9,
        )

        return response.choices[0].message.content.strip()

    def _build_context(self, chunks: List[Dict]) -> str:
        context_parts = []
        total_length = 0

        for i, chunk in enumerate(chunks):
            source_info = f"[Source: {chunk['filename']}"
            if chunk.get("page"):
                source_info += f", Page {chunk['page']}"
            source_info += "]"

            chunk_text = f"{source_info}\n{chunk['text']}"
            chunk_length = len(chunk_text)

            if total_length + chunk_length > self.max_context_length:
                break

            context_parts.append(f"Context {i + 1}:\n{chunk_text}")
            total_length += chunk_length

        return "\n\n---\n\n".join(context_parts)

    def _build_system_prompt(self) -> str:
        return "You are an intelligent knowledge assistant with access to a company's document repository. Answer accurately based strictly on the provided context. If the answer is not in the context, say so clearly. Be concise, cite sources, and never fabricate information."

    def _build_user_prompt(self, query: str, context: str) -> str:
        return f"Based on the following context from company documents, please answer the question below.\n\nCONTEXT DOCUMENTS:\n{context}\n\nQUESTION:\n{query}\n\nProvide a clear, accurate answer based solely on the context provided above."