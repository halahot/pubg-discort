const DEATH_TYPE = {
    ALIVE:'alive',
    BY_PLAYER: 'byplayer',
    SUICIDE: 'suicide',
  };

const GAME_MODE = {
    DUO: 'duo',
    DUO_FPP: 'duo-fpp',
    SOLO: 'solo',
    SOLO_FPP: 'solo-fpp',
    SQUAD: 'squad',
    SQUAD_FPP: 'squad-fpp',
  }; 

const PLATFORM_REGION = {
    // PC Platforms
    STEAM: 'steam',
    KAKAO: 'kakao',
    PC_AS: 'pc-as',
    PC_EU: 'pc-eu',
    PC_JP: 'pc-jp',
    PC_KRJP: 'pc-krjp',
    PC_KAKAO: 'pc-kakao',
    PC_NA: 'pc-na',
    PC_OC: 'pc-oc',
    PC_RU: 'pc-ru',
    PC_SA: 'pc-sa',
    PC_SEA: 'pc-sea',
    // PSN Platforms
    PSN: 'psn',
    PSN_AS: 'psn-as',
    PSN_EU: 'psn-eu',
    PSN_NA: 'psn-na',
    PSN_OC: 'psn-oc',
    // XBOX Platforms
    XBOX: 'xbox',
    XBOX_AS: 'xbox-as',
    XBOX_EU: 'xbox-eu',
    XBOX_NA: 'xbox-na',
    XBOX_OC: 'xbox-oc',
    XBOX_SA: 'xbox-sa'
  };  

export default {
      DEATH_TYPE,
      GAME_MODE,
      PLATFORM_REGION
  };