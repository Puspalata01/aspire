# Flood Detection Models

This directory contains PyTorch implementations of machine learning models for flood detection and prediction.

## Models

### 1. Flood Inundation Segmentation (`flood_segmentation_model.py`)

Image segmentation models for identifying flooded areas from satellite imagery.

#### Architectures

**U-Net**
- Classic encoder-decoder architecture
- Skip connections for precise localization
- Features: [64, 128, 256, 512]
- Suitable for: SAR imagery, optical imagery

**Attention U-Net**
- U-Net with attention gates
- Improved focus on relevant regions
- Better performance on complex scenes

**Usage:**
```python
from models.flood.flood_segmentation_model import get_flood_segmentation_model

model = get_flood_segmentation_model(
    model_type='unet',
    in_channels=4,
    out_channels=1,
    features=[64, 128, 256, 512]
)

output = model(input_tensor)
```

**Input:** (B, C, H, W) - Batch × Channels × Height × Width  
**Output:** (B, 1, H, W) - Binary flood mask (sigmoid activated)

---

### 2. Precipitation Forecasting (`precipitation_forecasting_model.py`)

Time-series models for rainfall prediction.

#### Architectures

**LSTM**
- Standard LSTM for sequence modeling
- Multi-layer with dropout
- Supports bidirectional mode

**GRU**
- Lighter alternative to LSTM
- Faster training

**LSTM with Attention**
- Attention mechanism for temporal importance
- Returns attention weights for interpretability

**Seq2Seq LSTM**
- Encoder-decoder architecture
- Multi-step forecasting
- Teacher forcing during training

**Usage:**
```python
from models.flood.precipitation_forecasting_model import get_precipitation_model

model = get_precipitation_model(
    model_type='lstm_attention',
    input_size=5,
    hidden_size=128,
    num_layers=2,
    output_size=1
)

output, attention_weights = model(input_sequence)
```

**Input:** (B, T, F) - Batch × Time steps × Features  
**Output:** (B, 1) - Next time step prediction

---

### 3. River Discharge Prediction (`river_discharge_model.py`)

Models for predicting river discharge from meteorological and hydrological inputs.

#### Architectures

**RiverDischargePredictor (LSTM)**
- Basic LSTM model
- Suitable for temporal discharge patterns

**HybridDischargeModel**
- Combines temporal and spatial features
- Separate encoders for each modality
- Fusion layer for combined prediction

**PhysicsInformedDischargeModel**
- Integrates Manning's equation
- Data-driven + physics-based hybrid
- Learnable Manning coefficient
- Improved generalization

**MultiStepDischargePredictor**
- Seq2Seq architecture
- 7-day discharge forecasts
- Encoder-decoder with LSTM

**Usage:**
```python
from models.flood.river_discharge_model import get_discharge_model

# Standard LSTM
model = get_discharge_model(
    model_type='lstm',
    input_size=5,
    hidden_size=128
)

# Physics-informed
model = get_discharge_model(
    model_type='physics_informed',
    input_size=5
)

discharge = model(temporal_sequence, rainfall, slope, area)
```

**Input:** (B, T, F) - Batch × Time steps × Features  
**Output:** (B, 1) - Discharge prediction (m³/s)

---

## Training

All models include corresponding trainers in `pipelines/training/`:

- `flood_segmentation_trainer.py` - Dice + BCE loss, IoU/F1 metrics
- `precipitation_trainer.py` - MSE loss, MAE/RMSE/R² metrics
- `discharge_trainer.py` - MSE loss, NSE metric for hydrology

**Example:**
```python
from pipelines.training.flood_segmentation_trainer import FloodSegmentationTrainer

trainer = FloodSegmentationTrainer(
    model_type='unet',
    in_channels=4,
    learning_rate=0.001
)

results = trainer.train(
    train_loader=train_loader,
    val_loader=val_loader,
    epochs=50,
    save_dir=Path('models/checkpoints/flood')
)
```

---

## Inference

Inference pipelines in `pipelines/inference/flood_inference.py`:

- `FloodSegmentationInference` - Load model, predict masks, calculate flood extent
- `PrecipitationInference` - Multi-step rainfall forecasting
- `DischargeInference` - Discharge prediction with confidence

**Example:**
```python
from pipelines.inference.flood_inference import FloodSegmentationInference

predictor = FloodSegmentationInference(
    model_path='models/checkpoints/flood/best_model.pt',
    model_type='unet',
    in_channels=4
)

mask, probability = predictor.predict(
    image=input_image,
    threshold=0.5,
    return_probability=True
)

extent = predictor.calculate_flood_extent(mask, pixel_size_m2=100)
print(f"Flooded area: {extent['flooded_area_km2']:.2f} km²")
```

---

## Model Performance

### Flood Segmentation Metrics
- **IoU (Intersection over Union):** Overlap accuracy
- **Dice Coefficient:** Similar to IoU, smoother gradients
- **F1 Score:** Balance of precision and recall
- **Precision:** Accuracy of flood predictions
- **Recall:** Coverage of actual floods

### Precipitation Forecasting Metrics
- **MAE (Mean Absolute Error):** Average prediction error
- **RMSE (Root Mean Square Error):** Penalizes large errors
- **R² (Coefficient of Determination):** Variance explained
- **MAPE (Mean Absolute Percentage Error):** Relative error

### Discharge Prediction Metrics
- **NSE (Nash-Sutcliffe Efficiency):** Hydrology-specific metric (-∞ to 1)
- **MAE, RMSE, R²:** Standard regression metrics

---

## Configuration

Model hyperparameters in `config/config.yaml`:

```yaml
flood:
  model_type: "unet"
  input_channels: 4
  output_classes: 2
  image_size: 256
  batch_size: 8
  epochs: 50
  learning_rate: 0.001

precipitation:
  model_type: "lstm"
  sequence_length: 30
  forecast_horizon: 7
  hidden_size: 128
  num_layers: 2
  batch_size: 32
  epochs: 100
```

---

## Checkpoints

Models are saved with:
- Model state dict
- Optimizer state
- Scheduler state
- Training/validation losses
- Evaluation metrics

**Load checkpoint:**
```python
trainer.load_checkpoint('models/checkpoints/flood/best_model.pt')
```

---

## Device Support

All models support:
- CPU
- CUDA (single/multi-GPU)
- MPS (Apple Silicon)

Automatic device selection:
```python
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
```

---

## Requirements

```
torch>=2.0.1
torchvision>=0.15.2
numpy>=1.24.3
tqdm>=4.65.0
```

---

## Future Enhancements

- Transformer-based architectures
- Ensemble models
- Model distillation for edge deployment
- ONNX export for production
- Uncertainty quantification

---

**Version:** 0.1.0  
**Last Updated:** 2026-10-04  
**Status:** MVP Complete
