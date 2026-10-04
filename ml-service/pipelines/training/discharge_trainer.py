import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Tuple
from tqdm import tqdm
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from models.flood.river_discharge_model import get_discharge_model
from utils.logger import get_logger

logger = get_logger(__name__)


class DischargeDataset(Dataset):
    
    def __init__(
        self,
        temporal_sequences: np.ndarray,
        targets: np.ndarray,
        spatial_features: Optional[np.ndarray] = None
    ):
        self.temporal_sequences = torch.FloatTensor(temporal_sequences)
        self.targets = torch.FloatTensor(targets)
        self.spatial_features = torch.FloatTensor(spatial_features) if spatial_features is not None else None
    
    def __len__(self):
        return len(self.temporal_sequences)
    
    def __getitem__(self, idx):
        if self.spatial_features is not None:
            return self.temporal_sequences[idx], self.spatial_features[idx], self.targets[idx]
        return self.temporal_sequences[idx], self.targets[idx]


class DischargeTrainer:
    
    def __init__(
        self,
        model_type: str = 'lstm',
        input_size: int = 5,
        hidden_size: int = 128,
        num_layers: int = 2,
        output_size: int = 1,
        learning_rate: float = 0.001,
        device: Optional[str] = None,
        **kwargs
    ):
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)
        
        self.model_type = model_type
        self.model = get_discharge_model(
            model_type=model_type,
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            output_size=output_size,
            **kwargs
        ).to(self.device)
        
        self.criterion = nn.MSELoss()
        self.optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode='min', factor=0.5, patience=5, verbose=True
        )
        
        self.train_losses = []
        self.val_losses = []
        
        logger.info(f"Initialized DischargeTrainer on {self.device}")
        logger.info(f"Model: {model_type}, Parameters: {sum(p.numel() for p in self.model.parameters()):,}")
    
    def train_epoch(self, train_loader: DataLoader) -> float:
        
        self.model.train()
        epoch_loss = 0.0
        
        pbar = tqdm(train_loader, desc='Training')
        for batch in pbar:
            if len(batch) == 3:
                temporal, spatial, targets = batch
                temporal = temporal.to(self.device)
                spatial = spatial.to(self.device)
                targets = targets.to(self.device)
            else:
                temporal, targets = batch
                temporal = temporal.to(self.device)
                targets = targets.to(self.device)
                spatial = None
            
            self.optimizer.zero_grad()
            
            if self.model_type == 'hybrid':
                outputs = self.model(temporal, spatial)
            elif self.model_type == 'physics_informed':
                outputs = self.model(temporal)
            elif self.model_type == 'multi_step':
                outputs = self.model(temporal)
            else:
                outputs, _ = self.model(temporal)
            
            if outputs.dim() > targets.dim():
                outputs = outputs.squeeze(-1)
            if targets.dim() == 1:
                targets = targets.unsqueeze(-1)
            
            loss = self.criterion(outputs, targets)
            
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            self.optimizer.step()
            
            epoch_loss += loss.item()
            pbar.set_postfix({'loss': loss.item()})
        
        return epoch_loss / len(train_loader)
    
    def validate(self, val_loader: DataLoader) -> Tuple[float, Dict[str, float]]:
        
        self.model.eval()
        val_loss = 0.0
        
        all_predictions = []
        all_targets = []
        
        with torch.no_grad():
            for batch in tqdm(val_loader, desc='Validating'):
                if len(batch) == 3:
                    temporal, spatial, targets = batch
                    temporal = temporal.to(self.device)
                    spatial = spatial.to(self.device)
                    targets = targets.to(self.device)
                else:
                    temporal, targets = batch
                    temporal = temporal.to(self.device)
                    targets = targets.to(self.device)
                    spatial = None
                
                if self.model_type == 'hybrid':
                    outputs = self.model(temporal, spatial)
                elif self.model_type == 'physics_informed':
                    outputs = self.model(temporal)
                elif self.model_type == 'multi_step':
                    outputs = self.model(temporal)
                else:
                    outputs, _ = self.model(temporal)
                
                if outputs.dim() > targets.dim():
                    outputs = outputs.squeeze(-1)
                if targets.dim() == 1:
                    targets = targets.unsqueeze(-1)
                
                loss = self.criterion(outputs, targets)
                val_loss += loss.item()
                
                all_predictions.append(outputs.cpu().numpy())
                all_targets.append(targets.cpu().numpy())
        
        all_predictions = np.concatenate(all_predictions, axis=0)
        all_targets = np.concatenate(all_targets, axis=0)
        
        metrics = self.calculate_metrics(all_predictions, all_targets)
        
        return val_loss / len(val_loader), metrics
    
    def calculate_metrics(
        self,
        predictions: np.ndarray,
        targets: np.ndarray
    ) -> Dict[str, float]:
        
        mae = np.mean(np.abs(predictions - targets))
        
        mse = np.mean((predictions - targets) ** 2)
        rmse = np.sqrt(mse)
        
        ss_res = np.sum((targets - predictions) ** 2)
        ss_tot = np.sum((targets - np.mean(targets)) ** 2)
        r2 = 1 - (ss_res / (ss_tot + 1e-8))
        
        mape = np.mean(np.abs((targets - predictions) / (targets + 1e-8))) * 100
        
        nash_sutcliffe = 1 - (ss_res / (ss_tot + 1e-8))
        
        return {
            'mae': float(mae),
            'rmse': float(rmse),
            'r2': float(r2),
            'mape': float(mape),
            'nse': float(nash_sutcliffe)
        }
    
    def train(
        self,
        train_loader: DataLoader,
        val_loader: DataLoader,
        epochs: int = 100,
        save_dir: Optional[Path] = None
    ) -> Dict[str, list]:
        
        if save_dir:
            save_dir = Path(save_dir)
            save_dir.mkdir(parents=True, exist_ok=True)
        
        best_val_loss = float('inf')
        best_metrics = {}
        
        logger.info(f"Starting training for {epochs} epochs...")
        
        for epoch in range(epochs):
            logger.info(f"\nEpoch {epoch + 1}/{epochs}")
            
            train_loss = self.train_epoch(train_loader)
            self.train_losses.append(train_loss)
            
            val_loss, metrics = self.validate(val_loader)
            self.val_losses.append(val_loss)
            
            self.scheduler.step(val_loss)
            
            logger.info(f"Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
            logger.info(f"Metrics - MAE: {metrics['mae']:.4f}, RMSE: {metrics['rmse']:.4f}, "
                       f"R²: {metrics['r2']:.4f}, NSE: {metrics['nse']:.4f}, MAPE: {metrics['mape']:.2f}%")
            
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                best_metrics = metrics
                
                if save_dir:
                    self.save_checkpoint(save_dir / 'best_model.pt', epoch, metrics)
                    logger.info(f"  ✓ Saved best model (val_loss: {val_loss:.4f})")
            
            if save_dir and (epoch + 1) % 20 == 0:
                self.save_checkpoint(save_dir / f'checkpoint_epoch_{epoch+1}.pt', epoch, metrics)
        
        logger.info(f"\nTraining completed!")
        logger.info(f"Best validation loss: {best_val_loss:.4f}")
        logger.info(f"Best metrics: {best_metrics}")
        
        return {
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'best_metrics': best_metrics
        }
    
    def save_checkpoint(self, path: Path, epoch: int, metrics: Dict[str, float]):
        
        torch.save({
            'epoch': epoch,
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'scheduler_state_dict': self.scheduler.state_dict(),
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'metrics': metrics
        }, path)
    
    def load_checkpoint(self, path: Path):
        
        checkpoint = torch.load(path, map_location=self.device)
        
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
        self.train_losses = checkpoint.get('train_losses', [])
        self.val_losses = checkpoint.get('val_losses', [])
        
        logger.info(f"Loaded checkpoint from {path}")
        logger.info(f"Epoch: {checkpoint['epoch']}, Metrics: {checkpoint.get('metrics', {})}")


if __name__ == "__main__":
    batch_size = 32
    num_samples = 1000
    sequence_length = 30
    input_size = 5
    
    train_temporal = np.random.randn(num_samples, sequence_length, input_size).astype(np.float32)
    train_targets = np.abs(np.random.randn(num_samples, 1).astype(np.float32)) * 100
    
    val_temporal = np.random.randn(200, sequence_length, input_size).astype(np.float32)
    val_targets = np.abs(np.random.randn(200, 1).astype(np.float32)) * 100
    
    train_dataset = DischargeDataset(train_temporal, train_targets)
    val_dataset = DischargeDataset(val_temporal, val_targets)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    trainer = DischargeTrainer(
        model_type='lstm',
        input_size=input_size,
        hidden_size=128,
        num_layers=2,
        output_size=1,
        learning_rate=0.001
    )
    
    results = trainer.train(
        train_loader=train_loader,
        val_loader=val_loader,
        epochs=10,
        save_dir=Path('models/checkpoints/discharge_prediction')
    )
    
    print("\nTraining completed!")
    print(f"Final metrics: {results['best_metrics']}")
