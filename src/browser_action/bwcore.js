var config = {
	enable : 0,
	total : 0,
	max : 0,
	chance: 75,
	interval : 0,
	autofollow: true,
	autolike: true
}

$(document).ready(function(){
	$("btn#start").click(function(){
		var txt = $(this).text();
		if (txt==="Start"){
		
			$(this).text("Stop");
			$(this).removeClass("btn-success");
			$(this).addClass("btn-danger");
			config.enable = 1;
			config.max = $('#max-unfollow').val();
			config.chance = $('#chance').val();
			config.interval= $('#interval').val();
			config.autofollow= $("#autofollow").is(":checked");
			config.autolike= $("#autolike").is(":checked");
		} else {
			$(this).text("Start");
			$(this).removeClass("btn-danger");
			$(this).addClass("btn-success");
			config.enable = 0;
		}
		
		set_status();
	});
	
	get_status();
	//setInterval(get_status,1000);
});	

function set_status(){
	
	chrome.runtime.sendMessage({action: "set",
			enable: config.enable,
			total: config.total,
			max: config.max,
			chance: config.chance,
			interval: config.interval,
			autofollow: config.autofollow,
			autolike: config.autolike
		}, function(response){});		

}

function get_status(){
	var $b = $("btn#start");
	var $c = $("btn#count");

	chrome.runtime.sendMessage({action: "get"}, function(response){
	
		config.enable = response.enable;
		config.total = response.total;
		config.max = response.max;
		config.chance = response.chance;
		config.interval = response.interval;
		config.autofollow = response.autofollow;
		config.autolike = response.autolike;
		
		if (config.enable == 0){
			$b.text("Start");
			$b.removeClass("btn-danger");
			$b.addClass("btn-success");
		} else {
			$b.text("Stop");
			$b.removeClass("btn-success");
			$b.addClass("btn-danger");
		}
		
		$c.text(config.total.toString());
		$('#max-unfollow').val(config.max);
		$('#chance').val(config.chance);
		$('#interval').val(config.interval);
		$('#autofollow').prop("checked",config.autofollow);
		$('#autolike').prop("checked",config.autolike);
	});
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

	if(request.action === "count"){
		$("btn#count").text(request.value);
		if(request.enable != 1){
		  var $b = $("btn#start");
		  $b.removeClass("btn-danger");
		  $b.addClass("btn-success");
		  $b.text("Start");
		}
		return;
	}
});
