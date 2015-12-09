#!/usr/bin/env bash
# Runs tensorboard.

ROBOT_NAME=ROBOT_NAME
DIR=$ROBOT_NAME/train_dir/logs

echo "Loading events from $DIR..."

venv/bin/tensorboard --logdir=$DIR
