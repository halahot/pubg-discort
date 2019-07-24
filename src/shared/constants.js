const  COMMON_MESSAGES =  {
    REACTION_WARNING: ':warning: Bot is missing the `Text Permissions > Manage Messages` permission. Give permission for the best experience. :warning:'
};

const TIME_IN_SECONDS = {
    ONE_MINUTE: 60, 
    FIVE_MINUTES: this.ONE_MINUTE * 5,   
    ONE_HOUR: this.ONE_MINUTE * 60,
    THREE_HOUR: this.ONE_HOUR * 3
};

const COLOR = 0x00AE86;

export default {
    COMMON_MESSAGES,
    TIME_IN_SECONDS,
    COLOR
};

