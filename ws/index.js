const WebSocket = require('ws')
const { wsPro } = require('../utils');

function handleWs(server) {

  const rules = [
    'cd',
    'rm',
    'yum',
    'apt',
    'pm2',
    'sudo'
  ]

  const wss = new WebSocket.Server({ server })

  wss.on('connection', (ws) => {
    console.log('connect success')

    ws.on('message', async (data) => {
      console.log(data.toString())
      const { command, projectName } = JSON.parse(data.toString()) || {}

      const [com] = command.split(' ')

      if (rules.includes(com)) {
        ws.send('\r\n' + `An unauthorized command was used - ${com} \r\n Not allowed to command：【${rules.join(',')}】`)
      } else {
        try {

          let data = await wsPro(
            command,
            projectName
          )
  
          ws.send(data.replace(/\n/g, '\r\n'))
        } catch (e) {
          ws.close()
        }
      
      }

    })

  })

}

module.exports = handleWs