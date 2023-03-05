const globby = require('globby')
const config = require("./lasso-config")
const path = require("path");
const lasso = require("lasso");
async function prebuild() {
    console.log("Beginning Lasso Prebuild")
    run({
        config: config,
        flags: [],
        pages: await globby('marko/pages/*/*.marko')
    }).then(lassoPrebuildResult => {
        const builds = lassoPrebuildResult._buildsByPath
        for (const key in builds) {
            console.log(`Prebuilt ${key}`)
        }
        console.log("Finished Lasso Prebuild.")
    })
}
prebuild().catch(err => {
    console.error(err)
    throw err;
}) 
function run (options = {}) {
    let {
        pages,
        config,
        flags
    } = options;
    if (typeof config === "string") {
        config = require(require.resolve(path.resolve(process.cwd(), config)));
    }
    const theLasso = lasso.create(config);
    const pageConfigs = pages.map(page => {
        return {
            flags,
            dependencies: [`marko-hydrate:${page}`],
            pageDir: path.resolve(process.cwd(), path.dirname(page)),
            pageName: page
        };
    });
    return theLasso.prebuildPage(pageConfigs);
};
