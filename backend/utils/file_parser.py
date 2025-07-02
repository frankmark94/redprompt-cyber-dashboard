import json
import csv
import pandas as pd
import uuid
from typing import List, Dict, Any
from models import PromptData, PromptStatus


async def parse_prompts_file(file_path: str) -> List[PromptData]:
    """
    Parse uploaded CSV or JSON file containing adversarial prompts.
    
    Expected formats:
    - JSON: [{"prompt": "...", "tags": ["tag1", "tag2"]}, ...]
    - CSV: columns "prompt" (required), "tags" (optional, comma-separated)
    """
    prompts = []
    
    if file_path.endswith('.json'):
        prompts = await parse_json_file(file_path)
    elif file_path.endswith('.csv'):
        prompts = await parse_csv_file(file_path)
    else:
        raise ValueError("Unsupported file format. Only JSON and CSV are supported.")
    
    return prompts


async def parse_json_file(file_path: str) -> List[PromptData]:
    """Parse JSON file containing prompts."""
    prompts = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle different JSON structures
    if isinstance(data, list):
        # Array of prompt objects
        for item in data:
            if isinstance(item, str):
                # Simple array of strings
                prompts.append(create_prompt_data(item))
            elif isinstance(item, dict):
                # Array of objects
                prompt_text = item.get('prompt', item.get('text', ''))
                if prompt_text:
                    tags = item.get('tags', [])
                    if isinstance(tags, str):
                        tags = [tag.strip() for tag in tags.split(',') if tag.strip()]
                    prompts.append(create_prompt_data(prompt_text, tags))
    elif isinstance(data, dict):
        # Single object or structured data
        if 'prompts' in data:
            # Structured format with prompts array
            for item in data['prompts']:
                if isinstance(item, str):
                    prompts.append(create_prompt_data(item))
                elif isinstance(item, dict):
                    prompt_text = item.get('prompt', item.get('text', ''))
                    if prompt_text:
                        tags = item.get('tags', [])
                        if isinstance(tags, str):
                            tags = [tag.strip() for tag in tags.split(',') if tag.strip()]
                        prompts.append(create_prompt_data(prompt_text, tags))
        else:
            # Single prompt object
            prompt_text = data.get('prompt', data.get('text', ''))
            if prompt_text:
                tags = data.get('tags', [])
                if isinstance(tags, str):
                    tags = [tag.strip() for tag in tags.split(',') if tag.strip()]
                prompts.append(create_prompt_data(prompt_text, tags))
    
    return prompts


async def parse_csv_file(file_path: str) -> List[PromptData]:
    """Parse CSV file containing prompts."""
    prompts = []
    
    try:
        # Try to read with pandas for better handling of various CSV formats
        df = pd.read_csv(file_path)
        
        # Look for prompt column (case-insensitive)
        prompt_column = None
        for col in df.columns:
            if col.lower() in ['prompt', 'prompts', 'text', 'message', 'query']:
                prompt_column = col
                break
        
        if prompt_column is None:
            raise ValueError("No prompt column found. Expected column names: 'prompt', 'text', 'message', or 'query'")
        
        # Look for tags column (optional)
        tags_column = None
        for col in df.columns:
            if col.lower() in ['tags', 'tag', 'categories', 'category', 'labels', 'label']:
                tags_column = col
                break
        
        # Process each row
        for _, row in df.iterrows():
            prompt_text = str(row[prompt_column]).strip()
            if prompt_text and prompt_text.lower() != 'nan':
                tags = []
                if tags_column and pd.notna(row[tags_column]):
                    tags_str = str(row[tags_column])
                    tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
                
                prompts.append(create_prompt_data(prompt_text, tags))
    
    except Exception as e:
        # Fallback to basic CSV parsing
        with open(file_path, 'r', encoding='utf-8') as f:
            csv_reader = csv.DictReader(f)
            
            # Get field names and find prompt column
            fieldnames = csv_reader.fieldnames
            prompt_field = None
            tags_field = None
            
            for field in fieldnames:
                field_lower = field.lower()
                if field_lower in ['prompt', 'prompts', 'text', 'message', 'query']:
                    prompt_field = field
                elif field_lower in ['tags', 'tag', 'categories', 'category', 'labels', 'label']:
                    tags_field = field
            
            if not prompt_field:
                raise ValueError("No prompt column found in CSV file")
            
            # Process rows
            for row in csv_reader:
                prompt_text = row.get(prompt_field, '').strip()
                if prompt_text:
                    tags = []
                    if tags_field and row.get(tags_field):
                        tags = [tag.strip() for tag in row[tags_field].split(',') if tag.strip()]
                    
                    prompts.append(create_prompt_data(prompt_text, tags))
    
    return prompts


def create_prompt_data(prompt_text: str, tags: List[str] = None) -> PromptData:
    """Create a PromptData object from prompt text and tags."""
    if tags is None:
        tags = []
    
    # Auto-detect potential security tags based on content
    auto_tags = detect_security_tags(prompt_text)
    all_tags = list(set(tags + auto_tags))
    
    return PromptData(
        id=str(uuid.uuid4()),
        prompt=prompt_text,
        status=PromptStatus.pending,
        tags=all_tags
    )


def detect_security_tags(prompt: str) -> List[str]:
    """Automatically detect security-related tags based on prompt content."""
    tags = []
    prompt_lower = prompt.lower()
    
    # Common jailbreak patterns
    jailbreak_patterns = [
        'ignore', 'forget', 'disregard', 'override', 'bypass', 'disable',
        'pretend', 'roleplay', 'act as', 'imagine', 'hypothetical',
        'developer mode', 'admin mode', 'debug mode', 'maintenance mode',
        'system prompt', 'instructions', 'guidelines', 'rules'
    ]
    
    # Injection patterns
    injection_patterns = [
        'system:', 'user:', 'assistant:', 'human:', 'ai:',
        'prompt injection', 'command injection', 'code injection',
        '```', 'exec', 'eval', 'script'
    ]
    
    # Social engineering patterns
    social_patterns = [
        'urgent', 'emergency', 'immediate', 'confidential', 'secret',
        'password', 'token', 'api key', 'credential', 'login',
        'personal information', 'private data', 'sensitive'
    ]
    
    # Check for patterns
    for pattern in jailbreak_patterns:
        if pattern in prompt_lower:
            tags.append('Jailbreak Attempt')
            break
    
    for pattern in injection_patterns:
        if pattern in prompt_lower:
            tags.append('Injection Attempt')
            break
    
    for pattern in social_patterns:
        if pattern in prompt_lower:
            tags.append('Social Engineering')
            break
    
    # Check for suspicious characters or formatting
    if '\\n' in prompt or '\\t' in prompt or prompt.count('\n') > 3:
        tags.append('Formatted Input')
    
    if len(prompt) > 1000:
        tags.append('Long Prompt')
    
    if any(char in prompt for char in ['<', '>', '{', '}', '[', ']']):
        tags.append('Structured Input')
    
    return tags 