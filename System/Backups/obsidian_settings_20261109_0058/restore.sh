#!/bin/bash
set -e
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_OBSIDIAN="/home/rayten/PC sync/Obsidian_Vault/.obsidian"
TARGET_SYS_INIT="/home/rayten/PC sync/Obsidian_Vault/System/[SYS_INIT].md"

echo "🔄 Restoring Obsidian from: $BACKUP_DIR"
cp -r "$BACKUP_DIR/.obsidian_dump"/* "$TARGET_OBSIDIAN/"
cp "$BACKUP_DIR/SYS_INIT.md" "$TARGET_SYS_INIT"
echo "✅ Rollback complete! Reload Obsidian (Ctrl+R)."
