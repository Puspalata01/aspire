import torch
import torch.nn as nn
from typing import Optional, Tuple


class RiverDischargePredictor(nn.Module):
    
    def __init__(
        self,
        input_size: int,
        hidden_size: int = 128,
        num_layers: int = 2,
        output_size: int = 1,
        dropout: float = 0.2
    ):
        super(RiverDischargePredictor, self).__init__()
        
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, output_size),
            nn.ReLU()
        )
    
    def forward(self, x, hidden=None):
        lstm_out, hidden = self.lstm(x, hidden)
        out = self.fc(lstm_out[:, -1, :])
        return out, hidden


class HybridDischargeModel(nn.Module):
    
    def __init__(
        self,
        temporal_features: int,
        spatial_features: int,
        hidden_size: int = 128,
        num_layers: int = 2,
        output_size: int = 1,
        dropout: float = 0.2
    ):
        super(HybridDischargeModel, self).__init__()
        
        self.temporal_encoder = nn.LSTM(
            input_size=temporal_features,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        self.spatial_encoder = nn.Sequential(
            nn.Linear(spatial_features, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU()
        )
        
        self.fusion = nn.Sequential(
            nn.Linear(hidden_size * 2, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, output_size),
            nn.ReLU()
        )
    
    def forward(self, temporal_input, spatial_input):
        
        temporal_out, _ = self.temporal_encoder(temporal_input)
        temporal_features = temporal_out[:, -1, :]
        
        spatial_features = self.spatial_encoder(spatial_input)
        
        combined = torch.cat([temporal_features, spatial_features], dim=1)
        
        discharge = self.fusion(combined)
        
        return discharge


class PhysicsInformedDischargeModel(nn.Module):
    
    def __init__(
        self,
        input_size: int,
        hidden_size: int = 128,
        num_layers: int = 2,
        output_size: int = 1,
        dropout: float = 0.2
    ):
        super(PhysicsInformedDischargeModel, self).__init__()
        
        self.data_driven = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        self.physics_branch = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.Tanh(),
            nn.Linear(hidden_size, hidden_size),
            nn.Tanh()
        )
        
        self.fusion_fc = nn.Sequential(
            nn.Linear(hidden_size * 2, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, output_size),
            nn.ReLU()
        )
        
        self.manning_coeff = nn.Parameter(torch.tensor(0.035))
    
    def physics_component(self, rainfall, slope, area):
        
        runoff = rainfall * 0.7
        
        velocity = (1.0 / self.manning_coeff) * torch.pow(runoff, 0.67) * torch.sqrt(slope + 1e-8)
        
        discharge = velocity * area * runoff
        
        return discharge
    
    def forward(self, x, rainfall=None, slope=None, area=None):
        
        lstm_out, _ = self.data_driven(x)
        data_features = lstm_out[:, -1, :]
        
        physics_input = x[:, -1, :]
        physics_features = self.physics_branch(physics_input)
        
        combined = torch.cat([data_features, physics_features], dim=1)
        
        discharge = self.fusion_fc(combined)
        
        if rainfall is not None and slope is not None and area is not None:
            physics_discharge = self.physics_component(rainfall, slope, area)
            discharge = 0.7 * discharge + 0.3 * physics_discharge.unsqueeze(-1)
        
        return discharge


class MultiStepDischargePredictor(nn.Module):
    
    def __init__(
        self,
        input_size: int,
        hidden_size: int = 128,
        num_layers: int = 2,
        forecast_horizon: int = 7,
        dropout: float = 0.2
    ):
        super(MultiStepDischargePredictor, self).__init__()
        
        self.forecast_horizon = forecast_horizon
        
        self.encoder = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        self.decoder = nn.LSTM(
            input_size=1,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, 1),
            nn.ReLU()
        )
    
    def forward(self, x):
        
        _, (hidden, cell) = self.encoder(x)
        
        decoder_input = torch.zeros(x.size(0), 1, 1).to(x.device)
        
        predictions = []
        
        for _ in range(self.forecast_horizon):
            decoder_output, (hidden, cell) = self.decoder(decoder_input, (hidden, cell))
            
            prediction = self.fc(decoder_output)
            predictions.append(prediction)
            
            decoder_input = prediction
        
        predictions = torch.cat(predictions, dim=1)
        
        return predictions


def get_discharge_model(
    model_type: str = 'lstm',
    input_size: int = 5,
    hidden_size: int = 128,
    num_layers: int = 2,
    output_size: int = 1,
    dropout: float = 0.2,
    **kwargs
):
    
    if model_type == 'lstm':
        return RiverDischargePredictor(
            input_size, hidden_size, num_layers, output_size, dropout
        )
    
    elif model_type == 'hybrid':
        temporal_features = kwargs.get('temporal_features', input_size)
        spatial_features = kwargs.get('spatial_features', 10)
        return HybridDischargeModel(
            temporal_features, spatial_features, hidden_size, num_layers, output_size, dropout
        )
    
    elif model_type == 'physics_informed':
        return PhysicsInformedDischargeModel(
            input_size, hidden_size, num_layers, output_size, dropout
        )
    
    elif model_type == 'multi_step':
        forecast_horizon = kwargs.get('forecast_horizon', 7)
        return MultiStepDischargePredictor(
            input_size, hidden_size, num_layers, forecast_horizon, dropout
        )
    
    else:
        raise ValueError(f"Unknown model type: {model_type}")


if __name__ == "__main__":
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    batch_size = 16
    sequence_length = 30
    input_size = 5
    
    x = torch.randn(batch_size, sequence_length, input_size).to(device)
    
    print("Testing River Discharge LSTM:")
    lstm_model = RiverDischargePredictor(
        input_size=input_size,
        hidden_size=128,
        num_layers=2,
        output_size=1
    ).to(device)
    
    output, _ = lstm_model(x)
    print(f"  Input shape: {x.shape}")
    print(f"  Output shape: {output.shape}")
    print(f"  Parameters: {sum(p.numel() for p in lstm_model.parameters()):,}")
    
    print("\nTesting Hybrid Discharge Model:")
    temporal_input = torch.randn(batch_size, sequence_length, 3).to(device)
    spatial_input = torch.randn(batch_size, 10).to(device)
    
    hybrid_model = HybridDischargeModel(
        temporal_features=3,
        spatial_features=10,
        hidden_size=128
    ).to(device)
    
    output_hybrid = hybrid_model(temporal_input, spatial_input)
    print(f"  Temporal input shape: {temporal_input.shape}")
    print(f"  Spatial input shape: {spatial_input.shape}")
    print(f"  Output shape: {output_hybrid.shape}")
    print(f"  Parameters: {sum(p.numel() for p in hybrid_model.parameters()):,}")
    
    print("\nTesting Physics-Informed Model:")
    physics_model = PhysicsInformedDischargeModel(
        input_size=input_size,
        hidden_size=128
    ).to(device)
    
    rainfall = torch.randn(batch_size, 1).to(device)
    slope = torch.abs(torch.randn(batch_size, 1)).to(device)
    area = torch.abs(torch.randn(batch_size, 1)).to(device) * 1000
    
    output_physics = physics_model(x, rainfall, slope, area)
    print(f"  Output shape: {output_physics.shape}")
    print(f"  Manning coefficient: {physics_model.manning_coeff.item():.4f}")
    print(f"  Parameters: {sum(p.numel() for p in physics_model.parameters()):,}")
    
    print("\nTesting Multi-Step Discharge Predictor:")
    multistep_model = MultiStepDischargePredictor(
        input_size=input_size,
        hidden_size=128,
        forecast_horizon=7
    ).to(device)
    
    output_multistep = multistep_model(x)
    print(f"  Output shape (7-day forecast): {output_multistep.shape}")
    print(f"  Parameters: {sum(p.numel() for p in multistep_model.parameters()):,}")
