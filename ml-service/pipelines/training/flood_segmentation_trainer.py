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

from models.flood.flood_segmentation_model import get_flood_segmentation_model
from utils.logger import get_logger
from utils.config_loader import config

logger = get_logger(__name__)


class FloodSegmentationDataset(Dataset):
    
    def __init__(
        self,
        images: np.ndarray,
        masks: np.ndarray,
        transform=None
    ):
        self.images = images
        self.masks = masks
        self.transform = transform
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        image = self.images[idx]
        mask = self.masks[idx]
        
        if image.ndim == 2:
            image = np.expand_dims(image, axis=0)
        elif image.ndim == 3 and image.shape[2] < image.shape[0]:
            image = np.transpose(image, (2, 0, 1))
        
        if mask.ndim == 2:
            mask = np.expand_dims(mask, axis=0)
        
        image = torch.FloatTensor(image)
        mask = torch.FloatTensor(mask)
        
        if self.transform:
            image, mask = self.transform(image, mask)
        
        return image, mask


class DiceLoss(nn.Module):
    
    def __init__(self, smooth=1e-6):
        super(DiceLoss, self).__init__()
        self.smooth = smooth
    
    def forward(self, predictions, targets):
        predictions = predictions.contiguous()
        targets = targets.contiguous()
        
        intersection = (predictions * targets).sum(dim=(2, 3))
        dice = (2. * intersection + self.smooth) / (
            predictions.sum(dim=(2, 3)) + targets.sum(dim=(2, 3)) + self.smooth
        )
        
        return 1 - dice.mean()


class CombinedLoss(nn.Module):
    
    def __init__(self, dice_weight=0.5, bce_weight=0.5):
        super(CombinedLoss, self).__init__()
        self.dice_loss = DiceLoss()
        self.bce_loss = nn.BCELoss()
        self.dice_weight = dice_weight
        self.bce_weight = bce_weight
    
    def forward(self, predictions, targets):
        dice = self.dice_loss(predictions, targets)
        bce = self.bce_loss(predictions, targets)
        return self.dice_weight * dice + self.bce_weight * bce


class FloodSegmentationTrainer:
    
    def __init__(
        self,
        model_type: str = 'unet',
        in_channels: int = 4,
        out_channels: int = 1,
        learning_rate: float = 0.001,
        device: Optional[str] = None
    ):
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)
        
        self.model = get_flood_segmentation_model(
            model_type=model_type,
            in_channels=in_channels,
            out_channels=out_channels
        ).to(self.device)
        
        self.criterion = CombinedLoss(dice_weight=0.5, bce_weight=0.5)
        self.optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode='min', factor=0.5, patience=5, verbose=True
        )
        
        self.train_losses = []
        self.val_losses = []
        
        logger.info(f"Initialized FloodSegmentationTrainer on {self.device}")
        logger.info(f"Model: {model_type}, Parameters: {sum(p.numel() for p in self.model.parameters()):,}")
    
    def train_epoch(self, train_loader: DataLoader) -> float:
        
        self.model.train()
        epoch_loss = 0.0
        
        pbar = tqdm(train_loader, desc='Training')
        for images, masks in pbar:
            images = images.to(self.device)
            masks = masks.to(self.device)
            
            self.optimizer.zero_grad()
            
            outputs = self.model(images)
            loss = self.criterion(outputs, masks)
            
            loss.backward()
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
            for images, masks in tqdm(val_loader, desc='Validating'):
                images = images.to(self.device)
                masks = masks.to(self.device)
                
                outputs = self.model(images)
                loss = self.criterion(outputs, masks)
                
                val_loss += loss.item()
                
                all_predictions.append(outputs.cpu().numpy())
                all_targets.append(masks.cpu().numpy())
        
        all_predictions = np.concatenate(all_predictions, axis=0)
        all_targets = np.concatenate(all_targets, axis=0)
        
        metrics = self.calculate_metrics(all_predictions, all_targets)
        
        return val_loss / len(val_loader), metrics
    
    def calculate_metrics(
        self,
        predictions: np.ndarray,
        targets: np.ndarray,
        threshold: float = 0.5
    ) -> Dict[str, float]:
        
        pred_binary = (predictions > threshold).astype(np.float32)
        
        intersection = (pred_binary * targets).sum()
        union = pred_binary.sum() + targets.sum() - intersection
        iou = (intersection + 1e-6) / (union + 1e-6)
        
        dice = (2 * intersection + 1e-6) / (pred_binary.sum() + targets.sum() + 1e-6)
        
        tp = (pred_binary * targets).sum()
        fp = (pred_binary * (1 - targets)).sum()
        fn = ((1 - pred_binary) * targets).sum()
        
        precision = (tp + 1e-6) / (tp + fp + 1e-6)
        recall = (tp + 1e-6) / (tp + fn + 1e-6)
        f1 = 2 * (precision * recall) / (precision + recall + 1e-6)
        
        return {
            'iou': float(iou),
            'dice': float(dice),
            'precision': float(precision),
            'recall': float(recall),
            'f1': float(f1)
        }
    
    def train(
        self,
        train_loader: DataLoader,
        val_loader: DataLoader,
        epochs: int = 50,
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
            logger.info(f"Metrics - IoU: {metrics['iou']:.4f}, Dice: {metrics['dice']:.4f}, "
                       f"F1: {metrics['f1']:.4f}, Precision: {metrics['precision']:.4f}, Recall: {metrics['recall']:.4f}")
            
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                best_metrics = metrics
                
                if save_dir:
                    self.save_checkpoint(save_dir / 'best_model.pt', epoch, metrics)
                    logger.info(f"  ✓ Saved best model (val_loss: {val_loss:.4f})")
            
            if save_dir and (epoch + 1) % 10 == 0:
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
    batch_size = 8
    num_samples = 100
    image_size = 256
    
    train_images = np.random.rand(num_samples, image_size, image_size, 4).astype(np.float32)
    train_masks = (np.random.rand(num_samples, image_size, image_size) > 0.7).astype(np.float32)
    
    val_images = np.random.rand(20, image_size, image_size, 4).astype(np.float32)
    val_masks = (np.random.rand(20, image_size, image_size) > 0.7).astype(np.float32)
    
    train_dataset = FloodSegmentationDataset(train_images, train_masks)
    val_dataset = FloodSegmentationDataset(val_images, val_masks)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    trainer = FloodSegmentationTrainer(
        model_type='unet',
        in_channels=4,
        out_channels=1,
        learning_rate=0.001
    )
    
    results = trainer.train(
        train_loader=train_loader,
        val_loader=val_loader,
        epochs=5,
        save_dir=Path('models/checkpoints/flood_segmentation')
    )
    
    print("\nTraining completed!")
    print(f"Final metrics: {results['best_metrics']}")
