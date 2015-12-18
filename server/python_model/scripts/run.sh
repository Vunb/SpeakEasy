#!/usr/bin/env bash
# Runs the speak_easy model.

ROBOT_NAME=ROBOT_NAME

export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/usr/local/cuda/lib64"
export CUDA_HOME=/usr/local/cuda

venv/bin/python $ROBOT_NAME/speak_easy.py --train_dir='/home/ubuntu/train_10000_512' --data_dir='/home/ubuntu/data_10000' $@
