#!/bin/bash
# -------------------------------------------------------------
# Restore script for Obsidian configuration dump
# Created: 2026-11-09
# -------------------------------------------------------------
set -e

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.obsidian_dump"
TARGET_DIR="/home/rayten/PC sync/Obsidian_Vault/.obsidian"

echo "🔄 Restoring Obsidian settings from: $SOURCE_DIR"
echo "🎯 Target directory: $TARGET_DIR"

if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Backup source directory does not exist: $SOURCE_DIR"
    exit 1
fi

# Copy all files and directories preserving structure
cp -r "$SOURCE_DIR"/* "$TARGET_DIR"/

echo "✅ Obsidian settings successfully restored!"
echo "💡 Reload Obsidian (Ctrl+R) to apply restored state."
