import sys
from pathlib import Path
from loguru import logger
from utils.config_loader import config


def setup_logging():
    log_path = config.logs_path
    log_path.mkdir(parents=True, exist_ok=True)
    
    logger.remove()
    
    logger.add(
        sys.stderr,
        format=config.get('logging.format'),
        level=config.get('logging.level', 'INFO'),
        colorize=True
    )
    
    logger.add(
        log_path / "ml_service_{time}.log",
        rotation=config.get('logging.rotation', '500 MB'),
        retention=config.get('logging.retention', '10 days'),
        level=config.get('logging.level', 'INFO'),
        format=config.get('logging.format')
    )
    
    logger.info(f"Logging initialized for {config.app_name} v{config.app_version}")


def get_logger(name: str):
    return logger.bind(name=name)
