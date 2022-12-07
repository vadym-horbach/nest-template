#!/bin/sh
set -o errexit
whoami

echo "executing command: |$@|";
exec "$@";