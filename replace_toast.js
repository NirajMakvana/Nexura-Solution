const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js')) results.push(file);
        }
    });
    return results;
}

const frontendSrcPath = path.join(__dirname, 'frontend', 'src');
const files = walk(frontendSrcPath);

let replaced = 0;

files.forEach(file => {
    // skip the toaster component itself or hooks
    if (file.includes('toaster.jsx') || file.includes('use-toast.js')) {
        return;
    }

    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. replace import
    const importRegex = /import\s*\{\s*useToast\s*\}\s*from\s*['"][.\/@]+hooks\/use-toast['"]/g;
    content = content.replace(importRegex, "import { toast } from 'react-hot-toast'");

    // 2. remove const { toast } = useToast()
    const hookRegex = /[ \t]*const\s*\{\s*toast\s*\}\s*=\s*useToast\(\)\s*\n?/g;
    content = content.replace(hookRegex, "");

    // 3. Replace toast({...}) and toast({title: ... })
    // Use an iterated match approach if we want to handle the specific toast({ format reliably
    // We'll regex replace toast({ ... })
    const toastCallRegex = /toast\(\{([\s\S]*?)\}\)/g;

    content = content.replace(toastCallRegex, (match, body) => {
        const isError = /variant:\s*['"]destructive['"]/.test(body) ||
            /title:\s*['"]Error['"]/i.test(body) ||
            /variant:\s*['"]error['"]/i.test(body);

        let descMatch = body.match(/description:\s*(['"`].*?['"`])/);
        let titleMatch = body.match(/title:\s*(['"`].*?['"`])/);

        // Sometimes description is not quoted, meaning it's a variable or template
        // Better extraction:
        let msgMatch = body.match(/description:\s*(.*?)(?:,|$)/m);
        let tMatch = body.match(/title:\s*(.*?)(?:,|$)/m);

        let message = "'Notification'";

        if (descMatch) {
            message = descMatch[1];
        } else if (msgMatch) {
            // trim trailing commas
            message = msgMatch[1].trim().replace(/,$/, '');
        } else if (titleMatch) {
            message = titleMatch[1];
        } else if (tMatch) {
            message = tMatch[1].trim().replace(/,$/, '');
        }

        if (isError) {
            return `toast.error(${message})`;
        } else {
            return `toast.success(${message})`;
        }
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        replaced++;
    }
});

console.log(`Replaced toast in ${replaced} files.`);
