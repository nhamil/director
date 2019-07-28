module.exports = {
    mode: "production", 
    entry: "./src/main.js",
    output: {
        filename: "./[name].js",
        pathinfo: false,
        libraryTarget: "commonjs2",
    },
    optimization: {
        splitChunks: {
            chunks: "all" 
        }
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