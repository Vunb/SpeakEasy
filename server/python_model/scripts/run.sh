#!/usr/bin/env bash
# Runs the speak_easy model.

ROBOT_NAME=ROBOT_NAME

venv/bin/python $ROBOT_NAME/speak_easy_NOBUCKETS.py --train_dir=$ROBOT_NAME/train_dir2 --data_dir=$ROBOT_NAME/data_dir $@
