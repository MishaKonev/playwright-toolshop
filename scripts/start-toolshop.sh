#!/usr/bin/env bash
# Starts the Toolshop app in Docker, seeds the database and waits until UI and API respond.
set -euo pipefail

COMPOSE="docker compose -f docker/toolshop/docker-compose.yml"

wait_for() {
  local name=$1 check=$2 attempts=$3
  echo "Waiting for $name..."
  for i in $(seq 1 "$attempts"); do
    if eval "$check" >/dev/null 2>&1; then
      echo "$name is ready"
      return 0
    fi
    sleep 5
  done
  echo "$name did not become ready"
  $COMPOSE logs --tail=100
  return 1
}

$COMPOSE up -d --quiet-pull

wait_for "MariaDB" "$COMPOSE exec -T mariadb mysqladmin ping -h localhost -u root -proot --silent" 30

echo "Creating and seeding the database..."
$COMPOSE exec -T laravel-api php artisan migrate:refresh --seed --force

wait_for "API" "curl -sf http://localhost:8091/status" 30
wait_for "UI" "curl -sf http://localhost:4200" 60
