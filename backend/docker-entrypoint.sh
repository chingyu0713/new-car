#!/bin/sh
echo "🔄 Running database migration..."
node dist/config/migrate.js

echo "🚀 Starting server..."
exec node dist/server.js
