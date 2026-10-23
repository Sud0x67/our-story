// An original, quiet pentatonic score. No external media or song recordings.
export class Ambience {
  constructor(){this.context=null;this.enabled=true;this.nextNote=0;this.step=0;this.started=false;}
  async start(){
    if(!this.context){
      const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;
      this.context=new Context();const ctx=this.context;
      this.master=ctx.createGain();this.master.gain.value=0;this.master.connect(ctx.destination);
      const reverb=ctx.createConvolver(),impulse=ctx.createBuffer(2,ctx.sampleRate*2.2,ctx.sampleRate);
      for(let c=0;c<2;c++){const data=impulse.getChannelData(c);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,3)*.22;}
      reverb.buffer=impulse;const wet=ctx.createGain();wet.gain.value=.32;reverb.connect(wet);wet.connect(this.master);this.reverb=reverb;
    }
    await this.context.resume();this.started=true;this.nextNote=this.context.currentTime+.15;this.setQuiet(false);
  }
  setQuiet(quiet,ending=false){
    if(!this.context)return;const target=this.enabled&&!quiet?(ending?.035:.15):0;
    if(target!==this.targetGain){this.targetGain=target;this.master.gain.setTargetAtTime(target,this.context.currentTime,.8);}
  }
  async toggle(){if(!this.started){this.enabled=true;await this.start();}else{this.enabled=!this.enabled;this.setQuiet(false);}}
  note(midi,when,volume=.1,duration=3){
    const ctx=this.context;
    for(const [i,multiplier]of[1,2,3].entries()){
      const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.value=440*Math.pow(2,(midi-69)/12)*multiplier;
      gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(volume*[1,.16,.045][i],when+.025);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
      oscillator.connect(gain);gain.connect(this.master);gain.connect(this.reverb);oscillator.start(when);oscillator.stop(when+duration+.05);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    }
  }
  update(){
    if(!this.context||!this.started||!this.enabled)return;const now=this.context.currentTime;
    if(this.nextNote<now-.2)this.nextNote=now+.1;
    if(this.nextNote>now+.12)return;
    const roots=[48,45,53,55],melody=[12,16,19,24,19,16,14,19,12,19,24,28,24,19,16,14];
    const root=roots[Math.floor(this.step/8)%4];this.note(root+melody[this.step%melody.length],this.nextNote,.18,3.5);
    if(this.step%4===0){this.note(root-12,this.nextNote,.16,5);this.note(root+7,this.nextNote,.07,4);}
    this.nextNote+=.82;this.step++;
  }
  dispose(){this.context?.close();}
}
