import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))

from llm.llm_client import LLMClient, LLMConfig, ConversationSession
from llm.tool_registry import registry
from llm.explainability import SHAPExplainer, VulnerabilityExplainer
from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class QueryIntent:
    intent: str
    entities: Dict[str, str]
    confidence: float
    suggested_tools: List[str]


INTENT_PATTERNS = [
    {
        "intent": "flood_risk_assessment",
        "keywords": ["flood risk", "risk assessment", "hazard level", "risk score", "flood danger"],
        "tools": ["assess_flood_risk"],
    },
    {
        "intent": "population_impact",
        "keywords": ["people affected", "population impact", "casualties", "displacement", "displaced"],
        "tools": ["predict_population_impact"],
    },
    {
        "intent": "evacuation_planning",
        "keywords": ["evacuate", "evacuation route", "escape route", "move people", "safe route"],
        "tools": ["get_evacuation_route", "check_shelter_availability"],
    },
    {
        "intent": "resource_allocation",
        "keywords": ["resources needed", "food water", "relief supplies", "aid required", "how much"],
        "tools": ["get_resource_needs"],
    },
    {
        "intent": "shelter_capacity",
        "keywords": ["shelter", "relief camp", "accommodation", "housing", "camps available"],
        "tools": ["check_shelter_availability"],
    },
    {
        "intent": "economic_loss",
        "keywords": ["economic loss", "financial damage", "cost of damage", "monetary impact", "damage cost"],
        "tools": ["estimate_economic_loss"],
    },
    {
        "intent": "compound_query",
        "keywords": ["full assessment", "complete picture", "everything", "all impacts", "summary"],
        "tools": ["assess_flood_risk", "predict_population_impact", "get_resource_needs", "estimate_economic_loss"],
    },
]


class IntentClassifier:

    def classify(self, query: str) -> QueryIntent:
        query_lower = query.lower()

        best_intent = None
        best_score = 0
        best_tools = []

        for pattern in INTENT_PATTERNS:
            score = sum(1 for kw in pattern["keywords"] if kw in query_lower)
            if score > best_score:
                best_score = score
                best_intent = pattern["intent"]
                best_tools = pattern["tools"]

        if best_intent is None:
            best_intent = "general_query"
            best_tools = ["assess_flood_risk"]

        entities = self._extract_entities(query)
        confidence = min(best_score / 2, 1.0) if best_score > 0 else 0.3

        return QueryIntent(
            intent=best_intent,
            entities=entities,
            confidence=confidence,
            suggested_tools=best_tools,
        )

    def _extract_entities(self, query: str) -> Dict[str, str]:
        entities = {}

        region_patterns = [
            r"(?:in|for|at|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)",
            r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:district|region|zone|area|coast)",
        ]
        for pattern in region_patterns:
            match = re.search(pattern, query)
            if match:
                entities["region"] = match.group(1)
                break

        number_patterns = [
            (r"(\d+(?:\.\d+)?)\s*(?:lakh|lakhs)", "population", lambda x: float(x) * 100000),
            (r"(\d+(?:\.\d+)?)\s*(?:thousand|k\b)", "population", lambda x: float(x) * 1000),
            (r"population\s+(?:of\s+)?(\d+(?:,\d+)*)", "population", lambda x: float(x.replace(",", ""))),
            (r"(\d+(?:\.\d+)?)\s*(?:km²|sq\s*km|square\s*km)", "area_km2", float),
            (r"(\d+(?:\.\d+)?)\s*(?:m|meter|metres?)\s+(?:depth|deep|flood)", "flood_depth_m", float),
            (r"(?:intensity|hazard)\s+(?:of\s+)?(\d+(?:\.\d+)?)", "hazard_intensity", float),
        ]

        for pattern, key, transform in number_patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                try:
                    entities[key] = str(transform(match.group(1)))
                except Exception:
                    pass

        return entities


class NaturalLanguageQueryInterface:

    def __init__(
        self,
        llm_config: Optional[LLMConfig] = None,
        enable_explainability: bool = True,
    ):
        self.llm_client = LLMClient(llm_config)
        self.intent_classifier = IntentClassifier()
        self.shap_explainer = SHAPExplainer() if enable_explainability else None
        self.vuln_explainer = VulnerabilityExplainer() if enable_explainability else None
        self.sessions: Dict[str, ConversationSession] = {}
        logger.info("Initialized NaturalLanguageQueryInterface")

    def get_or_create_session(self, session_id: str) -> ConversationSession:
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationSession(
                client=self.llm_client,
                session_id=session_id,
            )
        return self.sessions[session_id]

    def query(
        self,
        user_query: str,
        session_id: str = "default",
        context: Optional[Dict] = None,
    ) -> Dict:
        logger.info(f"Query [{session_id}]: {user_query[:80]}...")

        intent = self.intent_classifier.classify(user_query)
        logger.info(f"Intent: {intent.intent} (confidence: {intent.confidence:.2f}), tools: {intent.suggested_tools}")

        session = self.get_or_create_session(session_id)

        enriched_query = user_query
        if context:
            context_str = ", ".join(f"{k}: {v}" for k, v in context.items())
            enriched_query = f"{user_query}\n[Context: {context_str}]"

        response_text = session.send(enriched_query)
        turn = session.turn_log[-1]

        result = {
            "query": user_query,
            "response": response_text,
            "intent": intent.intent,
            "intent_confidence": intent.confidence,
            "entities_extracted": intent.entities,
            "tools_used": turn["tools_used"],
            "session_id": session_id,
        }

        return result

    def run_direct_tool(self, tool_name: str, arguments: Dict) -> Dict:
        try:
            result = registry.execute(tool_name, arguments)
            return {"success": True, "tool": tool_name, "result": result}
        except Exception as e:
            return {"success": False, "tool": tool_name, "error": str(e)}

    def explain_prediction(
        self,
        model: object,
        instance: "np.ndarray",
        feature_names: List[str],
        background: "np.ndarray",
        model_type: str = "tree",
        prediction_label: str = "risk score",
    ) -> Dict:
        if self.shap_explainer is None:
            return {"error": "Explainability not enabled"}

        explanation = self.shap_explainer.explain_single_prediction(
            model=model,
            instance=instance,
            feature_names=feature_names,
            background=background,
            model_type=model_type,
        )

        explanation["narrative"] = self.shap_explainer.generate_text_explanation(
            explanation, prediction_label=prediction_label
        )

        return explanation

    def batch_query(
        self,
        queries: List[str],
        session_id: str = "batch",
        context: Optional[Dict] = None,
    ) -> List[Dict]:
        results = []
        for q in queries:
            result = self.query(q, session_id=session_id, context=context)
            results.append(result)
        return results

    def save_session(self, session_id: str, output_path: Path):
        if session_id in self.sessions:
            self.sessions[session_id].save_session(Path(output_path))
        else:
            logger.warning(f"Session {session_id} not found")

    def get_session_summary(self, session_id: str) -> Dict:
        if session_id not in self.sessions:
            return {}

        session = self.sessions[session_id]
        all_tools = [tool for turn in session.turn_log for tool in turn["tools_used"]]
        from collections import Counter
        tool_counts = Counter(all_tools)

        return {
            "session_id": session_id,
            "total_turns": len(session.turn_log),
            "total_tool_calls": len(all_tools),
            "tool_usage": dict(tool_counts),
        }


if __name__ == "__main__":
    interface = NaturalLanguageQueryInterface()

    queries = [
        "What is the flood risk in the Puri district with hazard intensity 0.78 and population density of 950 per km²?",
        "How many people will be displaced and what are the casualties estimates?",
        "Plan the evacuation for 35,000 people from Zone B. Roads are partially blocked.",
        "What resources do we need for 20,000 displaced people for 2 weeks?",
        "Check shelter availability in Puri district for 18,000 people.",
        "Give me the full economic impact assessment for an affected area of 300 km².",
    ]

    print("=" * 60)
    print("ASPIRE-AI Natural Language Query Interface Demo")
    print("=" * 60)

    for query in queries:
        result = interface.query(query, session_id="demo")
        print(f"\nUser: {query}")
        print(f"ASPIRE-AI: {result['response']}")
        print(f"  Intent: {result['intent']} | Tools: {result['tools_used']}")

    print("\n" + "=" * 60)
    summary = interface.get_session_summary("demo")
    print(f"Session summary: {summary['total_turns']} turns, {summary['total_tool_calls']} tool calls")
    print(f"Tool usage: {summary['tool_usage']}")
