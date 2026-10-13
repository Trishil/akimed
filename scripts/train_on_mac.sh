#!/bin/bash
set -e

echo "================================================================================"
echo " AkiMed Clinical Attention Transformer (111 Diseases + Vitals & Margins)"
echo " Training on Apple Silicon Metal Performance Shaders (MPS)"
echo "================================================================================"

VENV_PYTHON="/Volumes/Trishil/Akimed_data/venv/bin/python"
SCRIPT="/Volumes/Trishil/Akimed_data/scripts/train_akimed_vitals_transformer.py"

if [ ! -f "$VENV_PYTHON" ]; then
    echo "[ERROR] Python venv not found at $VENV_PYTHON"
    exit 1
fi

"$VENV_PYTHON" "$SCRIPT" "$@"

echo ""
echo "================================================================================"
echo " Executing Hard Clinical Certification Benchmark Suite on Newly Trained Model"
echo "================================================================================"
"$VENV_PYTHON" "/Volumes/Trishil/Akimed_data/scripts/hard_clinical_benchmark_suite.py"

