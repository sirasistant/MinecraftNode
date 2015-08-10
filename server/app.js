var readline = require('readline');
var sudo = require('sudo');
var exec = require('child_process').exec;
var moment = require( 'moment' );
var cron = require('cron');
var CronJob=cron.CronJob;
var config = require('./config.json');

//create state machine
var STATE_RUNNING=0,STATE_BACKUP=1,STATE_CLOSING=2;

var state=STATE_RUNNING;

//create minecraft process
var sudoOptions = {
	cachePassword: true,
	prompt: 'Sudo password? '
};

var minecraftSrv;

var backupAndRestart=function(){
	var filename=config.backupFolderPath+"/"+moment().format('D_M_YYYY_H_mm_ss')+'.tar.gz';

	console.log("Starting backup with name "+filename);

	var backupCmd = 'tar -zcvf '+filename+' '+config.minecraftFolder;

	exec(backupCmd, function(error, stdout, stderr) {
		console.log("changing permissions to file");
		var permissionsProcess= sudo([ 'chmod', '777',filename ], sudoOptions);

		permissionsProcess.on('close', function (code) {
			console.log("Backup finished");
			state=STATE_RUNNING;
			startMinecraft();
		});

	});
}

var startMinecraft=function(){
	console.log("Starting minecraft using command: "+"sudo "+[  config.startMinecraftCommand,config.minecraftFolder+"./"+config.startMinecraftFile ].join(" "));
	minecraftSrv = sudo([  config.startMinecraftCommand,config.minecraftFolder+"/"+config.startMinecraftFile ], sudoOptions);

	minecraftSrv.stdout.on('data', function (data) {
		console.log(data.toString());
	});

	minecraftSrv.on('close', function (code) {
		console.log("Minecraft server closed, state is"+state);
		minecraftSrv.kill('SIGINT');
		switch(state){
			case STATE_RUNNING:
				//run forever
				startMinecraft();
				break;
				case STATE_BACKUP:
				//start the backup
				backupAndRestart();
				
				break;
				case STATE_CLOSING:
				console.log("Server succesfully closed");
				process.exit();
				break;
			}
		});
}
startMinecraft();

var writeToMinecraft=function(line){
	minecraftSrv.stdin.write(line);
}

var stopMinecraft=function(){
	writeToMinecraft("stop \n");
}

//create terminal interface
var stdInput = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

stdInput.on('line', function(line){
	if(line==="stop"){
		state=STATE_CLOSING;
		stopMinecraft();
		return;
	}
	if(state===STATE_RUNNING){
		writeToMinecraft(line+'\n');
	}
	else{
		if(state===STATE_BACKUP){
			console.log("Backup running...");
		}else{
			if(state===STATE_CLOSING){
				console.log("closing...");
			}
		}
	}
});

new CronJob('0 0 '+config.hour+' '+config.dayOfMonth+' * '+config.dayOfWeek, function() {
	if(state===STATE_RUNNING){
		console.log('Backup running...');
		state=STATE_BACKUP;
		stopMinecraft();
	}}, null, true, 'Europe/Madrid');
