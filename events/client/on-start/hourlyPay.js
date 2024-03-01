const profileModel = require('../../../models/profileSchema');

const updateProfile = async (profile) =>{
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

const checkTime = async (prevHour) => {
    try{

        const profiles = await profileModel.find();
        const currHour = new Date(Date.now()).getHours();

        if(currHour != prevHour){

            profiles.forEach(profile => updateProfile(profile));
  
            console.log('Updated values of all players.');
        }

        setTimeout(async () => await checkTime(currHour), 360000);

    } catch (error) {
        return console.log('Error while updating values.', error);
    }
}


module.exports = { checkTime };