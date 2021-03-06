$(document).ready( function (){
	var sim = physicsSim();
  sim.run();
});

function physicsSim(spec){
	var that = {},
			balls = [],
			world = { ground:0, left:0, right:0 };
	createCanvas({w:960, h:540, fullscreen:true, onResize:adjustWorld});
	world.right        = canvas.width;
	world.ground       = canvas.height - 80;
	function adjustWorld(){
		world.right = canvas.width;
		world.ground = canvas.height - 80;
	}
	
	function draw(){
		// clear the background
		context.clearRect(0,0,canvas.width,canvas.height);
		// draw the ground plane
		context.strokeStyle = "rgb(0,0,0)";
		context.beginPath();
		context.moveTo( 0, world.ground );
		context.lineTo( canvas.width, world.ground );
		context.stroke();
		
		for(var i = 0; i < balls.length-1; ++i){
			for(var j = i+1; j < balls.length; ++j){
				balls[i].collide(balls[j]);
			}
		}
		
		for(var i = 0; i < balls.length; ++i){
			balls[i].move();
			balls[i].draw();
		}
	}
	// runs our simulation
	function loop(){
		draw();
		requestAnimationFrame( loop );
	}	
	
	that.run = function (){			
		var spec = {world: world };
		for( var i = 0; i < 48; ++i ){
			spec.x = Math.random() * canvas.width;
			spec.y = Math.random() * 200;
			spec.px = spec.x - 5 + Math.random() * 10;
			spec.radius = Math.ceil( (Math.random() * (Math.random())) * 8 ) * 12;
			var gray = Math.floor( (Math.random() * 8 + 1) * 255/10 );
			spec.style = "rgb(" + gray + "," + gray + "," + gray + ")";
			balls.push( ball( spec ) );
		}
		loop();
	}
	
	return that;
}

function ball(spec){
	var that = {},
			x = spec.x || 0,
		  y = spec.y || 0,
		  px = spec.px || spec.x || x,
		  py = spec.py || spec.y || y,
		  radius = spec.radius || 48,
			style = spec.style || "rgb(180,180,180)",
		  friction = 0.725,
		  gravity = spec.gravity || 0.75,
		  grabbed = false,
			recoil = 1.25,
			world = spec.world || {ground:100, left:0, right:100};

	// check if the mouse should hold the ball
	// once grabbed, will hold on until mouse is released
	function checkGrabbing(){
		if( mouseDown ){
			if(((mouseX-x)*(mouseX-x) + (mouseY-y)*(mouseY-y)) < (radius * radius)){
				grabbed = true;
			}
		} else {
			grabbed = false;
		}
		return grabbed;
	}
	that.vitals = function(){
		return {x:x,
						y:y,
						px:px,
						py:py,
						radius:radius };
	}
	that.shift = function(ax, ay){
		x += ax;
		y += ay;
	}
	that.collide = function(other){
		var v = other.vitals();
		var dx = v.x - x;
		var dy = v.y - y;
		var r2 = (radius + v.radius) * (radius + v.radius);
		var dist2 = (dx)*(dx) + (dy)*(dy);
		if( dist2 < r2 ){
			var minDist = radius + v.radius;
			var angle = Math.atan2(dy, dx);
			var tx = x + Math.cos(angle) * minDist;
			var ty = y + Math.sin(angle) * minDist;
			// move away along vector
			var p1 = 1.0 - radius / minDist;
			var p2 = 1.0 - v.radius / minDist;
			var ax = (tx - v.x) * recoil;
			var ay = (ty - v.y) * recoil;
			that.shift( -ax * p1, -ay * p1 );
			other.shift( ax * p2, ay * p2 );
		}
	}
	that.move = function (){
		// move the ball
		checkGrabbing();
		if( grabbed ){
			// user controlled
			px = pmouseX;
			py = pmouseY;
			x = mouseX;
			y = mouseY;
		} else {
			// do physics
			var dx = x - px;
			var dy = (y + gravity) - py;
			x = x + dx * friction;
			y = y + dy * friction;
			// bounce off the ground
			if(y > world.ground - radius){
				y = world.ground - radius;
				dy *= -friction; // reverse energy
				dx *= friction; // reduce energy
			}
			// bounce off left/right walls
			if( x > world.right - radius ){
				x = world.right - radius;
				dx *= -friction; // reverse energy
				dy *= friction;
			} else if( x < world.left + radius ){
				x = world.left + radius;
				dx *= -friction;
				dy *= friction;
			}
			// store previous positions
			py = y - dy;
			px = x - dx;
		}
	}
	
	// public method
	that.draw = function (){
		// draw the ball
		context.fillStyle = style;
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI*2);
		context.fill();
	}
	
	return that;
}
