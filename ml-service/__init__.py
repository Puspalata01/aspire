from utils.config_loader import config
from utils.logger import setup_logging, get_logger

__version__ = "0.1.0"

setup_logging()
logger = get_logger(__name__)

config.ensure_directories()

logger.info(f"ML Service initialized - Version {__version__}")
