#!/bin/bash
# This script automatically generates and updates the file structure documentation.
# ./update_structures.sh


FRONTEND_DOC_PATH="/Users/leduckien/Downloads/livesolve_AIprompt/FileStructureFrontEnd.md"
BACKEND_DOC_PATH="/Users/leduckien/Downloads/livesolve_AIprompt/FileStructureBackEnd.md"


# --- Script Logic (No need to edit below this line) ---

# Check if the placeholder paths have been changed.
if [[ "$FRONTEND_DOC_PATH" == "/path/to/your/FileStructureFrontEnd.md" ]]; then
    echo "✋ ATTENTION: Please edit the FRONTEND_DOC_PATH variable inside the 'update_structures.sh' script first."
    exit 1
fi

echo "🤖 Starting to update file structure documentation..."

# --- Frontend Structure ---
echo "   -> Documenting 'frontend' structure..."
# The '>' operator erases the old content and writes the new content.
tree frontend -I "node_modules|dist|build|.env*" > "$FRONTEND_DOC_PATH"

# --- Backend Structure ---
echo "   -> Documenting 'backend' structure..."
tree backend -I "__pycache__|.venv|venv|.env*" > "$BACKEND_DOC_PATH"

echo "✅ Done! Documentation files at the specified paths have been updated."


