from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Union
from datetime import datetime
from enum import Enum


class PromptStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"
    timeout = "timeout"


class PromptData(BaseModel):
    id: str
    prompt: str
    status: PromptStatus = PromptStatus.pending
    response: Optional[str] = None
    timestamp: Optional[str] = None
    token_usage: Optional[int] = None
    max_tokens: Optional[int] = None
    tags: Optional[List[str]] = []
    execution_time: Optional[float] = None
    error_message: Optional[str] = None


class TestRunRequest(BaseModel):
    target_url: str
    max_timeout: Optional[int] = 30  # seconds
    screenshot_on_failure: Optional[bool] = True
    delay_between_prompts: Optional[int] = 2  # seconds


class TestRunResponse(BaseModel):
    test_run_id: str
    status: str
    message: str
    prompts_count: int


class TestResult(BaseModel):
    id: str
    prompt: str
    response: Optional[str]
    status: PromptStatus
    timestamp: str
    execution_time: float
    token_usage: Optional[int] = None
    tags: List[str] = []
    error_message: Optional[str] = None
    screenshot_path: Optional[str] = None


class TestRunResult(BaseModel):
    test_run_id: str
    target_url: str
    timestamp: str
    status: str
    total_prompts: int
    successful_tests: int
    failed_tests: int
    results: List[TestResult]
    error: Optional[str] = None


class UploadResponse(BaseModel):
    message: str
    prompts_count: int
    prompts: List[PromptData]


class ResultsResponse(BaseModel):
    results: List[TestRunResult]
    total_runs: int
