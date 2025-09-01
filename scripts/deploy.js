#!/usr/bin/env node

/**
 * Script de despliegue para Clima Tracker
 * Este script ayuda a preparar el proyecto para GitHub Pages
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const GITHUB_USERNAME = process.argv[2];

if (!GITHUB_USERNAME) {
  console.error('❌ Error: Debes proporcionar tu nombre de usuario de GitHub');
  console.log('Uso: node scripts/deploy.js <tu-usuario-github>');
  process.exit(1);
}

console.log('🚀 Preparando despliegue para GitHub Pages...');
console.log(`👤 Usuario de GitHub: ${GITHUB_USERNAME}`);

// 1. Actualizar README.md
console.log('📝 Actualizando README.md...');
const readmePath = 'README.md';
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// Reemplazar todas las instancias de 'tu-usuario' con el usuario real
readmeContent = readmeContent.replace(/tu-usuario/g, GITHUB_USERNAME);

fs.writeFileSync(readmePath, readmeContent);
console.log('✅ README.md actualizado');

// 2. Actualizar worker/src/index.ts
console.log('🔧 Actualizando worker/src/index.ts...');
const workerPath = 'worker/src/index.ts';
let workerContent = fs.readFileSync(workerPath, 'utf8');

// Reemplazar URLs en el worker
workerContent = workerContent.replace(/tu-usuario/g, GITHUB_USERNAME);

fs.writeFileSync(workerPath, workerContent);
console.log('✅ Worker actualizado');

// 3. Verificar que el build funciona
console.log('🔨 Verificando build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build exitoso');
} catch (error) {
  console.error('❌ Error en el build:', error.message);
  process.exit(1);
}

// 4. Mostrar instrucciones finales
console.log('\n🎉 ¡Proyecto preparado para GitHub Pages!');
console.log('\n📋 Próximos pasos:');
console.log('1. Haz commit y push de los cambios:');
console.log('   git add .');
console.log(`   git commit -m "Preparar para despliegue en GitHub Pages"`);
console.log('   git push origin main');
console.log('\n2. Configura GitHub Pages:');
console.log('   - Ve a tu repositorio en GitHub');
console.log('   - Settings > Pages');
console.log('   - Source: GitHub Actions');
console.log('\n3. Tu sitio estará disponible en:');
console.log(`   https://${GITHUB_USERNAME}.github.io/clima-tracker/`);
console.log('\n4. Para el worker de Cloudflare:');
console.log('   cd worker');
console.log('   npm run deploy');
console.log('\n✨ ¡Despliegue completado!');
