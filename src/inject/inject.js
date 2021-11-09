/*
	TikTok Unfollower - Script
	(c) 2021 - FreeAngel 
	youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
	github : 
*/

tick_count = 0;
cur_url = "test";

const _MAX_FOLLOW_TO_RELOAD = 40;

last_click = 0;
last_call = 0;
reload = 0;
enabled = 0;
no_buttons = false;
overlimit = false;
r_interval = 0;

first = true;

var config = {
	enable : 0,
	total : 0,
	max : 0,
	chance: 75,
	interval : 0,
	autofollow : true,
	autolike: true
}

function get_random(lmin,lmax){
	var c = parseInt(lmin);
	c = c + Math.floor(Math.random() * lmax);
	if(c > lmax) { c = lmax; };
	return c;
}

var simulateMouseEvent = function(element, eventName, coordX, coordY) {
	element.dispatchEvent(new MouseEvent(eventName, {
	  view: window,
	  bubbles: true,
	  cancelable: true,
	  clientX: coordX,
	  clientY: coordY,
	  button: 0
	}));
  };
  
  function click(btn){
	  var box = btn.getBoundingClientRect(),
		  coordX = box.left + (box.right - box.left) / 2,
		  coordY = box.top + (box.bottom - box.top) / 2;
		  
	  //simulateMouseEvent(btn,"click",coordX,coordY);
	  btn.focus();
	  simulateMouseEvent(btn,"mousemove",coordX,coordY);
	  simulateMouseEvent(btn,"mousedown",coordX,coordY);
	  setTimeout(function(){
		  simulateMouseEvent(btn,"click",coordX,coordY);
		  simulateMouseEvent(btn,"mouseup",coordX,coordY);
	  },200);
  }

function _follow(ps){

	if(!config.autofollow) { return false; }

	var btns = ps.getElementsByTagName("button");
				
	if((!btns) || (btns.length < 1)) { 
		console.log("No Follow Button !");
		return false; 
	}

	for(var i=0; i<btns.length; i++){
		if(btns[i].textContent == "Follow") {

			btns[i].click();
			console.log("Followed !");

			config.total++;
		
			chrome.extension.sendMessage({action: 'inc'}, function(response){
				if(response.status == false)
					config.enable = 0;
			});	

			return true;
		}
	}

	return false;
}

function _like(ps, b){
	if(!config.autolike){ return false; }

	//<span data-e2e="like-icon"
	//var div = ps.querySelectorAll('span[data-e2e="like-icon"]');
	
	var div = ps.querySelectorAll('div.engagement-icon-v23');
	if((!div) || (div.length < 1)){
		div = ps.querySelectorAll('span[data-e2e="like-icon"');
	}
	
	if((!div) || (div.length < 1)) { 
		console.log("No like Button !");
		return false; 
	}	
	
	for(var i=0; i<div.length; i++){
	
		var svg = div[i].querySelector('svg');
		if(svg){
			if(svg.getAttribute('fill') === 'currentColor'){
				console.log("Liked !");
				click(div[i]);

				if(b) { 
					config.total++;
					chrome.extension.sendMessage({action: 'inc'}, function(response){
						if(response.status == false)
							config.enable = 0;
					});	
		
				}
				return true;
			}
			return false;
		}
	
	}	

	return false;
}

function doFollowAndLike(){

	var posts = document.querySelectorAll("div.tiktok-1kylh1d-DivItemContainer");
	if((!posts) || (posts.length < 1))  { 
		console.log("No post not found !");
		return false; 
	}

	var b = false;
	var b1 = false;

	for(var i=0; i<posts.length; i++){

		posts[i].scrollIntoView();
		b = _follow(posts[i]);
		b1 = _like(posts[i], !b);
		if((b) || (b1)) { return true; }
	}

	return false;
}


function show_info(){

	var info = document.getElementById("info_ex");
	if(!info) {
	
		info = document.createElement('div');
		info.style.cssText = "position: fixed; bottom: 0; width:100%; z-index: 999;background-color: #F5FACA; border-style: solid;  border-width: 1px; margins: 5px; paddingLeft: 10px; paddingRight: 10px;";
		info.innerHTML = "<center><h3 id='status_ex'>active</h3></center>";
		info.id = "info_ex";
		document.body.appendChild(info);
		console.log("info_ex created");
	}
}
	
function info(txt){

	var info = document.getElementById("status_ex");
	if(!info) { return; }
	info.textContent = "Action : "+config.total+", "+txt;
}
	
function simulateMouseOver(myTarget) {
  var event = new MouseEvent('mouseover', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  var canceled = !myTarget.dispatchEvent(event);
  if (canceled) {
    //console.log("canceled");
  } else {
    //console.log("not canceled");
  }
}
	
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.action === "set") {
		config.enable = request.enable;
		config.total = request.total;
		config.max = request.max;
		config.chance = request.chance;
		config.interval = request.interval;
		config.autofollow = request.autofollow;
		config.autolike = request.autolike;
		tick_count = 0;
		if(!config.enable){
			var info = document.getElementById("info_ex");
			if(info) {
				console.log("removed");
				info.parentNode.removeChild(info);
			}
			config.total = 0;
			overlimit = false;
			first = true;
		}
	}
});
 
 	   var readyStateCheckInterval = setInterval(function() {
	       if (document.readyState === "complete") {

		   if(first){
				first = false;
				chrome.runtime.sendMessage({action: "get"}, function(response){
	
					config.enable = response.enable;
					config.total = response.total;
					config.max = response.max;
					config.chance = response.chance;
					config.interval = response.interval;
					config.autofollow = response.autofollow;
					config.autolike = response.autolike;
					
					r_interval = get_random(config.interval,config.chance); 
					console.log("got interval : "+r_interval);
				});
		   }
		   
		   cur_url = $(location).attr('href');		   
           tick_count= tick_count+1; 

		   
		   if((config.enable == 1) && (cur_url.indexOf('tiktok.com') !== -1)){

		   	show_info();

			if(config.total >= _MAX_FOLLOW_TO_RELOAD){ no_buttons = true; return; }
			if(config.total >= config.max){ overlimit = true; info("Reached Total Limit : "+config.total); return; }

			if (overlimit) {
				
				if((tick_count % 5) == 0){	info("Reached Total Limit : "+config.total); }
				return;
			}
			   
			if(no_buttons) {

				if(tick_count > 30){
			
					console.log("No Button, Reload");
					window.location.href=cur_url;
				} else {
					var c = 30 - tick_count;
					info("Waiting For "+c+" seconds to reload");
				}
		
				return;
			}
			   
				if (tick_count >= r_interval){
			    
					tick_count = 0;
					doFollowAndLike();
					r_interval = get_random(config.interval,config.chance); 
					//console.log("got interval : "+r_interval);
				
				} else {
					info("Waiting for : "+(r_interval - tick_count));
				}
		   
				
		   } else {
			console.log('tick disable');
		   }

	   }
	}, 1000);

