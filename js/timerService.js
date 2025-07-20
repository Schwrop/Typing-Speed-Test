// Handles timer logic for the typing test
export class Timer {
    constructor(duration, onTick, onEnd) {
        this.duration = duration;
        this.timeLeft = duration;
        this.onTick = onTick;
        this.onEnd = onEnd;
        this.interval = null;
    }
    start() {
        this.stop();
        this.timeLeft = this.duration;
        this.interval = setInterval(() => {
            this.timeLeft--;
            if (this.onTick) this.onTick(this.timeLeft);
            if (this.timeLeft <= 0) {
                this.stop();
                if (this.onEnd) this.onEnd();
            }
        }, 1000);
    }
    stop() {
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
    }
    reset() {
        this.stop();
        this.timeLeft = this.duration;
    }
    getTimeLeft() {
        return this.timeLeft;
    }
}
