const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cria um "carimbo" único baseado na data e hora exata de agora
const version = Date.now().toString(36); 

function updateHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Ignora pastas do sistema
            if (file !== '.git' && file !== 'node_modules' && file !== 'assets' && file !== 'icons') {
                updateHtmlFiles(fullPath);
            }
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Procura todos os scripts (.js) e links de estilos (.css) que SÃO NATIVOS do projeto (ignora https como o firebase)
            // e anexa ?v=VERSAO no final, forçando o celular do usuário a baixar o arquivo novo.
            content = content.replace(/(href|src)="((?!http)[^"]+\.(css|js))(\?v=[a-zA-Z0-9]+)?"/g, `$1="$2?v=${version}"`);
            
            fs.writeFileSync(fullPath, content);
        }
    }
}

console.log('================================================');
console.log('🚀 INICIANDO DEPLOY INTELIGENTE (CACHE BUSTING)');
console.log('================================================\n');

try {
    console.log(`1. Injetando nova versão de cache (?v=${version}) em todos os arquivos HTML...`);
    updateHtmlFiles(__dirname);
    console.log('   ✓ Cache atualizado com sucesso.\n');

    console.log('2. Enviando arquivos para o GitHub...');
    execSync('git add .', { stdio: 'inherit' });
    
    // Pega os argumentos do terminal para usar como mensagem de commit, ou usa uma padrão
    const commitMsg = process.argv.slice(2).join(' ') || `Update and Cache Bust (v${version})`;
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    
    console.log('\n3. Empurrando para a nuvem...');
    execSync('git push', { stdio: 'inherit' });
    
    console.log('\n✅ DEPLOY CONCLUÍDO! O site está atualizado e o cache dos jogadores será renovado automaticamente.');
} catch (e) {
    console.log('\n❌ ERRO DURANTE O DEPLOY:', e.message);
    // Se der erro por não ter nada pra commitar, ignora.
    if (e.message.includes('nothing to commit')) {
        console.log('Parece que não haviam arquivos modificados para enviar.');
    }
}
