module.exports = {
    "src/**/*.{ts,tsx}": [
        "tslint --project tsconfig.json --fix",
        "prettier --write"
    ]
};
