import numpy as np
import cv2
from typing import Tuple, Optional, Union, List
from pathlib import Path
from utils.logger import get_logger

logger = get_logger(__name__)


class ImagePreprocessor:
    
    def __init__(self, target_size: Tuple[int, int] = (256, 256)):
        self.target_size = target_size
        logger.info(f"Initialized ImagePreprocessor with target size: {target_size}")
    
    def resize(
        self,
        image: np.ndarray,
        size: Optional[Tuple[int, int]] = None,
        method: str = 'bilinear'
    ) -> np.ndarray:
        
        if size is None:
            size = self.target_size
        
        interpolation_methods = {
            'nearest': cv2.INTER_NEAREST,
            'bilinear': cv2.INTER_LINEAR,
            'cubic': cv2.INTER_CUBIC,
            'lanczos': cv2.INTER_LANCZOS4
        }
        
        interp = interpolation_methods.get(method, cv2.INTER_LINEAR)
        
        resized = cv2.resize(image, size, interpolation=interp)
        
        logger.debug(f"Resized image from {image.shape} to {resized.shape}")
        
        return resized
    
    def normalize(
        self,
        image: np.ndarray,
        method: str = 'standard'
    ) -> np.ndarray:
        
        image = image.astype(np.float32)
        
        if method == 'standard':
            normalized = (image - image.mean()) / (image.std() + 1e-8)
        
        elif method == 'minmax':
            min_val = image.min()
            max_val = image.max()
            normalized = (image - min_val) / (max_val - min_val + 1e-8)
        
        elif method == '0_1':
            normalized = image / 255.0
        
        elif method == 'imagenet':
            mean = np.array([0.485, 0.456, 0.406])
            std = np.array([0.229, 0.224, 0.225])
            if image.ndim == 3 and image.shape[2] == 3:
                normalized = (image / 255.0 - mean) / std
            else:
                normalized = (image - image.mean()) / (image.std() + 1e-8)
        
        else:
            raise ValueError(f"Unknown normalization method: {method}")
        
        return normalized
    
    def augment(
        self,
        image: np.ndarray,
        horizontal_flip: bool = False,
        vertical_flip: bool = False,
        rotate: Optional[float] = None,
        brightness: Optional[float] = None,
        contrast: Optional[float] = None,
        noise: Optional[float] = None
    ) -> np.ndarray:
        
        augmented = image.copy()
        
        if horizontal_flip and np.random.rand() > 0.5:
            augmented = cv2.flip(augmented, 1)
        
        if vertical_flip and np.random.rand() > 0.5:
            augmented = cv2.flip(augmented, 0)
        
        if rotate is not None:
            angle = np.random.uniform(-rotate, rotate)
            h, w = augmented.shape[:2]
            center = (w // 2, h // 2)
            matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            augmented = cv2.warpAffine(augmented, matrix, (w, h))
        
        if brightness is not None:
            beta = np.random.uniform(-brightness, brightness)
            augmented = cv2.convertScaleAbs(augmented, alpha=1.0, beta=beta)
        
        if contrast is not None:
            alpha = np.random.uniform(1.0 - contrast, 1.0 + contrast)
            augmented = cv2.convertScaleAbs(augmented, alpha=alpha, beta=0)
        
        if noise is not None:
            noise_array = np.random.randn(*augmented.shape) * noise
            augmented = augmented + noise_array
            augmented = np.clip(augmented, 0, 255).astype(augmented.dtype)
        
        return augmented
    
    def crop(
        self,
        image: np.ndarray,
        crop_size: Tuple[int, int],
        position: str = 'center'
    ) -> np.ndarray:
        
        h, w = image.shape[:2]
        crop_h, crop_w = crop_size
        
        if position == 'center':
            start_h = (h - crop_h) // 2
            start_w = (w - crop_w) // 2
        elif position == 'random':
            start_h = np.random.randint(0, max(1, h - crop_h))
            start_w = np.random.randint(0, max(1, w - crop_w))
        elif position == 'top_left':
            start_h, start_w = 0, 0
        else:
            start_h = (h - crop_h) // 2
            start_w = (w - crop_w) // 2
        
        end_h = start_h + crop_h
        end_w = start_w + crop_w
        
        cropped = image[start_h:end_h, start_w:end_w]
        
        return cropped
    
    def pad(
        self,
        image: np.ndarray,
        target_size: Tuple[int, int],
        pad_value: float = 0
    ) -> np.ndarray:
        
        h, w = image.shape[:2]
        target_h, target_w = target_size
        
        pad_h = max(0, target_h - h)
        pad_w = max(0, target_w - w)
        
        top = pad_h // 2
        bottom = pad_h - top
        left = pad_w // 2
        right = pad_w - left
        
        if image.ndim == 2:
            padded = cv2.copyMakeBorder(
                image, top, bottom, left, right,
                cv2.BORDER_CONSTANT, value=pad_value
            )
        else:
            padded = cv2.copyMakeBorder(
                image, top, bottom, left, right,
                cv2.BORDER_CONSTANT, value=[pad_value] * image.shape[2]
            )
        
        return padded
    
    def denoise(
        self,
        image: np.ndarray,
        method: str = 'gaussian',
        strength: int = 5
    ) -> np.ndarray:
        
        if method == 'gaussian':
            denoised = cv2.GaussianBlur(image, (strength, strength), 0)
        
        elif method == 'median':
            denoised = cv2.medianBlur(image, strength)
        
        elif method == 'bilateral':
            denoised = cv2.bilateralFilter(image, strength, 75, 75)
        
        elif method == 'nlm':
            if image.ndim == 2:
                denoised = cv2.fastNlMeansDenoising(image, None, strength, 7, 21)
            else:
                denoised = cv2.fastNlMeansDenoisingColored(image, None, strength, strength, 7, 21)
        
        else:
            denoised = image
        
        logger.debug(f"Denoised image using {method} method")
        
        return denoised
    
    def create_patches(
        self,
        image: np.ndarray,
        patch_size: Tuple[int, int],
        stride: Optional[Tuple[int, int]] = None,
        drop_last: bool = False
    ) -> List[np.ndarray]:
        
        if stride is None:
            stride = patch_size
        
        h, w = image.shape[:2]
        patch_h, patch_w = patch_size
        stride_h, stride_w = stride
        
        patches = []
        
        for i in range(0, h - patch_h + 1, stride_h):
            for j in range(0, w - patch_w + 1, stride_w):
                patch = image[i:i+patch_h, j:j+patch_w]
                patches.append(patch)
        
        if not drop_last:
            if (h - patch_h) % stride_h != 0:
                for j in range(0, w - patch_w + 1, stride_w):
                    patch = image[h-patch_h:h, j:j+patch_w]
                    patches.append(patch)
            
            if (w - patch_w) % stride_w != 0:
                for i in range(0, h - patch_h + 1, stride_h):
                    patch = image[i:i+patch_h, w-patch_w:w]
                    patches.append(patch)
        
        logger.info(f"Created {len(patches)} patches of size {patch_size}")
        
        return patches
    
    def reconstruct_from_patches(
        self,
        patches: List[np.ndarray],
        original_size: Tuple[int, int],
        patch_size: Tuple[int, int],
        stride: Optional[Tuple[int, int]] = None,
        method: str = 'average'
    ) -> np.ndarray:
        
        if stride is None:
            stride = patch_size
        
        h, w = original_size
        patch_h, patch_w = patch_size
        stride_h, stride_w = stride
        
        if patches[0].ndim == 2:
            reconstructed = np.zeros((h, w))
            counts = np.zeros((h, w))
        else:
            reconstructed = np.zeros((h, w, patches[0].shape[2]))
            counts = np.zeros((h, w, patches[0].shape[2]))
        
        patch_idx = 0
        for i in range(0, h - patch_h + 1, stride_h):
            for j in range(0, w - patch_w + 1, stride_w):
                if patch_idx < len(patches):
                    reconstructed[i:i+patch_h, j:j+patch_w] += patches[patch_idx]
                    counts[i:i+patch_h, j:j+patch_w] += 1
                    patch_idx += 1
        
        counts[counts == 0] = 1
        reconstructed = reconstructed / counts
        
        return reconstructed
    
    def enhance_contrast(
        self,
        image: np.ndarray,
        method: str = 'clahe'
    ) -> np.ndarray:
        
        if method == 'clahe':
            if image.ndim == 2:
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                enhanced = clahe.apply(image.astype(np.uint8))
            else:
                lab = cv2.cvtColor(image.astype(np.uint8), cv2.COLOR_BGR2LAB)
                l, a, b = cv2.split(lab)
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                l = clahe.apply(l)
                enhanced = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)
        
        elif method == 'histogram_equalization':
            if image.ndim == 2:
                enhanced = cv2.equalizeHist(image.astype(np.uint8))
            else:
                enhanced = image.copy()
                for i in range(image.shape[2]):
                    enhanced[:, :, i] = cv2.equalizeHist(image[:, :, i].astype(np.uint8))
        
        else:
            enhanced = image
        
        return enhanced
    
    def batch_process(
        self,
        images: List[np.ndarray],
        operations: List[dict]
    ) -> List[np.ndarray]:
        
        processed = []
        
        for img in images:
            result = img
            
            for op in operations:
                op_name = op.get('name')
                op_params = {k: v for k, v in op.items() if k != 'name'}
                
                if op_name == 'resize':
                    result = self.resize(result, **op_params)
                elif op_name == 'normalize':
                    result = self.normalize(result, **op_params)
                elif op_name == 'augment':
                    result = self.augment(result, **op_params)
                elif op_name == 'denoise':
                    result = self.denoise(result, **op_params)
                elif op_name == 'enhance_contrast':
                    result = self.enhance_contrast(result, **op_params)
            
            processed.append(result)
        
        logger.info(f"Batch processed {len(images)} images with {len(operations)} operations")
        
        return processed


if __name__ == "__main__":
    preprocessor = ImagePreprocessor(target_size=(256, 256))
    
    image = np.random.randint(0, 255, (512, 512, 3), dtype=np.uint8)
    
    resized = preprocessor.resize(image, size=(256, 256))
    normalized = preprocessor.normalize(resized, method='0_1')
    augmented = preprocessor.augment(resized, horizontal_flip=True, rotate=15)
    
    patches = preprocessor.create_patches(image, patch_size=(128, 128), stride=(64, 64))
    
    print(f"Original image: {image.shape}")
    print(f"Resized: {resized.shape}")
    print(f"Number of patches: {len(patches)}")
