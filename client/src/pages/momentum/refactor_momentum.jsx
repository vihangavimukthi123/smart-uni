import fs from 'fs';
import path from 'path';

function getFiles(dir, exts) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file, exts));
        } else {
            if (exts.includes(path.extname(file))) {
                results.push(file);
            }
        }
    });
    return results;
}

const dir = 'd:/pr00000000000000000000000000000000/SmartCampusPlatform/client/src/pages/momentum';
const files = getFiles(dir, ['.jsx', '.js']);

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Replace API paths
    content = content.replace(/import\.meta\.env\.VITE_BACKEND_URL \+ "\/student/g, '"/api/auth');
    content = content.replace(/import\.meta\.env\.VITE_BACKEND_URL \+ "\/supplier/g, '"/api/auth');
    content = content.replace(/import\.meta\.env\.VITE_BACKEND_URL/g, '"/api/rental"');
    content = content.replace(/axios\.get\("\/api\/rental" \+ "\//g, 'api.get("/rental/');
    content = content.replace(/axios\.post\("\/api\/rental" \+ "\//g, 'api.post("/rental/');
    content = content.replace(/axios\.put\("\/api\/rental" \+ "\//g, 'api.put("/rental/');
    
    // Replace Tailwind classes
    content = content.replace(/className=['"](.*?)['"]/g, (match, classes) => {
        let newClasses = classes
            .replace(/bg-primary/g, 'bg-elevated')
            .replace(/text-secondary/g, 'text-primary')
            .replace(/bg-secondary/g, 'bg-card')
            .replace(/text-primary/g, 'text-secondary')
            .replace(/w-full h-screen/g, 'app-shell')
            .replace(/flex flex-col/g, 'flex-col')
            .replace(/items-center justify-center/g, 'flex-center')
            .replace(/rounded-\w+/g, 'card-rounded')
            .replace(/shadow-\w+/g, 'card-shadow')
            .replace(/p-\d+/g, 'p-4')
            .replace(/m-\d+/g, 'm-4')
            .replace(/text-\w+/g, '')
            .replace(/font-\w+/g, '')
            .replace(/border /g, '')
            .replace(/border-\w+-\d+/g, '')
            .replace(/hover:bg-\w+-\d+/g, '')
            .replace(/transition-all/g, '');
            
        if(newClasses.includes('bg-elevated')) newClasses = 'glass-card ' + newClasses;
        return `className="${newClasses.trim().replace(/\s+/g," ')}"`;
    });

    fs.writeFileSync(f, content);
});

console.log("Refactoring complete");
