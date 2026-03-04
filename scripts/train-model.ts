const fs = require('fs');
const path = require('path');

/**
 * CLI Tool to "train" the model by adding new training examples to the dataset.
 * Usage: node scripts/train-model.ts --title "New Bug" --desc "Description" --cat "functional" --sev "high" --cause "Root cause" --steps "Step 1, Step 2"
 */

const args = process.argv.slice(2);
const params: Record<string, string> = {};

for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    if (key && value) {
        params[key] = value;
    }
}

const validCategories = ['ui_ux', 'functional', 'performance', 'security', 'data_logic', 'integration'];
const validSeverities = ['critical', 'high', 'medium', 'low'];

if (!params.title || !params.desc || !params.cat) {
    console.error('Usage: node scripts/train-model.ts --title <title> --desc <description> --cat <category> --sev <severity> --cause <root_cause> --steps <steps_comma_separated>');
    console.error(`Valid categories: ${validCategories.join(', ')}`);
    console.error(`Valid severities: ${validSeverities.join(', ')}`);
    process.exit(1);
}

if (!validCategories.includes(params.cat)) {
    console.error(`❌ Invalid category: "${params.cat}". Valid options: ${validCategories.join(', ')}`);
    process.exit(1);
}

if (params.sev && !validSeverities.includes(params.sev)) {
    console.error(`❌ Invalid severity: "${params.sev}". Valid options: ${validSeverities.join(', ')}`);
    process.exit(1);
}

const datasetPath = path.join(__dirname, '../src/lib/ai/datasets.ts');
let content = fs.readFileSync(datasetPath, 'utf8');

const newExample = {
    id: `train-${Date.now()}`,
    title: params.title,
    description: params.desc,
    category: params.cat,
    severity: params.sev || 'medium',
    root_cause: params.cause || 'Under investigation.',
    resolution_steps: params.steps ? params.steps.split(',').map(s => s.trim()) : ['Investigate logs.', 'Replicate issue.'],
    tags: params.title.toLowerCase().split(' ').slice(0, 3)
};

const insertIndex = content.lastIndexOf('];');
const exampleString = `    {
        id: '${newExample.id}',
        title: '${newExample.title}',
        description: '${newExample.description.replace(/'/g, "\\'")}',
        category: '${newExample.category}',
        severity: '${newExample.severity}',
        root_cause: '${newExample.root_cause.replace(/'/g, "\\'")}',
        resolution_steps: ${JSON.stringify(newExample.resolution_steps)},
        tags: ${JSON.stringify(newExample.tags)}
    },
`;

content = content.slice(0, insertIndex) + exampleString + content.slice(insertIndex);

fs.writeFileSync(datasetPath, content);

console.log('✅ Model "trained" successfully!');
console.log(`Added new training pattern: ${newExample.title}`);
