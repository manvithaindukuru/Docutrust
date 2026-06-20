import io
import re
from typing import List, Dict
import PyPDF2
import docx


class DocumentProcessor:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def process_file(self, content: bytes, filename: str, file_ext: str) -> List[Dict]:
        if file_ext == ".pdf":
            text = self._extract_pdf(content)
        elif file_ext == ".docx":
            text = self._extract_docx(content)
        elif file_ext in [".txt", ".md"]:
            text = content.decode("utf-8", errors="ignore")
        else:
            raise ValueError(f"Unsupported file extension: {file_ext}")

        text = self._clean_text(text)
        chunks = self._chunk_text(text, filename)
        return chunks

    def _extract_pdf(self, content: bytes) -> str:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text_parts = []
        for page_num, page in enumerate(pdf_reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(f"[Page {page_num + 1}]\n{page_text}")
        return "\n\n".join(text_parts)

    def _extract_docx(self, content: bytes) -> str:
        doc = docx.Document(io.BytesIO(content))
        paragraphs = []
        for para in doc.paragraphs:
            if para.text.strip():
                paragraphs.append(para.text.strip())
        return "\n\n".join(paragraphs)

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        text = re.sub(r'\t+', ' ', text)
        text = text.strip()
        return text

    def _chunk_text(self, text: str, filename: str) -> List[Dict]:
        chunks = []
        sentences = self._split_into_sentences(text)
        current_chunk = []
        current_length = 0
        chunk_index = 0

        for sentence in sentences:
            sentence_length = len(sentence)

            if current_length + sentence_length > self.chunk_size and current_chunk:
                chunk_text = " ".join(current_chunk)
                page_match = re.search(r'\[Page (\d+)\]', chunk_text)
                page_num = int(page_match.group(1)) if page_match else None
                chunk_text_clean = re.sub(r'\[Page \d+\]\s*', '', chunk_text).strip()

                if chunk_text_clean:
                    chunks.append({
                        "text": chunk_text_clean,
                        "filename": filename,
                        "chunk_index": chunk_index,
                        "page": page_num,
                        "char_count": len(chunk_text_clean)
                    })
                    chunk_index += 1

                overlap_sentences = current_chunk[-3:] if len(current_chunk) >= 3 else current_chunk
                current_chunk = overlap_sentences.copy()
                current_length = sum(len(s) for s in current_chunk)

            current_chunk.append(sentence)
            current_length += sentence_length

        if current_chunk:
            chunk_text = " ".join(current_chunk)
            page_match = re.search(r'\[Page (\d+)\]', chunk_text)
            page_num = int(page_match.group(1)) if page_match else None
            chunk_text_clean = re.sub(r'\[Page \d+\]\s*', '', chunk_text).strip()

            if chunk_text_clean:
                chunks.append({
                    "text": chunk_text_clean,
                    "filename": filename,
                    "chunk_index": chunk_index,
                    "page": page_num,
                    "char_count": len(chunk_text_clean)
                })

        return chunks

    def _split_into_sentences(self, text: str) -> List[str]:
        sentence_pattern = re.compile(r'(?<=[.!?])\s+(?=[A-Z])|(?<=\n)')
        sentences = sentence_pattern.split(text)
        cleaned = []
        for s in sentences:
            s = s.strip()
            if s and len(s) > 10:
                cleaned.append(s)
        return cleaned
