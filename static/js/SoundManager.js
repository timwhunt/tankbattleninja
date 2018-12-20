export default class SoundManager {
    constructor() {
        this.fireSounds = [];
        this.fireIdx = 0;
        this.fireSounds.push(new Audio('/sound/fire.wav'));
        this.fireSounds.push(new Audio('/sound/fire.wav'));
        this.fireSounds.push(new Audio('/sound/fire.wav'));
        this.fireSounds.push(new Audio('/sound/fire.wav'));
        this.fireSounds.push(new Audio('/sound/fire.wav'));
        this.fireSounds.push(new Audio('/sound/fire.wav'));
        this.fireSounds.push(new Audio('/sound/fire.wav'));

        this.hitSounds = [];
        this.hitIdx = 0;
        this.hitSounds.push(new Audio('/sound/hit.wav'));
        this.hitSounds.push(new Audio('/sound/hit.wav'));
        this.hitSounds.push(new Audio('/sound/hit.wav'));
        this.hitSounds.push(new Audio('/sound/hit.wav'));

        this.dieSounds = [];
        this.dieIdx = 0;
        this.dieSounds.push(new Audio('/sound/die.wav'));

        this.localPlayer = null;
    }

    calculateVolume(posX, posZ) {
        var distSquared = Math.pow(posX - this.localPlayer.dynamic.posX,2) + Math.pow(posZ - this.localPlayer.dynamic.posZ,2);
        if (distSquared > 40000) { //200^2 - too far
            return 0;
        }
        return 1.0 - distSquared / 40000;
    }
    playFire(posX, posZ){
        //if (this.localPlayer.dynamic.playerIndex != 0) return; //hack for running two players on one computer

        var volume = this.calculateVolume(posX, posZ);
        if (volume == 0) {
            return;
        }

        if (++this.fireIdx >= this.fireSounds.length) {
            this.fireIdx = 0;
        }
        this.fireSounds[this.fireIdx].volume = volume;
        this.fireSounds[this.fireIdx].play();
    }

    playDie() {
        if (++this.dieIdx >= this.dieSounds.length) {
            this.dieIdx = 0;
        }
        this.dieSounds[this.dieIdx].play();
    }

    playHit(posX, posZ) {
        //if (this.localPlayer.dynamic.playerIndex != 0) return; //hack for running two players on one computer

        var volume = this.calculateVolume(posX, posZ);
        if (volume == 0) {
            return;
        }

        if (++this.hitIdx >= this.hitSounds.length) {
            this.hitIdx = 0;
        }
        this.hitSounds[this.hitIdx].volume = volume;
        this.hitSounds[this.hitIdx].play();
    }

}
