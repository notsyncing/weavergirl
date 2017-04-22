export default class Loader {
    static modules = new Map();
    static base = location.href;
    static afterLoadHandlers = [];
    
    static absolute(relative): string {
        let stack = this.base.split("/"),
            parts = relative.split("/");
        stack.pop(); // remove current file name (or empty string)
                     // (omit if "base" is the current folder without trailing slash)
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === ".")
                continue;
            if (parts[i] === "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }

    static fetch(url): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);

                xhr.onreadystatechange = () => {
                    if (xhr.readyState === (XMLHttpRequest.DONE || 4)) {
                        if (xhr.status === 200) {
                            resolve(xhr.responseText);
                        } else {
                            reject(new Error(`Server returned status code ${xhr.status}: GET ${url}`));
                        }
                    }
                };

                xhr.send();
            } catch (err) {
                reject(err);
            }
        });
    }

    static loadFromUrl(url): Promise<string> {
        return this.fetch(url);
    }

    static async load(pathOrUrl): Promise<any> {
        if (!/^[a-zA-Z0-9]+:\/\//.test(pathOrUrl)) {
            pathOrUrl = this.absolute(pathOrUrl);
        }

        if (this.modules.has(pathOrUrl)) {
            return this.modules.get(pathOrUrl).exports;
        }

        const script = await this.loadFromUrl(pathOrUrl);
        let exports = {};

        this.modules.set(pathOrUrl, {
            script: script,
            exports: exports
        });

        let _module = {exports: exports};

        let f = new Function("module", "exports", script);
        f.call({}, _module, exports);

        this.modules.get(pathOrUrl).exports = _module.exports;

        for (let h of this.afterLoadHandlers) {
            h(_module.exports);
        }

        return _module.exports;
    }

    static async loadAsset(pathOrUrl): Promise<string> {
        if (!/^[a-zA-Z0-9]+:\/\//.test(pathOrUrl)) {
            pathOrUrl = this.absolute(pathOrUrl);
        }

        return await this.loadFromUrl(pathOrUrl);
    }
    
    static rebase(): void {
        this.base = location.href;
    }
    
    static addAfterLoadHandler(h): void {
        this.afterLoadHandlers.push(h);
    }
}