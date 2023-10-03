const { ActivityType } = require('discord.js');
const profileModel = require('../../models/profileSchema');

module.exports = async (client) => {
    console.log("CivSim is online!");
    client.user.setActivity(`${client.guilds.cache.size} servers.`, { type: ActivityType.Watching });

    //Update gold every hour

    let prevHour;

    setInterval(async () => {
        try{

          const profiles = await profileModel.find();

          if(new Date(Date.now()).getHours() != prevHour){

            prevHour = new Date(Date.now()).getHours();

            for (const profile of profiles) {

              const { earnRate, growthRate } = profile;
      
              await profileModel.updateMany(
                { 
                  userID: profile.userID 
                },
                { 
                  $inc: 
                  { 
                    citizens: growthRate,
                    earnRate: growthRate,
                    growthRate: 1,
                    gold: earnRate,
                  } 
                }
              );
            }
            
            console.log('Updated values of all players.');
        }

        } catch (error) {
            return console.log('Error while updating values.', error);
        }
    }, 3600000);
}