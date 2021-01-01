/**
 * steps = Array of Step
 * Step: function(msg: Message, state: object, cancel: function): async<bool>
 *      returns true if wizard should advance to next step
 *      returns false if step should be repeated (e.g. for invalid input)
 * 
 *      msg: The message which triggered this step
 *      state: general purpose object to keep track of state between steps
 *      cancel: can be called at any time to cancel the wizard
 */

function createWizard(steps, startMessage, client, timeout = 60, onTimeout) {
    // create user state
    let currStep = 0;
    let state = { init: true };
    let userId = startMessage.author.id, channelId = startMessage.channel.id;
    let blockFlag = false;

    // define control functions
    let cancelFn;
    let resetTimeoutFn;

    // create message handler for wizard
    const messageRecieved = async (msg) => {
        // skip if this is the incorrect user or channel responding, or we're still waiting on another step
        if(msg.author.id !== userId || msg.channel.id !== channelId || blockFlag)
            return;
        // delete user's message
        let m = { content: msg.content, guild: msg.guild.id };
        await msg.delete();
        // pass it onto the next step
        blockFlag = true;
        let pass = await steps[currStep](m, state, cancelFn);
        if(pass) {
            currStep++;
            if(currStep >= steps.length) {
                cancelFn();
            } else {
                resetTimeoutFn();
            }
        }
        blockFlag = false;
    };
    client.on("message", messageRecieved);

    // create timeout function
    let timeoutId;
    resetTimeoutFn = () => {
        timeoutId = setTimeout(() => {
            cancelFn();
            if(onTimeout) {
                onTimeout();
            }
        }, timeout * 1000);
    };
    resetTimeoutFn();

    // define cancel function for wizard
    cancelFn = () => {
        client.off("message", messageRecieved);
        if(timeoutId) clearTimeout(timeoutId);
    };

    // call first step to begin process
    steps[0](startMessage, state, cancelFn);
    state.init = false;

}

module.exports = {
    createWizard
};