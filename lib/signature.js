const fetch = require('node-fetch')
const retry = require('async-retry')
const convertStream = require('stream-to-string')

module.exports = async (fileName, assets) => {
  // Look if we can find a signature...
  const foundSignature = assets.find(asset => asset.name === `${fileName}.sig`)

  if (!foundSignature) {
    return null
  }

  const { body } = await retry(
    async () => {
      const response = await fetch(foundSignature.browser_download_url)

      if (response.status !== 200) {
        throw new Error(
          `GitHub API responded with ${response.status} for url ${
            foundSignature.browser_download_url
          }`
        )
      }

      return response
    },
    { retries: 3 }
  )

  const content = await convertStream(body)
  return content
}
