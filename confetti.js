// GLOBAL VARS
var canvas;
var context;

var width;
var height;

var maxConfetti = 125; // Sets max number of confetti pieces
var particles = [];

var angle = 0;
var tiltAngle = 0;

var confettiRunning = true;
var animationDone = true;
var animationHandler;
var reactivateTimer;

var startYet = false;

var intervalCounter = 0;
var deactivateCounter = 0;

// Document init
document.addEventListener("DOMContentLoaded", function(){

    console.log('loaded confetti');

    SetGlobals();
    InitializeConfetti();

    //$(window).resize(function () {
    window.onresize = (function() {
        console.log('onresize');
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    // Attach to DOM elements here...
    //$("#price").click(function(e){
    document.getElementById("price").addEventListener("click", function(event){

        if(startYet){
            RestartConfetti();
        } else {
            StartConfetti();
            startYet = true;
        }

        //$('#banner').slideDown("slow");
        slideDown('#banner');


    }, false);

});

// FUNCTIONS
// Manual slide down transition functions to avoid jQuery usage
function slideDown(find){

    element = document.querySelector(find);
    element.style.display="block";
    element.className = "box animate";
    resetClass(element);
    addClass(element,"slidedown");

}

function resetClass(el) {
    var class_to_remove = ['slideup','slidedown','facein','fadeout'];
    var each_class = el.className.split(" ");
    newclass = [];
    for (i=0 ; i < each_class.length ; i++) {
        if(class_to_remove.indexOf(each_class[i]) >= 0){
            continue;
        }
        newclass.push(each_class[i]);
    }
    el.className = newclass.join(" ");
}

function addClass(el,cl){
    el.className = el.className + " " + cl;
}

function removeClass(el,cl){
    var each_class = el.className.split(" ");
    newclass = [];
    for (i=0 ; i < each_class.length ; i++) {
        if(each_class[i] == cl){
            continue;
        }
        newclass.push(each_class[i]);
    }
    el.className = newclass.join(" ");
}

// Manual fade out transition function to avoid jQuery usage
function fadeOut(el) {
    el.style.opacity = 1;

    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = "none";
        } else {
            requestAnimationFrame(fade);
        }
    })();
}

// Initializes browser window canvas
function SetGlobals() {

    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

}

// Generates random hex value color for confetti
function getColor(){

    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;

}

// Creates confetti particle
function confettiParticle(colorOptions) {

    this.x = Math.random() * width; // x-coordinate
    this.y = (Math.random() * height) - height; //y-coordinate
    this.r = Math.floor(Math.random() * (40 - 10 + 1) + 10); //radius;
    this.d = (Math.random() * maxConfetti) + 10; //density;
    this.colorOptions = colorOptions;
    this.tilt = Math.floor(Math.random() * 10) - 10;
    this.tiltAngleStep = (Math.random() * 0.07) + .05;
    this.tiltAngle = 0;
    this.draw = function () {
        context.beginPath();
        context.lineWidth = this.r / 3;
        context.strokeStyle = this.color;
        context.moveTo(this.x + this.tilt + (this.r / 4), this.y);
        context.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r / 4));
        return context.stroke();
    };

}

// Confetti init
function InitializeConfetti() {
    


    particles = [];

    animationDone = false;

    for (var i = 0; i < maxConfetti; i++) {
        var particleColor = getColor();
        particles.push(new confettiParticle(particleColor));
    }

    if(startYet){
        StartConfetti();
    }

}

// Draw confetti particle
function Draw() {

    context.clearRect(0, 0, width, height);

    var results = [];

    for (var i = 0; i < maxConfetti; i++) {
        (function (j) {
            results.push(particles[j].draw());
        })(i);
    }

    Update();

    return results;

}

// Update confetti particle, step through frames
function Update() {

    var remainingConfetti = 0;
    var confetti;
    angle += 0.01;
    tiltAngle += 0.1;

    for (var i = 0; i < maxConfetti; i++) {
        confetti = particles[i];
        if (animationDone) return;

        if (!confettiRunning && confetti.y < -15) {
            confetti.y = height + 100;
            continue;
        }

        stepParticle(confetti, i);

        if (confetti.y <= height) {
            remainingConfetti++;
        }
    
    }

    if (remainingConfetti === 0) {
        StopConfetti();
    }

}

// Animate confetti
function stepParticle(particle, particleIndex) {

    particle.tiltAngle += particle.tiltAngleStep;
    particle.y += (Math.cos(angle + particle.d) + 3 + particle.r / 2) / 2;
    particle.x += Math.sin(angle);
    particle.tilt = (Math.sin(particle.tiltAngle - (particleIndex / 3))) * 15;
    particle.color = particle.colorOptions;

}

// Clear animation timers, hide VIP banner
function ClearTimers() {

    clearTimeout(reactivateTimer);
    clearTimeout(animationHandler);
    
    //console.log('cleartimers');

    var fadeInterval = setInterval(function(){
        console.log('fadeout');
        intervalCounter += 1;
        //console.log(intervalCounter);
        //$('#banner').fadeOut(1000);
        if(intervalCounter < 2){
            var el = document.querySelector('#banner');
            fadeOut(el);
        } 

        clearInterval(fadeInterval);

    },2000);

}

// Start confetti animation loop, stop generation after a certain period of time
function StartConfetti() {

    console.log('start confetti');

    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    (function animloop() {
        if (animationDone) return null;
        animationHandler = requestAnimFrame(animloop);
        return Draw();
    })();

    setInterval(function(){
        deactivateCounter += 1;
        //console.log(intervalCounter);
        //$('#banner').fadeOut(1000);
        if(deactivateCounter < 2){
            DeactivateConfetti();
        }
    },1200);

}

// Stop confetti animation and clear timers
function DeactivateConfetti() {

    console.log('deactivate confetti');

    confettiRunning = false;
    ClearTimers();        

}

// Stop confetting entirely and clear canvas
function StopConfetti() {

    console.log('stop confetti');

    animationDone = true;
    if (context == undefined) return;
    context.clearRect(0, 0, width, height);

}

// Restart confetti if user clicks link again after removing VIP from cart
function RestartConfetti() {

    console.log('restart');

    document.getElementById("banner").style.display = "none";
    document.getElementById("banner").style.opacity = "1";

    ClearTimers();
    StopConfetti();

    intervalCounter = 0;
    

    reactivateTimer = setTimeout(function () {
        //console.log('reactivate timer');
        confettiRunning = true;
        animationDone = false;
        InitializeConfetti();
    }, 100);

}

// Browser animation frame function
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        return window.setTimeout(callback, 1000 / 60);
    };
})();