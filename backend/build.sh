#!/bin/bash

# Check if the sketch name argument is provided
if [ -z "$1" ]; then
  echo "Error: Sketch name argument is required."
  exit 1
fi

# Get the sketch name from the argument
SKETCH_NAME=$1

# Define paths
SKETCH_DIR="/var/www/html/storage/app/sketch"
BUILD_DIR="$SKETCH_DIR/build/$SKETCH_NAME"

# Ensure the build directory exists and is empty
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Run arduino-cli compile command
/usr/local/bin/arduino-cli compile -b arduino:avr:uno -e --output-dir "$BUILD_DIR" "$SKETCH_DIR"

# Check if the build was successful
if [ $? -eq 0 ]; then
  echo "Build successful for $SKETCH_NAME"
else
  echo "Build failed for $SKETCH_NAME"
fi