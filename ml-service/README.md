# Multi-Hazard ML Service

**AI-Powered Disaster Intelligence & Response Platform**

> From Warning to Action

## Overview

This ML service provides intelligent multi-hazard detection, risk assessment, impact prediction, and decision support for disaster management. The MVP focuses on flood detection for Odisha, India, with extensibility to cyclones, storm surges, heatwaves, and other hazards.

## Project Structure

```
ml-service/
├── models/                    # ML model implementations
│   ├── flood/                # Flood detection models
│   ├── cyclone/              # Cyclone tracking models
│   ├── storm_surge/          # Storm surge prediction
│   ├── heatwave/             # Heatwave detection
│   └── multi_hazard/         # Cascading hazard models
├── data/                      # Data storage
│   ├── raw/                  # Raw input data
│   ├── processed/            # Preprocessed data
│   └── sample/               # Sample/synthetic data
├── pipelines/                 # ML pipelines
│   ├── preprocessing/        # Data preprocessing
│   ├── training/             # Model training
│   └── inference/            # Model inference
├── api/                       # REST API
│   ├── routes/               # API endpoints
│   ├── schemas/              # Request/response schemas
│   └── middleware/           # API middleware
├── utils/                     # Utility functions
│   ├── geospatial/           # GIS utilities
│   ├── visualization/        # Plotting and mapping
│   └── metrics/              # Evaluation metrics
├── config/                    # Configuration files
├── tests/                     # Test suite
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
├── logs/                      # Application logs
└── notebooks/                 # Jupyter notebooks

```

## Features

### Current (Phase 1)
- ✅ Project structure and dependencies
- ✅ Configuration management
- ✅ Logging framework
- ✅ Docker containerization

### Planned
- Flood inundation detection (U-Net)
- Precipitation forecasting (LSTM)
- Risk assessment engine
- Impact prediction models
- Decision support systems
- LLM integration with explainability
- REST API for inference
- Real-time monitoring

## Installation

### Local Setup

```bash
# Clone the repository
cd aspire/ml-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Ensure directories exist
python -c "from utils.config_loader import config; config.ensure_directories()"
```

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t aspire-ml-service .
docker run -p 8000:8000 -v $(pwd)/data:/app/data aspire-ml-service
```

## Configuration

Edit `config/config.yaml` to customize:
- Data paths
- Model hyperparameters
- API settings
- Geographic boundaries
- Risk thresholds

## Usage

### Training Models

```python
from pipelines.training import FloodTrainer
from utils.config_loader import config

trainer = FloodTrainer(config)
trainer.train()
```

### Running Inference

```python
from pipelines.inference import FloodPredictor

predictor = FloodPredictor(model_path="models/flood/best_model.pt")
result = predictor.predict(input_data)
```

### API Server

```bash
# Start FastAPI server
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# Access docs at http://localhost:8000/docs
```

## Development Roadmap

See [ML_SERVICE_CHECKLIST.md](ML_SERVICE_CHECKLIST.md) for detailed development phases.

**Current Phase:** Phase 1.1 - Project Structure ✅  
**Next Phase:** Phase 1.2 - Sample Data Generators

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test suite
pytest tests/unit/
```

## Architecture

The system follows a modular architecture:

1. **Data Layer**: Sample data generators → Preprocessing pipeline
2. **Model Layer**: Specialized models per hazard type
3. **Risk Engine**: Vulnerability × Exposure × Hazard
4. **Decision Support**: Optimization algorithms for routing and allocation
5. **API Layer**: FastAPI with GeoJSON support
6. **LLM Layer**: Tool-calling interface with safety guardrails

## Contributing

1. Follow existing code conventions
2. Write tests for new features
3. Update documentation
4. Use type hints
5. Run linting before commits

## License

[To be determined]

## References

- Blueprint: `MULTI_HAZARD_ML_AI_BLUEPRINT.md`
- Checklist: `ML_SERVICE_CHECKLIST.md`

---

**Status:** In Development  
**Last Updated:** 2026-10-04  
**Contact:** [Your contact information]
