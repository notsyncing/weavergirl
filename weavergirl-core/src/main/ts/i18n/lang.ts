import Loader from "../loader/loader";

export class Language {
    private static currentLocale = "en-US";
    private static languageFileBase = "/languages/";

    private static languageFiles = new Map<string, any>();
    private static currentLanguageData: any = null;

    static enable = false;

    static init() {
        if (!this.enable) {
            this.enable = true;
        }

        Language.setLocale(navigator.language || navigator["browserLanguage"]);
    }

    static setLocale(locale: string) {
        this.currentLocale = locale;

        if (!this.languageFiles.has(locale)) {
            Loader.loadAsset(this.languageFileBase + locale + ".json")
                .then(d => {
                    let data = JSON.parse(d);
                    this.languageFiles.set(locale, data);
                    this.currentLanguageData = data;
                })
                .catch(err => {
                    console.warn(`Failed to load language file for ${this.currentLocale}: ${err.message}`);
                    console.dir(err);
                });
        } else {
            this.currentLanguageData = this.languageFiles.get(locale);
        }
    }

    static getCurrentLocale(): string {
        return this.currentLocale;
    }

    static setLanguageFileBase(base: string) {
        if (!base.endsWith("/")) {
            base += "/";
        }

        this.languageFileBase = base;
    }

    static getText(key: string, ...args: Array<string>): string {
        let s = Language.enable ? (Language.currentLanguageData || {})[key] : key;

        if (!s) {
            s = key;
        }

        for (let i = 0; i < args.length; i++) {
            let p = new RegExp(`\\{${i}\\}`, "g");
            s = s.replace(p, args[i]);
        }

        return s;
    }
}

