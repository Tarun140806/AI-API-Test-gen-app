from fastapi import APIRouter, UploadFile, File, HTTPException
from services.rag_service import store_document, clear_collection
import tempfile
import os
import uuid

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/docs")
async def upload_docs(file: UploadFile = File(...)):
    """
    Accepts a PDF or TXT file, chunks it and stores in ChromaDB.
    """
    # Validate file type
    if not file.filename.endswith(('.pdf', '.txt')):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files are supported"
        )

    file_type = "pdf" if file.filename.endswith('.pdf') else "txt"

    # Save file temporarily
    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=f".{file_type}"
    ) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        doc_id = str(uuid.uuid4())
        chunks_stored = store_document(doc_id, tmp_path, file_type)

        return {
            "success": True,
            "doc_id": doc_id,
            "filename": file.filename,
            "chunks_stored": chunks_stored,
            "message": f"Successfully processed {chunks_stored} chunks from {file.filename}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Always delete temp file
        os.unlink(tmp_path)

@router.delete("/docs")
async def clear_docs():
    """
    Clears all uploaded documents from ChromaDB.
    """
    try:
        clear_collection()
        return {"success": True, "message": "All documents cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))