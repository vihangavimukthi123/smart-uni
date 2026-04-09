const fs = require('fs');
const path = require('path');

const dir = 'd:/pr00000000000000000000000000000000/SmartCampusPlatform/server/controllers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
    let content = fs.readFileSync(path.join(dir, f), 'utf8');
    
    let toExport = [];
    content = content.replace(/export\s+async\s+function\s+([a-zA-Z0-9_]+)/g, (match, fnName) => {
        toExport.push(fnName);
        return `async function ${fnName}`;
    });
    
    if (toExport.length > 0) {
        // Look for module.exports
        if (content.includes('module.exports = {')) {
            content = content.replace(/module\.exports\s*=\s*\{([^}]+)\};?/, (match, inner) => {
                const combined = inner.split(',').map(s => s.trim()).filter(s => s).concat(toExport);
                // remove duplicates
                const unique = [...new Set(combined)];
                return `module.exports = { ${unique.join(', ')} };`;
            });
        } else {
            content += `\nmodule.exports = { ${toExport.join(', ')} };\n`;
        }
        fs.writeFileSync(path.join(dir, f), content);
    }
});

console.log("Fixed ESM leftover exports!");
