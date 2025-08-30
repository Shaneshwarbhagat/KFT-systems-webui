const fetch = require('node-fetch')

exports.handler = async function(event, context) {
  const url = event.queryStringParameters && event.queryStringParameters.url
  if (!url) {
    return {
      statusCode: 400,
      body: 'Missing url parameter',
    }
  }

  try {
    // Fetch the file from the HTTP backend
    const response = await fetch(url)
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: 'Failed to fetch file',
      }
    }
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = response.headers.get('content-disposition') || 'attachment; filename="MIS_Report.xlsx"'
    const buffer = await response.buffer()
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Access-Control-Allow-Origin': '*',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Proxy error: ' + err.message,
    }
  }
}
