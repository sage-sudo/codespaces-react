# PHASE RESTORATION GUIDE

## Available Phases:

### FIRST PHASE
- Basic Trading Dashboard
- YFinance Integration
- Read-only Code Viewer
- **Restore:** `cp -r BACKUPS/FIRST_PHASE/src/ ./`

### SECOND PHASE  
- All First Phase features
- Code Editor with Version History
- Edit/View Toggle
- **Restore:** `cp -r BACKUPS/SECOND_PHASE/src/ ./`

## Quick Restore Commands:

```bash
# Restore First Phase (Basic)
rm -rf src/ && cp -r BACKUPS/FIRST_PHASE/src/ ./

# Restore Second Phase (With Editor)
rm -rf src/ && cp -r BACKUPS/SECOND_PHASE/src/ ./
```