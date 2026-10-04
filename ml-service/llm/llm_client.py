import json
import os
from typing import Any, Dict, Generator, List, Optional
from dataclasses import dataclass, field
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))

from llm.tool_registry import registry
from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class LLMConfig:
    provider: str = "openai"
    model: str = "gpt-4o-mini"
    temperature: float = 0.2
    max_tokens: int = 2048
    system_prompt: str = ""
    ollama_base_url: str = "http://localhost:11434"
    max_tool_rounds: int = 5

    def __post_init__(self):
        if not self.system_prompt:
            self.system_prompt = (
                "You are ASPIRE-AI, an expert disaster risk management assistant. "
                "You help emergency operators assess flood risk, predict impacts, "
                "plan evacuations, and allocate resources during disaster events. "
                "Always use the provided tools to back your answers with data. "
                "Be concise, actionable, and prioritize life safety. "
                "Never make autonomous operational decisions — always present "
                "findings and recommendations for human review."
            )


class LLMClient:

    def __init__(self, config: Optional[LLMConfig] = None):
        self.config = config or LLMConfig()
        self._client = None
        self._setup_client()
        logger.info(f"Initialized LLMClient (provider: {self.config.provider}, model: {self.config.model})")

    def _setup_client(self):
        if self.config.provider == "openai":
            try:
                from openai import OpenAI
                api_key = os.getenv("OPENAI_API_KEY")
                if not api_key:
                    logger.warning("OPENAI_API_KEY not set — LLM calls will be simulated")
                    self._client = None
                else:
                    self._client = OpenAI(api_key=api_key)
            except ImportError:
                logger.warning("openai package not installed — LLM calls will be simulated")
                self._client = None

        elif self.config.provider == "ollama":
            try:
                from openai import OpenAI
                self._client = OpenAI(
                    base_url=f"{self.config.ollama_base_url}/v1",
                    api_key="ollama",
                )
            except ImportError:
                logger.warning("openai package not installed — LLM calls will be simulated")
                self._client = None

    def _simulate_response(self, messages: List[Dict], tools: List[Dict]) -> Dict:
        last_user = next(
            (m["content"] for m in reversed(messages) if m["role"] == "user"), ""
        )

        tool_calls_map = {
            "risk": ("assess_flood_risk", {"region": "query_region", "hazard_intensity": 0.75, "population_density": 800}),
            "impact": ("predict_population_impact", {"affected_population": 50000, "risk_score": 0.75}),
            "evacuati": ("get_evacuation_route", {"origin_zone": "Zone A", "population": 5000}),
            "resource": ("get_resource_needs", {"displaced_population": 20000, "duration_days": 7}),
            "shelter": ("check_shelter_availability", {"region": "query_region", "required_capacity": 15000}),
            "econom": ("estimate_economic_loss", {"affected_area_km2": 200, "building_damage_fraction": 0.4}),
        }

        chosen_tool = None
        for keyword, (tool_name, tool_args) in tool_calls_map.items():
            if keyword in last_user.lower():
                chosen_tool = (tool_name, tool_args)
                break

        if chosen_tool and tools:
            tool_name, tool_args = chosen_tool
            return {
                "role": "assistant",
                "content": None,
                "tool_calls": [
                    {
                        "id": f"call_{tool_name}",
                        "type": "function",
                        "function": {"name": tool_name, "arguments": json.dumps(tool_args)},
                    }
                ],
                "simulated": True,
            }

        return {
            "role": "assistant",
            "content": (
                "Based on current data, I can help assess disaster risk and coordinate response. "
                "Please specify the region, hazard type, or operation you need help with."
            ),
            "tool_calls": None,
            "simulated": True,
        }

    def _call_api(self, messages: List[Dict], tools: List[Dict]) -> Dict:
        if self._client is None:
            return self._simulate_response(messages, tools)

        kwargs = {
            "model": self.config.model,
            "messages": messages,
            "temperature": self.config.temperature,
            "max_tokens": self.config.max_tokens,
        }
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"

        response = self._client.chat.completions.create(**kwargs)
        msg = response.choices[0].message

        tool_calls = None
        if msg.tool_calls:
            tool_calls = [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                }
                for tc in msg.tool_calls
            ]

        return {
            "role": "assistant",
            "content": msg.content,
            "tool_calls": tool_calls,
            "simulated": False,
        }

    def _execute_tool_calls(self, tool_calls: List[Dict]) -> List[Dict]:
        results = []
        for tc in tool_calls:
            fn_name = tc["function"]["name"]
            try:
                args = json.loads(tc["function"]["arguments"])
                result = registry.execute(fn_name, args)
                content = json.dumps(result)
            except Exception as e:
                logger.error(f"Tool execution error ({fn_name}): {e}")
                content = json.dumps({"error": str(e)})

            results.append({
                "role": "tool",
                "tool_call_id": tc["id"],
                "name": fn_name,
                "content": content,
            })
        return results

    def chat(
        self,
        messages: List[Dict],
        use_tools: bool = True,
    ) -> Dict:
        tools = registry.list_tools() if use_tools else []
        conversation = list(messages)
        tool_rounds = 0
        tool_execution_log = []

        while tool_rounds < self.config.max_tool_rounds:
            response = self._call_api(conversation, tools)

            if not response.get("tool_calls"):
                return {
                    "content": response["content"],
                    "tool_execution_log": tool_execution_log,
                    "simulated": response.get("simulated", False),
                }

            conversation.append({
                "role": "assistant",
                "content": response.get("content"),
                "tool_calls": response["tool_calls"],
            })

            tool_results = self._execute_tool_calls(response["tool_calls"])
            conversation.extend(tool_results)

            for tc, tr in zip(response["tool_calls"], tool_results):
                tool_execution_log.append({
                    "tool": tc["function"]["name"],
                    "args": json.loads(tc["function"]["arguments"]),
                    "result": json.loads(tr["content"]),
                })

            tool_rounds += 1

        response = self._call_api(conversation, [])
        return {
            "content": response["content"],
            "tool_execution_log": tool_execution_log,
            "simulated": response.get("simulated", False),
        }


class ConversationSession:

    def __init__(self, client: Optional[LLMClient] = None, session_id: Optional[str] = None):
        self.client = client or LLMClient()
        self.session_id = session_id or _generate_id()
        self.messages: List[Dict] = [
            {"role": "system", "content": self.client.config.system_prompt}
        ]
        self.turn_log = []
        logger.info(f"Started conversation session: {self.session_id}")

    def send(self, user_message: str) -> str:
        self.messages.append({"role": "user", "content": user_message})

        response = self.client.chat(self.messages)

        content = response["content"] or ""
        self.messages.append({"role": "assistant", "content": content})

        self.turn_log.append({
            "user": user_message,
            "assistant": content,
            "tools_used": [t["tool"] for t in response.get("tool_execution_log", [])],
        })

        logger.info(
            f"Turn {len(self.turn_log)} — tools used: {[t['tool'] for t in response.get('tool_execution_log', [])]}"
        )

        return content

    def reset(self):
        self.messages = [
            {"role": "system", "content": self.client.config.system_prompt}
        ]
        self.turn_log = []
        logger.info(f"Session reset: {self.session_id}")

    def get_history(self) -> List[Dict]:
        return [m for m in self.messages if m["role"] != "system"]

    def save_session(self, output_path: Path):
        output_path = Path(output_path)
        output_path.mkdir(parents=True, exist_ok=True)
        import json as _json
        with open(output_path / f"session_{self.session_id}.json", "w") as f:
            _json.dump({
                "session_id": self.session_id,
                "turn_log": self.turn_log,
                "history": self.get_history(),
            }, f, indent=2)
        logger.info(f"Session saved to {output_path}")


def _generate_id() -> str:
    import uuid
    return str(uuid.uuid4())[:8]


if __name__ == "__main__":
    session = ConversationSession()

    queries = [
        "What is the flood risk for the Odisha coastal zone with hazard intensity 0.82 and population density 1200?",
        "Given that risk, how many people will be impacted and what are the evacuation needs?",
        "What resources are needed for the displaced population over 10 days?",
    ]

    for query in queries:
        print(f"\nUser: {query}")
        response = session.send(query)
        print(f"ASPIRE-AI: {response}")
        if session.turn_log[-1]["tools_used"]:
            print(f"  [Tools used: {session.turn_log[-1]['tools_used']}]")
