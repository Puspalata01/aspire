import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional


class UNet(nn.Module):
    
    def __init__(
        self,
        in_channels: int = 3,
        out_channels: int = 1,
        features: list = [64, 128, 256, 512],
        dropout: float = 0.2
    ):
        super(UNet, self).__init__()
        
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.features = features
        
        self.encoder_blocks = nn.ModuleList()
        self.decoder_blocks = nn.ModuleList()
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        
        in_ch = in_channels
        for feature in features:
            self.encoder_blocks.append(
                self._conv_block(in_ch, feature, dropout=dropout)
            )
            in_ch = feature
        
        self.bottleneck = self._conv_block(
            features[-1], features[-1] * 2, dropout=dropout
        )
        
        for feature in reversed(features):
            self.decoder_blocks.append(
                nn.ConvTranspose2d(
                    feature * 2, feature, kernel_size=2, stride=2
                )
            )
            self.decoder_blocks.append(
                self._conv_block(feature * 2, feature, dropout=dropout)
            )
        
        self.final_conv = nn.Conv2d(features[0], out_channels, kernel_size=1)
    
    def _conv_block(self, in_channels, out_channels, dropout=0.2):
        return nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Dropout2d(dropout),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )
    
    def forward(self, x):
        skip_connections = []
        
        for encoder in self.encoder_blocks:
            x = encoder(x)
            skip_connections.append(x)
            x = self.pool(x)
        
        x = self.bottleneck(x)
        
        skip_connections = skip_connections[::-1]
        
        for idx in range(0, len(self.decoder_blocks), 2):
            x = self.decoder_blocks[idx](x)
            skip = skip_connections[idx // 2]
            
            if x.shape != skip.shape:
                x = F.interpolate(x, size=skip.shape[2:], mode='bilinear', align_corners=True)
            
            x = torch.cat([skip, x], dim=1)
            x = self.decoder_blocks[idx + 1](x)
        
        return torch.sigmoid(self.final_conv(x))


class AttentionUNet(nn.Module):
    
    def __init__(
        self,
        in_channels: int = 3,
        out_channels: int = 1,
        features: list = [64, 128, 256, 512]
    ):
        super(AttentionUNet, self).__init__()
        
        self.encoder_blocks = nn.ModuleList()
        self.decoder_blocks = nn.ModuleList()
        self.attention_blocks = nn.ModuleList()
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        
        in_ch = in_channels
        for feature in features:
            self.encoder_blocks.append(self._conv_block(in_ch, feature))
            in_ch = feature
        
        self.bottleneck = self._conv_block(features[-1], features[-1] * 2)
        
        for feature in reversed(features):
            self.attention_blocks.append(
                self._attention_block(feature * 2, feature, feature)
            )
            
            self.decoder_blocks.append(
                nn.ConvTranspose2d(feature * 2, feature, kernel_size=2, stride=2)
            )
            self.decoder_blocks.append(
                self._conv_block(feature * 2, feature)
            )
        
        self.final_conv = nn.Conv2d(features[0], out_channels, kernel_size=1)
    
    def _conv_block(self, in_channels, out_channels):
        return nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )
    
    def _attention_block(self, F_g, F_l, F_int):
        return nn.Sequential(
            nn.Conv2d(F_g, F_int, kernel_size=1, stride=1, padding=0, bias=True),
            nn.Conv2d(F_l, F_int, kernel_size=1, stride=1, padding=0, bias=True),
            nn.ReLU(inplace=True),
            nn.Conv2d(F_int, 1, kernel_size=1, stride=1, padding=0, bias=True),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        skip_connections = []
        
        for encoder in self.encoder_blocks:
            x = encoder(x)
            skip_connections.append(x)
            x = self.pool(x)
        
        x = self.bottleneck(x)
        skip_connections = skip_connections[::-1]
        
        for idx in range(0, len(self.decoder_blocks), 2):
            x = self.decoder_blocks[idx](x)
            skip = skip_connections[idx // 2]
            
            if x.shape != skip.shape:
                x = F.interpolate(x, size=skip.shape[2:], mode='bilinear', align_corners=True)
            
            x = torch.cat([skip, x], dim=1)
            x = self.decoder_blocks[idx + 1](x)
        
        return torch.sigmoid(self.final_conv(x))


def get_flood_segmentation_model(
    model_type: str = 'unet',
    in_channels: int = 3,
    out_channels: int = 1,
    features: Optional[list] = None
):
    
    if features is None:
        features = [64, 128, 256, 512]
    
    if model_type == 'unet':
        return UNet(in_channels, out_channels, features)
    elif model_type == 'attention_unet':
        return AttentionUNet(in_channels, out_channels, features)
    else:
        raise ValueError(f"Unknown model type: {model_type}")


if __name__ == "__main__":
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    model = UNet(in_channels=4, out_channels=1, features=[64, 128, 256, 512])
    model = model.to(device)
    
    x = torch.randn(2, 4, 256, 256).to(device)
    
    output = model(x)
    
    print(f"Input shape: {x.shape}")
    print(f"Output shape: {output.shape}")
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    attention_model = AttentionUNet(in_channels=4, out_channels=1)
    attention_model = attention_model.to(device)
    output_att = attention_model(x)
    print(f"\nAttention U-Net output shape: {output_att.shape}")
    print(f"Attention U-Net parameters: {sum(p.numel() for p in attention_model.parameters()):,}")
