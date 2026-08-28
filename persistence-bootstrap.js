const fs = require('fs');

// Railway volumes are normally exposed through RAILWAY_VOLUME_MOUNT_PATH.
// Keep a safe fallback for the common /data mount so admin edits survive
// restarts/redeploys even when Railway does not expose that variable.
if (!process.env.DATA_DIR) {
  if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    process.env.DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH;
  } else if (fs.existsSync('/data')) {
    process.env.DATA_DIR = '/data';
  }
}

console.log('[NAVAB] persistent data dir:', process.env.DATA_DIR || '(project-local data/)');
