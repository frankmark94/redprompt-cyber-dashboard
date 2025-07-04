import sys
import asyncio
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
import uuid

from models import PromptData, TestRunRequest, TestRunResponse, TestResult
from utils.file_parser import parse_prompts_file
from utils.test_runner import run_prompt_tests

app = FastAPI(
    title="RedPrompt Backend",
    description="AI Security Testing Suite Backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081"
    ],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure results directory exists
os.makedirs("results", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

# In-memory storage for current prompts
current_prompts: List[PromptData] = []


@app.get("/")
async def root():
    return {"message": "RedPrompt Backend API", "version": "1.0.0"}


@app.post("/upload-prompts")
async def upload_prompts(file: UploadFile = File(...)):
    """Upload and parse a JSON or CSV file containing adversarial prompts."""
    try:
        # Validate file type
        if not file.filename.endswith(('.json', '.csv')):
            raise HTTPException(
                status_code=400, 
                detail="File must be JSON or CSV format"
            )
        
        # Save uploaded file
        file_path = f"uploads/{uuid.uuid4()}_{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Parse prompts from file
        global current_prompts
        current_prompts = await parse_prompts_file(file_path)
        
        # Clean up uploaded file
        os.remove(file_path)
        
        return {
            "message": f"Successfully uploaded {len(current_prompts)} prompts",
            "prompts_count": len(current_prompts),
            "prompts": current_prompts
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.post("/run-tests", response_model=TestRunResponse)
async def run_tests(request: TestRunRequest, background_tasks: BackgroundTasks):
    """Execute stored prompts against the target URL using Playwright."""
    try:
        if not current_prompts:
            raise HTTPException(
                status_code=400, 
                detail="No prompts uploaded. Please upload prompts first."
            )
        
        # Generate unique test run ID
        test_run_id = str(uuid.uuid4())
        
        # Start test execution in background
        background_tasks.add_task(
            execute_tests_background,
            test_run_id,
            request.target_url,
            current_prompts.copy()
        )
        
        return TestRunResponse(
            test_run_id=test_run_id,
            status="started",
            message=f"Test execution started for {len(current_prompts)} prompts",
            prompts_count=len(current_prompts)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting tests: {str(e)}")


@app.get("/results")
async def get_results():
    """Get all previous test run results."""
    try:
        results = []
        
        # Read all result files from results directory
        for filename in os.listdir("results"):
            if filename.endswith(".json"):
                with open(f"results/{filename}", "r") as f:
                    result_data = json.load(f)
                    results.append(result_data)
        
        # Sort by timestamp (newest first)
        results.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return {
            "results": results,
            "total_runs": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving results: {str(e)}")


@app.get("/results/{test_run_id}")
async def get_test_result(test_run_id: str):
    """Get specific test run result by ID."""
    try:
        result_file = f"results/{test_run_id}.json"
        
        if not os.path.exists(result_file):
            raise HTTPException(status_code=404, detail="Test run not found")
        
        with open(result_file, "r") as f:
            result_data = json.load(f)
        
        return result_data
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Test run not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving result: {str(e)}")


@app.get("/current-prompts")
async def get_current_prompts():
    """Get currently loaded prompts."""
    return {
        "prompts": current_prompts,
        "count": len(current_prompts)
    }


@app.delete("/current-prompts")
async def clear_current_prompts():
    """Clear currently loaded prompts."""
    global current_prompts
    current_prompts = []
    return {"message": "Prompts cleared successfully"}


async def execute_tests_background(test_run_id: str, target_url: str, prompts: List[PromptData]):
    """Background task to execute prompt tests."""
    try:
        # Run the tests using Playwright
        results = await run_prompt_tests(target_url, prompts)
        
        # Prepare result data
        result_data = {
            "test_run_id": test_run_id,
            "target_url": target_url,
            "timestamp": datetime.now().isoformat(),
            "status": "completed",
            "total_prompts": len(prompts),
            "successful_tests": len([r for r in results if r.status == "completed"]),
            "failed_tests": len([r for r in results if r.status == "failed"]),
            "results": [r.dict() for r in results]
        }
        
        # Save results to file
        with open(f"results/{test_run_id}.json", "w") as f:
            json.dump(result_data, f, indent=2)
            
    except Exception as e:
        # Save error result
        error_data = {
            "test_run_id": test_run_id,
            "target_url": target_url,
            "timestamp": datetime.now().isoformat(),
            "status": "error",
            "error": str(e),
            "total_prompts": len(prompts),
            "results": []
        }
        
        with open(f"results/{test_run_id}.json", "w") as f:
            json.dump(error_data, f, indent=2)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
