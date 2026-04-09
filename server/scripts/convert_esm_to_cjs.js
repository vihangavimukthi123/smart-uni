const fs = require('fs');
const path = require('path');

const srcDirs = [
  { path: 'd:/pr00000000000000000000000000000000/Smart Rental System_new/Smart Rental System/back_end/controllers', files: ['orderController.js', 'productController.js', 'reviewController.js', 'supplierController.js', 'studentController.js'] },
  { path: 'd:/pr00000000000000000000000000000000/Smart Rental System_new/Smart Rental System/back_end/routes', files: ['orderRouter.js', 'productRouter.js', 'reviewRouter.js'] },
  { path: 'd:/pr00000000000000000000000000000000/SmartLearningHub/SmartCampus/backend/controllers', files: ['resourceController.js', 'taskController.js'] },
  { path: 'd:/pr00000000000000000000000000000000/SmartLearningHub/SmartCampus/backend/routes', files: ['peerReviewRoutes.js', 'peerRoutes.js', 'requestRoutes.js', 'resourceRoutes.js', 'taskRoutes.js'] }
];

const destDirControllers = 'd:/pr00000000000000000000000000000000/SmartCampusPlatform/server/controllers';
const destDirRoutes = 'd:/pr00000000000000000000000000000000/SmartCampusPlatform/server/routes';

srcDirs.forEach(dir => {
  dir.files.forEach(file => {
    const srcFile = path.join(dir.path, file);
    if (!fs.existsSync(srcFile)) return;
    
    let content = fs.readFileSync(srcFile, 'utf8');
    
    // convert imports: import x from 'y' -> const x = require('y')
    content = content.replace(/import\s+([a-zA-Z0-9_{},\s]+)\s+from\s+['"]([^'"]+)['"]/g, (match, vars, pkg) => {
        if(vars.includes('{')) {
           return `const ${vars} = require('${pkg}')`;
        } else {
           return `const ${vars} = require('${pkg}')`;
        }
    });

    // convert exports: export default x; -> module.exports = x;
    content = content.replace(/export\s+default\s+([a-zA-Z0-9_]+);?/g, 'module.exports = $1;');
    
    // convert inline exports: export const x = ... -> const x = ... ; module.exports.x = x;
    const exportsList = [];
    content = content.replace(/export\s+const\s+([a-zA-Z0-9_]+)\s*=\s*/g, (match, fnName) => {
        exportsList.push(fnName);
        return `const ${fnName} = `;
    });
    
    // convert inline exports: export function x -> function x 
    content = content.replace(/export\s+function\s+([a-zA-Z0-9_]+)/g, (match, fnName) => {
        exportsList.push(fnName);
        return `function ${fnName}`;
    });

    if(exportsList.length > 0) {
       content += `\nmodule.exports = { ${exportsList.join(', ')} };`;
    }

    // specific model fixes
    content = content.replace(/\.\.\/models\/([a-zA-Z0-9_]+)\.js/g, '../models/$1');
    content = content.replace(/\.\/models\/([a-zA-Z0-9_]+)\.js/g, '../models/$1');
    content = content.replace(/import Student from/g, "const User = require");
    content = content.replace(/import Supplier from/g, "const User = require");
    content = content.replace(/import\s+\*\s+as\s+([a-zA-Z0-9_]+)\s+from\s+['"]([^'"]+)['"]/g, "const $1 = require('$2')");

    // Also we need to route Product/Review properly and update names
    if (file === 'resourceController.js') {
       content = content.replace(/Resource/g, 'LearningResource');
    }
    if (file === 'resourceRoutes.js') {
       content = content.replace(/Resource/g, 'LearningResource');
       content = content.replace(/resourceController/g, 'learningResourceController');
    }

    let destName = file;
    if (file === 'resourceController.js') destName = 'learningResourceController.js';
    if (file === 'resourceRoutes.js') destName = 'learningResourceRoutes.js';

    let dDir = file.includes('Router') || file.includes('Routes') ? destDirRoutes : destDirControllers;
    
    if (destName.includes('Router')) {
       destName = destName.replace('Router', 'Routes');
    }

    fs.writeFileSync(path.join(dDir, destName), content);
  });
});
