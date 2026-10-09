import torch
import torch.nn as nn
from typing import Optional, Tuple


class PrecipitationLSTM(nn.Module):
    
    def __init__(
        self,
        input_size: int,
        hidden_size: int = 128,
        num_layers: int = 2,
        output_size: int = 1,
        dropout: float = 0.2,
        bidirectional: bool = False
    ):
        super(PrecipitationLSTM, self).__init__()
        
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.output_size = output_size
        self.bidirectional = bidirectional
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
            bidirectional=bidirectional
        )
        
        lstm_output_size = hidden_size * 2 if bidirectional else hidden_size
        
        self.fc = nn.Sequential(
            nn.Linear(lstm_output_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, output_size)
        )
    
    def forward(self, x, hidden=None):
        
        lstm_out, hidden = self.lstm(x, hidden)
        
        out = self.fc(lstm_out[:, -1, :])
        
        return out, hidden
    
    def predict_sequence(self, x, forecast_horizon: int):
        
        predictions = []
        hidden = None
        
        current_input = x
        
        for _ in range(forecast_horizon):
            pred, hidden = self.forward(current_input, hidden)
            predictions.append(pred)
            
            new_input = pred.unsqueeze(1)
            if current_input.size(1) > 1:
                current_input = torch.cat([current_input[:, 1:, :], new_input], dim=1)
            else:
                current_input = new_input
        
        return torch.stack(predictions, dim=1)


class PrecipitationGRU(nn.Module):
    
    def __init__(
        self,
        input_size: int,
        hidden_size: int = 128,
        num_layers: int = 2,
        output_size: int = 1,
        dropout: float = 0.2
    ):
        super(PrecipitationGRU, self).__init__()
        
        self.gru = nn.GRU(
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
            nn.Linear(hidden_size, output_size)
        )
    
    def forward(self, x, hidden=None):
        gru_out, hidden = self.gru(x, hidden)
        out = self.fc(gru_out[:, -1, :])
        return out, hidden


class AttentionLayer(nn.Module):
    
    def __init__(self, hidden_size: int):
        super(AttentionLayer, self).__init__()
        self.attention = nn.Linear(hidden_size, 1)
    
    def forward(self, lstm_output):
        
        attention_weights = torch.softmax(self.attention(lstm_output), dim=1)
        
        context = torch.sum(attention_weights * lstm_output, dim=1)
        
        return context, attention_weights


class PrecipitationLSTMWithAttention(nn.Module):
    
    def __init__(
        self,
        input_size: int,
        hidden_size: int = 128,
        num_layers: int = 2,
        output_size: int = 1,
        dropout: float = 0.2
    ):
        super(PrecipitationLSTMWithAttention, self).__init__()
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        self.attention = AttentionLayer(hidden_size)
        
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, output_size)
        )
    
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        
        context, attention_weights = self.attention(lstm_out)
        
        out = self.fc(context)
        
        return out, attention_weights


class Seq2SeqLSTM(nn.Module):
    
    def __init__(
        self,
        input_size: int,
        hidden_size: int = 128,
        num_layers: int = 2,
        output_size: int = 1,
        forecast_horizon: int = 7,
        dropout: float = 0.2
    ):
        super(Seq2SeqLSTM, self).__init__()
        
        self.encoder = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        self.decoder = nn.LSTM(
            input_size=output_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        self.fc = nn.Linear(hidden_size, output_size)
        self.forecast_horizon = forecast_horizon
    
    def forward(self, x, target_seq=None, teacher_forcing_ratio=0.5):
        
        batch_size = x.size(0)
        
        _, (hidden, cell) = self.encoder(x)
        
        decoder_input = torch.zeros(batch_size, 1, 1).to(x.device)
        
        outputs = []
        
        for t in range(self.forecast_horizon):
            decoder_output, (hidden, cell) = self.decoder(decoder_input, (hidden, cell))
            
            prediction = self.fc(decoder_output)
            outputs.append(prediction)
            
            if target_seq is not None and torch.rand(1).item() < teacher_forcing_ratio:
                decoder_input = target_seq[:, t:t+1, :]
            else:
                decoder_input = prediction
        
        outputs = torch.cat(outputs, dim=1)
        
        return outputs


def get_precipitation_model(
    model_type: str = 'lstm',
    input_size: int = 1,
    hidden_size: int = 128,
    num_layers: int = 2,
    output_size: int = 1,
    dropout: float = 0.2,
    **kwargs
):
    
    if model_type == 'lstm':
        return PrecipitationLSTM(
            input_size, hidden_size, num_layers, output_size, dropout
        )
    elif model_type == 'gru':
        return PrecipitationGRU(
            input_size, hidden_size, num_layers, output_size, dropout
        )
    elif model_type == 'lstm_attention':
        return PrecipitationLSTMWithAttention(
            input_size, hidden_size, num_layers, output_size, dropout
        )
    elif model_type == 'seq2seq':
        forecast_horizon = kwargs.get('forecast_horizon', 7)
        return Seq2SeqLSTM(
            input_size, hidden_size, num_layers, output_size, forecast_horizon, dropout
        )
    else:
        raise ValueError(f"Unknown model type: {model_type}")


if __name__ == "__main__":
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    batch_size = 16
    sequence_length = 30
    input_size = 5
    
    x = torch.randn(batch_size, sequence_length, input_size).to(device)
    
    print("Testing LSTM Model:")
    lstm_model = PrecipitationLSTM(
        input_size=input_size,
        hidden_size=128,
        num_layers=2,
        output_size=1
    ).to(device)
    
    output, _ = lstm_model(x)
    print(f"  Input shape: {x.shape}")
    print(f"  Output shape: {output.shape}")
    print(f"  Parameters: {sum(p.numel() for p in lstm_model.parameters()):,}")
    
    print("\nTesting Multi-step Forecast:")
    forecast = lstm_model.predict_sequence(x, forecast_horizon=7)
    print(f"  Forecast shape: {forecast.shape}")
    
    print("\nTesting LSTM with Attention:")
    attention_model = PrecipitationLSTMWithAttention(
        input_size=input_size,
        hidden_size=128,
        num_layers=2,
        output_size=1
    ).to(device)
    
    output_att, attention_weights = attention_model(x)
    print(f"  Output shape: {output_att.shape}")
    print(f"  Attention weights shape: {attention_weights.shape}")
    print(f"  Parameters: {sum(p.numel() for p in attention_model.parameters()):,}")
    
    print("\nTesting Seq2Seq LSTM:")
    seq2seq_model = Seq2SeqLSTM(
        input_size=input_size,
        hidden_size=128,
        num_layers=2,
        output_size=1,
        forecast_horizon=7
    ).to(device)
    
    output_seq2seq = seq2seq_model(x)
    print(f"  Output shape: {output_seq2seq.shape}")
    print(f"  Parameters: {sum(p.numel() for p in seq2seq_model.parameters()):,}")
