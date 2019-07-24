import { GameMode } from '../../pubg-typescript-api';

export default class PubgModeService {

    static getAvailableModes() {
        return Object.values(GameMode);
    }

}