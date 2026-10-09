import yaml
import os
from pathlib import Path
from typing import Any, Dict
from loguru import logger


class Config:
    _instance = None
    _config = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Config, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._config is None:
            self.load_config()

    def load_config(self, config_path: str = None):
        if config_path is None:
            config_path = Path(__file__).parent.parent / "config" / "config.yaml"
        
        try:
            with open(config_path, 'r') as f:
                self._config = yaml.safe_load(f)
            logger.info(f"Configuration loaded from {config_path}")
        except FileNotFoundError:
            logger.error(f"Config file not found at {config_path}")
            raise
        except yaml.YAMLError as e:
            logger.error(f"Error parsing config file: {e}")
            raise

    def get(self, key: str, default: Any = None) -> Any:
        keys = key.split('.')
        value = self._config
        
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
                if value is None:
                    return default
            else:
                return default
        
        return value

    def set(self, key: str, value: Any):
        keys = key.split('.')
        config = self._config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value

    @property
    def app_name(self) -> str:
        return self.get('app.name', 'ML Service')

    @property
    def app_version(self) -> str:
        return self.get('app.version', '0.1.0')

    @property
    def environment(self) -> str:
        return self.get('app.environment', 'development')

    @property
    def debug(self) -> bool:
        return self.get('app.debug', False)

    @property
    def data_root(self) -> Path:
        return Path(self.get('paths.data_root', './data'))

    @property
    def models_path(self) -> Path:
        return Path(self.get('paths.models', './models'))

    @property
    def logs_path(self) -> Path:
        return Path(self.get('paths.logs', './logs'))

    def ensure_directories(self):
        paths = [
            self.get('paths.data_root'),
            self.get('paths.raw_data'),
            self.get('paths.processed_data'),
            self.get('paths.sample_data'),
            self.get('paths.models'),
            self.get('paths.logs'),
            self.get('paths.checkpoints'),
        ]
        
        for path in paths:
            Path(path).mkdir(parents=True, exist_ok=True)
        
        logger.info("All required directories ensured")


config = Config()
