//setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;



console.log(ctx);
const gradient = ctx.createLinearGradient (0,0, 0, canvas.height);
gradient.addColorStop(0, 'white');
gradient.addColorStop(1, 'gold');
ctx.fillStyle = gradient;
ctx.strokeStyle = gradient;


class Particle {
constructor (effect, index){
    this.effect = effect;
    this.index= index;
    this.radius = Math.floor(Math.random() *10 + 5);

    this.x = this.radius + Math.random() * (this.effect.width  - this.radius *2);
    this.y= this.radius + Math.random () * (this.effect.height - this.radius *2);
    this.vx = Math.random() * 1 - 0.5;
    this.vy = Math.random() * 1 - 0.5;
    this.pushX = 0;
    this.pushY = 0;
    this.friction = 0.8;

}
draw (context){
if ( this.index % 2 === 0 ){
    context.save();
    context.globalAlpha = 0.6; 
    context.beginPath();
    context.moveTo (this.x, this.y);
    context.lineTo(this.effect.mouse.x, this.effect.mouse.y);
    context.stroke();
    context.restore();
}
context.beginPath();
context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
context.fill();

}
update(){
    if (this.effect.mouse.pressed){
        const dx= this.x - this.effect.mouse.x;
        const dy = this.y - this.effect.mouse.y;
        const distance = Math.hypot(dx, dy);
        const force = this.effect.mouse.radius / distance;

        if (distance < this.effect.mouse.radius){
            //atan2 gives a sense of direction
            const angle = Math.atan2(dy, dx);
            //i want particles to bounce around
            this.pushX += Math.cos(angle) * force;
            this.pushY += Math.sin(angle) *force;
        }
    } //adding  friction using physics
    this.x += (this.pushX *= this.friction)+ this.vx;
    this.y += (this.pushY *= this.friction)+ this.vy; 
    
    //particles should stay inside canvas
    if (this.x <this.radius){
        this.x = this.radius;
        this.vx *= -1;
    } else if (this.x > this.effect.width - this.radius){
        this.x = this.effect.width - this.radius;
        this.vx *= -1;
    }
    if (this.y <this.radius){
        this.y = this.radius;
        this.vy *= -1;
    } else if (this.y > this.effect.height - this.radius){
        this.y = this.effect.height - this.radius;
        this.vy *= -1;
    } 

} reset(){
    this.x = this.radius + Math.random() * (this.effect.width  - this.radius *2);
    this.y= this.radius + Math.random () * (this.effect.height - this.radius *2);
}
}

class Effect {
constructor(canvas, context){
    this.canvas= canvas;
    this.context = context;
    this.width= this.canvas.width;
    this.height= this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 300;
    this.createParticles();

    //setting mouse effect

    this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false,
        radius: 120
    }
//es6 arrow functions were created to simplify functon scope
    window.addEventListener('resize', e => {
     console.log(e.target.window.innerWidth);
     this.resize(e.target.window.innerWidth, e.target.window.innerHeight);
    })
    window.addEventListener('mousemove', e => {
      if(this.mouse.pressed){
        this.mouse.x = e.x;
        this.mouse.y  = e.y;
  
      }
    })
    window.addEventListener('mousedown', e => {
        this.mouse.pressed = true;
        this.mouse.x = e.x;
        this.mouse.y  = e.y;
        
    })
    window.addEventListener('mouseup', e => {
        this.mouse.pressed = false; 

    })
}
createParticles (){
    for (let i=0; i <this.numberOfParticles; i++){
        this.particles.push(new Particle(this, i));
    }
}
handleParticles(context){
    //it goes through code line by line
    //connect line first then the particle so lines r connected behind particles
    this.connectParticles(context);
    this.particles.forEach(particle => {
        particle.draw(context);
        particle.update();
    });
   
}
//connectParticles expects context as an argument 
connectParticles(context){
    const maxDistance = 80;
    //we compare every particle to another particle using nested for loops
    for (let a = 0; a < this.particles.length; a++){
        for (let b = a; b < this.particles.length; b ++){
             const dx = this.particles [a].x - this.particles[b].x;
             const dy= this.particles [a].y - this.particles[b].y;
             const distance = Math.hypot(dx, dy);
//when their distance is less than max distance means they are closer
             if (distance < maxDistance){
                //save method will save all canvas settings 
                context.save();
                //to make smoother effect
                //defining opacity using global alpha 
             const opacity = 1 -(distance/maxDistance);
             context.globalAlpha = opacity; 
             context.beginPath();
             context.moveTo(this.particles[a].x, this.particles[a].y);
             context.lineTo(this.particles[b].x, this.particles[b].y);
//using stroke method to draw line
            context.stroke();
            //calling restore resets canvas set 
            context.restore ();
           }
        }
    }
}  
resize(width, height){
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    //reset, resets everything to default thats why need to declare color again
    const gradient = this.context.createLinearGradient (0,0, 
    width, height);
gradient.addColorStop(0, 'white');
gradient.addColorStop(0.5, 'gold');
gradient.addColorStop(1, 'orangered');
this.context.fillStyle = gradient;
this.context.strokeStyle = 'white';
this.particles.forEach(particle => {
    particle.reset();
});
}
}

const effect = new Effect (canvas, ctx);


function animate(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    effect.handleParticles(ctx);
    requestAnimationFrame(animate);
}
animate();

