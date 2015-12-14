#!/usr/bin/env bash
# Builds TensorFlow from source and uploads to S3.
#
# * Must be run from the TensorFlow root.
# * Uploads release pip package to s3://gelsto-data/tensorflow-release/gpu

bazel build -c opt --config=cuda //tensorflow/tools/pip_package:build_pip_package
tensorflow/tools/pip_package/build_pip_package.sh /tmp/ --use_gpu
aws s3 cp /tmp/tensorflow*.whl s3://gelsto-data/tensorflow-release/gpu/

# Uncomment this if you'd prefer to install locally instead:
#VENV_DIR=$1
#$VENV_DIR/bin/pip install --upgrade /tmp/tensorflow*.whl
