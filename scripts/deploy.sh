#!/usr/bin/env bash
set -e

echo "🚀 Building IFT Order for GitHub Pages..."
npm run build

echo "📦 Publishing dist to origin/gh-pages..."
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy: update GitHub Pages build $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
git remote add origin https://github.com/oscarcaux7/ift-order.git
git push -f origin gh-pages
cd ..
rm -rf dist/.git

echo "✅ Déploiement terminé avec succès !"
echo "🌐 URL GitHub Pages : https://oscarcaux7.github.io/ift-order/"
