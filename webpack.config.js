module.exports = {
    mode: "production", 
    entry: "./src/main.js",
    output: {
        filename: "./main.js",
        pathinfo: false,
        libraryTarget: "commonjs2",
    },

    target: "node",

    node: {
        console: true,
        global: true,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
    }
};