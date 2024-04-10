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

const hourlyPay = async (prevHour) => {
    try{

        const profiles = await profileModel.find();
        const currHour = new Date(Date.now()).getHours();

        if(currHour === prevHour) return setTimeout(async () => await hourlyPay(prevHour), 10000);

        profiles.forEach(profile => updateProfile(profile));
  
        console.log('Updated values of all players.');

        setTimeout(async () => await hourlyPay(currHour), 360000);

    } catch (error) {
        console.error(error);
    }
}


module.exports = { hourlyPay };