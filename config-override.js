const { injectBabelPlugin } = require("react-app-rewired")
const rewireDefinePlugin = require("react-app-rewire-define-plugin")

module.exports = function override(config, env) {
  console.log(config)
  config = injectBabelPlugin(
    ["import", { libraryName: "antd", libraryDirectory: "es", style: "css" }],
    config
  )
  config = rewireDefinePlugin(config, env, {
    "process.env.VERSION": JSON.stringify(require("./package.json").version),
  })
  console.log(env)
  return config
}
