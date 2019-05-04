console.clear();
const fs = require('fs');
const exec = require('child_process').exec;
const ENTRY_FILE = './main.js';
const PARSE_COMMAND = `parse-server --appId APPLICATION_ID --masterKey MASTER_KEY --databaseURI mongodb://localhost/test --cloud "./main.js"`
const DASHBOARD_COMMAND = `parse-dashboard --appId APPLICATION_ID --masterKey MASTER_KEY --serverURL "http://localhost:1337/parse"`
let commands = []

const watch = () => {
    run(PARSE_COMMAND)
    run(DASHBOARD_COMMAND)
    fs.watchFile(ENTRY_FILE, {interval: 250}, (curr, prev) => {
        for(command of commands) {
            if(command.name == PARSE_COMMAND) {
                command.kill()
                run(PARSE_COMMAND)
                break;
            }
        }
        console.log(`${ENTRY_FILE} file change, RESTART`);
    });
}
const run = (COMMAND) => {
    console.log(COMMAND);
    const command = exec(COMMAND);
    command.name = COMMAND
    commands.push(command)
    command.stdout.on('data', (data) => {
        console.log(data);
    });
    command.stdout.on('end', (data) => {
        console.log(`END `);
    });
}

process.on('beforeExit', () => {
    for(command of commands) {
        command.kill()
    }
});

watch()
