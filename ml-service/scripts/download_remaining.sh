#!/usr/bin/env bash
# =============================================================================
# Download Remaining Fast & High-Value Datasets
# Multi-Hazard Disaster Intelligence Platform (Odisha AOI)
#
# Datasets included:
#   [05] ERA5 Hourly Reanalysis (2022-2023: temp, rain, wind, humidity, pressure)  ~30 MB
#   [19] IMD Gridded Temperature (2022-2023: Tmax, Tmin for heatwaves)            ~2 MB
#   [20] NASA Global Landslide Catalog (historical landslide events)              ~1.5 MB
#   [22] CHIRPS Monthly Rainfall (precipitation anomalies for drought)            ~10 MB
#
# Total Download Size: ~45 MB (takes ~1-2 minutes total)
#
# NOTE: Heavy datasets like NASA GPM (28 GB) and WorldPop (778 MB from UK)
#       are intentionally excluded to save bandwidth and avoid throttled servers.
# =============================================================================

set -e

# Resolve script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "${SCRIPT_DIR}/../.." && pwd )"
ML_SERVICE_DIR="${PROJECT_ROOT}/ml-service"

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}  Multi-Hazard Platform: Download Remaining Fast Datasets (~45 MB)     ${NC}"
echo -e "${BLUE}======================================================================${NC}"

cd "${ML_SERVICE_DIR}"

# Check for .env file
if [ ! -f "${PROJECT_ROOT}/.env" ]; then
    echo -e "${RED}Warning: .env file not found at ${PROJECT_ROOT}/.env${NC}"
fi

# Display menu if no arguments given
TARGETS="${1:-all}"

echo -e "\n${YELLOW}Prerequisite for ERA5 (Dataset 05):${NC}"
echo -e "Make sure you have accepted the ERA5 license once while logged in:"
echo -e "👉 ${BLUE}https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=download#manage-licences${NC}\n"

case "${TARGETS}" in
    "all")
        echo -e "${GREEN}Running all fast remaining datasets: 05, 19, 20, 22...${NC}"
        
        echo -e "\n${BLUE}--- [1/4] Dataset 20: NASA Global Landslide Catalog (~1.5 MB) ---${NC}"
        python3 scripts/run_downloads.py --config scripts/datasets.yaml run --only 20 --yes || true

        echo -e "\n${BLUE}--- [2/4] Dataset 22: CHIRPS Monthly Rainfall Anomalies (~10 MB) ---${NC}"
        python3 scripts/run_downloads.py --config scripts/datasets.yaml run --only 22 --yes || true

        echo -e "\n${BLUE}--- [3/4] Dataset 19: IMD Gridded Daily Temperature 2022-2023 (~2 MB) ---${NC}"
        python3 scripts/run_downloads.py --config scripts/datasets.yaml run --only 19 --years 2022 2023 --yes || true

        echo -e "\n${BLUE}--- [4/4] Dataset 05: Copernicus ERA5 Hourly Reanalysis 2022-2023 (~30 MB) ---${NC}"
        python3 scripts/run_downloads.py --config scripts/datasets.yaml run --only 5 --years 2022 2023 --yes || true
        ;;

    "era5"|"5")
        echo -e "${GREEN}Running Dataset 05 (ERA5 2022-2023)...${NC}"
        python3 scripts/run_downloads.py --config scripts/datasets.yaml run --only 5 --years 2022 2023 --yes
        ;;

    "temperature"|"19")
        echo -e "${GREEN}Running Dataset 19 (IMD Temperature 2022-2023)...${NC}"
        python3 scripts/run_downloads.py --config scripts/datasets.yaml run --only 19 --years 2022 2023 --yes
        ;;

    "landslide"|"20")
        echo -e "${GREEN}Running Dataset 20 (NASA Landslide Catalog)...${NC}"
        python3 scripts/run_downloads.py --config scripts/datasets.yaml run --only 20 --yes
        ;;

    "chirps"|"drought"|"22")
        echo -e "${GREEN}Running Dataset 22 (CHIRPS Monthly Rainfall)...${NC}"
        python3 scripts/run_downloads.py --config scripts/datasets.yaml run --only 22 --yes
        ;;

    *)
        echo -e "${RED}Unknown option: ${TARGETS}${NC}"
        echo -e "Usage:"
        echo -e "  ./scripts/download_remaining.sh          # downloads all 4 datasets (~45 MB total)"
        echo -e "  ./scripts/download_remaining.sh era5     # downloads only ERA5"
        echo -e "  ./scripts/download_remaining.sh 19       # downloads only IMD temperature"
        echo -e "  ./scripts/download_remaining.sh 20       # downloads only Landslide catalog"
        echo -e "  ./scripts/download_remaining.sh 22       # downloads only CHIRPS drought data"
        exit 1
        ;;
esac

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}  Batch completed! All available files are in data/raw/                ${NC}"
echo -e "${GREEN}======================================================================${NC}"
