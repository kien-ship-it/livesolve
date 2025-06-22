#!/bin/bash
# This script automatically generates and updates the file structure documentatio
# ./update_structures.sh


# --- Configuration (EDIT THESE PATHS) ---
# Directory where this script and its headers are located.
SCRIPT_DIR="/Users/leduckien/Downloads/livesolve_AIprompt"

# Path to your project's frontend directory
FRONTEND_DIR="frontend"
# Path to your project's backend directory
BACKEND_DIR="backend"

# --- Header & Output File Definitions ---
FRONTEND_HEADER="${SCRIPT_DIR}/frontend_structure_header.md"
BACKEND_HEADER="${SCRIPT_DIR}/backend_structure_header.md"

FRONTEND_DOC_PATH="${SCRIPT_DIR}/FileStructureFrontEnd.md"
BACKEND_DOC_PATH="${SCRIPT_DIR}/FileStructureBackEnd.md"

# --- Script Logic (No need to edit below this line) ---
echo "🤖 Starting to update file structure documentation..."

# --- Frontend Structure ---
echo "   -> Documenting 'frontend' structure..."
# 1. Copy the manual header to the final file (overwrite).
cat "$FRONTEND_HEADER" > "$FRONTEND_DOC_PATH"
# 2. Append the auto-generated tree structure to the final file.
tree "$FRONTEND_DIR" -I "node_modules|dist|build|.env*|.DS_Store" >> "$FRONTEND_DOC_PATH"

# --- Backend Structure ---
echo "   -> Documenting 'backend' structure..."
# 1. Copy the manual header to the final file (overwrite).
cat "$BACKEND_HEADER" > "$BACKEND_DOC_PATH"
# 2. Append the auto-generated tree structure to the final file.
tree "$BACKEND_DIR" -I "__pycache__|.venv|venv|.env*|.DS_Store" >> "$BACKEND_DOC_PATH"

echo "✅ Done! Documentation files have been rebuilt successfully."