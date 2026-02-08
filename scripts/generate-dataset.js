const fs = require('fs');
const path = require('path');

const categories = ['ui_ux', 'functional', 'performance', 'security', 'data_logic', 'integration'];
const severities = ['critical', 'high', 'medium', 'low'];

const templates = {
    ui_ux: [
        "The {component} is not aligned correctly on {device}.",
        "Color mismatch in the {component} when {action}.",
        "Button text is overflowing in the {component}.",
        "Responsive layout breaks on {device} for {component}."
    ],
    functional: [
        "The {component} does not save {item} correctly.",
        "Clicking the {component} results in no action.",
        "The {component} throws a 500 error when {action}.",
        "Incorrect calculation in the {component} during {action}."
    ],
    security: [
        "SQL injection vulnerability detected in {component}.",
        "Cross-site scripting (XSS) possible via {component}.",
        "Broken authentication in {component} for {item}.",
        "Unauthorized access to {item} through {component}."
    ],
    performance: [
        "The {component} takes more than {time} to load.",
        "High memory usage when {action} in {component}.",
        "Slow database query in {component} when fetching {item}.",
        "Jerky animations in {component} on {device}."
    ],
    data_logic: [
        "Duplicate {item} entries found in {component}.",
        "Data mismatch between {component} and the dashboard.",
        "Null pointer exception in {component} when {item} is empty.",
        "Incorrect fallback logic for {item} in {component}."
    ],
    integration: [
        "API timeout when connecting {component} to external service.",
        "Webhook failure for {item} in {component}.",
        "Schema mismatch between {component} and the third-party provider.",
        "Failed to synchronize {item} across {component}."
    ]
};

const components = ['Login Page', 'Dashboard', 'Settings Panel', 'Payment Gateway', 'Search Bar', 'User Profile'];
const devices = ['iPhone 13', 'Chrome Browser', 'Safari', 'Android Tablet', 'Desktop View'];
const items = ['user data', 'invoice', 'product details', 'session token', 'search results'];
const actions = ['scrolling', 'submitting the form', 'updating the profile', 'initial loading'];

function generateSyntheticData(count = 500) {
    const data = [];
    for (let i = 0; i < count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const template = templates[category][Math.floor(Math.random() * templates[category].length)];

        let text = template
            .replace('{component}', components[Math.floor(Math.random() * components.length)])
            .replace('{device}', devices[Math.floor(Math.random() * devices.length)])
            .replace('{item}', items[Math.floor(Math.random() * items.length)])
            .replace('{action}', actions[Math.floor(Math.random() * actions.length)])
            .replace('{time}', '5 seconds');

        data.push({
            id: i + 1,
            text: text,
            category: category,
            severity: severity
        });
    }
    return data;
}

const dataset = generateSyntheticData(1000);
fs.writeFileSync(
    path.join(__dirname, 'ml-training-data.json'),
    JSON.stringify(dataset, null, 2)
);

console.log("Synthetic dataset generated: 1000 items saved to ml-training-data.json");
