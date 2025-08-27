import { defineComponent, reactive, ref, onMounted, onUnmounted, nextTick } from "vue";
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

export default defineComponent({
  props: {
    terminalDialog: { type: Boolean, default: false },
    terminalProjectName: { type: String }
  },

  emits: {
    closeDialog: () => true
  },

  setup(props, { emit }) {

    const state = reactive({
      terminal: null,
      currentCommand: '',
      socket: null,
      isConnecting: false
    } as {
      terminal: Terminal | null,
      currentCommand: string,
      socket: WebSocket | null,
      isConnecting: Boolean
    })

    const terminalRef = ref<HTMLDivElement | null>(null);

    const methods = {
      initTerminal: () => {
        state.terminal = new Terminal({
          cursorBlink: true,
          cursorStyle: 'underline',
          fontSize: 14,
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          theme: {
            foreground: '#e0e0e0',
            background: '#1e1e1e',
            cursor: '#e0e0e0',
            brightWhite: '#ffffff'
          }
        });

        if (terminalRef.value) {
          state.terminal.open(terminalRef.value);

          state.terminal.write('Welcome to Vue3 Terminal\r\n');
          state.terminal.write('Type "help" for available commands\r\n');
        }

        state.terminal.onData((data: string) => {
          handler.handleTerminalInput(data);
        });
      },

      executeCommand: (command: string) => {
        switch (command.trim().toLowerCase()) {
          case 'help':
            state.terminal?.write('Available commands:\r\n');
            state.terminal?.write('  help - Show available commands\r\n');
            state.terminal?.write('  clear - Clear terminal\r\n');
            state.terminal?.write('  info - Show system info\r\n');
            state.terminal?.write('  connect - Connect to server\r\n');
            break;
          case 'clear':
            state.terminal?.clear();
            break;
          case 'info':
            state.terminal?.write('Sa-io Terminal v1.0.0\r\n');
            break;
          case 'connect':
            methods.connectToServer();
            break;
          default:
            if (state.socket && state.socket.readyState === WebSocket.OPEN) {
              state.socket.send(JSON.stringify({ projectName: props.terminalProjectName, command }));
            } else {
              state.terminal?.write(`Command not found: ${command}\r\n`);
              state.terminal?.write('Type "help" for available commands\r\n');
            }
        }
      },

      connectToServer: () => {
        if (!!state.socket) {
          state.socket.close()
        }
        
        const wsUrl = 'ws://192.168.1.49:3000';
        state.socket = new WebSocket(wsUrl);

        state.isConnecting = true;

        state.socket.onopen = () => {
          state.isConnecting = false;
          state.terminal?.write('Connected to server successfully!\r\n');
        };

        state.socket.onmessage = (event) => {
          state.terminal?.write(event.data + '\r\n');
        };

        state.socket.onerror = (error: any) => {
          state.isConnecting = false;
          
          state.terminal?.write(`Connection error: ${error.message}\r\n`);
        };

        state.socket.onclose = () => {
          state.isConnecting = false;
          state.terminal?.write('Disconnected from server\r\n');
        };
      }
    }

    const handler = {
      closeDialog: () => emit('closeDialog'),

      handleTerminalInput: (data: string) => {
        const charCode = data.charCodeAt(0);

        console.log(charCode);
        

        if (charCode === 13) {
          state.terminal?.write('\r\r\n');
          methods.executeCommand(state.currentCommand);
          state.currentCommand = '';
          return;
        }

        if (charCode === 127) {
          if (state.currentCommand.length > 0) {
            state.currentCommand = state.currentCommand.slice(0, -1);
            state.terminal?.write('\b \b');
          }
          return;
        }

        if (charCode >= 32 && charCode <= 126) {
          state.currentCommand += data;
          state.terminal?.write(data);
        }
      }
    }

    onMounted(() => {
     
      nextTick(methods.initTerminal)
      // window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      // window.removeEventListener('resize', handleResize);

      if (state.terminal) {
        state.terminal.dispose();
      }
      if (state.socket) {
        state.socket.close();
      }
    });

    return () => (
      <el-dialog v-model={props.terminalDialog} title={`${props.terminalProjectName} Termianl`} width="80%" top="5vh"
        before-close={handler.closeDialog}
        v-slots={{
          footer: () => <>
            <div class="dialog-footer">
              <el-button onClick={handler.closeDialog}>Cancel</el-button>
            </div>
          </>
        }}
      >
        <div class="terminal-container">
          <div 
            ref={terminalRef}
            style={{ width: '100%', height: '450px' }} 
            v-loading={state.isConnecting} 
            class="terminal-wrapper"
          ></div>
       </div>
      </el-dialog>
    )
  }
})