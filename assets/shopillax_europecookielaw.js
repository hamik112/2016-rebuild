function __shopillax_europeancookielaw_init() {
	var $div_overlay = jQuery("<div>", {id: "shopillaxcookielaw-overlay", class: "remove"});
	var $div_wrapper = jQuery("<div>", {id: "shopillaxcookielaw-wrapper", class: "top"});
	$div_overlay.attr("id","shopillaxcookielaw-overlay");
	$div_overlay.attr("class","remove");
	$div_wrapper.attr("id","shopillaxcookielaw-wrapper");
	$div_wrapper.attr("class","top");
	var htmlPaddingTop = jQuery("html").css('paddingTop');
	if (htmlPaddingTop!='' && htmlPaddingTop!='0px' && htmlPaddingTop!='0') {
		$div_wrapper.css({'top':htmlPaddingTop});
	}
	var ahtml = '<div id="shopillaxcookielaw-content">';
	ahtml = ahtml + '<div id="shopillaxcookielaw-desc">';
	ahtml = ahtml + '<p>We are using cookies to give you the best experience on our site. Cookies are files stored in your browser and are used by most websites to help personalise your web experience. By continuing to use our website without changing the settings, you are agreeing to our use of cookies. <a href="http://www.taste4.co.uk/pages/cookies" class="shopillaxcookielaw_button shopillaxcookielaw_more-info" target="_blank"><span>More Info</span></a> <a href="" class="shopillaxcookielaw_button shopillaxcookielaw_close" onclick="__shopillax_europeancookielaw_close();return false;"><span>Close</span></a></p>';
	ahtml = ahtml + '</div>';
	ahtml = ahtml + '</div>';
	var cookie_policy_page_url = 'http://www.taste4.co.uk/pages/cookies';
	var page_url = document.URL;
	$div_wrapper.html(ahtml);
	jQuery('body').append($div_wrapper);
	if (page_url.indexOf(cookie_policy_page_url)==-1) {
		jQuery('body').append($div_overlay);	
	}
}

function __shopillax_europeancookielaw_close() {
	var cookie_duration_days = 365;
	var cookie_domain = 'domain=.'+document.domain;
	var cookie_name = 'europeancookielaw';
	var cookie_value = 'true';
	var cookie_date = new Date();
	cookie_date.setTime(cookie_date.getTime()+(cookie_duration_days*24*60*60*1000));
	var cookie_expires = "; expires="+cookie_date.toGMTString();
	document.cookie = cookie_name+"="+cookie_value+cookie_expires+"; path=/; "+cookie_domain;
	jQuery("#shopillaxcookielaw-wrapper, #shopillaxcookielaw-overlay").remove();
}

function __shopillax_europeancookielaw_stylesheet() {
	jQuery('head').append('<link rel="stylesheet" href="https://cdn.shopify.com/s/files/1/0903/8786/t/9/assets/shopillax_europecookielaw.css?4971604596041935634" type="text/css" media="all" >');
}

function __shopillax_checkcookie(cookie_name) {
	if (document.cookie.length > 0) {
		var cookie_start = document.cookie.indexOf(cookie_name + "=");
		if (cookie_start != -1) {
			cookie_start = cookie_start + cookie_name.length + 1;
			var cookie_end = document.cookie.indexOf(";", cookie_start);
			if (cookie_end == -1) {
				cookie_end = document.cookie.length;
			}
			
			return unescape(document.cookie.substring(cookie_start, cookie_end));
		}
	} 
}

jQuery(document).ready(function(){
	if (!__shopillax_checkcookie('europeancookielaw')) {
		__shopillax_europeancookielaw_stylesheet();
		__shopillax_europeancookielaw_init();
	}
});