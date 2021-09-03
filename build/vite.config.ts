import { defineConfig } from "vite";
// import * as fs from "fs";

const entries = {
    "examples/model/dragon": process.cwd() + "/examples/model/dragon/index.html",
};

export const config = {
    resolve: {
        alias: {
            src: process.cwd() + "/src",
            files: process.cwd() + "/files",
        },
    },

    server: {
        host: "threejs.development",
        port: 3333,
    },

    build: {
        rollupOptions: {
            input: entries
        }
    }
}

export default defineConfig(config)