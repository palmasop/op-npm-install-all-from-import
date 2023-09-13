import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Define the directory where your project's source files are located
const projectDirectory = fileURLToPath(new URL('.', import.meta.url));
// Regular expression to match import statements
const importRegex = /import\s+(?:\{\s*([^}]+)\s*\}|([^}\n]+))\s+from\s+['"]([^'"]+)['"]/g;

function isPackageInstalled(packageName) {
    try {
        execSync(`npm ls ${packageName}`);
        return true;
    } catch (error) {
        return false;
    }
}

function installPackage(packageName) {
    console.log(`Installing ${packageName}...`);
    try {
        execSync(`npm install ${packageName}`, { stdio: 'ignore' }); // Use 'ignore' to suppress error output
        console.log(`${packageName} had Installed!`);
    } catch (error) {
        console.log(`${packageName} Install Failed, Skipped`);
    }
}

function processDirectory(directoryPath) {
    const items = fs.readdirSync(directoryPath);

    for (const item of items) {
        const itemPath = `${directoryPath}/${item}`;

        if (item === "node_modules")
            continue;

        if (fs.statSync(itemPath).isDirectory()) {
            processDirectory(itemPath);
            continue;
        }

        if (!(item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.tsx') || item.endsWith('.ts')))
            continue;

        const fileContent = fs.readFileSync(itemPath, 'utf8');
        let match;
        while ((match = importRegex.exec(fileContent)) !== null) {
            const packageName = match[3];

            if (!packageName.startsWith(".") && !isPackageInstalled(packageName))
                installPackage(packageName);
        }
    }
}

async function load(dir) {
    console.log("Finding...")
    await processDirectory(dir ?? projectDirectory);
    console.log("All package had successfully Installed!")
}

export default load;