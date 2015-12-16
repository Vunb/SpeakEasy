#!/usr/local/bin/bash
# Runs the speak_easy model.

TRAIN_DIR='/Volumes/Seagate\ Backup Plus Drive/TrainingDirectories'
DATA_DIR='/Volumes/Seagate Backup Plus Drive/SPEAKEASY_DATA'
ROBOT_NAME=MARVIN



venv/bin/python $ROBOT_NAME/speak_easy.py --train_dir='/Volumes/Seagate\ Backup Plus Drive/TrainingDirectories' --data_dir='/Volumes/Seagate Backup Plus Drive/SPEAKEASY_DATA' $@
