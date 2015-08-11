## What is this project able to do?

Right now, this is a NodeJS wrapper for a minecraft server (It will forward all the stdin you input to the minecraft server and vice versa) that features automatic backup of the minecraft folder into a configurable destination on a programmable basis. Right now, it's only working on Linux, since it uses some terminal utilities.

## How to configure it?
To configure it, you must edit the config.json file present in the server folder:
```javascript
{
	"minecraftFolder":"../../ftbserver", //Relative path to the minecraft folder
	"backupFolderPath":"../../", //Relative path to the backups folder
	"startMinecraftCommand":"sh", //Command to launch the server
	"startMinecraftFile":"ServerStart.sh", //File that starts the server
	"dayOfWeek":"*", //The days of the week that a backup will be made. * for everyday, or a set of numbers from 0 to 6 (zero is sunday) comma separated (without spaces).
	"hour":"3", //The hours of the day that a backup will be made. same format as the day of the week
	"dayOfMonth":"*" //The days of the month that a backup will be made. same format as the day of the week
}
```
