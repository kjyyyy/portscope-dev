from __future__ import annotations

import json
import logging
import os
from abc import ABC, abstractmethod
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    """Abstract base for LLM providers. All providers must implement chat()."""

    @abstractmethod
    async def chat(self, prompt: str, max_tokens: int = 2000) -> str:
        """Send a prompt and return the text response."""
        ...


class AnthropicProvider(LLMProvider):
    """Anthropic Claude API (native SDK)."""

    def __init__(self) -> None:
        import anthropic

        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY not set")
        self.client = anthropic.AsyncAnthropic(api_key=api_key)
        self.model = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")

    async def chat(self, prompt: str, max_tokens: int = 2000) -> str:
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text.strip()


class OpenAICompatibleProvider(LLMProvider):
    """
    Works with any OpenAI-compatible API:
    - Ollama (http://localhost:11434/v1)
    - OpenRouter (https://openrouter.ai/api/v1)
    - HuggingFace Inference (https://api-inference.huggingface.co/v1)
    - vLLM (http://localhost:8000/v1)
    - LM Studio, Together AI, Groq, etc.

    Set via environment variables:
      LLM_BASE_URL=http://localhost:11434/v1  (for Ollama)
      LLM_API_KEY=your-key                     (optional for Ollama)
      LLM_MODEL=llama3.1:8b                    (model name)
    """

    def __init__(self) -> None:
        self.base_url = os.environ.get("LLM_BASE_URL", "http://localhost:11434/v1")
        self.api_key = os.environ.get("LLM_API_KEY", "ollama")
        self.model = os.environ.get("LLM_MODEL", "llama3.1:8b")
        self.client = httpx.AsyncClient(timeout=120.0)

    async def chat(self, prompt: str, max_tokens: int = 2000) -> str:
        headers: dict[str, str] = {"Content-Type": "application/json"}
        if self.api_key and self.api_key != "ollama":
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": 0.1,
        }

        response = await self.client.post(
            f"{self.base_url}/chat/completions",
            json=payload,
            headers=headers,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()


_provider: Optional[LLMProvider] = None


def get_provider() -> LLMProvider:
    """
    Factory: choose provider based on LLM_PROVIDER env var.

    Supported values:
      anthropic  → Anthropic Claude (requires ANTHROPIC_API_KEY)
      ollama     → Ollama local (default, requires LLM_BASE_URL or uses localhost:11434)
      openrouter → OpenRouter (requires LLM_API_KEY, LLM_MODEL)
      huggingface→ HuggingFace Inference API (requires LLM_API_KEY)
      openai     → OpenAI API (requires LLM_API_KEY)
      vllm       → Self-hosted vLLM (requires LLM_BASE_URL)
      custom     → Any OpenAI-compatible endpoint (requires LLM_BASE_URL)
    """
    global _provider
    if _provider is not None:
        return _provider

    provider_name = os.environ.get("LLM_PROVIDER", "ollama").lower()

    if provider_name == "anthropic":
        _provider = AnthropicProvider()

    elif provider_name == "ollama":
        os.environ.setdefault("LLM_BASE_URL", "http://localhost:11434/v1")
        os.environ.setdefault("LLM_MODEL", "llama3.1:8b")
        _provider = OpenAICompatibleProvider()

    elif provider_name == "openrouter":
        os.environ.setdefault("LLM_BASE_URL", "https://openrouter.ai/api/v1")
        if not os.environ.get("LLM_API_KEY"):
            raise RuntimeError("LLM_API_KEY required for OpenRouter")
        _provider = OpenAICompatibleProvider()

    elif provider_name == "huggingface":
        os.environ.setdefault("LLM_BASE_URL", "https://api-inference.huggingface.co/v1")
        if not os.environ.get("LLM_API_KEY"):
            raise RuntimeError("LLM_API_KEY (HuggingFace token) required")
        _provider = OpenAICompatibleProvider()

    elif provider_name in ("openai", "vllm", "custom"):
        _provider = OpenAICompatibleProvider()

    else:
        raise RuntimeError(
            f"Unknown LLM_PROVIDER '{provider_name}'. "
            "Use: anthropic, ollama, openrouter, huggingface, openai, vllm, custom"
        )

    logger.info("LLM provider: %s (model: %s)", provider_name, getattr(_provider, "model", "n/a"))
    return _provider


def reset_provider() -> None:
    """Reset the cached provider (useful for testing)."""
    global _provider
    _provider = None
