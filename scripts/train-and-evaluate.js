const fs = require('fs');
const path = require('path');

// 1. Load Dataset
const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'ml-training-data.json'), 'utf8'));

// 2. Tokenizer & Preprocessor
function tokenize(text) {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2);
}

class NaiveBayes {
    constructor() {
        this.categories = {};
        this.words = {};
        this.totalDocs = 0;
        this.labelCounts = {};
    }

    train(data) {
        data.forEach(item => {
            const tokens = tokenize(item.text);
            const label = item.category;

            this.totalDocs++;
            this.labelCounts[label] = (this.labelCounts[label] || 0) + 1;

            if (!this.categories[label]) {
                this.categories[label] = { totalWords: 0, wordFreq: {} };
            }

            tokens.forEach(token => {
                this.categories[label].wordFreq[token] = (this.categories[label].wordFreq[token] || 0) + 1;
                this.categories[label].totalWords++;
                this.words[token] = true;
            });
        });
    }

    predict(text) {
        const tokens = tokenize(text);
        let bestLabel = null;
        let maxScore = -Infinity;

        const vocabularySize = Object.keys(this.words).length;

        Object.keys(this.labelCounts).forEach(label => {
            // Log probability to avoid underflow
            let score = Math.log(this.labelCounts[label] / this.totalDocs);

            tokens.forEach(token => {
                const wordFreq = this.categories[label].wordFreq[token] || 0;
                // Laplacian smoothing
                const wordProb = (wordFreq + 1) / (this.categories[label].totalWords + vocabularySize);
                score += Math.log(wordProb);
            });

            if (score > maxScore) {
                maxScore = score;
                bestLabel = label;
            }
        });

        return bestLabel;
    }
}

// 3. Split Data (80/20)
const shuffle = data => data.sort(() => Math.random() - 0.5);
const shuffledData = shuffle(rawData);
const splitIndex = Math.floor(shuffledData.length * 0.8);
const trainData = shuffledData.slice(0, splitIndex);
const testData = shuffledData.slice(splitIndex);

// 4. Train
console.log(`Training on ${trainData.length} items...`);
const model = new NaiveBayes();
model.train(trainData);

// 5. Evaluate
console.log(`Evaluating on ${testData.length} items...`);
let correct = 0;
const results = {
    truePositives: {},
    falsePositives: {},
    falseNegatives: {}
};

testData.forEach(item => {
    const prediction = model.predict(item.text);
    if (prediction === item.category) {
        correct++;
        results.truePositives[prediction] = (results.truePositives[prediction] || 0) + 1;
    } else {
        results.falsePositives[prediction] = (results.falsePositives[prediction] || 0) + 1;
        results.falseNegatives[item.category] = (results.falseNegatives[item.category] || 0) + 1;
    }
});

const accuracy = correct / testData.length;
console.log(`\nOverall Accuracy: ${(accuracy * 100).toFixed(2)}%`);

console.log("\n--- Per-Category Metrics ---");
Object.keys(model.labelCounts).forEach(label => {
    const tp = results.truePositives[label] || 0;
    const fp = results.falsePositives[label] || 0;
    const fn = results.falseNegatives[label] || 0;

    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1 = 2 * (precision * recall) / (precision + recall) || 0;

    console.log(`${label.padEnd(15)} | P: ${precision.toFixed(2)} | R: ${recall.toFixed(2)} | F1: ${f1.toFixed(2)}`);
});

// 6. Save Model "Metadata" to show result
const evaluation = {
    accuracy,
    timestamp: new Date().toISOString(),
    metrics: results
};

fs.writeFileSync(
    path.join(__dirname, 'ml-evaluation-report.json'),
    JSON.stringify(evaluation, null, 2)
);

console.log("\nEvaluation report saved to ml-evaluation-report.json");
