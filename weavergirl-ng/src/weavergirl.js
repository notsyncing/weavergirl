(function () {
    if (!window.Weavergirl) {
        window.Weavergirl = {};
    }
})();

(function () {

    let modules = new Map();

    function absolute(relative) {
        let base = location.href;
        let stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); // remove current file name (or empty string)
                     // (omit if "base" is the current folder without trailing slash)
        for (let i=0; i<parts.length; i++) {
            if (parts[i] === ".")
                continue;
            if (parts[i] === "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }

    function fetchScript(url) {
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

    function loadFromUrl(url) {
        return fetchScript(url);
    }

    async function load(pathOrUrl) {
        if (!/^[a-zA-Z0-9]+:\/\//.test(pathOrUrl)) {
            if (!pathOrUrl.startsWith("/")) {
                pathOrUrl = absolute(pathOrUrl);
            }
        }

        if (modules.has(pathOrUrl)) {
            return modules.get(pathOrUrl).exports;
        }

        const script = await loadFromUrl(pathOrUrl);
        let exports = {};

        modules.set(pathOrUrl, {
            script: script,
            exports: exports
        });

        let f = new Function("_exports", "var exports = _exports;\n\n" + script);
        f.call(exports);
    }

    window.Weavergirl.Loader = {
        load: load
    };

})();

(function () {

    let stylesheets = new Set();
    let fragments = new Map();



})();