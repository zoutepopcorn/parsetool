console.clear();
const fs = require('fs');
const exec = require('child_process').exec;
const ENTRY_FILE = './main.js';
const PARSE_COMMAND = `parse-server --appId APPLICATION_ID --masterKey MASTER_KEY --databaseURI mongodb://localhost/test --cloud "./main.js"`
const DASHBOARD_COMMAND = `parse-dashboard --appId APPLICATION_ID --masterKey MASTER_KEY --serverURL "http://localhost:1337/parse"`
let commands = []

const killAll = () => {
    for (command of commands) {
        command.kill('SIGINT')
    }
    commands = []
};

const watchFile = () => {
    fs.watchFile(ENTRY_FILE, {interval: 250}, (curr, prev) => {
        let i = 0;
        for (command of commands) {
            if (command.name == PARSE_COMMAND) {
                killAll()
                setTimeout(() => {
                    console.log("     ==================== RESTART ====================     ")
                    watch()
                }, 500)
            }
            i++
        }
        console.log(`${ENTRY_FILE} file change, RESTART`);
    });
};

const watch = () => {
    console.log('=> watch() parse-server => ./main.js');
    run(DASHBOARD_COMMAND)
    setTimeout(() => {
        run(PARSE_COMMAND)
    }, 5000)
    setTimeout(() => {
        console.log("________________________________________________________")
    }, 7000)
    watchFile()
}


const run = (COMMAND) => {
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
    killAll()
});

watch()
