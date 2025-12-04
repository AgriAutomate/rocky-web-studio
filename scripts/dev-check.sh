#!/bin/bash

echo "🚀 Rocky Web Studio - Development Pre-Flight Check"
echo "=================================================="
echo ""

echo "📝 Checking TypeScript..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found"
  exit 1
fi
echo "✅ TypeScript OK"
echo ""

echo "🔍 Checking ESLint..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Lint errors found"
  exit 1
fi
echo "✅ ESLint OK"
echo ""

echo "🔨 Testing production build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build successful"
echo ""

echo "=================================================="
echo "✅ ALL CHECKS PASSED - Safe to deploy!"
echo "=================================================="





